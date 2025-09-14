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
  Platform,
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
  const [isExpanded, setIsExpanded] = useState(false);
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
    console.log('userInfor', userInfor);
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

      {/* Standard Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {t('salary.title', 'Salary')}
          </Text>
          <View style={styles.headerSpacer} />
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
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.companyName}>DAIHATSU METAL</Text>
            </View>

            {/* Employee Info */}
            <TouchableOpacity
              style={styles.employeeInfo}
              onPress={() => setIsExpanded(!isExpanded)}
              activeOpacity={0.7}>
              <View style={styles.avatarContainer}>
                <Image
                  source={require('../assets/images/avatar.jpg')}
                  style={styles.employeeAvatar}
                />
              </View>

              <View style={styles.employeeDetails}>
                <Text style={styles.employeeName}>
                  {userInfor.name || '---'}
                </Text>
                <Text style={styles.employeePosition}>
                  {userInfor.position || 'Employee'}
                </Text>
              </View>

              <View style={styles.employeeIdSection}>
                <Text style={styles.idLabel}>ID</Text>
                <Text style={styles.employeeId}>
                  {userInfor.employee_id || '---'}
                </Text>
              </View>

              <Icon
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="rgba(255,255,255,0.8)"
              />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Beautiful Month Selector with Gradient */}
        <View style={styles.monthSelectorContainer}>
          <TouchableOpacity
            style={styles.monthSelector}
            onPress={() => setIsModalVisible(true)}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#4FACFE', '#00F2FE']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.monthCard}>
              <View style={styles.monthHeader}>
                <Icon name="calendar-outline" size={24} color="#ffffff" />
                <Text style={styles.monthTitle}>Payroll Period</Text>
              </View>
              <View style={styles.monthContent}>
                <Text style={styles.monthText}>
                  {moment(payrollMonth).format('MMMM YYYY')}
                </Text>
                <Icon name="chevron-down" size={20} color="#ffffff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Beautiful Salary Summary with Gradients */}
        {Object.keys(payrollData).length > 0 && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.summaryGradient}>
                <View style={styles.summaryContent}>
                  <Icon name="wallet" size={24} color="#ffffff" />
                  <View style={styles.summaryText}>
                    <Text style={styles.summaryLabel}>Net Salary</Text>
                    <Text style={styles.summaryValue}>
                      {payrollData?.net_salary ? `$${payrollData.net_salary}` : '---'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.summaryGradient}>
                <View style={styles.summaryContent}>
                  <Icon name="calculator" size={24} color="#ffffff" />
                  <View style={styles.summaryText}>
                    <Text style={styles.summaryLabel}>Gross Salary</Text>
                    <Text style={styles.summaryValue}>
                      {payrollData?.gross_salary ? `$${payrollData.gross_salary}` : '---'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Clean Payroll Details */}
        <View style={styles.payrollContainer}>
          <View style={styles.payrollHeader}>
            <Text style={styles.payrollTitle}>Payroll Details</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Icon name="filter" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : Object.keys(payrollData).length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="document" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No data available</Text>
              <Text style={styles.emptySubtext}>
                Select a different month to view details
              </Text>
            </View>
          ) : (
            <View style={styles.payrollList}>
              {payrollItems.map((item, index) => (
                <View key={index} style={styles.payrollItem}>
                  <View style={styles.itemIcon}>
                    <Icon name={item.icon} size={18} color="#64748b" />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                    <Text style={styles.itemValue}>
                      {item.value ? `$${item.value}` : '---'}
                    </Text>
                  </View>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44,
    paddingBottom: 12,
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 36,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    marginTop: -10,
  },
  employeeCard: {
    marginTop: 0,
    borderRadius: 0,
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  cardGradient: {
    borderRadius: 0,
    padding: 20,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1.2,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
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
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  employeePosition: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginBottom: 6,
  },
  employeeIdSection: {
    alignItems: 'center',
    marginLeft: 12,
  },
  idLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginBottom: 2,
  },
  employeeId: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
  monthSelectorContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  monthSelector: {
    borderRadius: 20,
    shadowColor: '#4FACFE',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  monthCard: {
    padding: 24,
    borderRadius: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 12,
  },
  monthContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  summaryContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryGradient: {
    borderRadius: 16,
    padding: 20,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    flex: 1,
    marginLeft: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  payrollContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
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
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  payrollTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a202c',
    letterSpacing: 0.5,
  },
  filterButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: '#667eea',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  payrollList: {
    padding: 16,
  },
  payrollItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    flex: 1,
  },
  itemValue: {
    fontSize: 16,
    color: '#1a202c',
    fontWeight: '700',
  },
});

export default Salary;

