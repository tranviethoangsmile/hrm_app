import {SpeechRecognitionService} from './speechRecognition';
import {detectLanguageWithConfidence} from './languageDetection';
import {splitTranslationText, translateText} from '../translator';
import {SpeechSegmenter} from './speechSegmenter';

export const CONV_STATE = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  LISTENING: 'listening',
  DETECTED: 'detected',
  TRANSLATING: 'translating',
  SPEAKING: 'speaking',
  INTERRUPTED: 'interrupted',
  PAUSED: 'paused',
  ERROR: 'error',
};

const RESTART_DELAY_MS = 350;
const MAX_MESSAGES = 100;

export class ConversationManager {
  constructor({langRef, voiceOnRef, autoDetectRef}) {
    this.langRef = langRef;
    this.voiceOnRef = voiceOnRef || {current: false};
    this.autoDetectRef = autoDetectRef || {current: true};
    this.running = false;
    this.paused = false;
    this.state = CONV_STATE.IDLE;
    this.messages = [];
    this.errorKind = null;
    this.errorDetail = '';
    this.activeLang = langRef.current.source;
    this.speech = new SpeechRecognitionService();
    this.speech.bind({
      onStart: () => this._onSpeechStart(),
      onPartial: event => this._onPartial(event),
      onResults: event => this._onFinal(event),
      onError: error => this._onError(error),
    });
    this._session = 0;
    this._msgSeq = 0;
    this._listening = false;
    this._restartTimer = null;
    this._queue = [];
    this._queueRunning = false;
    this._lastText = '';
    this._partialText = '';
    this._speechStartTime = 0;
    this._segmentSeq = 0;
    this._silentErrors = 0;
    this.segmenter = new SpeechSegmenter({
      onPartial: text => this._onPartialText(text),
    });
    this._subscribers = [];
  }

  subscribe(cb) {
    this._subscribers.push(cb);
    return () => {
      this._subscribers = this._subscribers.filter(item => item !== cb);
    };
  }

  _emit(extra = {}) {
    const payload = {
      state: this.state,
      messages: this.messages,
      activeLang: this.activeLang,
      errorKind: this.errorKind,
      errorDetail: this.errorDetail,
      ...extra,
    };
    this._subscribers.forEach(cb => {
      try {
        cb(payload);
      } catch (error) {
        // A screen subscriber must not break the native speech lifecycle.
      }
    });
  }

  _setState(state, extra = {}) {
    this.state = state;
    this._emit(extra);
  }

  _log(message, ...rest) {
    if (__DEV__) {
      console.log(`[Meeting] ${message}`, ...rest);
    }
  }

  async start() {
    if (this.running) {
      return;
    }
    const {source, target} = this.langRef.current;
    if (source === target) {
      this._fail('pair_same', 'translator.unable_to_translate');
      return;
    }
    this.running = true;
    this.paused = false;
    this._session += 1;
    this._queue = [];
    this._lastText = '';
    this._partialText = '';
    this._silentErrors = 0;
    this.segmenter.reset();
    this.errorKind = null;
    this.errorDetail = '';
    this.activeLang = source;
    const session = this._session;
    this._setState(CONV_STATE.CONNECTING);
    console.log('[TRANSLATOR] start');
    console.log(`[TRANSLATOR] sessionId: ${session}`);
    console.log(`[TRANSLATOR] source: ${source}`);
    console.log(`[TRANSLATOR] target: ${target}`);
    try {
      if (!(await this.speech.isAvailable())) {
        throw {code: 'stt_unavailable'};
      }
      if (!(await this.speech.ensurePermission())) {
        throw {code: 'permission'};
      }
      if (session !== this._session || !this.running) {
        return;
      }
      this._setState(CONV_STATE.LISTENING);
      await this._startListening();
    } catch (error) {
      if (error?.code === 'permission') {
        this._fail('permission', 'translator.permission_denied');
      } else if (error?.code === 'stt_unavailable') {
        this._fail('stt_unavailable', 'translator.stt_unavailable');
      } else {
        this._log('start error', error);
        this._fail('start', 'translator.unable_to_translate');
      }
    }
  }

