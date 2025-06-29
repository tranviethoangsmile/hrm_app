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

const ProcessingOrdersTab = ({USER_INFOR}) => {
  const {t} = useTranslation();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1000);
  const [uniformOrders, setUniformOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const showMessage = useCallback((msg, type, dur) => {
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
        showMessage('success', 'success', 1000);
        setUniformOrders(orders =>
          orders.filter(order => order.id !== orderId),
        );
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
    <Animated.View style={styles.orderContainer}>
      <View style={styles.orderContent}>
        <Text style={styles.uniformType}>{t(`${item.uniform_type}`)}</Text>
        <Text style={styles.details}>
          {t('size')}:{' '}
          <Text style={styles.detailsValue}>{item.uniform_size}</Text>
        </Text>
        <Text style={styles.details}>
          {t('quantity')}:{' '}
          <Text style={styles.detailsValue}>{item.quantity}</Text>
        </Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>{t('status')}:</Text>
          <Animated.Text style={[styles.status, {opacity}]}>
            {t(`${item.order_status}`)}
            {'...'}
          </Animated.Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handle_delete_order(item.id)}>
        <Icon name="delete" size={24} color={COLORS.danger} />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
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
          <Icon name="inbox" size={64} color={COLORS.gray400} />
          <Text style={styles.noDataText}>{t('not.data')}</Text>
        </View>
      )}
      <ModalMessage
        visible={isMessageModalVisible}
        message={t(message)}
        type={messageType}
        duration={duration}
        onClose={() => setMessageModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SIZES.padding,
  },
  orderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    ...SHADOWS.medium,
  },
  orderContent: {
    flex: 1,
  },
  uniformType: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: SIZES.base / 2,
  },
  details: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base / 2,
  },
  detailsValue: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.base / 2,
  },
  statusLabel: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  status: {
    ...FONTS.h4,
    color: COLORS.warning,
    marginLeft: SIZES.base / 2,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.danger + '20',
    ...LAYOUT.center,
  },
  emptyContainer: {
    flex: 1,
    ...LAYOUT.center,
  },
  noDataText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: SIZES.base,
  },
});

export default ProcessingOrdersTab;
