// LanguageDetectionService — detect ngôn ngữ của câu nói (offline, nhanh).
// Ưu tiên nhận diện bằng script (ko/ja/zh), còn lại latin (vi/pt/en) dùng
// diacritics + từ khoá phổ biến để tính điểm. Trả null khi không đủ tự tin.

const HANGUL = /[\uAC00-\uD7AF\u1100-\u11FF]/;
const KANA = /[\u3040-\u30FF]/;
const CJK = /[\u4E00-\u9FFF]/;

const VI_DIACRITICS =
  /[ăâđêôơưàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/i;
const PT_DIACRITICS = /[çãõ]/i;

const VI_WORDS = [
  'tôi',
  'bạn',
  'không',
  'là',
  'của',
  'và',
  'được',
  'rồi',
  'người',
  'muốn',
  'hôm',
  'nay',
  'xin',
  'chào',
  'cảm',
  'ơn',
  'đang',
  'một',
  'ngày',
  'mấy',
];
const PT_WORDS = [
  'você',
  'obrigado',
  'não',
  'bom',
  'dia',
  'como',
  'está',
  'que',
  'para',
  'muito',
  'bem',
  'tem',
  'uma',
  'hoje',
];
const EN_WORDS = [
  'the',
  'you',
  'how',
  'are',
  'thank',
  'fine',
  'good',
  'what',
  'with',
  'have',
  'today',
  'very',
  'well',
  'please',
];

const countOccurrences = (text, words) => {
  const lower = ` ${text.toLowerCase()} `;
  return words.reduce(
    (sum, w) => sum + (lower.indexOf(` ${w} `) !== -1 ? 1 : 0),
    0,
  );
};

export const detectLanguage = (text = '') => {
  const result = detectLanguageWithConfidence(text);
  return result ? result.lang : null;
};

// detect + mức độ tự tin (0..1). Script (ko/ja/zh) là xác định tuyệt đối →
// confidence cao. Tiếng latin (vi/pt/en) dựa trên biên độ điểm giữa ứng viên
// cao nhất và nhì: biên độ càng mảnh → càng thiếu tự tin.
export const detectLanguageWithConfidence = (text = '') => {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return null;
  }

  if (HANGUL.test(trimmed)) {
    return {lang: 'ko', confidence: 0.98};
  }
  if (KANA.test(trimmed)) {
    return {lang: 'ja', confidence: 0.98};
  }
  if (CJK.test(trimmed)) {
    return {lang: 'zh', confidence: 0.96};
  }

  const viDiacritics = (trimmed.match(VI_DIACRITICS) || []).length;
  const ptDiacritics = (trimmed.match(PT_DIACRITICS) || []).length;

  const viScore = viDiacritics * 2 + countOccurrences(trimmed, VI_WORDS);
  const ptScore = ptDiacritics + countOccurrences(trimmed, PT_WORDS);
  const enScore = countOccurrences(trimmed, EN_WORDS);

  const candidates = [
    {lang: 'vi', score: viScore},
    {lang: 'pt', score: ptScore},
    {lang: 'en', score: enScore},
  ].sort((a, b) => b.score - a.score);

  const top = candidates[0];
  if (top.score <= 0) {
    return null;
  }
  const second = candidates[1];
  const confidence =
    second.score > 0 ? top.score / (top.score + second.score) : 0.92;
  return {
    lang: top.lang,
    confidence: Math.min(0.98, Math.max(0.4, confidence)),
  };
};

export default {detectLanguage, detectLanguageWithConfidence};
