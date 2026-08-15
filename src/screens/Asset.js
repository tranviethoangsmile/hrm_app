import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';

const MOCK_ASSETS = [
  {
    id: 1,
    icon: 'desktop-outline',
    code: 'PC-0012',
    name: 'Máy tính PC01',
    issued: '15/01/2026',
    status: 'in_use',
    gradient: ['#4F46E5', '#7C3AED'],
  },
  {
    id: 2,
    icon: 'hammer-outline',
    code: 'TL-0087',
    name: 'Bộ cờ lê inox',
    issued: '20/03/2026',
    status: 'in_use',
    gradient: ['#F59E0B', '#EF4444'],
  },
  {
    id: 3,
    icon: 'shield-outline',
    code: 'BH-0315',
    name: 'Mũ bảo hộ',
    issued: '02/05/2026',
    status: 'available',
    gradient: ['#10B981', '#0EA5E9'],
  },
  {
    id: 4,
    icon: 'shirt-outline',
    code: 'QT-0150',
    name: 'Đồng phục bảo hộ',
    issued: '10/06/2026',
    status: 'broken',
    gradient: ['#0EA5E9', '#6366F1'],
  },
];

const STATUS_KEY = {
  available: 'asset.status_available',
  in_use: 'asset.status_in_use',
  broken: 'asset.status_broken',
  returned: 'asset.status_returned',
};

const STATUS_COLOR = {
  available: '#10B981',
  in_use: '#4F46E5',
  broken: '#EF4444',
  returned: '#94A3B8',
};

const Asset = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const [assets, setAssets] = useState(MOCK_ASSETS);

  const inUse = assets.filter(a => a.status === 'in_use').length;
  const broken = assets.filter(a => a.status === 'broken').length;

  const handleReturn = asset => {
    Alert.alert(
      t('asset.confirm_return_title'),
      t('asset.confirm_return_msg', {name: asset.name}),
      [
        {text: t('asset.cancel'), style: 'cancel'},
        {
          text: t('asset.return_btn'),
          onPress: () => {
            setAssets(prev =>
              prev.map(a =>
                a.id === asset.id ? {...a, status: 'returned'} : a,
              ),
            );
            Alert.alert(t('asset.success_title'), t('asset.success_msg'));
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title={t('asset.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={colors.primaryGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroCard}>
          <Text style={styles.heroTitle}>{t('asset.title')}</Text>
          <Text style={styles.heroSub}>{t('asset.subtitle')}</Text>
          <View style={styles.heroStatRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{assets.length}</Text>
              <Text style={styles.heroStatLabel}>{t('asset.total')}</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{inUse}</Text>
              <Text style={styles.heroStatLabel}>
                {t('asset.status_in_use')}
              </Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{broken}</Text>
              <Text style={styles.heroStatLabel}>
                {t('asset.status_broken')}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {assets.map(asset => (
          <View
            key={asset.id}
            style={[
              styles.assetCard,
              {backgroundColor: colors.surface, borderColor: colors.border},
            ]}>
            <View style={styles.assetMain}>
              <LinearGradient
                colors={asset.gradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.assetIcon}>
                <Icon name={asset.icon} size={22} color="#fff" />
              </LinearGradient>
              <View style={styles.assetInfo}>
                <Text style={[styles.assetName, {color: colors.text}]}>
                  {asset.name}
                </Text>
                <Text style={[styles.assetCode, {color: colors.textSecondary}]}>
                  {t('asset.code')}: {asset.code}
                </Text>
                <Text
                  style={[styles.assetIssued, {color: colors.textSecondary}]}>
                  {t('asset.issued')}: {asset.issued}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {backgroundColor: STATUS_COLOR[asset.status] + '22'},
                ]}>
                <View
                  style={[
                    styles.statusDot,
                    {backgroundColor: STATUS_COLOR[asset.status]},
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    {color: STATUS_COLOR[asset.status]},
                  ]}>
                  {t(STATUS_KEY[asset.status])}
                </Text>
              </View>
            </View>
            {asset.status !== 'returned' ? (
              <TouchableOpacity
                style={[
                  styles.returnBtn,
                  {borderColor: STATUS_COLOR[asset.status]},
                ]}
                onPress={() => handleReturn(asset)}
                activeOpacity={0.8}>
                <Icon
                  name="return-up-back-outline"
                  size={16}
                  color={STATUS_COLOR[asset.status]}
                />
                <Text
                  style={[
                    styles.returnText,
                    {color: STATUS_COLOR[asset.status]},
                  ]}>
                  {t('asset.return_btn')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}

        <View
          style={[styles.pendingNote, {backgroundColor: colors.primaryLight}]}>
          <Icon name="cloud-upload-outline" size={18} color={colors.primary} />
          <Text style={[styles.pendingText, {color: colors.primary}]}>
            {t('asset.pending')}
          </Text>
        </View>
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
  heroStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  heroStat: {
    flex: 1,
  },
  heroStatValue: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 10,
  },
  assetCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 10,
  },
  assetMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 15,
    fontWeight: '700',
  },
  assetCode: {
    fontSize: 12,
    marginTop: 2,
  },
  assetIssued: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 9,
    marginTop: 12,
    gap: 6,
  },
  returnText: {
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
});

export default Asset;
