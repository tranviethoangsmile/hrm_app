import axios from 'axios';
import {API_KEY_GOOGLE} from '../utils/constans';

export const SUPPORTED_LANGS = [
  {code: 'vi', labelKey: 'translator.lang.vi'},
  {code: 'en', labelKey: 'translator.lang.en'},
  {code: 'ja', labelKey: 'translator.lang.ja'},
  {code: 'pt', labelKey: 'translator.lang.pt'},
  {code: 'zh', labelKey: 'translator.lang.zh'},
  {code: 'ko', labelKey: 'translator.lang.ko'},
];

const SAMPLES = {
  vi: [
    'Xin chào, tôi là nhân viên mới.',
    'Tôi muốn xin nghỉ phép vào thứ sáu.',
    'Khi nào có lịch họp tuần này?',
    'Cảm ơn bạn đã giúp đỡ.',
  ],
  en: [
    'Hello, I am a new employee.',
    'I would like to take a day off on Friday.',
    'When is the meeting this week?',
    'Thank you for your help.',
  ],
  ja: [
    'こんにちは、私は新入社員です。',
    '金曜日に休暇を取りたいです。',
    '今週の会議はいつですか。',
    '手伝ってくれてありがとうございます。',
  ],
  pt: [
    'Olá, sou um novo funcionário.',
    'Gostaria de tirar um dia de folga na sexta.',
    'Quando é a reunião desta semana?',
    'Obrigado pela sua ajuda.',
  ],
  zh: [
    '你好，我是新员工。',
    '我想周五请一天假。',
    '这周的会议是什么时候？',
    '谢谢你的帮助。',
  ],
  ko: [
    '안녕하세요, 저는 신입 사원입니다.',
    '금요일에 하루 휴가를 내고 싶습니다.',
    '이번 주 회의는 언제입니까?',
    '도와주셔서 감사합니다.',
  ],
};

const DICT = [
  {
    vi: 'Xin chào, tôi là nhân viên mới.',
    en: 'Hello, I am a new employee.',
    ja: 'こんにちは、私は新入社員です。',
    pt: 'Olá, sou um novo funcionário.',
    zh: '你好，我是新员工。',
    ko: '안녕하세요, 저는 신입 사원입니다.',
  },
  {
    vi: 'Tôi muốn xin nghỉ phép vào thứ sáu.',
    en: 'I would like to take a day off on Friday.',
    ja: '金曜日に休暇を取りたいです。',
    pt: 'Gostaria de tirar um dia de folga na sexta.',
    zh: '我想周五请一天假。',
    ko: '금요일에 하루 휴가를 내고 싶습니다.',
  },
  {
    vi: 'Khi nào có lịch họp tuần này?',
    en: 'When is the meeting this week?',
    ja: '今週の会議はいつですか。',
    pt: 'Quando é a reunião desta semana?',
    zh: '这周的会议是什么时候？',
    ko: '이번 주 회의는 언제입니까?',
  },
  {
    vi: 'Cảm ơn bạn đã giúp đỡ.',
    en: 'Thank you for your help.',
    ja: '手伝ってくれてありがとうございます。',
    pt: 'Obrigado pela sua ajuda.',
    zh: '谢谢你的帮助。',
    ko: '도와주셔서 감사합니다.',
  },
];

const normalize = text => text.trim().toLowerCase().replace(/\s+/g, ' ');

const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

export const mockRecognize = lang => {
  const samples = SAMPLES[lang] || SAMPLES.en;
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(pickRandom(samples));
    }, 1400);
  });
};

const GOOGLE_TRANSLATE_URL = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY_GOOGLE}`;

const translateWithGoogle = async (text, from, to) => {
  const response = await axios.post(
    GOOGLE_TRANSLATE_URL,
    {q: text, source: from, target: to, format: 'text'},
    {headers: {'Content-Type': 'application/json'}},
  );
  return response?.data?.data?.translations?.[0]?.translatedText || null;
};

const translateWithMyMemory = async (text, from, to) => {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text,
  )}&langpair=${encodeURIComponent(from)}|${encodeURIComponent(to)}`;
  const response = await axios.get(url, {timeout: 15000});
  const status = response?.data?.responseStatus;
  const translated = response?.data?.responseData?.translatedText;
  if (status === 200 && translated) {
    return translated;
  }
  return null;
};

const fallbackTranslate = (text, from, to) => {
  const normalized = normalize(text);
  const matched = DICT.find(entry => {
    const source = entry[from];
    return source && normalize(source) === normalized;
  });
  return matched && matched[to] ? matched[to] : `[${to}] ${text}`;
};

export const translateText = async (text, from, to) => {
  if (!text || from === to) {
    return text;
  }
  try {
    const google = await translateWithGoogle(text, from, to);
    if (google) {
      return google;
    }
  } catch (error) {
    // Google key bị treo/mất quyền → thử MyMemory
  }
  try {
    const myMemory = await translateWithMyMemory(text, from, to);
    if (myMemory) {
      return myMemory;
    }
  } catch (error) {
    // MyMemory lỗi → fallback mock
  }
  return fallbackTranslate(text, from, to);
};

export const getLangLabelKey = code => {
  const found = SUPPORTED_LANGS.find(lang => lang.code === code);
  return found ? found.labelKey : 'translator.lang.en';
};

const isPureLatin = text => {
  let latin = true;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const isAsciiPrintable =
      (code >= 32 && code <= 126) || code === 10 || code === 13;
    if (!isAsciiPrintable) {
      latin = false;
      break;
    }
  }
  return latin;
};

export const SYNTHESIZE_BASE_MS = 380;
export const SYNTHESIZE_PER_CHAR_MS = 55;

export const synthDurationMs = text => {
  const clean = (text || '').trim();
  if (!clean) {
    return 0;
  }
  // Mô phỏng tốc độ đọc: ngôn ngữ Latin đọc nhanh hơn một chút.
  const perChar = isPureLatin(clean)
    ? SYNTHESIZE_PER_CHAR_MS * 0.8
    : SYNTHESIZE_PER_CHAR_MS;
  return Math.max(900, SYNTHESIZE_BASE_MS + clean.length * perChar);
};

export const mockSynthesize = (text, lang) => {
  const duration = synthDurationMs(text);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({text, lang, duration, uri: `mock://speech/${lang}/${duration}`});
    }, 250);
  });
};
