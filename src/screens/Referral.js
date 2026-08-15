/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';

const vnd = value =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const MOCK_JOBS = [
  {
    id: 1,
    icon: 'construct-outline',
    title: 'Thợ hàn MIG',
    department: 'Sản xuất Kim loại',
    bonus: 3000000,
    open: true,
    gradient: ['#4F46E5', '#7C3AED'],
  },
  {
    id: 2,
    icon: 'settings-outline',
    title: 'Kỹ sư bảo trì',
    department: 'Kỹ thuật & QC',
    bonus: 5000000,
    open: true,
    gradient: ['#0EA5E9', '#6366F1'],
  },
  {
    id: 3,
    icon: 'clipboard-outline',
    title: 'Nhân viên kho',
    department: 'Kho & Logistics',
    bonus: 2000000,
    open: false,
    gradient: ['#F59E0B', '#EF4444'],
  },
  {
    id: 4,
    icon: 'people-outline',
    title: 'Chuyên viên HR',
    department: 'Hành chính – Nhân sự',
    bonus: 4000000,
    open: true,
    gradient: ['#10B981', '#0EA5E9'],
  },
];

const Referral = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const [activeJob, setActiveJob] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const totalBonus = MOCK_JOBS.filter(j => j.open).reduce(
    (sum, j) => sum + j.bonus,
    0,
  );

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert(t('referral.form_title'), t('referral.required'));
      return;
    }
    setActiveJob(null);
    setName('');
    setPhone('');
    setEmail('');
    Alert.alert(
      t('referral.submit_success_title'),
      t('referral.submit_success_msg'),
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title={t('referral.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={colors.primaryGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroCard}>
          <Text style={styles.heroTitle}>{t('referral.title')}</Text>
          <Text style={styles.heroSub}>{t('referral.subtitle')}</Text>
          <View style={styles.heroBonusRow}>
            <Text style={styles.heroBonusValue}>{vnd(totalBonus)}</Text>
            <Text style={styles.heroBonusLabel}>
              {t('referral.total_bonus')}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.sectionLabelWrap}>
          <Text style={[styles.sectionLabel, {color: colors.primary}]}>
            {t('referral.open_positions')}
          </Text>
        </View>

        {MOCK_JOBS.map(job => (
          <View
            key={job.id}
            style={[
              styles.jobCard,
              {backgroundColor: colors.surface, borderColor: colors.border},
            ]}>
            <View style={styles.jobHeader}>
              <LinearGradient
                colors={job.gradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.jobIcon}>
                <Icon name={job.icon} size={22} color="#fff" />
              </LinearGradient>
              <View style={styles.jobInfo}>
                <Text style={[styles.jobTitle, {color: colors.text}]}>
                  {job.title}
                </Text>
                <Text style={[styles.jobDept, {color: colors.textSecondary}]}>
                  {job.department}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: job.open
                      ? colors.success
                      : colors.backgroundSecondary,
                  },
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    {color: job.open ? '#fff' : colors.textSecondary},
                  ]}>
                  {t(job.open ? 'referral.open' : 'referral.closed')}
                </Text>
              </View>
            </View>
            <View style={styles.jobFooter}>
              <Text style={[styles.bonusLabel, {color: colors.textSecondary}]}>
                {t('referral.bonus')}
              </Text>
              <Text style={[styles.bonusValue, {color: colors.primary}]}>
                {vnd(job.bonus)}
              </Text>
              <TouchableOpacity
                style={[
                  styles.referBtn,
                  {
                    backgroundColor: job.open
                      ? colors.primary
                      : colors.textTertiary,
                  },
                ]}
                disabled={!job.open}
                onPress={() => setActiveJob(job)}
                activeOpacity={0.85}>
                <Icon name="person-add-outline" size={16} color="#fff" />
                <Text style={styles.referBtnText}>{t('referral.refer')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View
          style={[styles.pendingNote, {backgroundColor: colors.primaryLight}]}>
          <Icon name="cloud-upload-outline" size={18} color={colors.primary} />
          <Text style={[styles.pendingText, {color: colors.primary}]}>
            {t('referral.pending')}
          </Text>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={activeJob !== null}
        animationType="slide"
        onRequestClose={() => setActiveJob(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, {backgroundColor: colors.surface}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: colors.text}]}>
                {t('referral.form_title')}
              </Text>
              <TouchableOpacity onPress={() => setActiveJob(null)} hitSlop={10}>
                <Icon name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalJob, {color: colors.primary}]}>
              {activeJob?.title}
            </Text>

            <Text style={[styles.fieldLabel, {color: colors.text}]}>
              {t('referral.candidate_name')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder={t('referral.candidate_name_ph')}
              placeholderTextColor={colors.textTertiary}
            />

            <Text style={[styles.fieldLabel, {color: colors.text}]}>
              {t('referral.candidate_phone')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
              ]}
              value={phone}
              onChangeText={setPhone}
              placeholder="0901 234 567"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
            />

            <Text style={[styles.fieldLabel, {color: colors.text}]}>
              {t('referral.candidate_email')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="name@company.com"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, {borderColor: colors.border}]}
                onPress={() => setActiveJob(null)}
                activeOpacity={0.8}>
                <Text style={[styles.modalCancelText, {color: colors.text}]}>
                  {t('referral.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  {backgroundColor: colors.primary},
                ]}
                onPress={handleSubmit}
                activeOpacity={0.85}>
                <Text style={styles.modalSubmitText}>
                  {t('referral.submit')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  heroCard: {
    borderRadius: 22,
    padding: 20,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
  },
  heroBonusRow: {
    marginTop: 16,
  },
  heroBonusValue: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
  },
  heroBonusLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionLabelWrap: {
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  jobCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 10,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  jobDept: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  jobFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#E2E8F0',
  },
  bonusLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  bonusValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  referBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  referBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  pendingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
    gap: 8,
  },
  pendingText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalJob: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderRadius: 12,
    borderWidth: 0.5,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
  },
  modalSubmitText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default Referral;
