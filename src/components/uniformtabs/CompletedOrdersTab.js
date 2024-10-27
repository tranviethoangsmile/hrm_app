import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
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
import Icon from 'react-native-vector-icons/Ionicons';

const CompletedOrdersTab = ({USER_INFOR}) => {
  const {t} = useTranslation();
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [uniformOrders, setUniformOrders] = useState([]);
  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setMessageModalVisible(true);
  };
  const handle_get_all_uniform_order_of_user = async () => {
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
  };

  useEffect(() => {
    handle_get_all_uniform_order_of_user();
  }, []);

  const renderItem = ({item}) => (
    <View style={styles.orderContainer}>
      <View style={styles.orderContent}>
        <Text style={styles.uniformType}>{t(`${item.uniform_type}`)}</Text>
        <Text style={styles.details}>
          {t('si.ze')}: {item.uniform_size}
        </Text>
        <Text style={styles.details}>
          {t('quantity')}: {item.quantity}
        </Text>
        <Text style={styles.status}>
          {t(`status`)}: {t(`${item.order_status}`)}
        </Text>
        <Text style={styles.deliveryDate}>
          {t(`delivery`)}: {item.delivery_date}
        </Text>
      </View>
      <Icon name="checkmark-circle" size={35} color="#4CAF50" />
    </View>
  );

  return (
    <View style={styles.container}>
      {uniformOrders.length > 0 ? (
        <FlatList
          data={uniformOrders}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={styles.noDataText}>{t('not.data')}</Text>
      )}
      <ModalMessage
        isVisible={isMessageModalVisible}
        onClose={() => setMessageModalVisible(false)}
        message={message}
        type={messageType}
        t={t}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9', // Nền sáng và hiện đại
  },
  orderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff', // Nền của đơn hàng
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0', // Viền nhẹ để tăng độ nổi bật
  },
  orderContent: {
    flex: 1,
  },
  uniformType: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2b2b2b',
  },
  details: {
    fontSize: 16,
    color: '#555',
  },
  status: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  deliveryDate: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
    fontStyle: 'italic', // Kiểu chữ nghiêng để nhấn mạnh
  },
  noDataText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CompletedOrdersTab;
