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
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';

const MOCK_LEAVE = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    type: 'annual',
    dateRange: '20/08/2026 – 21/08/2026',
    days: 2,
    reason: 'Nghỉ phép năm',
    sentAt: '2 giờ trước',
  },
  {
    id: 2,
    name: 'Trần Thị Bích',
    type: 'sick',
    dateRange: '18/08/2026',
    days: 1,
    reason: 'Khám bệnh',
    sentAt: '5 giờ trước',
  },
  {
    id: 3,
    name: 'Lê Văn Cường',
    type: 'personal',
    dateRange: '25/08/2026 – 27/08/2026',
    days: 3,
    reason: 'Việc gia đình',
    sentAt: 'Hôm qua',
  },
];

const MOCK_OVERTIME = [
  {
    id: 1,
    name: 'Phạm Văn Dũng',
    date: '15/08/2026',
    hours: 2,
    reason: 'Chạy đơn gấp',
    sentAt: '1 giờ trước',
  },
  {
    id: 2,
    name: 'Hoàng Thị Hạnh',
    date: '16/08/2026',
    hours: 3,
    reason: 'Kiểm kê cuối tháng',
    sentAt: '3 giờ trước',
  },
];

const TYPE_LABEL_KEY = {
  annual: 'approval.annual',
  sick: 'approval.sick',
  personal: 'approval.personal',
};

