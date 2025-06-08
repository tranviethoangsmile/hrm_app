/* eslint-disable react/self-closing-comp */
import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Button,
  TouchableWithoutFeedback,
} from 'react-native';
import {API, BASE_URL, ORDER_URL, PORT, V1, VERSION} from '../utils/constans';
import axios from 'axios';
import moment from 'moment';
import ModalMessage from './ModalMessage';
import Icon from 'react-native-vector-icons/FontAwesome';
import {COLORS} from '../config/theme';

const OrderModal = ({
  visible,
  onClose,
  orders,
  getUserOrders,
  t,
  textColor,
  titleColor,
  subColor,
}) => {
  const today = moment();
  const closeModal = () => {
    onClose();
  };
  const [messageModal, setMessageModal] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1000);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  const showMessage = (msg, type, dur) => {
    setMessageModalVisible(true);
    setMessageModal(msg);
    setMessageType(type);
    setDuration(dur);
  };
  const handleCancelOrder = async id => {
    try {
      const deleteOrder = await axios.delete(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${ORDER_URL}/${id}`,
      );
      if (deleteOrder?.data?.success) {
        getUserOrders();
        showMessage('dltSuc', 'success', 1000);
      } else {
        getUserOrders();
        showMessage('unSuccess', 'warning', 1000);
      }
    } catch (error) {
      showMessage('err', 'error', 1000);
    }
  };

  const DEFAULT_TEXT_COLOR = (COLORS && COLORS.text) || '#222';
  const DEFAULT_TITLE_COLOR = (COLORS && COLORS.primary) || '#3498db';
  const DEFAULT_SUB_COLOR = (COLORS && COLORS.textSecondary) || '#b2bec3';
  const TEXT_COLOR = textColor || DEFAULT_TEXT_COLOR;
  const TITLE_COLOR = titleColor || DEFAULT_TITLE_COLOR;
  const SUB_COLOR = subColor || DEFAULT_SUB_COLOR;
  const HEADER_BG = '#fff';
  const {height} = Dimensions.get('window');
  const modalHeight = height * 0.8;

  const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    modalContent: {
      width: '95%',
      height: height * 0.8,
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
    closeBtn: {
      padding: 5,
    },
    modalTitle: {
      fontSize: 20,
      color: TITLE_COLOR,
      fontWeight: 'bold',
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    separator: {
      height: 1,
      backgroundColor: '#ddd',
      marginVertical: 10,
    },
    orderRowHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 2,
    },
    headerText: {
      color: TITLE_COLOR,
      fontSize: 16,
      fontWeight: 'bold',
      flex: 1,
      textAlign: 'left',
      minWidth: 120,
    },
    body: {
      flex: 1,
    },
    bodyContent: {
      padding: 10,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 18,
      marginBottom: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.07,
      shadowRadius: 4,
    },
    cardPast: {
      backgroundColor: '#f3f3f3',
    },
    cardInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardDateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      minWidth: 120,
    },
    cardDate: {
      fontSize: 16,
      color: TEXT_COLOR,
      fontWeight: '600',
      marginLeft: 4,
    },
    cardShiftRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      minWidth: 120,
      justifyContent: 'flex-end',
    },
    cardShift: {
      fontSize: 16,
      color: TEXT_COLOR,
      marginLeft: 4,
    },
    trashBtn: {
      padding: 5,
      marginLeft: 10,
    },
    trashBtnDisabled: {
      opacity: 0.5,
    },
    emptyBox: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      color: SUB_COLOR,
      fontSize: 16,
      fontStyle: 'italic',
      marginTop: 2,
    },
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={closeModal}>
      <TouchableWithoutFeedback onPress={closeModal}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                  <Icon name="close" size={22} color="red" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{t('orLi')}</Text>
                <View style={{width: 38}} />
              </View>
              <View style={styles.separator}></View>
              <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}>
                {orders.length === 0 && (
                  <View style={styles.emptyBox}>
                    <Icon
                      name="cutlery"
                      size={48}
                      color={SUB_COLOR}
                      style={{marginBottom: 12}}
                    />
                    <Text style={styles.emptyText}>{t('noOrder')}</Text>
                  </View>
                )}
                {orders.map((order, index) => {
                  const isPast = moment(order.date, 'YYYY/MM/DD').isBefore(
                    today,
                    'day',
                  );
                  const isDay = order.dayOrNight === 'dd';
                  return (
                    <View
                      key={index}
                      style={[styles.card, isPast && styles.cardPast]}>
                      <View style={styles.cardInfo}>
                        <View style={styles.cardDateRow}>
                          <Icon
                            name="calendar"
                            size={18}
                            color={isPast ? SUB_COLOR : TITLE_COLOR}
                            style={{marginRight: 7}}
                          />
                          <Text style={styles.cardDate}>{order.date}</Text>
                          {isPast && (
                            <Icon
                              name="clock-o"
                              size={16}
                              color={SUB_COLOR}
                              style={{marginLeft: 6}}
                            />
                          )}
                        </View>
                        <View style={styles.cardShiftRow}>
                          <Icon
                            name={isDay ? 'sun-o' : 'moon-o'}
                            size={16}
                            color={isDay ? '#f1c40f' : '#8e44ad'}
                            style={{marginRight: 6}}
                          />
                          <Text style={styles.cardShift}>
                            {t(order.dayOrNight)}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.trashBtn,
                          isPast && styles.trashBtnDisabled,
                        ]}
                        onPress={() => handleCancelOrder(order.id)}
                        disabled={isPast}
                        activeOpacity={0.7}>
                        <Icon
                          name="trash"
                          size={20}
                          color={isPast ? SUB_COLOR : '#e74c3c'}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
      <ModalMessage
        isVisible={isMessageModalVisible}
        onClose={() => setMessageModalVisible(false)}
        message={messageModal}
        type={messageType}
        t={t}
        duration={duration}
      />
    </Modal>
  );
};

export default OrderModal;
