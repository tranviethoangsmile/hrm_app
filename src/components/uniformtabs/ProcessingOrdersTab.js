import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
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
import {TEXT_COLOR} from '../../utils/Colors';
const ProcessingOrdersTab = ({USER_INFOR}) => {
  const {t} = useTranslation();
  const animatedValue = useRef(new Animated.Value(0)).current;
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
        order_status: 'pending',
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

  const handle_delete_order = async orderId => {
    try {
      const deleteURL = `${BASE_URL}${PORT}${API}${VERSION}${V1}${UNIFORM_ORDER}${DELETE}`;
      const response = await axios.post(deleteURL, {
        id: orderId,
      });
      if (response.data.success) {
        showMessage('success', 'success');
        setUniformOrders(orders =>
          orders.filter(order => order.id !== orderId),
        );
      } else {
        showMessage('succunSuccessess', 'warning');
      }
    } catch (error) {
      showMessage('err', 'error');
    }
  };

  useEffect(() => {
    const blink = () => {
      animatedValue.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 500, // Thời gian để tăng cường độ sáng
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 500, // Thời gian để giảm cường độ sáng
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };
    handle_get_all_uniform_order_of_user();

    blink();

    // return () => animatedValue.stop();
  }, [animatedValue]);
  const opacity = animatedValue;

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
        <Icon name="delete" size={25} color="#ff5252" />
      </TouchableOpacity>
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
    backgroundColor: '#f9f9f9', // Thay đổi màu nền cho hiện đại hơn
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20, // Đặt lineHeight cho phù hợp với nội dung
  },
  status: {
    fontSize: 14,
    color: '#ff5252',
    marginLeft: 5, // Khoảng cách giữa label và nội dung trạng thái
    lineHeight: 20, // Đặt lineHeight cho phù hợp với nội dung
  },
  orderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff', // Nền của đơn hàng
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#ddd',
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2b2b2b', // Màu chữ đậm hơn
  },
  details: {
    fontSize: 16,
    color: '#4a4a4a',
  },
  deleteButton: {
    padding: 8, // Giảm kích thước nút
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ProcessingOrdersTab;