const Approvals = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const [tab, setTab] = useState('leave');
  const [leaveItems, setLeaveItems] = useState(MOCK_LEAVE);
  const [otItems, setOtItems] = useState(MOCK_OVERTIME);
  const [rejectItem, setRejectItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const items = tab === 'leave' ? leaveItems : otItems;
  const setItems =
    tab === 'leave'
      ? setLeaveItems
      : setOtItems;

  const removeItem = id => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleApprove = item => {
    Alert.alert(
      t('approval.confirm_approve_title'),
      t('approval.confirm_approve_msg', {name: item.name}),
      [
        {text: t('approval.cancel'), style: 'cancel'},
        {
          text: t('approval.approve'),
          onPress: () => {
            removeItem(item.id);
            Alert.alert(t('approval.approved_msg', {name: item.name}));
          },
        },
      ],
    );
  };

  const handleOpenReject = item => {
    setRejectItem(item);
    setRejectReason('');
  };

  const handleConfirmReject = () => {
    if (!rejectItem) return;
    const name = rejectItem.name;
    removeItem(rejectItem.id);
    setRejectItem(null);
    setRejectReason('');
    Alert.alert(t('approval.rejected_msg', {name}));
  };

  const renderLeaveCard = item => (
    <View
      key={item.id}
      style={[
        styles.card,
        {backgroundColor: colors.surface, borderColor: colors.border},
      ]}>
      <View style={styles.cardHeader}>
        <View
          style={[styles.avatar, {backgroundColor: colors.primaryLight}]}>
          <Text style={[styles.avatarText, {color: colors.primary}]}>
            {item.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.cardIdentity}>
          <Text style={[styles.name, {color: colors.text}]}>{item.name}</Text>
          <Text style={[styles.sentAt, {color: colors.textSecondary}]}>
            {t('approval.sent_at')} · {item.sentAt}
          </Text>
        </View>
        <View style={[styles.typeBadge, {backgroundColor: colors.primaryLight}]}>
          <Text style={[styles.typeBadgeText, {color: colors.primary}]}>
            {t(TYPE_LABEL_KEY[item.type] || 'approval.annual')}
          </Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Icon name="calendar-outline" size={16} color={colors.textSecondary} />
        <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>
          {t('approval.date_range')}
        </Text>
        <Text style={[styles.detailValue, {color: colors.text}]}>
          {item.dateRange} · {item.days} {t('approval.day_unit')}
        </Text>
      </View>

      <View style={[styles.reasonBox, {backgroundColor: colors.backgroundSecondary}]}>
        <Text style={[styles.reasonText, {color: colors.text}]}>
          {item.reason}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.rejectBtn, {borderColor: colors.danger}]}
          onPress={() => handleOpenReject(item)}
          activeOpacity={0.8}>
          <Icon name="close-circle-outline" size={18} color={colors.danger} />
          <Text style={[styles.rejectText, {color: colors.danger}]}>
            {t('approval.reject')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.approveBtn, {backgroundColor: colors.success}]}
          onPress={() => handleApprove(item)}
          activeOpacity={0.8}>
          <Icon name="checkmark-circle-outline" size={18} color="#fff" />
          <Text style={styles.approveText}>{t('approval.approve')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOvertimeCard = item => (
    <View
      key={item.id}
      style={[
        styles.card,
        {backgroundColor: colors.surface, borderColor: colors.border},
      ]}>
      <View style={styles.cardHeader}>
        <View
          style={[styles.avatar, {backgroundColor: colors.primaryLight}]}>
          <Text style={[styles.avatarText, {color: colors.primary}]}>
            {item.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.cardIdentity}>
          <Text style={[styles.name, {color: colors.text}]}>{item.name}</Text>
          <Text style={[styles.sentAt, {color: colors.textSecondary}]}>
            {t('approval.sent_at')} · {item.sentAt}
          </Text>
        </View>
        <View style={[styles.typeBadge, {backgroundColor: colors.primaryLight}]}>
          <Text style={[styles.typeBadgeText, {color: colors.primary}]}>
            {item.hours} {t('approval.hour_unit')}
          </Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Icon name="time-outline" size={16} color={colors.textSecondary} />
        <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>
          {t('approval.date_range')}
        </Text>
        <Text style={[styles.detailValue, {color: colors.text}]}>
          {item.date}
        </Text>
      </View>

      <View style={[styles.reasonBox, {backgroundColor: colors.backgroundSecondary}]}>
        <Text style={[styles.reasonText, {color: colors.text}]}>
          {item.reason}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.rejectBtn, {borderColor: colors.danger}]}
          onPress={() => handleOpenReject(item)}
          activeOpacity={0.8}>
          <Icon name="close-circle-outline" size={18} color={colors.danger} />
          <Text style={[styles.rejectText, {color: colors.danger}]}>
            {t('approval.reject')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.approveBtn, {backgroundColor: colors.success}]}
          onPress={() => handleApprove(item)}
          activeOpacity={0.8}>
          <Icon name="checkmark-circle-outline" size={18} color="#fff" />
          <Text style={styles.approveText}>{t('approval.approve')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title={t('approval.title')} onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
          {t('approval.subtitle')}
        </Text>

        <View
          style={[
            styles.segment,
            {backgroundColor: colors.backgroundSecondary, borderColor: colors.border},
          ]}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              tab === 'leave' && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => setTab('leave')}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.segmentText,
                {color: tab === 'leave' ? '#fff' : colors.textSecondary},
              ]}>
              {t('approval.tab_leave')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              tab === 'overtime' && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => setTab('overtime')}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.segmentText,
                {color: tab === 'overtime' ? '#fff' : colors.textSecondary},
              ]}>
              {t('approval.tab_overtime')}
            </Text>
          </TouchableOpacity>
        </View>

        {items.length > 0 ? (
          <Text style={[styles.count, {color: colors.textSecondary}]}>
            {t('approval.pending_count', {count: items.length})}
          </Text>
        ) : null}

        {items.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Icon
              name="checkmark-done-circle-outline"
              size={52}
              color={colors.textTertiary}
            />
            <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
              {t('approval.empty')}
            </Text>
          </View>
        ) : tab === 'leave' ? (
          items.map(renderLeaveCard)
        ) : (
          items.map(renderOvertimeCard)
        )}
      </ScrollView>

      <Modal
        transparent
        visible={rejectItem !== null}
        animationType="fade"
        onRequestClose={() => setRejectItem(null)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {backgroundColor: colors.surface},
            ]}>
            <Text style={[styles.modalTitle, {color: colors.text}]}>
              {t('approval.confirm_reject_title')}
            </Text>
            <Text style={[styles.modalName, {color: colors.textSecondary}]}>
              {rejectItem?.name}
            </Text>
            <TextInput
              style={[
                styles.reasonInput,
                {
                  color: colors.text,
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                },
              ]}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder={t('approval.reject_reason')}
              placeholderTextColor={colors.textTertiary}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, {borderColor: colors.border}]}
                onPress={() => setRejectItem(null)}
                activeOpacity={0.8}>
                <Text style={[styles.modalCancelText, {color: colors.text}]}>
                  {t('approval.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, {backgroundColor: colors.danger}]}
                onPress={handleConfirmReject}
                activeOpacity={0.8}>
                <Text style={styles.modalConfirmText}>
                  {t('approval.reject')}
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
  subtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 4,
    marginBottom: 14,
  },
  segmentBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardIdentity: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  sentAt: {
    fontSize: 12,
    marginTop: 2,
  },
  typeBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
    marginRight: 8,
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  reasonBox: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  reasonText: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    gap: 6,
  },
  rejectText: {
    fontSize: 14,
    fontWeight: '700',
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  approveText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    borderRadius: 18,
    padding: 18,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalName: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },
  reasonInput: {
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 12,
    minHeight: 84,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  modalCancelBtn: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 12,
  },
  modalConfirmText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default Approvals;
