import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  RefreshControl,
  Alert,
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
import apiClient from '../../services/apiClient';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

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
      const response = await apiClient.post(URL, {
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
    Alert.alert(t('confirm_delete'), t('wantDelete'), [
      {text: t('cancel'), style: 'cancel'},
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            const deleteURL = `${BASE_URL}${PORT}${API}${VERSION}${V1}${UNIFORM_ORDER}${DELETE}`;
            const response = await apiClient.post(deleteURL, {
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
        },
      },
    ]);
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
    <Animated.View
      style={[
        styles.orderContainer,
        {backgroundColor: colors.surface, borderColor: colors.border},
      ]}>
      <View style={styles.orderHeader}>
        <View
          style={[styles.orderIcon, {backgroundColor: colors.warning + '22'}]}>
          <Icon name="time-outline" size={22} color={colors.warning} />
        </View>
        <View style={styles.orderInfo}>
          <Text style={[styles.uniformType, {color: colors.text}]}>
            {t(`${item.uniform_type}`)}
          </Text>
          <Text style={[styles.orderDate, {color: colors.textSecondary}]}>
            {t('order_date')}: {item.created_at?.split('T')[0] || 'N/A'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.deleteButton, {backgroundColor: colors.danger + '15'}]}
          onPress={() => handle_delete_order(item.id)}>
          <Icon name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={['transparent', 'transparent']}
        style={styles.separator}
      />

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Icon name="resize-outline" size={15} color={colors.textSecondary} />
          <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>
            {t('size')}:
          </Text>
          <Text style={[styles.detailsValue, {color: colors.text}]}>
            {item.uniform_size}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="cart-outline" size={15} color={colors.textSecondary} />
          <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>
            {t('quantity')}:
          </Text>
          <Text style={[styles.detailsValue, {color: colors.text}]}>
            {item.quantity}
          </Text>
        </View>
      </View>

      <View style={styles.statusSection}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              {backgroundColor: colors.warning + '30'},
            ]}>
            <Animated.View style={[styles.statusDot, {opacity}]} />
          </View>
          <Text style={[styles.statusLabel, {color: colors.textSecondary}]}>
            {t('status')}:
          </Text>
          <Text style={[styles.status, {color: colors.warning}]}>
            {t(`${item.order_status}`)}
          </Text>
        </View>
        <View
          style={[
            styles.progressBar,
            {backgroundColor: colors.warning + '20'},
          ]}>
          <Animated.View style={[styles.progressFill, {opacity}]} />
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
            <Icon name="time-outline" size={40} color={colors.textSecondary} />
          </View>
          <Text style={[styles.noDataText, {color: colors.textSecondary}]}>
            {t('not.data')}
          </Text>
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
    padding: 16,
  },
  orderContainer: {
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
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  orderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  orderDetails: {
    padding: 14,
    paddingBottom: 6,
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
  statusSection: {
    padding: 14,
    paddingTop: 0,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9500',
  },
  statusLabel: {
    fontSize: 13,
    marginRight: 6,
    fontWeight: '500',
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9500',
    borderRadius: 2,
    width: '60%',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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

export default ProcessingOrdersTab;
