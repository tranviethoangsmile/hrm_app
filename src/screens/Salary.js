import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  Dimensions,
  Animated,
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
import {useTheme} from '../hooks/useTheme';

const {width: screenWidth} = Dimensions.get('window');

const Salary = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState(
    moment().subtract(1, 'month').format('YYYY-MM-DD'),
  );
  const [payrollData, setPayrollData] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
  const navigation = useNavigation();
  const {t} = useTranslation();
  const theme = useTheme();
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
        setPayrollData({});
      } else {
        setPayrollData(res?.data?.data);
      }
    } catch (error) {
      setPayrollData({});
    } finally {
      setIsLoading(false);
    }
  }, [payrollMonth, userInfor.id, t]);

  useEffect(() => {
    console.log('userInfor', userInfor);
    console.log('userInfor.name type:', typeof userInfor?.name, userInfor?.name);
    console.log('userInfor.avatar:', userInfor?.avatar);
    getPayrollOfUser();
  }, [payrollMonth, getPayrollOfUser]);

  useEffect(() => {
    // Animate content on load
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Format currency values
  const formatCurrency = (value) => {
    if (!value || value === 0) return '---';
    // Handle object with name property
    if (typeof value === 'object' && value.name) {
      return safeRender(value.name);
    }
    if (typeof value !== 'number') return '---';
    return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format time values
  const formatTime = (value) => {
    if (!value || value === 0) return '---';
    // Handle object with name property
    if (typeof value === 'object' && value.name) {
      return safeRender(value.name);
    }
    if (typeof value !== 'number') return '---';
    return `${value}h`;
  };

  // Format days
  const formatDays = (value) => {
    if (!value || value === 0) return '---';
    // Handle object with name property
    if (typeof value === 'object' && value.name) {
      return safeRender(value.name);
    }
    if (typeof value !== 'number') return '---';
    return `${value} days`;
  };

  // Helper function to safely get translation strings
  const getTranslation = (key, fallback = '') => {
    const translation = t(key);
    // Ensure we always return a string, not an object
    if (typeof translation === 'string') {
      return translation;
    }
    return fallback || key;
  };

  // Helper function to safely render any value as string
  const safeRender = (value, fallback = '---') => {
    if (value === null || value === undefined) {
      return fallback;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
    if (typeof value === 'object') {
      // Try to extract name property if it exists
      if (value.name && typeof value.name === 'string') {
        return value.name;
      }
      // Try to extract other common string properties
      if (value.value && typeof value.value === 'string') {
        return value.value;
      }
      if (value.label && typeof value.label === 'string') {
        return value.label;
      }
      // If it's an array, join it
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      // Convert object to string representation
      return JSON.stringify(value);
    }
    return fallback;
  };

  // Helper function to safely get payroll data
  const getPayrollValue = (key) => {
    const value = payrollData?.[key];
    return safeRender(value);
  };

  const payrollSections = [
    {
      title: getTranslation('salary.workTime', 'Work Time'),
      items: [
        {label: getTranslation('wt', 'Work Time'), value: getPayrollValue('work_time'), icon: 'time-outline', formatter: formatTime},
        {label: getTranslation('ot', 'Over Time'), value: getPayrollValue('over_time'), icon: 'flash-outline', formatter: formatTime},
        {label: getTranslation('nSTime', 'Night Shift'), value: getPayrollValue('shift_night'), icon: 'moon-outline', formatter: formatTime},
        {label: getTranslation('wend', 'Weekend'), value: getPayrollValue('weekend_time'), icon: 'calendar-number-outline', formatter: formatTime},
        {label: getTranslation('pvd', 'Paid Vacation Days'), value: getPayrollValue('paid_vacation_days'), icon: 'calendar-outline', formatter: formatDays},
      ]
    },
    {
      title: getTranslation('salary.earnings', 'Earnings'),
      items: [
        {label: getTranslation('wsalary', 'Work Salary'), value: getPayrollValue('work_salary'), icon: 'cash-outline', formatter: formatCurrency},
        {label: getTranslation('ot.salary', 'Over Time Salary'), value: getPayrollValue('over_time_salary'), icon: 'flash-outline', formatter: formatCurrency},
        {label: getTranslation('ns.salary', 'Night Shift Salary'), value: getPayrollValue('shift_night_salary'), icon: 'moon-outline', formatter: formatCurrency},
        {label: getTranslation('w.end.salary', 'Weekend Salary'), value: getPayrollValue('weekend_salary'), icon: 'calendar-outline', formatter: formatCurrency},
        {label: getTranslation('pvp', 'Paid Vacation Pay'), value: getPayrollValue('paid_vacation_pay'), icon: 'wallet-outline', formatter: formatCurrency},
        {label: getTranslation('bonus', 'Bonus Pay'), value: getPayrollValue('bonus_pay'), icon: 'gift-outline', formatter: formatCurrency},
        {label: getTranslation('oth.pay', 'Other Pay'), value: getPayrollValue('other_pay'), icon: 'add-circle-outline', formatter: formatCurrency},
        {label: getTranslation('R.Money', 'Refund Money'), value: getPayrollValue('refund_money'), icon: 'return-up-back-outline', formatter: formatCurrency},
      ]
    },
    {
      title: getTranslation('salary.allowances', 'Allowances'),
      items: [
        {label: getTranslation('AAP', 'Attendance Allowance'), value: getPayrollValue('attendance_allowance_pay'), icon: 'checkmark-circle-outline', formatter: formatCurrency},
        {label: getTranslation('TAP', 'Travel Allowance'), value: getPayrollValue('travel_allowance_pay'), icon: 'car-outline', formatter: formatCurrency},
      ]
    },
    {
      title: getTranslation('salary.deductions', 'Deductions'),
      items: [
        {label: getTranslation('I.TAX', 'Income Tax'), value: getPayrollValue('income_tax'), icon: 'receipt-outline', formatter: formatCurrency},
        {label: getTranslation('SI', 'Social Insurance'), value: getPayrollValue('social_insurance'), icon: 'shield-checkmark-outline', formatter: formatCurrency},
        {label: getTranslation('H.I', 'Health Insurance'), value: getPayrollValue('health_insurance'), icon: 'medkit-outline', formatter: formatCurrency},
        {label: getTranslation('AI', 'Accident Insurance'), value: getPayrollValue('accident_insurance'), icon: 'shield-outline', formatter: formatCurrency},
        {label: getTranslation('UDM', 'Uniform Deduction'), value: getPayrollValue('uniform_deduction'), icon: 'shirt-outline', formatter: formatCurrency},
        {label: getTranslation('C.FEE', 'Club Fee'), value: getPayrollValue('club_fee'), icon: 'people-outline', formatter: formatCurrency},
        {label: getTranslation('Rent', 'Rent Home'), value: getPayrollValue('rent_home'), icon: 'home-outline', formatter: formatCurrency},
        {label: getTranslation('col', 'Cost of Living'), value: getPayrollValue('cost_of_living'), icon: 'restaurant-outline', formatter: formatCurrency},
        {label: getTranslation('oth.d', 'Other Deduction'), value: getPayrollValue('other_deduction'), icon: 'remove-circle-outline', formatter: formatCurrency},
      ]
    }
  ];

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <StatusBar
        barStyle={theme.isDarkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Modern Header with Theme Support */}
      <LinearGradient
        colors={theme.isDarkMode ? ['#1a1a2e', '#16213e'] : ['#667eea', '#764ba2']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, {backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.2)'}]}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {getTranslation('salary.title', 'Salary')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={[styles.scrollContainer, {backgroundColor: theme.colors.background}]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 20}}>
        
        {/* Modern Employee Card with Theme Support */}
        <Animated.View 
          style={[
            styles.employeeCard,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
              backgroundColor: theme.colors.surface
            }
          ]}>
          <LinearGradient
            colors={theme.isDarkMode ? ['#1a1a2e', '#16213e'] : ['#667eea', '#764ba2']}
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
                  source={
                    userInfor?.avatar && userInfor.avatar !== '' 
                      ? {uri: userInfor.avatar}
                      : require('../assets/images/avatar.jpg')
                  }
                  style={styles.employeeAvatar}
                  defaultSource={require('../assets/images/avatar.jpg')}
                  onError={() => {
                    console.log('Avatar load error, using default');
                  }}
                  resizeMode="cover"
                />
                <View style={[styles.statusIndicator, {backgroundColor: '#10b981'}]} />
              </View>

              <View style={styles.employeeDetails}>
                <Text style={styles.employeeName}>
                  {safeRender(userInfor?.name, '---')}
                </Text>
                <Text style={styles.employeePosition}>
                  {safeRender(userInfor?.position, getTranslation('salary.employee', 'Employee'))}
                </Text>
                <Text style={styles.employeeDepartment}>
                  {safeRender(userInfor?.department, getTranslation('salary.production', 'Production'))}
                </Text>
              </View>

              <View style={styles.employeeIdSection}>
                <Text style={styles.idLabel}>ID</Text>
                <Text style={styles.employeeId}>
                  {safeRender(userInfor?.employee_id, '---')}
                </Text>
              </View>

              <Icon
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="rgba(255,255,255,0.8)"
              />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Compact Month Selector with Full Width - Sát card thông tin người dùng */}
        <Animated.View 
          style={[
            styles.monthSelectorContainer,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}]
            }
          ]}>
          <TouchableOpacity
            style={[styles.monthSelector, {backgroundColor: theme.colors.surface}]}
            onPress={() => setIsModalVisible(true)}
            activeOpacity={0.8}>
            <LinearGradient
              colors={theme.isDarkMode ? ['#374151', '#4b5563'] : ['#4FACFE', '#00F2FE']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.monthCard}>
              <View style={styles.monthContent}>
                <Icon name="calendar-outline" size={20} color="#ffffff" />
                <Text style={styles.monthText}>
                  {moment(payrollMonth).format('MMMM YYYY')}
                </Text>
                <Icon name="chevron-down" size={18} color="#ffffff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Modern Salary Summary with Theme Support */}
        {Object.keys(payrollData).length > 0 && (
          <Animated.View 
            style={[
              styles.summaryContainer,
              {
                opacity: fadeAnim,
                transform: [{translateY: slideAnim}]
              }
            ]}>
            <View style={[styles.summaryCard, {backgroundColor: theme.colors.surface}]}>
              <LinearGradient
                colors={theme.isDarkMode ? ['#059669', '#047857'] : ['#10b981', '#059669']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.summaryGradient}>
                <View style={styles.summaryContent}>
                  <Icon name="wallet" size={24} color="#ffffff" />
                  <View style={styles.summaryText}>
                    <Text style={styles.summaryLabel}>{getTranslation('salary.netSalary', 'Net Salary')}</Text>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(getPayrollValue('net_salary'))}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
            <View style={[styles.summaryCard, {backgroundColor: theme.colors.surface}]}>
              <LinearGradient
                colors={theme.isDarkMode ? ['#1e40af', '#1e3a8a'] : ['#3b82f6', '#2563eb']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.summaryGradient}>
                <View style={styles.summaryContent}>
                  <Icon name="calculator" size={24} color="#ffffff" />
                  <View style={styles.summaryText}>
                    <Text style={styles.summaryLabel}>{getTranslation('salary.grossSalary', 'Gross Salary')}</Text>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(getPayrollValue('gross_salary'))}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>
        )}

        {/* Modern Payroll Details with Organized Sections */}
        <Animated.View 
          style={[
            styles.payrollContainer,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
              backgroundColor: theme.colors.surface
            }
          ]}>
          <View style={[styles.payrollHeader, {borderBottomColor: theme.colors.border}]}>
            <Text style={[styles.payrollTitle, {color: theme.colors.text}]}>{getTranslation('salary.payrollDetails', 'Payroll Details')}</Text>
            <TouchableOpacity style={[styles.filterButton, {backgroundColor: theme.colors.surfaceSecondary}]}>
              <Icon name="filter" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, {color: theme.colors.text}]}>{getTranslation('salary.loading', 'Loading...')}</Text>
            </View>
          ) : Object.keys(payrollData).length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="document" size={48} color={theme.isDarkMode ? theme.colors.textSecondary : theme.colors.textTertiary} />
              <Text style={[styles.emptyText, {color: theme.isDarkMode ? theme.colors.text : theme.colors.textSecondary}]}>{getTranslation('salary.noDataAvailable', 'No data available')}</Text>
              <Text style={[styles.emptySubtext, {color: theme.isDarkMode ? theme.colors.textSecondary : theme.colors.textTertiary}]}>
                {getTranslation('salary.selectDifferentMonth', 'Select a different month to view details')}
              </Text>
            </View>
          ) : (
            <View style={styles.payrollList}>
              {payrollSections.map((section, sectionIndex) => (
                <View key={sectionIndex} style={styles.sectionContainer}>
                  <Text style={[styles.sectionTitle, {color: theme.isDarkMode ? theme.colors.primary : theme.colors.text}]}>
                    {section.title}
                  </Text>
                  {section.items.map((item, itemIndex) => (
                    <View key={itemIndex} style={[styles.payrollItem, {borderBottomColor: theme.colors.border}]}>
                      <View style={[styles.itemIcon, {backgroundColor: theme.isDarkMode ? theme.colors.surfaceSecondary : '#f0f9ff'}]}>
                        <Icon name={item.icon} size={18} color={theme.colors.primary} />
                      </View>
                      <View style={styles.itemContent}>
                        <Text style={[styles.itemLabel, {color: theme.colors.textSecondary}]}>
                          {item.label}
                        </Text>
                        <Text style={[styles.itemValue, {color: theme.colors.text}]}>
                          {item.formatter ? item.formatter(item.value) : safeRender(item.value)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </Animated.ScrollView>

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
    marginTop: -10,
  },
  employeeCard: {
    marginTop: 0,
    marginHorizontal: 0,
    borderRadius: 0,
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  cardGradient: {
    borderRadius: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
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
    marginBottom: 2,
  },
  employeeDepartment: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
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
    marginHorizontal: 0,
    marginTop: 0,
    alignSelf: 'stretch',
  },
  monthSelector: {
    borderRadius: 0,
    shadowColor: '#4FACFE',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
  },
  monthCard: {
    padding: 16,
    borderRadius: 0,
    width: '100%',
  },
  monthContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
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
  },
  payrollTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  filterButton: {
    padding: 10,
    borderRadius: 25,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  payrollList: {
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  payrollItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontWeight: '600',
    flex: 1,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default Salary;

