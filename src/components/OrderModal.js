/* eslint-disable react/self-closing-comp */
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  FlatList,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Easing,
} from 'react-native';
import {API, BASE_URL, ORDER_URL, PORT, V1, VERSION} from '../utils/constans';
import axios from 'axios';
import moment from 'moment';
import ModalMessage from './ModalMessage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../hooks/useTheme';

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
  const {colors, sizes, fonts, shadows, isDarkMode} = useTheme();
  const today = moment();
  const closeModal = () => {
    onClose();
  };
  const [localOrders, setLocalOrders] = useState(orders);
  const [messageModal, setMessageModal] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1000);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  
  // Animation values - removed to prevent scroll conflicts
  // const fadeAnim = useState(new Animated.Value(0))[0];
  // const slideAnim = useState(new Animated.Value(50))[0];
  // const scaleAnim = useState(new Animated.Value(0.9))[0];

  // Update local orders when parent orders change
  useEffect(() => {
    // Filter out any undefined/null orders
    const validOrders = orders ? orders.filter(order => order && order.id) : [];
    setLocalOrders(validOrders);
  }, [orders]);

  // Animation effect - removed to prevent scroll conflicts
  // useEffect(() => {
  //   if (visible) {
  //     Animated.parallel([
  //       Animated.timing(fadeAnim, {
  //         toValue: 1,
  //         duration: 300,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(slideAnim, {
  //         toValue: 0,
  //         duration: 300,
  //         easing: Easing.out(Easing.cubic),
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(scaleAnim, {
  //         toValue: 1,
  //         duration: 300,
  //         easing: Easing.out(Easing.back(1.1)),
  //         useNativeDriver: true,
  //       }),
  //     ]).start();
  //   } else {
  //     // Reset animations when modal closes
  //     fadeAnim.setValue(0);
  //     slideAnim.setValue(50);
  //     scaleAnim.setValue(0.9);
  //   }
  // }, [visible]);

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
    },
    backdropTouchable: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    modalContent: {
      width: '92%',
      height: height * 0.85,
      borderRadius: 28,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 12},
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 16,
    },
    headerGradient: {
      paddingVertical: 20,
      paddingHorizontal: 24,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
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
      fontSize: 20,
      color: '#fff',
      fontWeight: 'bold',
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 20,
    },
    statCard: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      minWidth: 80,
      flex: 1,
      marginHorizontal: 8,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    statIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    statContent: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.9)',
      fontWeight: '500',
    },
    body: {
      flex: 1,
    },
    bodyContent: {
      padding: 24,
      paddingBottom: 40, // Add extra padding at bottom
      flexGrow: 1, // Ensure content can grow
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    orderCard: {
      borderRadius: 24,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 6,
    },
    orderCardHeader: {
      padding: 20,
    },
    orderCardContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    orderDateSection: {
      flex: 1,
    },
    dateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    orderDate: {
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 6,
    },
    orderDay: {
      fontSize: 14,
      fontWeight: '500',
    },
    orderShiftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 24,
      marginRight: 12,
    },
    orderShiftText: {
      fontSize: 14,
      fontWeight: 'bold',
      marginLeft: 6,
    },
    deleteButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 12,
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
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    emptySubText: {
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
      fontWeight: '500',
    },
    pickedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginLeft: 12,
    },
    pickedText: {
      fontSize: 12,
      fontWeight: 'bold',
      marginLeft: 6,
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
      animationType="fade"
      onRequestClose={closeModal}>
      <View style={[styles.backdrop, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
        <TouchableOpacity 
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={closeModal}
        />
        <View style={styles.modalContent}>
              {/* Header with Gradient */}
              <LinearGradient
                colors={[colors.primary, colors.primary2]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.headerGradient}>
                <View style={styles.header}>
                  <TouchableOpacity
                    onPress={closeModal}
                    style={styles.closeBtn}
                    activeOpacity={0.7}>
                    <Icon name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{t('order.list.title')}</Text>
                  <View style={{width: 40}} />
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                  <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                      <IconFA name="clipboard-list" size={16} color={colors.primary} />
                    </View>
                    <View style={styles.statContent}>
                      <Text style={styles.statNumber}>{totalOrders}</Text>
                      <Text style={styles.statLabel}>{t('ord')}</Text>
                    </View>
                  </View>
                  <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                      <IconFA name="check-circle" size={16} color={colors.success} />
                    </View>
                    <View style={styles.statContent}>
                      <Text style={styles.statNumber}>{pickedOrders}</Text>
                      <Text style={styles.statLabel}>{t('pid')}</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>

              {/* Body */}
              <ScrollView
                style={[styles.body, { backgroundColor: colors.background }]}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={true}
                bounces={true}
                scrollEnabled={true}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled">
                {!localOrders || localOrders.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundSecondary }]}>
                      <IconFA name="utensils" size={40} color={colors.placeholder} />
                    </View>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      {t('order.empty.message')}
                    </Text>
                    <Text style={[styles.emptySubText, { color: colors.placeholder }]}>
                      {t('order.empty.subtitle')}
                    </Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.sectionHeader}>
                      <IconFA name="list" size={18} color={colors.primary} />
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('order.section.title')}
                      </Text>
                    </View>
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
                                  ? [colors.backgroundSecondary, colors.backgroundTertiary]
                                  : [colors.surface, colors.backgroundSecondary]
                              }
                              start={{x: 0, y: 0}}
                              end={{x: 1, y: 1}}
                              style={styles.orderCardHeader}>
                              <View style={styles.orderCardContent}>
                                <View style={styles.orderDateSection}>
                                  <View style={styles.dateHeader}>
                                    <IconFA name="calendar-day" size={14} color={colors.primary} />
                                    <Text style={[styles.orderDate, { color: colors.text }]}>
                                      {orderMoment.format('DD/MM/YYYY')}
                                    </Text>
                                  </View>
                                  <Text style={[styles.orderDay, { color: colors.textSecondary }]}>
                                    {t(getWeekdayKey(orderMoment))}
                                  </Text>
                                </View>

                                <View style={[styles.orderShiftSection, { 
                                  backgroundColor: isDay ? colors.warning + '20' : colors.info + '20' 
                                }]}>
                                  <IconFA
                                    name={isDay ? 'sun' : 'moon'}
                                    size={16}
                                    color={isDay ? colors.warning : colors.info}
                                  />
                                  <Text style={[styles.orderShiftText, { 
                                    color: isDay ? colors.warning : colors.info 
                                  }]}>
                                    {isDay ? t('dd') : t('nn')}
                                  </Text>
                                </View>

                                {/* Show status badge if picked */}
                                {order.isPicked && (
                                  <View style={[styles.pickedBadge, { backgroundColor: colors.success + '20' }]}>
                                    <IconFA
                                      name="check-circle"
                                      size={16}
                                      color={colors.success}
                                    />
                                    <Text style={[styles.pickedText, { color: colors.success }]}>
                                      {t('pid')}
                                    </Text>
                                  </View>
                                )}

                                {/* Only show delete button if can delete */}
                                {canDelete && (
                                  <TouchableOpacity
                                    style={[styles.deleteButton, { backgroundColor: colors.danger + '20' }]}
                                    onPress={() => handleCancelOrder(order.id)}
                                    activeOpacity={0.7}>
                                    <IconFA
                                      name="trash"
                                      size={16}
                                      color={colors.danger}
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
      </View>
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
