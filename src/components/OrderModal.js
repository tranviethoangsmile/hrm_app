/* eslint-disable react/self-closing-comp */
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Button,
} from 'react-native';
import {API, BASE_URL, ORDER_URL, PORT, V1, VERSION} from '../utils/constans';
import axios from 'axios';
import moment from 'moment';

const OrderModal = ({
  visible,
  onClose,
  orders,
  showAlert,
  getUserOrders,
  t,
}) => {
  const today = moment();
  const closeModal = () => {
    onClose();
  };

  const handleCancelOrder = async id => {
    try {
      const deleteOrder = await axios.delete(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${ORDER_URL}/${id}`,
      );
      if (deleteOrder?.data?.success) {
        getUserOrders();
        showAlert(t('dltSuc'));
      } else {
        getUserOrders();
        showAlert(deleteOrder?.data?.message);
      }
    } catch (error) {
      showAlert(error.message);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={closeModal}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header của Modal */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.modalTitle}>{t('orLi')}</Text>
            </View>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.separator}></View>
          <View style={styles.orderRow}>
            <Text style={styles.headerText}>{t('D')}</Text>
            <Text style={styles.headerText}>{t('ws')}</Text>
            <Text style={styles.headerText}></Text>
          </View>
          <ScrollView style={styles.body}>
            {
              (orders.sort((a, b) => new Date(a.date) - new Date(b.date)),
              orders.map((order, index) => (
                <View key={index} style={styles.orderRow}>
                  <Text style={styles.orderInfoText}>{order.date}</Text>
                  <Text style={styles.orderInfoText}>
                    {t(order.dayOrNight)}
                  </Text>
                  <Button
                    title={t('c')}
                    onPress={() => handleCancelOrder(order.id)}
                    disabled={moment(order.date, 'YYYY/MM/DD').isBefore(today)}
                    color={
                      moment(order.date, 'YYYY/MM/DD').isBefore(today)
                        ? '#95a5a6'
                        : '#e74c3c'
                    }
                  />
                </View>
              )))
            }
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const {height} = Dimensions.get('window');
const modalHeight = height * 0.8;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    width: '95%',
    height: modalHeight,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3498db',
  },
  closeButton: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  body: {
    flex: 1,
  },
  orderRow: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfoText: {
    color: '#2c3e50',
    fontSize: 16,
    marginBottom: 5,
  },
  headerText: {
    color: '#3498db',
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
});

export default OrderModal;
