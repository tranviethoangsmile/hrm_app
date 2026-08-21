// languageConfig — NGÔN NGỮ DÙNG CHUNG cho toàn bộ pipeline phiên dịch.
//
// Một nơi duy nhất định nghĩa: mã ngôn ngữ (vi/ja/en/...), locale cho Speech
// Recognition (sttLocale) và locale cho TTS (ttsLocale), cờ + nhãn i18n.
//
// QUAN TRỌNG (giới hạn API):
// - @react-native-voice/voice (iOS SFSpeechRecognizer / Android
//   SpeechRecognizer) CHỈ nhận MỘT locale mỗi phiên nghe. Không hỗ trợ
//   simultaneous multilingual recognition → conversation engine phải "nghe"
//   luân phiên + tự đảo nhanh khi no-match (xem conversationManager).
// - Trong cặp A ↔ B, 2 chiều dịch đều dùng locale tương ứng của mỗi ngôn ngữ.

export const LANGUAGE_CONFIG = {
  vi: {
    code: 'vi',
    nameKey: 'translator.lang.vi',
    flag: '🇻🇳',
    sttLocale: 'vi-VN',
    ttsLocale: 'vi-VN',
  },
  en: {
    code: 'en',
    nameKey: 'translator.lang.en',
    flag: '🇬🇧',
    sttLocale: 'en-US',
    ttsLocale: 'en-US',
  },
  ja: {
    code: 'ja',
    nameKey: 'translator.lang.ja',
    flag: '🇯🇵',
    sttLocale: 'ja-JP',
    ttsLocale: 'ja-JP',
  },
  pt: {
    code: 'pt',
    nameKey: 'translator.lang.pt',
    flag: '🇵🇹',
    sttLocale: 'pt-PT',
    ttsLocale: 'pt-PT',
  },
  zh: {
    code: 'zh',
    nameKey: 'translator.lang.zh',
    flag: '🇨🇳',
    sttLocale: 'zh-CN',
    ttsLocale: 'zh-CN',
  },
  ko: {
    code: 'ko',
    nameKey: 'translator.lang.ko',
    flag: '🇰🇷',
    sttLocale: 'ko-KR',
    ttsLocale: 'ko-KR',
  },
};

export const SUPPORTED_CODES = Object.keys(LANGUAGE_CONFIG);

// Locale cho Speech Recognition (mỗi lần nghe 1 ngôn ngữ — giới hạn thư viện).
export const getSttLocale = code =>
  (LANGUAGE_CONFIG[code] && LANGUAGE_CONFIG[code].sttLocale) || 'en-US';

// Locale cho TTS (luôn theo NGÔN NGỮ ĐÍCH — không dùng giọng tiếng Anh đọc
// tiếng Nhật).
export const getTtsLocale = code => {
  const cfg = LANGUAGE_CONFIG[code];
  if (cfg) {
    return cfg.ttsLocale || cfg.sttLocale;
  }
  return 'en-US';
};

export const getLanguageNameKey = code =>
  (LANGUAGE_CONFIG[code] && LANGUAGE_CONFIG[code].nameKey) ||
  'translator.lang.en';

export const getLanguageFlag = code =>
  (LANGUAGE_CONFIG[code] && LANGUAGE_CONFIG[code].flag) || '🌐';

export default LANGUAGE_CONFIG;
