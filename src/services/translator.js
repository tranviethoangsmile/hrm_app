import {
  LANGUAGE_CONFIG,
  getSttLocale as getLocaleForCode,
} from './conversation/languageConfig';

export const SUPPORTED_LANGS = Object.keys(LANGUAGE_CONFIG).map(code => ({
  code,
  labelKey: LANGUAGE_CONFIG[code].nameKey,
}));

export {getLocaleForCode};

export const getFlagForCode = code =>
  (LANGUAGE_CONFIG[code] && LANGUAGE_CONFIG[code].flag) || '🌐';

export const getLangLabelKey = code =>
  (LANGUAGE_CONFIG[code] && LANGUAGE_CONFIG[code].nameKey) ||
  'translator.lang.en';

export const MYMEMORY_ENDPOINT = 'https://api.mymemory.translated.net/get';
export const MYMEMORY_MAX_BYTES = 500;
const REQUEST_TIMEOUT_MS = 12000;
const MAX_RETRIES = 2;

const normalizeCode = code => {
  const value = String(code || '')
    .trim()
    .toLowerCase();
  return value.split('-')[0];
};

const utf8Length = value => {
  return encodeURIComponent(value).replace(/%[0-9A-F]{2}/g, 'x').length;
};

const trimToByteLimit = value => {
  let result = String(value || '').trim();
  while (utf8Length(result) > MYMEMORY_MAX_BYTES) {
    result = result.slice(0, -1).trim();
  }
  return result;
};

export const splitTranslationText = (text, maxBytes = MYMEMORY_MAX_BYTES) => {
  const source = String(text || '').trim();
  if (!source) {
    return [];
  }
  const sentences = source.match(/[^.!?。！？]+[.!?。！？]?/gu) || [source];
  const chunks = [];
  let current = '';
  sentences.forEach(sentence => {
    const candidate = current
      ? `${current} ${sentence.trim()}`
      : sentence.trim();
    if (utf8Length(candidate) <= maxBytes) {
      current = candidate;
      return;
    }
    if (current) {
      chunks.push(current);
      current = '';
    }
    let remainder = sentence.trim();
    while (utf8Length(remainder) > maxBytes) {
      const chunk = trimToByteLimit(remainder);
      chunks.push(chunk);
      remainder = remainder.slice(chunk.length).trim();
    }
    current = remainder;
  });
  if (current) {
    chunks.push(current);
  }
  return chunks;
};

const request = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  console.log('[TRANSLATION] request-start');
  try {
    const response = await fetch(url, {signal: controller.signal});
    const data = await response.json().catch(() => null);
    console.log('[TRANSLATION] response-status', response.status);
    if (__DEV__) {
      console.log('[TRANSLATION] response-body', JSON.stringify(data || {}));
    }
    if (!response.ok) {
      throw new Error(`mymemory_http_${response.status}`);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
};

export class MyMemoryTranslationService {
  constructor({
    endpoint = MYMEMORY_ENDPOINT,
    timeoutMs = REQUEST_TIMEOUT_MS,
  } = {}) {
    this.endpoint = endpoint;
    this.timeoutMs = timeoutMs;
  }

  async translate(text, sourceLanguage, targetLanguage, context) {
    const value = String(text || '').trim();
    const source = normalizeCode(sourceLanguage);
    const target = normalizeCode(targetLanguage);
    if (!value || source === target) {
      return value;
    }
    if (!source || !target) {
      throw new Error('mymemory_invalid_language');
    }
    if (utf8Length(value) > MYMEMORY_MAX_BYTES) {
      const chunks = splitTranslationText(value);
      const translations = [];
      for (const chunk of chunks) {
        translations.push(await this.translate(chunk, source, target, context));
      }
      return translations.join(' ');
    }

    const params = [
      `q=${encodeURIComponent(value)}`,
      `langpair=${encodeURIComponent(`${source}|${target}`)}`,
      'mt=1',
    ];
    if (context) {
      params.push(
        `context=${encodeURIComponent(String(context).slice(0, 500))}`,
      );
    }
    const url = `${this.endpoint}?${params.join('&')}`;
    let lastError;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const data = await request(url, this.timeoutMs);
        const translated = data?.responseData?.translatedText;
        if (data?.responseStatus !== 200 || !translated) {
          throw new Error('mymemory_invalid_response');
        }
        const result = String(translated).trim();
        console.log('[TRANSLATION] request-success', result);
        return result;
      } catch (error) {
        lastError = error;
        console.log('[TRANSLATION] request-failed', String(error));
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve =>
            setTimeout(resolve, 300 * (attempt + 1)),
          );
        }
      }
    }
    throw lastError || new Error('mymemory_request_failed');
  }
}

export const similarityRatio = (a, b) => {
  if (!a || !b) {
    return 0;
  }
  const lower = value => value.toLowerCase().trim();
  const first = lower(a);
  const second = lower(b);
  if (first === second) {
    return 1;
  }
  const tokens = value => value.match(/[a-z0-9\u00C0-\uFFFF]+/g) || [];
  const firstTokens = tokens(first);
  const secondTokens = new Set(tokens(second));
  if (!firstTokens.length || !secondTokens.size) {
    return 0;
  }
  return (
    firstTokens.filter(token => secondTokens.has(token)).length /
    Math.max(firstTokens.length, secondTokens.size)
  );
};

export class TranslationService extends MyMemoryTranslationService {}

export const translationService = new MyMemoryTranslationService();

export const translateText = async (text, from, to, context) =>
  translationService.translate(text, from, to, context);
