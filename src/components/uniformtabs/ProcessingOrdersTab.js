import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  RefreshControl,
} from 'react-native';
import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  BASE_URL,
  API,
  VERSION,
  V1,
  UNIFORM_ORDER,
  SEARCH,
  WITH_USER_ID,
  PORT,
  DELETE,
} from '../../utils/constans';
import ModalMessage from '../ModalMessage';
import axios from 'axios';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS, SIZES, FONTS, SHADOWS, LAYOUT} from '../../config/theme';

const ProcessingOrdersTab = ({USER_INFOR, isDarkMode, colors}) => {
  const {t} = useTranslation();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1000);
  const [uniformOrders, setUniformOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const showMessage = useCallback((msg, type, dur = 2000) => {
    setMessage(msg);
    setMessageType(type);
    setDuration(dur);
    setMessageModalVisible(true);
  }, []);

  const handle_get_all_uniform_order_of_user = useCallback(async () => {
    try {
      const URL = `${BASE_URL}${PORT}${API}${VERSION}${V1}${UNIFORM_ORDER}${SEARCH}${WITH_USER_ID}`;
      const response = await axios.post(URL, {
        user_id: USER_INFOR.id,
        order_status: 'pending',
      });
      if (!response?.data.success || response?.data.data.length === 0) {
        showMessage('not.data', 'warning', 1500);
        setUniformOrders([]);
      } else {
        setUniformOrders(response?.data.data);
      }
    } catch (error) {
      showMessage('err', 'error');
    }
  }, [USER_INFOR.id, showMessage]);

  const handle_delete_order = async orderId => {
    try {
      const deleteURL = `${BASE_URL}${PORT}${API}${VERSION}${V1}${UNIFORM_ORDER}${DELETE}`;
      const response = await axios.post(deleteURL, {
        id: orderId,
      });
      if (response.data.success) {
        // Cập nhật state trước
        setUniformOrders(orders =>
          orders.filter(order => order.id !== orderId),
        );
        // Hiển thị message sau
        showMessage('success', 'success', 1500);
      } else {
        showMessage('unSuccess', 'warning', 1500);
      }
    } catch (error) {
      showMessage('err', 'error', 2000);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await handle_get_all_uniform_order_of_user();
    setRefreshing(false);
  }, [handle_get_all_uniform_order_of_user]);

  useEffect(() => {
    const blink = () => {
      animatedValue.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    handle_get_all_uniform_order_of_user();
    blink();

    return () => {
      animatedValue.stopAnimation();
    };
  }, [animatedValue, handle_get_all_uniform_order_of_user]);

  const opacity = animatedValue;

  const renderItem = ({item}) => (
    <Animated.View style={[styles.orderContainer, {backgroundColor: colors.surface}]}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIcon}>
          <Icon name="pending" size={24} color={COLORS.warning} />
        </View>
        <View style={styles.orderInfo}>
          <Text style={[styles.uniformType, {color: colors.text}]}>{t(`${item.uniform_type}`)}</Text>
          <Text style={[styles.orderDate, {color: colors.textSecondary}]}>
            {t('order_date')}: {item.created_at?.split('T')[0] || 'N/A'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handle_delete_order(item.id)}>
          <Icon name="delete" size={20} color={COLORS.danger} />
        </TouchableOpacity>
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

      <View style={styles.statusSection}>
        <View style={styles.statusContainer}>
          <View style={styles.statusIndicator}>
            <Animated.View style={[styles.statusDot, {opacity}]} />
          </View>
          <Text style={[styles.statusLabel, {color: colors.textSecondary}]}>{t('status')}:</Text>
          <Animated.Text style={[styles.status, {opacity, color: COLORS.warning}]}>
            {t(`${item.order_status}`)}
          </Animated.Text>
        </View>
        <View style={[styles.progressBar, {backgroundColor: colors.borderColor}]}>
          <Animated.View 
            style={[
              styles.progressFill, 
              {opacity: opacity}
            ]} 
          />
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
          <Icon name="inbox" size={64} color={colors.textSecondary} />
          <Text style={[styles.noDataText, {color: colors.textSecondary}]}>{t('not.data')}</Text>
        </View>
      )}
      {isMessageModalVisible && (
        <ModalMessage
          isVisible={isMessageModalVisible}
          message={message}
          type={messageType}
          duration={duration}
          onClose={() => setMessageModalVisible(false)}
          t={t}
        />
      )}
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
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.warning + '10',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  orderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.warning + '20',
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
  orderDetails: {
    padding: SIZES.padding,
    paddingBottom: SIZES.base,
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
  statusSection: {
    padding: SIZES.padding,
    paddingTop: 0,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.warning + '30',
    marginRight: SIZES.base / 2,
    ...LAYOUT.center,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.warning,
  },
  statusLabel: {
    ...FONTS.body4,
    marginRight: SIZES.base / 2,
    fontWeight: '500',
  },
  status: {
    ...FONTS.h4,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.warning,
    borderRadius: 2,
    width: '60%',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.danger + '15',
    ...LAYOUT.center,
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

export default ProcessingOrdersTab;
