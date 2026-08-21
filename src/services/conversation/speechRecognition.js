// SpeechRecognitionService — bọc @react-native-voice/voice cho luồng hội thoại.
// Quản lý permission, availability, start/stop/destroy và gom sự kiện native
// (onSpeechResults/onSpeechEnd) để finalize ĐÚNG MỘT utterance.
//
// VAD notes:
// - Native layer (SFSpeechRecognizer / SpeechRecognizer) đã tự phân đoạn theo im
//   lặng: một khoảng ngắt ngắn (500ms) KHÔNG kết thúc lượt nói. Chúng ta chỉ bổ
//   sung "grace window" ở tầng JS (xem ConversationManager) để phân biệt người
//   nói tiếp tục cùng lượt hay lượt mới.
// - Android: cấu hình POSSIBLY_COMPLETE_SILENCE để tránh cắt câu khi người nói
//   ngắt nhịp giữa chừng (Test D).

import Voice from '@react-native-voice/voice';
import {PermissionsAndroid, Platform} from 'react-native';
import {getSttLocale} from './languageConfig';

export const MAX_UTTERANCE_MS = 30000;

// Android: thời gian im lặng trước khi recognizer "nghi ngờ" hết câu.
// Đặt lớn hơn mặc định để người nói ngắt nhịp ngắn vẫn là MỘT utterance.
export const ANDROID_SILENCE_POSSIBLE_MS = 700;
export const ANDROID_SILENCE_COMPLETE_MS = 1200;

// Mã lỗi Android SpeechRecognizer:
//   6 = ERROR_SPEECH_TIMEOUT  — không nghe thấy tiếng nói
//   7 = ERROR_NO_MATCH        — nghe nhưng không khớp ngôn ngữ đang nghe
//   9 = ERROR_RECOGNIZER_BUSY — recognizer bận (start quá nhanh)
//   5 = ERROR_CLIENT          — lỗi phía client (thường do start/stop vội)
//   3 = ERROR_AUDIO, 8 = ERROR_SERVER, 2 = ERROR_NETWORK, 4 = permissions
// iOS: 1110 = no speech detected (tương tự no-match).
// Các lỗi "im lặng / sai ngôn ngữ" → cơ hội để ĐẢO locale micro (bắt ngôn ngữ
// còn lại của cặp). Lỗi thật → báo lỗi cho user.
export const STT_SILENT_ERROR_CODES = new Set(['6', '7', '9', '1110']);
export const STT_CLIENT_ERROR_CODES = new Set(['5']);

const isNoMatchError = code =>
  code === 7 || code === 1110 || code === '7' || code === '1110';

const isSilentError = code =>
  STT_SILENT_ERROR_CODES.has(String(code)) || isNoMatchError(code);

export class SpeechRecognitionService {
  constructor() {
    this.started = false;
    this.callbacks = {};
    this._finalizeTimer = null;
  }

  // Gán handlers native MỘT LẦN; các lần start() sau vẫn dùng lại.
  bind(callbacks) {
    this.callbacks = callbacks || {};
    Voice.onSpeechStart = this._onStart;
    Voice.onSpeechRecognized = this._onRecognized;
    Voice.onSpeechPartialResults = this._onPartial;
    Voice.onSpeechResults = this._onResults;
    Voice.onSpeechEnd = this._onEnd;
    Voice.onSpeechError = this._onError;
  }

  unbind() {
    this.callbacks = {};
    Voice.removeAllListeners();
  }

  async ensurePermission() {
    if (Platform.OS === 'android') {
      try {
        console.log('[PERMISSION] microphone: requesting');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );
        const allowed = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log(
          `[PERMISSION] microphone: ${allowed ? 'granted' : 'denied'}`,
        );
        return allowed;
      } catch (e) {
        console.log('[PERMISSION] microphone: error', String(e));
        return false;
      }
    }
    console.log(
      '[PERMISSION] microphone: iOS runtime request delegated to Voice',
    );
    return true;
  }

  async isAvailable() {
    try {
      const available = !!(await Voice.isAvailable());
      console.log(`[STT] available: ${available}`);
      return available;
    } catch (e) {
      console.log('[STT] availability error', String(e));
      return false;
    }
  }

  async start(locale) {
    if (this.started) {
      return;
    }
    const options =
      Platform.OS === 'android'
        ? {
            EXTRA_PARTIAL_RESULTS: true,
            // Đừng cắt câu khi người nói ngắt nhịp ngắn.
            EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS:
              ANDROID_SILENCE_POSSIBLE_MS,
            EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS:
              ANDROID_SILENCE_COMPLETE_MS,
          }
        : {};
    const resolvedLocale = String(locale || '').includes('-')
      ? locale
      : getSttLocale(locale);
    console.log('[STT] microphone starting', resolvedLocale);
    await Voice.start(resolvedLocale, options);
    this.started = true;
    console.log('[STT] listening', resolvedLocale);
  }

  isStarted() {
    return this.started;
  }

  // Native session đã kết thúc (end/results/error) → cho phép start() lại.
  markEnded() {
    this.started = false;
  }

  async stop() {
    this._clearFinalizeTimer();
    if (!this.started) {
      return;
    }
    this.started = false;
    try {
      await Voice.stop();
    } catch (e) {
      // bỏ qua lỗi stop
    }
  }

  async cancel() {
    this._clearFinalizeTimer();
    this.started = false;
    try {
      await Voice.cancel();
    } catch (e) {
      // bỏ qua
    }
  }

  async destroy() {
    this._clearFinalizeTimer();
    this.started = false;
    try {
      await Voice.destroy();
    } catch (e) {
      // bỏ qua
    }
  }

  // ------- native handlers -------
  _onStart = () => {
    console.log('[STT] speech-start');
    this.callbacks.onStart?.();
  };

  _onRecognized = e => {
    console.log('[STT] recognized', JSON.stringify(e || {}));
    this.callbacks.onRecognized?.(e);
  };

  _onPartial = e => {
    console.log('[STT] partial', JSON.stringify(e || {}));
    this.callbacks.onPartial?.(e);
  };

  _onResults = e => {
    console.log('[STT] results', JSON.stringify(e || {}));
    this.callbacks.onResults?.(e);
  };

  _onEnd = () => {
    console.log('[STT] end');
    this.callbacks.onEnd?.();
  };

  _onError = e => {
    const code = e?.error?.code;
    const isNoMatch = isNoMatchError(code);
    const silent = isNoMatch || isSilentError(code);
    console.log('[STT] error', JSON.stringify(e || {}));
    this.callbacks.onError?.({
      code,
      isNoMatch,
      silent,
      clientError: STT_CLIENT_ERROR_CODES.has(String(code)),
      message: e?.error?.message || String(e?.error || ''),
    });
  };

  _clearFinalizeTimer() {
    if (this._finalizeTimer) {
      clearTimeout(this._finalizeTimer);
      this._finalizeTimer = null;
    }
  }

  // ConversationManager dùng các helper sau để finalize đúng 1 lần/utterance.
  scheduleFinalize(delay, fn) {
    this._clearFinalizeTimer();
    this._finalizeTimer = setTimeout(() => {
      this._finalizeTimer = null;
      fn();
    }, delay);
  }

  clearFinalizeTimer() {
    this._clearFinalizeTimer();
  }
}

export default SpeechRecognitionService;
