/* eslint-disable react/self-closing-comp */
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import {API, BASE_URL, ORDER_URL, PORT, V1, VERSION} from '../utils/constans';
import axios from 'axios';
import moment from 'moment';
import ModalMessage from './ModalMessage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from '../config/theme';

const OrderModal = ({
  visible,
  onClose,
  orders,
  getUserOrders,
  showAlert,
  onOrderDeleted,
  t,
  textColor,
  titleColor,
  subColor,
}) => {
  const today = moment();
  const closeModal = () => {
    onClose();
  };
  const [localOrders, setLocalOrders] = useState(orders);
  const [messageModal, setMessageModal] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1000);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);

  // Update local orders when parent orders change
  useEffect(() => {
    // Filter out any undefined/null orders
    const validOrders = orders ? orders.filter(order => order && order.id) : [];
    setLocalOrders(validOrders);
  }, [orders]);

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
        // Success - remove from local state and notify parent
        const updatedOrders = localOrders.filter(
          order => order && order.id && order.id !== id,
        );
        setLocalOrders(updatedOrders);
        showMessage('success', 'success', 1500);

        // Notify parent to remove from main ordered state
        if (onOrderDeleted) {
          onOrderDeleted(id);
        }
      } else {
        showMessage('unSuccess', 'warning', 1000);
      }
    } catch (error) {
      showMessage('err', 'error', 1000);
    }
  };

  const getWeekdayKey = date => {
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const dayIndex = date.day(); // 0 = Sunday, 1 = Monday, etc.
    return dayNames[dayIndex];
  };

  const {height} = Dimensions.get('window');

  const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '92%',
      height: height * 0.85,
      backgroundColor: '#f8f9fa',
      borderRadius: 25,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 10},
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    headerGradient: {
      paddingVertical: 20,
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    closeBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 22,
      color: COLORS.white,
      fontWeight: 'bold',
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 15,
      paddingHorizontal: 20,
    },
    statCard: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 15,
      padding: 15,
      alignItems: 'center',
      minWidth: 80,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.white,
    },
    statLabel: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.9)',
      marginTop: 4,
    },
    body: {
      flex: 1,
      backgroundColor: '#f8f9fa',
    },
    bodyContent: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: 15,
      marginLeft: 5,
    },
    orderCard: {
      backgroundColor: COLORS.white,
      borderRadius: 20,
      marginBottom: 15,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    orderCardHeader: {
      padding: 16,
    },
    orderCardContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    orderDateSection: {
      flex: 1,
    },
    orderDate: {
      fontSize: 16,
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: 4,
    },
    orderDay: {
      fontSize: 14,
      color: '#7f8c8d',
    },
    orderShiftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#ecf0f1',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },
    orderShiftText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#2c3e50',
      marginLeft: 6,
    },
    deleteButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#fee',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 15,
    },
    deleteButtonDisabled: {
      backgroundColor: '#f8f9fa',
    },
    pastOrderCard: {
      opacity: 0.6,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#ecf0f1',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    emptyText: {
      fontSize: 18,
      color: '#7f8c8d',
      fontWeight: '500',
      marginBottom: 8,
    },
    emptySubText: {
      fontSize: 14,
      color: '#bdc3c7',
      textAlign: 'center',
      lineHeight: 20,
    },
    pickedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#e8f5e8',
      borderRadius: 15,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginLeft: 10,
    },
    pickedText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#27ae60',
      marginLeft: 4,
    },
  });

  const totalOrders = localOrders ? localOrders.length : 0;
  const pickedOrders = localOrders
    ? localOrders.filter(order => order && order.isPicked).length
    : 0;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={closeModal}>
      <TouchableWithoutFeedback onPress={closeModal}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Header with Gradient */}
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.headerGradient}>
                <View style={styles.header}>
                  <TouchableOpacity
                    onPress={closeModal}
                    style={styles.closeBtn}>
                    <Icon name="close" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{t('order.list.title')}</Text>
                  <View style={{width: 40}} />
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{totalOrders}</Text>
                    <Text style={styles.statLabel}>{t('ord')}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{pickedOrders}</Text>
                    <Text style={styles.statLabel}>{t('pid')}</Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Body */}
              <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}>
                {!localOrders || localOrders.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <View style={styles.emptyIcon}>
                      <Icon name="food-off" size={40} color="#bdc3c7" />
                    </View>
                    <Text style={styles.emptyText}>
                      {t('order.empty.message')}
                    </Text>
                    <Text style={styles.emptySubText}>
                      {t('order.empty.subtitle')}
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.sectionTitle}>
                      {t('order.section.title')}
                    </Text>
                    {localOrders
                      .filter(order => order && order.id)
                      .map((order, index) => {
                        const isPast = moment(
                          order.date,
                          'YYYY-MM-DD',
                        ).isBefore(today, 'day');
                        const orderMoment = moment(order.date, 'YYYY-MM-DD');
                        const isDay = order.dayOrNight === 'DAY';
                        const canDelete = !isPast && !order.isPicked;

                        return (
                          <View
                            key={order.id}
                            style={[
                              styles.orderCard,
                              isPast && styles.pastOrderCard,
                            ]}>
                            <LinearGradient
                              colors={
                                isPast
                                  ? ['#ecf0f1', '#ecf0f1']
                                  : ['#ffffff', '#f8f9fa']
                              }
                              start={{x: 0, y: 0}}
                              end={{x: 1, y: 1}}
                              style={styles.orderCardHeader}>
                              <View style={styles.orderCardContent}>
                                <View style={styles.orderDateSection}>
                                  <Text style={styles.orderDate}>
                                    {orderMoment.format('DD/MM/YYYY')}
                                  </Text>
                                  <Text style={styles.orderDay}>
                                    {t(getWeekdayKey(orderMoment))}
                                  </Text>
                                </View>

                                <View style={styles.orderShiftSection}>
                                  <Icon
                                    name={
                                      isDay
                                        ? 'white-balance-sunny'
                                        : 'moon-waning-crescent'
                                    }
                                    size={16}
                                    color={isDay ? '#f39c12' : '#8e44ad'}
                                  />
                                  <Text style={styles.orderShiftText}>
                                    {isDay ? t('dd') : t('nn')}
                                  </Text>
                                </View>

                                {/* Show status badge if picked */}
                                {order.isPicked && (
                                  <View style={styles.pickedBadge}>
                                    <Icon
                                      name="check-circle"
                                      size={16}
                                      color="#27ae60"
                                    />
                                    <Text style={styles.pickedText}>
                                      {t('pid')}
                                    </Text>
                                  </View>
                                )}

                                {/* Only show delete button if can delete */}
                                {canDelete && (
                                  <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleCancelOrder(order.id)}
                                    activeOpacity={0.7}>
                                    <Icon
                                      name="delete"
                                      size={18}
                                      color="#e74c3c"
                                    />
                                  </TouchableOpacity>
                                )}
                              </View>
                            </LinearGradient>
                          </View>
                        );
                      })}
                  </>
                )}
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
