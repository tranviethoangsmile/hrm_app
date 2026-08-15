import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';

const MOCK_ORG = [
  {
    icon: 'business-outline',
    gradient: ['#4F46E5', '#7C3AED'],
    name: 'Ban Giám đốc',
    members: [
      {name: 'Nguyễn Văn Giám', position: 'Tổng Giám đốc'},
      {name: 'Trần Thị Điều', position: 'Phó Tổng Giám đốc'},
    ],
  },
  {
    icon: 'construct-outline',
    gradient: ['#F59E0B', '#EF4444'],
    name: 'Sản xuất Kim loại',
    members: [
      {name: 'Nguyễn Văn A', position: 'Trưởng ca'},
      {name: 'Trần Thị B', position: 'Thợ cơ khí'},
      {name: 'Lê Văn C', position: 'Thợ hàn'},
      {name: 'Phạm Văn D', position: 'Kỹ sư sản xuất'},
    ],
  },
  {
    icon: 'hard-hat-outline',
    gradient: ['#0EA5E9', '#6366F1'],
    name: 'Kỹ thuật & QC',
    members: [
      {name: 'Hoàng Thị E', position: 'QC'},
      {name: 'Vũ Văn F', position: 'Kỹ sư thiết bị'},
    ],
  },
  {
    icon: 'people-outline',
    gradient: ['#10B981', '#0EA5E9'],
    name: 'Hành chính – Nhân sự',
    members: [
      {name: 'Đặng Thị G', position: 'Trưởng phòng HR'},
      {name: 'Bùi Văn H', position: 'Kế toán'},
    ],
  },
];

const OrgChart = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title={t('orgchart.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={colors.primaryGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.heroCard}>
          <Text style={styles.heroTitle}>{t('orgchart.title')}</Text>
          <Text style={styles.heroSub}>{t('orgchart.subtitle')}</Text>
          <View style={styles.heroStatRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{MOCK_ORG.length}</Text>
              <Text style={styles.heroStatLabel}>
                {t('orgchart.departments')}
              </Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>
                {MOCK_ORG.reduce((sum, d) => sum + d.members.length, 0)}
              </Text>
              <Text style={styles.heroStatLabel}>{t('orgchart.members')}</Text>
            </View>
          </View>
        </LinearGradient>

        {MOCK_ORG.map((dept, index) => {
          const open = openIndex === index;
          return (
            <View
              key={dept.name}
              style={[
                styles.deptCard,
                {backgroundColor: colors.surface, borderColor: colors.border},
              ]}>
              <TouchableOpacity
                style={styles.deptHeader}
                onPress={() => setOpenIndex(open ? null : index)}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={dept.gradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.deptIcon}>
                  <Icon name={dept.icon} size={22} color="#fff" />
                </LinearGradient>
                <View style={styles.deptInfo}>
                  <Text style={[styles.deptName, {color: colors.text}]}>
                    {dept.name}
                  </Text>
                  <Text
                    style={[styles.deptCount, {color: colors.textSecondary}]}>
                    {dept.members.length} {t('orgchart.members')}
                  </Text>
                </View>
                <Icon
                  name={open ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
              {open ? (
                <View style={styles.memberList}>
                  {dept.members.map((member, i) => (
                    <View
                      key={i}
                      style={[
                        styles.memberRow,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: colors.border,
                        },
                      ]}>
                      <View
                        style={[
                          styles.avatar,
                          {backgroundColor: dept.gradient[0] + '22'},
                        ]}>
                        <Text
                          style={[
                            styles.avatarText,
                            {color: dept.gradient[0]},
                          ]}>
                          {member.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={[styles.memberName, {color: colors.text}]}>
                          {member.name}
                        </Text>
                        <Text
                          style={[
                            styles.memberPosition,
                            {color: colors.textSecondary},
                          ]}>
                          {member.position}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}

        <View
          style={[styles.pendingNote, {backgroundColor: colors.primaryLight}]}>
          <Icon name="cloud-upload-outline" size={18} color={colors.primary} />
          <Text style={[styles.pendingText, {color: colors.primary}]}>
            {t('orgchart.pending')}
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
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 12,
  },
  deptCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 10,
  },
  deptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  deptIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deptInfo: {
    flex: 1,
  },
  deptName: {
    fontSize: 15,
    fontWeight: '700',
  },
  deptCount: {
    fontSize: 12,
    marginTop: 2,
  },
  memberList: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 10,
    marginBottom: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
  },
  memberPosition: {
    fontSize: 12,
    marginTop: 2,
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

export default OrgChart;
