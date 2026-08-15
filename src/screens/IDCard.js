import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from '../components/common/QRCode';
import UploadAvatar from '../components/UploadAvatar';
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';
import {useUserProfile} from '../hooks/useUserProfile';
import {useSelector} from 'react-redux';

const IDCard = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const authData = useSelector(state => state.auth);
  const loginInfo = authData?.data?.data || {};
  const {userInfo: profileInfo, refresh} = useUserProfile();
  const user = {...(loginInfo || {}), ...(profileInfo || {})};
  const user_id = authData?.data?.data?.id;
  const [isAvatarModal, setIsAvatarModal] = useState(false);

  const handleAvatarSuccess = () => {
    setIsAvatarModal(false);
    refresh();
  };

  const rows = [
    {
      icon: 'id-card-outline',
      label: t('idcard.employee_code'),
      value: user?.employee_id || user?.employee_code || user?.code || '—',
    },
    {
      icon: 'business-outline',
      label: t('idcard.department'),
      value: user?.department?.name || user?.department_name || '—',
    },
    {
      icon: 'briefcase-outline',
      label: t('idcard.position'),
      value: user?.role || '—',
    },
    {icon: 'call-outline', label: t('idcard.phone'), value: user?.phone || '—'},
    {icon: 'mail-outline', label: t('idcard.email'), value: user?.email || '—'},
    {
      icon: 'location-outline',
      label: t('idcard.address'),
      value: user?.position || '—',
    },
    {
      icon: 'calendar-number-outline',
      label: t('idcard.paid_days'),
      value: user?.paid_days != null ? `${user.paid_days}` : '—',
    },
  ];

  const qrPayload = JSON.stringify({
    employee_code: user?.employee_id || user?.employee_code || user?.code || '',
    full_name: user?.full_name || user?.name || '',
    department: user?.department?.name || user?.department_name || '',
    position: user?.role || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title={t('idcard.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* ID Card visual */}
        <LinearGradient
          colors={colors.primaryGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.card}>
          <View style={styles.cardTop}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setIsAvatarModal(true)}>
              <View style={styles.avatarWrap}>
                <Image
                  source={
                    user?.avatar
                      ? {uri: user.avatar}
                      : require('../assets/images/avatar.jpg')
                  }
                  style={styles.avatar}
                />
                <View style={styles.avatarOverlay}>
                  <Icon name="camera" size={16} color="#ffffff" />
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName} numberOfLines={1}>
                {user?.full_name || user?.name || '—'}
              </Text>
              <Text style={styles.cardCode}>
                {user?.employee_id || user?.employee_code || user?.code || ''}
              </Text>
            </View>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.cardFooter}>
            <View style={styles.qrBox}>
              <QRCode
                value={qrPayload}
                size={68}
                color="#111827"
                backgroundColor="#ffffff"
              />
            </View>
            <View style={styles.cardMeta}>
              <Text style={styles.cardMetaLabel}>{t('idcard.department')}</Text>
              <Text style={styles.cardMetaValue} numberOfLines={1}>
                {user?.department?.name || user?.department_name || '—'}
              </Text>
              <Text style={styles.cardMetaLabel}>{t('idcard.position')}</Text>
              <Text style={styles.cardMetaValue} numberOfLines={1}>
                {user?.role || '—'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Detail rows */}
        <View
          style={[
            styles.detailCard,
            {backgroundColor: colors.surface, borderColor: colors.border},
          ]}>
          {rows.map((row, index) => (
            <View
              key={index}
              style={[
                styles.detailRow,
                index < rows.length - 1 && styles.detailRowBorder,
              ]}>
              <View
                style={[
                  styles.detailIcon,
                  {backgroundColor: colors.primaryLight},
                ]}>
                <Icon name={row.icon} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>
                {row.label}
              </Text>
              <Text
                style={[styles.detailValue, {color: colors.text}]}
                numberOfLines={2}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.scanHint, {backgroundColor: colors.primaryLight}]}>
          <Icon name="scan-outline" size={18} color={colors.primary} />
          <Text style={[styles.scanHintText, {color: colors.primary}]}>
            {t('idcard.scan_hint')}
          </Text>
        </View>
      </ScrollView>

      <UploadAvatar
        visible={isAvatarModal}
        closeModal={() => setIsAvatarModal(false)}
        t={t}
        user_id={user_id}
        avatar_url={user?.avatar}
        onSuccess={handleAvatarSuccess}
      />
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
  card: {
    borderRadius: 22,
    padding: 20,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 14,
  },
  cardName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  cardCode: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginVertical: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardMeta: {
    flex: 1,
  },
  cardMetaLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 4,
  },
  cardMetaValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailCard: {
    borderRadius: 18,
    borderWidth: 0.5,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  detailRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailLabel: {
    width: 110,
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  scanHint: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  scanHintText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default IDCard;
