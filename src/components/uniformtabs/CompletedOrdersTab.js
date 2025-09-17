import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
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
import axios from 'axios';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS, SIZES, FONTS, SHADOWS, LAYOUT} from '../../config/theme';

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
      const response = await axios.post(URL, {
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
    <Animated.View style={[styles.orderContainer, {backgroundColor: colors.surface}]}>
      <View style={styles.timelineContainer}>
        <View style={styles.timelineLine} />
        <View style={styles.timelineDot}>
          <Icon name="check-circle" size={20} color={COLORS.success} />
        </View>
      </View>
      
      <View style={styles.orderContent}>
        <View style={styles.orderHeader}>
          <View style={styles.orderIcon}>
            <Icon name="check-circle" size={24} color={COLORS.success} />
          </View>
          <View style={styles.orderInfo}>
            <Text style={[styles.uniformType, {color: colors.text}]}>{t(`${item.uniform_type}`)}</Text>
            <Text style={[styles.orderDate, {color: colors.textSecondary}]}>
              {t('completed_date')}: {item.delivery_date || 'N/A'}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{t('completed')}</Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Icon name="straighten" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>{t('size')}:</Text>
            <Text style={[styles.detailsValue, {color: colors.text}]}>{item.uniform_size}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="shopping-cart" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>{t('quantity')}:</Text>
            <Text style={[styles.detailsValue, {color: colors.text}]}>{item.quantity}</Text>
          </View>
        </View>

        <View style={styles.completionSection}>
          <View style={styles.completionRow}>
            <Icon name="schedule" size={16} color={COLORS.success} />
            <Text style={[styles.completionLabel, {color: colors.textSecondary}]}>{t('delivery_date')}:</Text>
            <Text style={[styles.completionValue, {color: COLORS.success}]}>{item.delivery_date}</Text>
          </View>
          <View style={styles.successBar}>
            <View style={styles.successFill} />
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="check-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.noDataText, {color: colors.textSecondary}]}>{t('not.data')}</Text>
        </View>
      )}
      <ModalMessage
        visible={isMessageModalVisible}
        message={t(message)}
        type={messageType}
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
    padding: SIZES.padding,
  },
  orderContainer: {
    flexDirection: 'row',
    borderRadius: SIZES.radius * 2,
    marginBottom: SIZES.padding,
    ...SHADOWS.large,
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  timelineContainer: {
    width: 40,
    alignItems: 'center',
    paddingVertical: SIZES.padding,
  },
  timelineLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: COLORS.success + '30',
    left: 19,
  },
  timelineDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success + '15',
    ...LAYOUT.center,
    zIndex: 1,
  },
  orderContent: {
    flex: 1,
    padding: SIZES.padding,
    paddingLeft: SIZES.base,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  orderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.success + '20',
    ...LAYOUT.center,
    marginRight: SIZES.base,
  },
  orderInfo: {
    flex: 1,
  },
  uniformType: {
    ...FONTS.h3,
    marginBottom: SIZES.base / 4,
    fontWeight: '700',
  },
  orderDate: {
    ...FONTS.body5,
    fontSize: 12,
  },
  statusBadge: {
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius,
  },
  statusText: {
    ...FONTS.body5,
    color: COLORS.success,
    fontWeight: '600',
    fontSize: 12,
  },
  orderDetails: {
    marginBottom: SIZES.base,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base / 2,
  },
  detailLabel: {
    ...FONTS.body4,
    marginLeft: SIZES.base / 2,
    marginRight: SIZES.base,
    fontWeight: '500',
  },
  detailsValue: {
    ...FONTS.h4,
    fontWeight: '600',
  },
  completionSection: {
    backgroundColor: COLORS.success + '05',
    borderRadius: SIZES.radius,
    padding: SIZES.base,
  },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base / 2,
  },
  completionLabel: {
    ...FONTS.body4,
    marginLeft: SIZES.base / 2,
    marginRight: SIZES.base,
    fontWeight: '500',
  },
  completionValue: {
    ...FONTS.h4,
    fontWeight: '600',
  },
  successBar: {
    height: 4,
    backgroundColor: COLORS.success + '20',
    borderRadius: 2,
    overflow: 'hidden',
  },
  successFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 2,
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    ...LAYOUT.center,
    padding: SIZES.padding,
  },
  noDataText: {
    ...FONTS.body3,
    marginTop: SIZES.base,
    textAlign: 'center',
  },
});

export default CompletedOrdersTab;