  async stop() {
    this.running = false;
    this.paused = false;
    this._session += 1;
    this._queue = [];
    this._queueRunning = false;
    this._clearRestartTimer();
    await this._stopListening();
    this._setState(CONV_STATE.IDLE);
  }

  async pause() {
    if (!this.running || this.paused) {
      return;
    }
    this.paused = true;
    this._clearRestartTimer();
    await this._stopListening();
    this._setState(CONV_STATE.PAUSED);
  }

  async resume() {
    if (!this.running || !this.paused) {
      return;
    }
    this.paused = false;
    this._setState(CONV_STATE.LISTENING);
    await this._startListening();
  }

  async destroy() {
    this.running = false;
    this.paused = false;
    this._session += 1;
    this._queue = [];
    this._clearRestartTimer();
    await this._stopListening();
    try {
      await this.speech.destroy();
    } catch (error) {
      // Native cleanup is best effort.
    }
    this._subscribers = [];
  }

  toggleVoice(on) {
    this.voiceOnRef.current = !!on;
  }

  toggleAutoDetect(on) {
    this.autoDetectRef.current = !!on;
  }

  updateLangs(source, target) {
    const previous = this.langRef.current;
    this.langRef.current = {source, target};
    if (
      this.running &&
      !this.paused &&
      (source !== previous.source || target !== previous.target)
    ) {
      this._restartListening();
    }
  }

  clearHistory() {
    this.messages = [];
    this._emit({});
  }

  retryMessage(id) {
    const message = this.messages.find(item => item.id === id);
    if (!message || message.status !== 'error' || !this.running) {
      return;
    }
    const sourceLang = message.sourceLanguage || this.langRef.current.source;
    const target =
      message.targetLanguage || message.toLang || this.langRef.current.target;
    this._updateMessage(id, {status: 'processing', translatedText: ''});
    this._queue.push({
      id,
      text: message.sourceText || message.originalText,
      sourceLang,
      target,
      session: this._session,
      segment: ++this._segmentSeq,
    });
    this._drainQueue();
  }

  async _startListening() {
    if (!this.running || this.paused || this._listening) {
      return;
    }
    const language = this.langRef.current.source;
    this._listening = true;
    console.log('[STT] initializing', language);
    this._log('listening start', language);
    try {
      await this.speech.start(language);
    } catch (error) {
      this._listening = false;
      console.log('[STT] start-error', String(error));
      if (this.running && !this.paused) {
        this._fail('stt_start', 'translator.unable_to_recognize');
      }
    }
  }

  async _stopListening() {
    this._listening = false;
    try {
      await this.speech.stop();
    } catch (error) {
      // Native cleanup is best effort.
    }
  }

  _scheduleRestart() {
    if (!this.running || this.paused || this._restartTimer) {
      return;
    }
    const session = this._session;
    this._restartTimer = setTimeout(async () => {
      this._restartTimer = null;
      if (session !== this._session || !this.running || this.paused) {
        return;
      }
      this._setState(CONV_STATE.LISTENING);
      await this._startListening();
    }, RESTART_DELAY_MS);
  }

  _restartListening() {
    if (!this.running || this.paused) {
      return;
    }
    this._clearRestartTimer();
    this._stopListening().then(() => this._scheduleRestart());
  }

  _clearRestartTimer() {
    if (this._restartTimer) {
      clearTimeout(this._restartTimer);
      this._restartTimer = null;
    }
  }

  _onFinal(event) {
    if (!this.running || this.paused || !this._listening) {
      return;
    }
    this.speech.markEnded();
    this._listening = false;
    const text = this.segmenter.finalize(event);
    console.log('[STT] final', text);
    this._partialText = '';
    if (!text) {
      this._scheduleRestart();
      return;
    }
    this._silentErrors = 0;
    const speechEndTime = Date.now();
    const chunks = splitTranslationText(text);
    chunks.forEach(chunk => this._enqueue(chunk, speechEndTime));
    this._scheduleRestart();
  }

  _onSpeechStart() {
    this._speechStartTime = Date.now();
    console.log('[STT] speech-detected', this._speechStartTime);
  }

