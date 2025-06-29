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

const CompletedOrdersTab = ({USER_INFOR}) => {
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
        <Text style={styles.status}>
          {t(`status`)}:{' '}
          <Text style={styles.statusValue}>{t(`${item.order_status}`)}</Text>
        </Text>
        <Text style={styles.deliveryDate}>
          {t(`delivery`)}:{' '}
          <Text style={styles.deliveryDateValue}>{item.delivery_date}</Text>
        </Text>
      </View>
      <View style={styles.checkmarkContainer}>
        <Icon name="check-circle" size={32} color={COLORS.success} />
      </View>
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
          <Icon name="check-circle-outline" size={64} color={COLORS.gray400} />
          <Text style={styles.noDataText}>{t('not.data')}</Text>
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
  status: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base / 2,
  },
  statusValue: {
    ...FONTS.h4,
    color: COLORS.success,
  },
  deliveryDate: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  deliveryDateValue: {
    ...FONTS.h4,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  checkmarkContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success + '20',
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

export default CompletedOrdersTab;
