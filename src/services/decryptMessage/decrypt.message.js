import CryptoJS from 'react-native-crypto-js';

// Hàm giả mã (giải mã)
export const decrypt = (ciphertext, key) => {
  if (!ciphertext || !key) {
    return null;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    if (!originalText) {
      return null;
    }
    return originalText;
  } catch (error) {
    return null;
  }
};
