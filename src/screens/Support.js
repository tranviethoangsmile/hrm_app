import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';

const FAQS = [
  {q: 'support.faq_q1', a: 'support.faq_a1'},
  {q: 'support.faq_q2', a: 'support.faq_a2'},
  {q: 'support.faq_q3', a: 'support.faq_a3'},
  {q: 'support.faq_q4', a: 'support.faq_a4'},
  {q: 'support.faq_q5', a: 'support.faq_a5'},
];

const PHONE_NUMBER = '1900 0000';
const EMAIL_ADDRESS = 'hr@company.com';

const Support = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const [openIndex, setOpenIndex] = useState(null);

  const handleCall = () => {
    Linking.openURL(`tel:${PHONE_NUMBER.replace(/\s/g, '')}`).catch(() => {
      Alert.alert(PHONE_NUMBER);
    });
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${EMAIL_ADDRESS}`).catch(() => {
      Alert.alert(EMAIL_ADDRESS);
    });
  };

  const renderContact = ({icon, label, value, onPress}) => (
    <TouchableOpacity
      style={[
        styles.contactRow,
        {backgroundColor: colors.surface, borderColor: colors.border},
      ]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={[styles.contactIcon, {backgroundColor: colors.primaryLight}]}>
        <Icon name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactLabel, {color: colors.textSecondary}]}>
          {label}
        </Text>
        <Text style={[styles.contactValue, {color: colors.text}]}>{value}</Text>
      </View>
      <Icon name="chevron-forward" size={18} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title={t('support.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionLabel, {color: colors.primary}]}>
          {t('support.contact')}
        </Text>
        {renderContact({
          icon: 'call-outline',
          label: t('support.phone'),
          value: PHONE_NUMBER,
          onPress: handleCall,
        })}
        {renderContact({
          icon: 'mail-outline',
          label: t('support.email'),
          value: EMAIL_ADDRESS,
          onPress: handleEmail,
        })}
        {renderContact({
          icon: 'time-outline',
          label: t('support.hours'),
          value: t('support.hours_value'),
        })}

        <Text style={[styles.sectionLabel, {color: colors.primary}]}>
          {t('support.faq')}
        </Text>
        {FAQS.map((faq, index) => {
          const open = openIndex === index;
          return (
            <View
              key={index}
              style={[
                styles.faqCard,
                {backgroundColor: colors.surface, borderColor: colors.border},
              ]}>
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => setOpenIndex(open ? null : index)}
                activeOpacity={0.8}>
                <Text style={[styles.faqQuestion, {color: colors.text}]}>
                  {t(faq.q)}
                </Text>
                <Icon
                  name={open ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
              {open ? (
                <Text style={[styles.faqAnswer, {color: colors.textSecondary}]}>
                  {t(faq.a)}
                </Text>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 10,
    marginTop: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 10,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  faqCard: {
    borderRadius: 14,
    borderWidth: 0.5,
    marginBottom: 10,
    paddingHorizontal: 14,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 19,
    paddingBottom: 14,
  },
});

export default Support;