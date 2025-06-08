import React, {useEffect, useState} from 'react';
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
  Button,
} from 'react-native';
import moment from 'moment';
import {useSelector} from 'react-redux';
import axios from 'axios';
import i18next from '../../services/i18next';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-native-date-picker';

import Icon from 'react-native-vector-icons/FontAwesome';
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
import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';
import Header from '../components/common/Header';

const Salary = () => {
  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
  };
  const [isVisibleDate, setVisibleDate] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState(
    moment().subtract(1, 'month').toDate(),
  );
  const [payrollData, setPayrollData] = useState({});
  const navigation = useNavigation();
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const userInfor = authData?.data?.data;
  const year = moment(payrollMonth).format('YYYY');
  const month = moment(payrollMonth).format('MM');
  useEffect(() => {
    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }
    };
    checkLanguage();
    getPayrollOfUser();
  }, [payrollMonth]);

  const getPayrollOfUser = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${PAYROLL}${SEARCH}`,
        {
          user_id: userInfor.id,
          date: `${year}-${month}`,
        },
      );
      if (!res?.data?.success) {
        return showAlert('not.data');
      }
      setPayrollData(res?.data?.data);
    } catch (error) {
      return showAlert('contactAdmin');
    }
  };
  const onClose = () => {
    setVisibleDate(false);
  };

  const payrollItems = [
    {label: t('wt'), value: payrollData?.work_time},
    {label: t('ot'), value: payrollData?.over_time},
    {label: t('pvd'), value: payrollData?.paid_vacation_days},
    {label: t('wend'), value: payrollData?.weekend_time},
    {label: t('pvp'), value: payrollData?.paid_vacation_pay},
    {label: t('wsalary'), value: payrollData?.work_salary},
    {label: t('ns.salary'), value: payrollData?.shift_night_salary},
    {label: t('ot.salary'), value: payrollData?.over_time_salary},
    {label: t('nSTime'), value: payrollData?.shift_night},
    {label: t('R.Money'), value: payrollData?.refund_money},
    {label: t('oth.pay'), value: payrollData?.other_pay},
    {label: t('w.end.salary'), value: payrollData?.weekend_salary},
    {
      label: t('AAP'),
      value: payrollData?.attendance_allowance_pay,
    },
    {label: t('TAP'), value: payrollData?.travel_allowance_pay},
    {label: t('bonus'), value: payrollData?.bonus_pay},
    {label: t('G.Salary'), value: payrollData?.gross_salary},
    {label: t('I.TAX'), value: payrollData?.income_tax},
    {label: t('SI'), value: payrollData?.social_insurance},
    {label: t('H.I'), value: payrollData?.health_insurance},
    {label: t('UDM'), value: payrollData?.uniform_deduction},
    {label: t('AI'), value: payrollData?.accident_insurance},
    {label: t('C.FEE'), value: payrollData?.club_fee},
    {label: t('Rent'), value: payrollData?.rent_home},
    {label: t('col'), value: payrollData?.cost_of_living},
    {label: t('oth.d'), value: payrollData?.other_deduction},
    {label: t('N.Salary'), value: payrollData?.net_salary},
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header
        title={t('salary.title', 'Lương')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.payrollHeaderView}>
          <View style={styles.infoViewContainer}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  userInfor.avatar
                    ? {uri: userInfor.avatar}
                    : require('../assets/images/avatar.jpg')
                }
                style={styles.avatar}
              />
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.nameText}>{userInfor.name}</Text>
              <Text style={styles.label}>
                {userInfor.employee_id} - {userInfor.role} -{' '}
                {userInfor.position}
              </Text>
              <Text style={styles.label}>{userInfor.email}</Text>
            </View>
          </View>
          <View style={styles.headerPayroll}>
            <Text style={styles.payrollHeaderText}>{t('payroll.o')}</Text>
            <TouchableOpacity onPress={() => setVisibleDate(true)}>
              <Text style={styles.payrollHeaderDate}>
                {year}-{month}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.separator}></View>
          <View style={styles.headerPayroll}>
            <Text style={styles.payrollHeaderText}>{t('payroll.s')}</Text>
            {payrollData && (
              <Text
                style={[styles.payrollHeaderDate, {backgroundColor: BG_COLOR}]}>
                {payrollData.pay_date}
              </Text>
            )}
          </View>
          <View style={styles.separator}></View>
          {payrollData ? (
            <View style={styles.payrollDetail}>
              {payrollItems.map((item, index) => (
                <PayrollDetailItem
                  key={index}
                  label={t(`${item.label}`)}
                  value={item.value}
                  isEven={index % 2 === 0}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.noDataText}>{t('not.data')}</Text>
          )}
        </View>
      </ScrollView>
      <Modal
        visible={isVisibleDate}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <DatePicker
              mode="date"
              date={payrollMonth}
              onDateChange={date => {
                setVisibleDate(false);
                setPayrollMonth(date);
                getPayrollOfUser();
              }}
              textColor={TEXT_COLOR}
            />
          </View>
          <Button
            title={t('c')}
            onPress={() => {
              setVisibleDate(false);
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

const PayrollDetailItem = ({label, value, isEven}) => (
  <View
    style={[styles.payrollDetailItem, isEven ? styles.evenRow : styles.oddRow]}>
    <Text style={styles.payrollDetailLabel}>{label}</Text>
    <Text style={styles.payrollDetailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(253, 255, 255, 0.5)',
  },
  modalContent: {
    backgroundColor: BG_COLOR,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  scrollContainer: {},
  payrollHeaderView: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: THEME_COLOR_2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoViewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  label: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 3,
  },
  headerPayroll: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  payrollHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  payrollHeaderDate: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    backgroundColor: THEME_COLOR,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 15,
  },
  payrollDetail: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  payrollDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  evenRow: {
    backgroundColor: '#f2f2f2',
  },
  oddRow: {
    backgroundColor: '#fff',
  },
  payrollDetailLabel: {
    flex: 1,
    fontSize: 16,
    color: TEXT_COLOR,
  },
  payrollDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginLeft: 10,
  },
  noDataText: {
    fontSize: 16,
    color: TEXT_COLOR,
    textAlign: 'center',
    marginTop: 20,
  },
  logoView: {
    width: '100%',
    height: 60,
    resizeMode: 'contain',
    backgroundColor: THEME_COLOR_2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Salary;
