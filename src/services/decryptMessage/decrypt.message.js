// Hàm giải mã
import CryptoJS from 'crypto-js';
export const decrypt = (ciphertext, key) => {
  const parsedKey = CryptoJS.enc.Utf8.parse(key); // Chuyển key sang WordArray
  const bytes = CryptoJS.AES.decrypt(ciphertext, parsedKey);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};
