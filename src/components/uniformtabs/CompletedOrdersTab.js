import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  RefreshControl,
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import {
  BASE_URL,
  API,
  VERSION,
  V1,
  UNIFORM_ORDER,
  SEARCH,
  WITH_USER_ID,
  PORT,
} from '../../utils/constans';
import ModalMessage from '../ModalMessage';
import apiClient from '../../services/apiClient';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

const CompletedOrdersTab = ({USER_INFOR, isDarkMode, colors}) => {
  const {t} = useTranslation();
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [uniformOrders, setUniformOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const showMessage = useCallback((msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setMessageModalVisible(true);
  }, []);

  const handle_get_all_uniform_order_of_user = useCallback(async () => {
    try {
      const URL = `${BASE_URL}${PORT}${API}${VERSION}${V1}${UNIFORM_ORDER}${SEARCH}${WITH_USER_ID}`;
      const response = await apiClient.post(URL, {
        user_id: USER_INFOR.id,
        order_status: 'completed',
      });
      if (!response?.data.success || response?.data.data.length === 0) {
        showMessage('not.data', 'warning');
        setUniformOrders([]);
      } else {
        setUniformOrders(response?.data.data);
      }
    } catch (error) {
      showMessage('err', 'error');
    }
  }, [USER_INFOR.id, showMessage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await handle_get_all_uniform_order_of_user();
    setRefreshing(false);
  }, [handle_get_all_uniform_order_of_user]);

  useEffect(() => {
    handle_get_all_uniform_order_of_user();
  }, [handle_get_all_uniform_order_of_user]);

  const renderItem = ({item, index}) => (
    <Animated.View
      style={[
        styles.orderContainer,
        {backgroundColor: colors.surface, borderColor: colors.border},
      ]}>
      <View style={styles.timelineContainer}>
        <View
          style={[
            styles.timelineLine,
            {backgroundColor: colors.success + '30'},
          ]}
        />
        <View
          style={[
            styles.timelineDot,
            {backgroundColor: colors.success + '15'},
          ]}>
          <Icon name="checkmark-circle" size={20} color={colors.success} />
        </View>
      </View>

      <View style={styles.orderContent}>
        <View style={styles.orderHeader}>
          <View
            style={[
              styles.orderIcon,
              {backgroundColor: colors.success + '20'},
            ]}>
            <Icon
              name="checkmark-circle-outline"
              size={22}
              color={colors.success}
            />
          </View>
          <View style={styles.orderInfo}>
            <Text style={[styles.uniformType, {color: colors.text}]}>
              {t(`${item.uniform_type}`)}
            </Text>
            <Text style={[styles.orderDate, {color: colors.textSecondary}]}>
              {t('completed_date')}: {item.delivery_date || 'N/A'}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: colors.success + '15'},
            ]}>
            <Text style={[styles.statusText, {color: colors.success}]}>
              {t('completed')}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Icon
              name="resize-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>
              {t('size')}:
            </Text>
            <Text style={[styles.detailsValue, {color: colors.text}]}>
              {item.uniform_size}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="cart-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>
              {t('quantity')}:
            </Text>
            <Text style={[styles.detailsValue, {color: colors.text}]}>
              {item.quantity}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.completionSection,
            {backgroundColor: colors.success + '08'},
          ]}>
          <View style={styles.completionRow}>
            <Icon name="calendar-outline" size={15} color={colors.success} />
            <Text
              style={[styles.completionLabel, {color: colors.textSecondary}]}>
              {t('delivery_date')}:
            </Text>
            <Text style={[styles.completionValue, {color: colors.success}]}>
              {item.delivery_date}
            </Text>
          </View>
          <View
            style={[
              styles.successBar,
              {backgroundColor: colors.success + '20'},
            ]}>
            <View
              style={[styles.successFill, {backgroundColor: colors.success}]}
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {uniformOrders.length > 0 ? (
        <FlatList
          data={uniformOrders}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIcon,
              {backgroundColor: colors.backgroundSecondary},
            ]}>
            <Icon
              name="checkmark-done-outline"
              size={40}
              color={colors.textSecondary}
            />
          </View>
          <Text style={[styles.noDataText, {color: colors.textSecondary}]}>
            {t('not.data')}
          </Text>
        </View>
      )}
      <ModalMessage
        isVisible={isMessageModalVisible}
        message={message}
        type={messageType}
        t={t}
        onClose={() => setMessageModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  orderContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 0.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  timelineContainer: {
    width: 40,
    alignItems: 'center',
    paddingVertical: 16,
  },
  timelineLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    left: 19,
  },
  timelineDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  orderContent: {
    flex: 1,
    padding: 14,
    paddingLeft: 6,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  orderInfo: {
    flex: 1,
  },
  uniformType: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  orderDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  completionSection: {
    borderRadius: 14,
    padding: 10,
  },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  completionLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  completionValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  successBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  successFill: {
    height: '100%',
    borderRadius: 2,
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 15,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default CompletedOrdersTab;
