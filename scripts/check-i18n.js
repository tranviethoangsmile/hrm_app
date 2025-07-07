#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Đọc các file ngôn ngữ
const loadTranslations = () => {
  const localesDir = path.join(__dirname, '../locales');
  const translations = {};

  const files = fs
    .readdirSync(localesDir)
    .filter(file => file.endsWith('.json'));

  files.forEach(file => {
    const lang = file.replace('.json', '');
    const filePath = path.join(localesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    translations[lang] = JSON.parse(content);
  });

  return translations;
};

// Tìm tất cả keys được sử dụng trong code
const findUsedKeys = () => {
  const usedKeys = new Set();
  const srcDir = path.join(__dirname, '../src');

  const scanDirectory = dir => {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf8');

        // Tìm pattern t('key') và t("key")
        const matches = content.match(/t\((['"`])([^'"`]+)\1\)/g);
        if (matches) {
          matches.forEach(match => {
            const key = match.match(/t\((['"`])([^'"`]+)\1\)/)[2];
            usedKeys.add(key);
          });
        }
      }
    });
  };

  scanDirectory(srcDir);
  return Array.from(usedKeys);
};

// Kiểm tra và báo cáo
const checkTranslations = () => {
  const translations = loadTranslations();
  const usedKeys = findUsedKeys();
  const languages = Object.keys(translations);

  console.log('🔍 KIỂM TRA ĐA NGÔN NGỮ (i18n)');
  console.log('='.repeat(50));

  // Thống kê số lượng keys
  console.log('\n📊 THỐNG KÊ:');
  languages.forEach(lang => {
    const count = Object.keys(translations[lang]).length;
    console.log(`${lang.toUpperCase()}: ${count} keys`);
  });

  console.log(`USED IN CODE: ${usedKeys.length} keys`);

  // Tìm keys thiếu cho từng ngôn ngữ
  console.log('\n⚠️  KEYS THIẾU:');
  const enKeys = new Set(Object.keys(translations.en || {}));

  languages.forEach(lang => {
    if (lang === 'en') return; // Bỏ qua tiếng Anh (base language)

    const langKeys = new Set(Object.keys(translations[lang]));
    const missingKeys = Array.from(enKeys).filter(key => !langKeys.has(key));

    if (missingKeys.length > 0) {
      console.log(`\n${lang.toUpperCase()} thiếu ${missingKeys.length} keys:`);
      missingKeys.slice(0, 10).forEach(key => console.log(`  - ${key}`));
      if (missingKeys.length > 10) {
        console.log(`  ... và ${missingKeys.length - 10} keys khác`);
      }
    } else {
      console.log(`\n${lang.toUpperCase()}: ✅ Đầy đủ`);
    }
  });

  // Tìm keys được dùng trong code nhưng không có trong translations
  console.log('\n❌ KEYS ĐƯỢC DÙNG NHƯNG KHÔNG CÓ TRANSLATION:');
  const missingInAllLangs = usedKeys.filter(key => {
    return !languages.some(lang => translations[lang][key]);
  });

  if (missingInAllLangs.length > 0) {
    missingInAllLangs.forEach(key => console.log(`  - ${key}`));
  } else {
    console.log('✅ Tất cả keys đều có translation');
  }

  // Tìm keys có trong translations nhưng không được dùng
  console.log('\n🗑️  KEYS KHÔNG ĐƯỢC SỬ DỤNG (có thể xóa):');
  const allTranslationKeys = new Set();
  languages.forEach(lang => {
    Object.keys(translations[lang]).forEach(key => allTranslationKeys.add(key));
  });

  const unusedKeys = Array.from(allTranslationKeys).filter(
    key => !usedKeys.includes(key),
  );
  if (unusedKeys.length > 0) {
    unusedKeys.slice(0, 15).forEach(key => console.log(`  - ${key}`));
    if (unusedKeys.length > 15) {
      console.log(`  ... và ${unusedKeys.length - 15} keys khác`);
    }
  } else {
    console.log('✅ Tất cả keys đều được sử dụng');
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Hoàn thành kiểm tra!');
};

// Chạy kiểm tra
checkTranslations();
