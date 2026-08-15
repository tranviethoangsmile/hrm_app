import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';
import SectionHeader from '../components/common/SectionHeader';

const MOCK_GROUPS = [
  {
    title: 'Sản xuất Kim loại',
    members: [
      {name: 'Nguyễn Văn A', role: 'Trưởng ca', phone: '0901 234 567'},
      {name: 'Trần Thị B', role: 'Thợ cơ khí', phone: '0902 345 678'},
      {name: 'Lê Văn C', role: 'Thợ hàn', phone: '0903 456 789'},
    ],
  },
  {
    title: 'Kỹ thuật',
    members: [
      {name: 'Phạm Văn D', role: 'Kỹ sư sản xuất', phone: '0904 567 890'},
      {name: 'Hoàng Thị E', role: 'QC', phone: '0905 678 901'},
    ],
  },
  {
    title: 'Hành chính – Nhân sự',
    members: [
      {name: 'Vũ Văn F', role: 'HR', phone: '0906 789 012'},
      {name: 'Đặng Thị G', role: 'Kế toán', phone: '0907 890 123'},
    ],
  },
];

const Directory = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const groups = useMemo(() => {
    if (!q) {
      return MOCK_GROUPS;
    }
    return MOCK_GROUPS.map(group => ({
      ...group,
      members: group.members.filter(
        m =>
          m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q),
      ),
    })).filter(group => group.members.length > 0);
  }, [q]);

  const handleCall = member => {
    Alert.alert(member.name, member.phone);
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title={t('directory.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.searchWrap,
            {backgroundColor: colors.surface, borderColor: colors.border},
          ]}>
          <Icon name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, {color: colors.text}]}
            placeholder={t('directory.search')}
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Icon
                name="close-circle"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {groups.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Icon
              name="people-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
              {t('feat.search_empty')}
            </Text>
          </View>
        ) : (
          groups.map(group => (
            <View key={group.title} style={styles.group}>
              <SectionHeader title={group.title} icon="people-circle-outline" />
              {group.members.map((member, index) => (
                <View
                  key={index}
                  style={[
                    styles.memberRow,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}>
                  <View
                    style={[
                      styles.memberAvatar,
                      {backgroundColor: colors.primaryLight},
                    ]}>
                    <Text
                      style={[styles.memberInitial, {color: colors.primary}]}>
                      {member.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, {color: colors.text}]}>
                      {member.name}
                    </Text>
                    <Text
                      style={[
                        styles.memberRole,
                        {color: colors.textSecondary},
                      ]}>
                      {member.role}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleCall(member)}
                    style={[
                      styles.callButton,
                      {backgroundColor: colors.primaryLight},
                    ]}
                    activeOpacity={0.8}>
                    <Icon name="call" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        )}

        <View
          style={[styles.pendingNote, {backgroundColor: colors.primaryLight}]}>
          <Icon name="cloud-upload-outline" size={18} color={colors.primary} />
          <Text style={[styles.pendingText, {color: colors.primary}]}>
            {t('directory.pending')}
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 0.5,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  group: {
    marginBottom: 18,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 12,
    marginBottom: 8,
  },
  memberAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInitial: {
    fontSize: 18,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
  },
  memberRole: {
    fontSize: 13,
    marginTop: 2,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
  },
  pendingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  pendingText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default Directory;
