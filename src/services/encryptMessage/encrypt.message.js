import CryptoJS from 'react-native-crypto-js';
export const encrypt = (text, key) => {
  if (!text || !key) {
    return null;
  }

  try {
    const ciphertext = CryptoJS.AES.encrypt(text, key).toString();
    return ciphertext;
  } catch (error) {
    return null;
  }
};
