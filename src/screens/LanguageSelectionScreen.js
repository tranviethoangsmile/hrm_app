import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import i18next from '../../services/i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../hooks/useTheme';
import {SIZES, FONTS} from '../config/theme';

const SUPPORTED_LOCALES = [
  {id: 'vi', flag: '🇻🇳', label: 'Tiếng Việt'},
  {id: 'ja', flag: '🇯🇵', label: '日本語'},
  {id: 'en', flag: '🇺🇸', label: 'English'},
  {id: 'pt', flag: '🇧🇷', label: 'Português (Brasil)'},
];

const LanguageSelectionScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors, isDarkMode} = useTheme();
  const [selectedLocale, setSelectedLocale] = useState(null);
  const [saving, setSaving] = useState(false);

  const continueToLogin = async () => {
    if (!selectedLocale || saving) return;
    setSaving(true);
    try {
      await AsyncStorage.setItem('Language', selectedLocale);
      await i18next.changeLanguage(selectedLocale);
      navigation.reset({index: 0, routes: [{name: 'Login'}]});
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={styles.header}>
        <View style={[styles.logoMark, {backgroundColor: colors.primaryLight}]}>
          <Icon name="language-outline" size={28} color={colors.primary} />
        </View>
        <Text style={[styles.title, {color: colors.text}]}>
          {t('app.language_title')}
        </Text>
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
          {t('app.language_subtitle')}
        </Text>
      </View>
      <FlatList
        data={SUPPORTED_LOCALES}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => {
          const selected = selectedLocale === item.id;
          return (
            <TouchableOpacity
              style={[
                styles.option,
                {backgroundColor: colors.surface, borderColor: colors.border},
                selected && {
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setSelectedLocale(item.id)}
              activeOpacity={0.75}
              accessibilityRole="radio"
              accessibilityState={{selected}}
              accessibilityLabel={item.label}>
              <Text style={styles.flag}>{item.flag}</Text>
              <Text style={[styles.language, {color: colors.text}]}>
                {item.label}
              </Text>
              {selected ? (
                <Icon name="checkmark-circle" size={23} color={colors.primary} />
              ) : (
                <View style={[styles.emptyCheck, {borderColor: colors.border}]} />
              )}
            </TouchableOpacity>
          );
        }}
      />
      <TouchableOpacity
        style={[
          styles.continue,
          {backgroundColor: selectedLocale ? colors.primary : colors.surfaceSecondary},
        ]}
        onPress={continueToLogin}
        disabled={!selectedLocale || saving}
        activeOpacity={0.8}
        accessibilityRole="button">
        <Text style={[styles.continueText, {color: selectedLocale ? '#fff' : colors.textTertiary}]}>
          {saving ? t('Loading') : t('app.continue')}
        </Text>
        <Icon name="arrow-forward" size={19} color={selectedLocale ? '#fff' : colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingHorizontal: SIZES.spacing.xxl, paddingTop: SIZES.spacing.section},
  header: {alignItems: 'center', marginBottom: SIZES.spacing.xxl},
  logoMark: {width: 64, height: 64, borderRadius: SIZES.radiusScale.lg, alignItems: 'center', justifyContent: 'center', marginBottom: SIZES.spacing.xl},
  title: {...FONTS.title, textAlign: 'center'},
  subtitle: {...FONTS.body, textAlign: 'center', marginTop: SIZES.spacing.sm, maxWidth: 310},
  list: {gap: SIZES.spacing.md, paddingBottom: SIZES.spacing.xl},
  option: {minHeight: 68, borderWidth: 1, borderRadius: SIZES.radiusScale.md, paddingHorizontal: SIZES.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: SIZES.spacing.md},
  flag: {fontSize: 25},
  language: {...FONTS.bodyMedium, flex: 1},
  emptyCheck: {width: 23, height: 23, borderRadius: 12, borderWidth: 1.5},
  continue: {minHeight: 54, borderRadius: SIZES.radiusScale.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SIZES.spacing.sm, marginBottom: SIZES.spacing.xxl},
  continueText: {...FONTS.bodyMedium},
});

export default LanguageSelectionScreen;
