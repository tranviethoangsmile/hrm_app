// TextToSpeechService — bọc react-native-tts, trả Promise resolve khi phát xong
// (finish/cancel/error). Manager dùng event này để "resume listening" đúng lúc,
// tránh micro thu lại chính giọng TTS (chống feedback loop).
//
// Voice resolution (quan trọng với tiếng Nhật — nguyên nhân "có text, không
// âm thanh"):
// - Android setDefaultLanguage trả về status code; react-native-tts map sai
//   LANG_AVAILABLE(-1) thành reject "Unknown error code: -1" dù NGÔN NGỮ CÓ
//   SẴN (module đã set language rồi). Ta xử lý reject kiểu này như THÀNH CÔNG.
// - Reject "lang_missing_data"/"lang_not_supported"/"not_found" → thiết bị
//   thiếu dữ liệu giọng → tìm giọng đã cài qua Tts.voices() (setDefaultVoice).
// - Không có giọng nào → THROW lỗi rõ ràng (no_voice_for_<lang>) + log, KHÔNG
//   im lặng. Không bao giờ dùng giọng tiếng Anh đọc tiếng Nhật.

import Tts from 'react-native-tts';
import {Platform} from 'react-native';
import {getTtsLocale} from './languageConfig';

const TTS_EVENTS = ['tts-start', 'tts-finish', 'tts-cancel', 'tts-error'];
const SPEAK_TIMEOUT_MS = 20000;
export const TTS_SPEED_PRESETS = [0.75, 0.85, 1, 1.15, 1.25, 1.5];
export const DEFAULT_TTS_SPEED = 1;
const DEFAULT_NATIVE_RATE = 0.45;

const clamp = value => Math.min(0.99, Math.max(0.01, value));

export const getNativeRateForSpeed = speed =>
  clamp(DEFAULT_NATIVE_RATE * Number(speed || DEFAULT_TTS_SPEED));

const languagePrefix = locale => (locale || '').split('-')[0].toLowerCase();

// Android LANG_AVAILABLE = -1. react-native-tts map nó vào default → reject
// "Unknown error code: -1" dù language KHÔNG LỖI (module đã setLanguage rồi).
const isLangAvailableReject = message =>
  String(message || '').indexOf('Unknown error code: -1') !== -1;

const ttsLog = (msg, ...rest) => {
  if (__DEV__) {
    console.log(`[Conversation][TTS] ${msg}`, ...rest);
  }
};

// Log danh sách giọng có trên máy (yêu cầu: kiểm tra TTS availability).
export const logAvailableVoices = async () => {
  try {
    const voices = await Tts.voices();
    const lines = voices.map(
      v =>
        `  - ${v.language || '?'} (id=${v.id}) quality=${v.quality}` +
        (v.notInstalled ? ' [NOT INSTALLED]' : ''),
    );
    ttsLog(`Available voices:\n${lines.join('\n') || '  (none)'}`);
  } catch (e) {
    ttsLog('logAvailableVoices error', e);
  }
};

const findInstalledVoice = async locale => {
  try {
    const voices = await Tts.voices();
    const prefix = languagePrefix(locale);
    const candidates = voices
      .filter(v => !v.notInstalled)
      .filter(v => languagePrefix(v.language) === prefix)
      .sort((a, b) => (b.quality || 0) - (a.quality || 0));
    return candidates[0] || null;
  } catch (e) {
    return null;
  }
};

// Đặt giọng cho ngôn ngữ. Trả true khi OK, false khi thiết bị không có giọng.
export const resolveVoiceForLanguage = async lang => {
  const locale = getTtsLocale(lang);
  ttsLog(`resolveVoice lang=${lang} locale=${locale}`);
  try {
    await Tts.setDefaultLanguage(locale);
    ttsLog(`setDefaultLanguage OK (${locale})`);
    return true;
  } catch (e) {
    const msg = e?.message || String(e || '');
    if (isLangAvailableReject(msg)) {
      // Android LANG_AVAILABLE: language hợp lệ, module đã set language.
      ttsLog(`setDefaultLanguage: LANG_AVAILABLE (${locale}) → OK`);
      return true;
    }
    ttsLog(`setDefaultLanguage FAIL (${locale}): ${msg}`);
  }
  const voice = await findInstalledVoice(locale);
  if (voice) {
    try {
      await Tts.setDefaultVoice(voice.id);
      ttsLog(`setDefaultVoice OK: ${voice.id} (${voice.language})`);
      return true;
    } catch (e2) {
      ttsLog(`setDefaultVoice FAIL ${voice.id}:`, e2);
    }
  } else {
    ttsLog(
      `No installed voice for "${languagePrefix(
        locale,
      )}" — voice data missing.`,
    );
  }
  return false;
};

let _sharedInitPromise = null;

const ensureTtsInit = () => {
  if (!_sharedInitPromise) {
    _sharedInitPromise = (async () => {
      try {
        await Tts.getInitStatus();
      } catch (err) {
        if (Platform.OS === 'android') {
          try {
            await Tts.setDefaultEngine('com.google.android.tts');
          } catch (e) {
            // bỏ qua fallback engine
          }
        }
      }
      Tts.setDefaultRate(DEFAULT_NATIVE_RATE).catch(() => {});
      Tts.setDefaultPitch(1.0).catch(() => {});
      logAvailableVoices();
    })();
  }
  return _sharedInitPromise;
};