  _onError(error) {
    this.speech.markEnded();
    this._listening = false;
    if (!this.running || this.paused) {
      return;
    }
    if (error?.silent || error?.isNoMatch || error?.clientError) {
      this._silentErrors += 1;
      console.log('[STT] no-match count', this._silentErrors);
      if (this._silentErrors >= 3) {
        this._fail('stt_no_match', 'translator.no_match');
      } else {
        this._scheduleRestart();
      }
      return;
    }
    this._fail('stt', 'translator.unable_to_recognize');
  }

  _onPartial(event) {
    this.segmenter.acceptPartial(event);
  }

  _onPartialText(text) {
    if (text) {
      this._silentErrors = 0;
      console.log('[STT] partial', text);
      this._partialText = text;
      this._emit({partialText: text});
    }
  }

  _enqueue(text, speechEndTime = Date.now()) {
    const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!normalized || normalized === this._lastText) {
      return;
    }
    this._lastText = normalized;
    this._segmentSeq += 1;
    const {source, target} = this.langRef.current;
    let sourceLang = source;
    if (this.autoDetectRef.current) {
      const detected = detectLanguageWithConfidence(text);
      if (detected?.lang && detected.lang !== target) {
        sourceLang = detected.lang;
      }
    }
    this.activeLang = sourceLang;
    const message = this._appendMessage({
      sourceLanguage: sourceLang,
      originalText: text,
      translatedText: '',
      toLang: target,
      targetLanguage: target,
      sourceText: text,
      speechEndTime,
      sttFinalizeTime: Date.now(),
      status: 'processing',
    });
    this._queue.push({
      id: message.id,
      text,
      sourceLang,
      target,
      session: this._session,
      segment: this._segmentSeq,
    });
    console.log(`[TRANSLATOR] SEGMENT #${this._segmentSeq}`, text);
    if (this._speechStartTime) {
      console.log(
        '[TRANSLATOR] STT latency',
        speechEndTime - this._speechStartTime,
        'ms',
      );
    }
    this._emit({queueLength: this._queue.length});
    this._drainQueue();
  }

  async _drainQueue() {
    if (this._queueRunning) {
      return;
    }
    this._queueRunning = true;
    try {
      while (this._queue.length > 0) {
        const item = this._queue.shift();
        if (!this.running || item.session !== this._session) {
          continue;
        }
        this._setState(CONV_STATE.TRANSLATING, {
          queueLength: this._queue.length,
        });
        const previous = this.messages[this.messages.length - 2];
        const context = previous?.translatedText || previous?.originalText;
        let translatedText = '';
        const translationStartTime = Date.now();
        console.log('[TRANSLATION] segment-start', item.segment);
        try {
          translatedText = await translateText(
            item.text,
            item.sourceLang,
            item.target,
            context,
          );
        } catch (error) {
          this._log('translation error', error);
        }
        const translationEndTime = Date.now();
        console.log(
          '[TRANSLATION] latency',
          translationEndTime - translationStartTime,
          'ms',
        );
        if (!this.running || item.session !== this._session) {
          continue;
        }
        this._updateMessage(item.id, {
          translatedText: translatedText || '',
          status: translatedText ? 'translated' : 'error',
          translationStartTime,
          translationEndTime,
        });
      }
    } finally {
      this._queueRunning = false;
      if (this.running && !this.paused) {
        this.activeLang = this.langRef.current.source;
        this._setState(CONV_STATE.LISTENING, {queueLength: 0});
      }
    }
  }

  _appendMessage(message) {
    this._msgSeq += 1;
    const item = {id: `m${this._msgSeq}`, timestamp: Date.now(), ...message};
    this.messages = [...this.messages, item].slice(-MAX_MESSAGES);
    this._emit({messages: this.messages});
    return item;
  }

  _updateMessage(id, patch) {
    this.messages = this.messages.map(item =>
      item.id === id ? {...item, ...patch} : item,
    );
    this._emit({messages: this.messages});
  }

  _fail(kind, detail) {
    this.errorKind = kind;
    this.errorDetail = detail;
    this.running = false;
    this._queue = [];
    this._clearRestartTimer();
    this._stopListening();
    this._setState(CONV_STATE.ERROR);
  }
}

export default ConversationManager;
export const MeetingInterpreterSession = ConversationManager;
