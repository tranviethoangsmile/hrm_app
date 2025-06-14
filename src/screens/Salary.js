import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import moment from 'moment';
import {useSelector} from 'react-redux';
import axios from 'axios';
import i18next from '../../services/i18next';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  PAYROLL,
  SEARCH,
} from '../utils/constans';
import LinearGradient from 'react-native-linear-gradient';
import SelectDate from '../components/SelectDate';

const Salary = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState(
    moment().subtract(1, 'month').format('YYYY-MM-DD'),
  );
  const [payrollData, setPayrollData] = useState({});
  const navigation = useNavigation();
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const userInfor = authData?.data?.data;

  const getPayrollOfUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${PAYROLL}${SEARCH}`,
        {
          user_id: userInfor.id,
          date: moment(payrollMonth).format('YYYY-MM'),
        },
      );
      if (!res?.data?.success) {
        Alert.alert(t('noti'), t('not.data'));
        setPayrollData({});
      } else {
        setPayrollData(res?.data?.data);
      }
    } catch (error) {
      Alert.alert(t('noti'), t('contactAdmin'));
      setPayrollData({});
    } finally {
      setIsLoading(false);
    }
  }, [payrollMonth, userInfor.id, t]);

  useEffect(() => {
    getPayrollOfUser();
  }, [payrollMonth, getPayrollOfUser]);

  const payrollItems = [
    {label: t('wt'), value: payrollData?.work_time, icon: 'time-outline'},
    {label: t('ot'), value: payrollData?.over_time, icon: 'flash-outline'},
    {
      label: t('pvd'),
      value: payrollData?.paid_vacation_days,
      icon: 'calendar-outline',
    },
    {
      label: t('wend'),
      value: payrollData?.weekend_time,
      icon: 'calendar-number-outline',
    },
    {
      label: t('pvp'),
      value: payrollData?.paid_vacation_pay,
      icon: 'wallet-outline',
    },
    {
      label: t('wsalary'),
      value: payrollData?.work_salary,
      icon: 'cash-outline',
    },
    {
      label: t('ns.salary'),
      value: payrollData?.shift_night_salary,
      icon: 'moon-outline',
    },
    {
      label: t('ot.salary'),
      value: payrollData?.over_time_salary,
      icon: 'flash-outline',
    },
    {label: t('nSTime'), value: payrollData?.shift_night, icon: 'moon-outline'},
    {
      label: t('R.Money'),
      value: payrollData?.refund_money,
      icon: 'return-up-back-outline',
    },
    {
      label: t('oth.pay'),
      value: payrollData?.other_pay,
      icon: 'add-circle-outline',
    },
    {
      label: t('w.end.salary'),
      value: payrollData?.weekend_salary,
      icon: 'calendar-outline',
    },
    {
      label: t('AAP'),
      value: payrollData?.attendance_allowance_pay,
      icon: 'checkmark-circle-outline',
    },
    {
      label: t('TAP'),
      value: payrollData?.travel_allowance_pay,
      icon: 'car-outline',
    },
    {label: t('bonus'), value: payrollData?.bonus_pay, icon: 'gift-outline'},
    {
      label: t('G.Salary'),
      value: payrollData?.gross_salary,
      icon: 'calculator-outline',
    },
    {
      label: t('I.TAX'),
      value: payrollData?.income_tax,
      icon: 'receipt-outline',
    },
    {
      label: t('SI'),
      value: payrollData?.social_insurance,
      icon: 'shield-checkmark-outline',
    },
    {
      label: t('H.I'),
      value: payrollData?.health_insurance,
      icon: 'medkit-outline',
    },
    {
      label: t('UDM'),
      value: payrollData?.uniform_deduction,
      icon: 'shirt-outline',
    },
    {
      label: t('AI'),
      value: payrollData?.accident_insurance,
      icon: 'shield-outline',
    },
    {label: t('C.FEE'), value: payrollData?.club_fee, icon: 'people-outline'},
    {label: t('Rent'), value: payrollData?.rent_home, icon: 'home-outline'},
    {
      label: t('col'),
      value: payrollData?.cost_of_living,
      icon: 'restaurant-outline',
    },
    {
      label: t('oth.d'),
      value: payrollData?.other_deduction,
      icon: 'remove-circle-outline',
    },
    {
      label: t('N.Salary'),
      value: payrollData?.net_salary,
      icon: 'wallet-outline',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('salary.title', 'Salary')}</Text>
          <View style={styles.backButton} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Employee Card */}
        <View style={styles.employeeCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.cardGradient}>
            <View style={styles.employeeInfo}>
              <Image
                source={
                  userInfor.avatar
                    ? {uri: userInfor.avatar}
                    : require('../assets/images/avatar.jpg')
                }
                style={styles.employeeAvatar}
              />
              <View style={styles.employeeDetails}>
                <Text style={styles.employeeName}>{userInfor.name}</Text>
                <Text style={styles.employeePosition}>
                  {userInfor.position || 'Employee'}
                </Text>
                <View style={styles.contactRow}>
                  <Icon
                    name="mail-outline"
                    size={12}
                    color="rgba(255,255,255,0.8)"
                  />
                  <Text style={styles.employeeEmail} numberOfLines={1}>
                    {userInfor.email || 'email@company.com'}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Month Selector */}
        <TouchableOpacity
          style={styles.monthSelector}
          onPress={() => setIsModalVisible(true)}>
          <LinearGradient
            colors={['#4FACFE', '#00F2FE']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.monthGradient}>
            <Icon name="calendar-outline" size={18} color="#fff" />
            <Text style={styles.monthText}>
              {moment(payrollMonth).format('YYYY/MM')}
            </Text>
            <Icon name="chevron-down" size={16} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Payroll Details */}
        <View style={styles.payrollContainer}>
          <View style={styles.payrollHeader}>
            <Icon name="list-outline" size={24} color="#667eea" />
            <Text style={styles.payrollTitle}>
              {t('payroll.details', 'Payroll Details')}
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : Object.keys(payrollData).length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="document-text-outline" size={64} color="#E0E0E0" />
              <Text style={styles.emptyText}>
                {t('not.data', 'No data available')}
              </Text>
            </View>
          ) : (
            <View style={styles.payrollGrid}>
              {payrollItems.map((item, index) => (
                <View key={index} style={styles.payrollItem}>
                  <LinearGradient
                    colors={['#f8fafc', '#f1f5f9']}
                    style={styles.payrollItemGradient}>
                    <Icon name={item.icon} size={24} color="#667eea" />
                    <Text style={styles.payrollItemLabel}>{item.label}</Text>
                    <Text style={styles.payrollItemValue}>
                      {item.value || '---'}
                    </Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <SelectDate
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        setSelectedDate={setPayrollMonth}
        getCheckin={getPayrollOfUser}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  scrollContainer: {
    flex: 1,
    marginTop: -10,
  },
  employeeCard: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    backgroundColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 16,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  employeeDetails: {
    flex: 1,
    marginLeft: 16,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  employeePosition: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeEmail: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginLeft: 4,
    flex: 1,
  },
  monthSelector: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  monthGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#4FACFE',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginHorizontal: 8,
    letterSpacing: 0.3,
  },
  payrollContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  payrollHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  payrollTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a202c',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#667eea',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  payrollGrid: {
    padding: 12,
  },
  payrollItem: {
    marginBottom: 12,
  },
  payrollItemGradient: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payrollItemLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  payrollItemValue: {
    fontSize: 16,
    color: '#1a202c',
    fontWeight: '700',
    marginTop: 4,
  },
});

export default Salary;
