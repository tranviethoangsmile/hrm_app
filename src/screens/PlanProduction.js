import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {TEXT_COLOR, THEME_COLOR_2, BG_COLOR} from '../utils/Colors';
import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  PLAN_PRODUCTION,
  SEARCH_PLAN_PRODUCTION_WITH_FIELD,
  SEARCH_BY_ID,
} from '../utils/constans';
import {useSelector} from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import i18next from '../../services/i18next';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {EditPlanProduction} from '../components';
import Header from '../components/common/Header';

const PlanProduction = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [plans, setPlans] = useState([]);
  const [isEditPLanProduction, setIsEditPlanProduction] = useState(false);
  const [plan, setPlan] = useState({});
  const authData = useSelector(state => state.auth);
  const USER_INFOR = authData?.data?.data;
  const start_date = moment().format('YYYY-MM-DD');
  const end_date = moment(start_date).add(7, 'days').format('YYYY-MM-DD');

  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
  };

  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };

  const get_plan_production = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${PLAN_PRODUCTION}${SEARCH_PLAN_PRODUCTION_WITH_FIELD}`,
        {
          department_id: USER_INFOR.department_id,
          start_date: start_date,
          end_date: end_date,
        },
      );
      if (!res?.data?.success) {
        throw new Error('not.data');
      }
      const sortPlans = res?.data.data.sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      );
      setPlans(sortPlans || []);
    } catch (error) {
      showAlert(error?.message || 'networkError');
    }
  };

  useEffect(() => {
    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }
    };
    checkLanguage();
    get_plan_production();
  }, []);

  const groupedData = plans.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = {dayShift: [], nightShift: []};
    }
    if (item.work_shift === 'DAY') {
      acc[date].dayShift.push(item);
    } else if (item.work_shift === 'NIGHT') {
      acc[date].nightShift.push(item);
    }
    return acc;
  }, {});

  const get_plan_production_by_id = async id => {
    try {
      const res = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${PLAN_PRODUCTION}${SEARCH_BY_ID}`,
        {
          id: id,
        },
      );
      if (!res?.data.success) {
        throw new Error('not.data');
      }
      setIsEditPlanProduction(true);
      setPlan(res?.data.data);
    } catch (error) {
      showAlert(error?.message || 'networkError');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header
        title={t('plan.title', 'Kế hoạch sản xuất')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scrollView}>
        {Object.keys(groupedData).map((date, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.dateText}>{date}</Text>
            <View style={styles.separator}></View>
            <View style={styles.shiftSection}>
              <Text style={styles.shiftTitle}>{t('DAY')}</Text>
              {groupedData[date].dayShift.map((item, idx) => (
                <View key={idx} style={styles.lineSection}>
                  <TouchableOpacity
                    onPress={() => get_plan_production_by_id(item.id)}>
                    <Text style={styles.productionLine}>
                      {t('line')}: {item.production_line}
                    </Text>
                    <Text style={styles.productName}>
                      {t('product')}:{item.product}
                    </Text>
                    <Text style={styles.quantity}>
                      {t('quantity')}: {item.quantity}
                    </Text>
                    <Text style={styles.workingHours}>
                      {t('ot')}: {item.operation_time} {t('h')}
                    </Text>
                    {item.is_custom ? (
                      <Icon name="exchange" size={30} color={'red'} />
                    ) : (
                      ''
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.shiftSection}>
              <Text style={styles.shiftTitle}>{t('NIGHT')}</Text>
              {groupedData[date].nightShift.map((item, idx) => (
                <View key={idx} style={styles.lineSection}>
                  <TouchableOpacity
                    onPress={() => get_plan_production_by_id(item.id)}>
                    <Text style={styles.productionLine}>
                      {t('line')}: {item.production_line}
                    </Text>
                    <Text style={styles.productName}>
                      {t('product')}: {item.product}
                    </Text>
                    <Text style={styles.quantity}>
                      {t('quantity')}: {item.quantity}
                    </Text>
                    <Text style={styles.workingHours}>
                      {t('ot')}: {item.operation_time} {t('h')}
                    </Text>
                    {item.is_custom ? (
                      <Icon name="exchange" size={30} color={'red'} />
                    ) : (
                      ''
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      <EditPlanProduction
        visible={isEditPLanProduction}
        planProduction={plan}
        t={t}
        onClose={() => setIsEditPlanProduction(false)}
        reCall={get_plan_production}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  separator: {
    height: 0.5,
    backgroundColor: '#ddd',
    marginVertical: 0,
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginVertical: 10,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 12,
  },
  shiftSection: {
    marginBottom: 20,
  },
  shiftTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLOR_2,
    marginBottom: 12,
  },
  lineSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.62,
    elevation: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_COLOR,
    marginBottom: 6,
  },
  quantity: {
    fontSize: 16,
    color: TEXT_COLOR,
    marginBottom: 6,
  },
  workingHours: {
    fontSize: 16,
    color: TEXT_COLOR,
    marginBottom: 6,
  },
  productionLine: {
    fontSize: 16,
    color: TEXT_COLOR,
    marginBottom: 6,
  },
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
});

export default PlanProduction;