// Helper dùng chung (text mode + conversation): phát text bằng ngôn ngữ đã chọn.
export const speakText = async (text, lang) => {
  if (!text || !String(text).trim()) {
    return;
  }
  await ensureTtsInit();
  await Tts.stop().catch(() => {});
  const ok = await resolveVoiceForLanguage(lang);
  if (!ok) {
    throw new Error(`no_voice_for_${lang}`);
  }
  ttsLog(`speak lang=${lang} text="${String(text).slice(0, 60)}"`);
  await Tts.speak(String(text));
  ttsLog('speak finished');
};

export class TextToSpeechService {
  constructor() {
    this.speaking = false;
    this._active = null;
    this._queue = [];
    this._draining = false;
    this._idleWaiters = [];
    this._initPromise = null;
    this._listeners = [];
    this.lastSpokenText = '';
    this.lastSpokenLang = null;
    this.lastVoiceUsed = null;
    this.speed = DEFAULT_TTS_SPEED;
  }

  init() {
    if (!this._initPromise) {
      this._initPromise = (async () => {
        await ensureTtsInit();
        this._bindEvents();
      })();
    }
    return this._initPromise;
  }

  _bindEvents() {
    if (this._listeners.length > 0) {
      return;
    }
    this._listeners = TTS_EVENTS.map(name =>
      Tts.addEventListener(name, () => this._handleEvent(name)),
    );
  }

  _handleEvent(name) {
    if (name === 'tts-start') {
      this.speaking = true;
      ttsLog('started');
      this.callbacks?.onStart?.();
      return;
    }
    // finish / cancel / error → coi như đã dừng phát
    const wasSpeaking = this.speaking;
    this.speaking = false;
    const active = this._active;
    this._active = null;
    if (active) {
      clearTimeout(active.timer);
      active.resolve();
    }
    if (wasSpeaking) {
      ttsLog(`event:${name}`);
      this.callbacks?.onEnd?.();
    }
  }

  setCallbacks(callbacks) {
    this.callbacks = callbacks || {};
  }

  isSpeaking() {
    return this.speaking;
  }

  async setSpeed(speed) {
    const numericSpeed = Number(speed);
    if (!Number.isFinite(numericSpeed) || numericSpeed <= 0) {
      return this.speed;
    }
    this.speed = numericSpeed;
    await this.init();
    await Tts.setDefaultRate(getNativeRateForSpeed(this.speed));
    ttsLog(
      'speed',
      this.speed,
      'nativeRate',
      getNativeRateForSpeed(this.speed),
    );
    return this.speed;
  }

  async speak(text, lang) {
    if (!text || !text.trim()) {
      return;
    }
    await this.init();
    return new Promise((resolve, reject) => {
      this._queue.push({text: String(text).trim(), lang, resolve, reject});
      this._drainQueue();
    });
  }

  async _drainQueue() {
    if (this._draining) {
      return;
    }
    this._draining = true;
    try {
      while (this._queue.length > 0) {
        const item = this._queue.shift();
        try {
          const ok = await resolveVoiceForLanguage(item.lang);
          if (!ok) {
            throw new Error(`no_voice_for_${item.lang}`);
          }
          this.lastSpokenText = item.text;
          this.lastSpokenLang = item.lang;
          await Tts.setDefaultRate(getNativeRateForSpeed(this.speed));
          ttsLog(`speak lang=${item.lang} locale=${getTtsLocale(item.lang)}`);
          await new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
              if (this._active) {
                ttsLog('timeout: no tts event — force stop');
                this._active = null;
                this.speaking = false;
                resolve();
              }
            }, SPEAK_TIMEOUT_MS);
            this._active = {resolve, reject, timer};
            this.speaking = true;
            Tts.speak(item.text);
          });
          item.resolve();
        } catch (error) {
          item.reject(error);
        }
      }
    } finally {
      this._draining = false;
      this.speaking = false;
      const waiters = this._idleWaiters;
      this._idleWaiters = [];
      waiters.forEach(resolve => resolve());
    }
  }

  waitForIdle() {
    if (!this._draining && !this.speaking && this._queue.length === 0) {
      return Promise.resolve();
    }
    return new Promise(resolve => this._idleWaiters.push(resolve));
  }

  async stop() {
    this._queue.forEach(item => item.resolve());
    this._queue = [];
    this.speaking = false;
    if (this._active) {
      clearTimeout(this._active.timer);
      this._active.resolve();
      this._active = null;
    }
    try {
      await Tts.stop();
    } catch (e) {
      // bỏ qua
    }
  }

  destroy() {
    this.callbacks = {};
    this._listeners.forEach(({remove}) => {
      try {
        remove();
      } catch (e) {
        // bỏ qua
      }
    });
    this._listeners = [];
    this.stop();
  }
}

export default TextToSpeechService;
