import CryptoJS from 'crypto-js';

// Hàm mã hóa với key và iv
export const encrypt = (text, key) => {
  if (!text || !key) {
    console.error('Key hoặc văn bản để mã hóa không được để trống.');
    return null;
  }

  try {
    const parsedKey = CryptoJS.enc.Utf8.parse(key); // Chuyển key (UUID) sang WordArray
    // const iv = CryptoJS.lib.WordArray.random(16); // Tạo iv ngẫu nhiên với kích thước 128-bit (16 bytes)

    // Mã hóa text với key và iv
    const encrypted = CryptoJS.AES.encrypt(text, parsedKey);

    // Gộp cả ciphertext và iv để có thể giải mã sau này
    const ciphertext = iv
      .concat(encrypted.ciphertext)
      .toString(CryptoJS.enc.Base64);

    return ciphertext;
  } catch (error) {
    console.error('Lỗi mã hóa:', error.message);
    return null;
  }
};
