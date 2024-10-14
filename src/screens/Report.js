/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  Dimensions,
  Alert,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {TEXT_COLOR, THEME_COLOR, THEME_COLOR_2} from '../utils/Colors';
import Loader from '../components/Loader';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
import CheckBox from '@react-native-community/checkbox';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from '../../services/i18next';

import {
  API,
  BASE_URL,
  PORT,
  V1,
  VERSION,
  CREATE,
  SEARCH,
  INVENTORY,
  DAILY_REPORT,
  GET_ALL,
} from '../utils/constans';
import {LineChart, BarChart, PieChart} from 'react-native-chart-kit';
import DropDownPicker from 'react-native-dropdown-picker';
import {shiftArr, products} from '../utils/interface';
const Report = () => {
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const navigation = useNavigation();
  const [dataInventory, setDataInventory] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState([0]);
  const [shiftValue, setShiftValue] = useState('');
  const [productValue, setProductValue] = useState('');
  const [shiftValueList, setShiftValueList] = useState([]);
  const [productValueList, setProductValueList] = useState([]);
  const [open, setOpen] = useState(false);
  const [proOpen, setProOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [productVal, setProductVal] = useState(null);
  const [labels, setLabels] = useState(['']);
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
  };
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  const get_all_inventory_with_dapertment = async () => {
    try {
      const field = {
        department_id: authData?.data?.data?.department_id,
      };
      const inventorys = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${INVENTORY}${SEARCH}`,
        {
          ...field,
        },
      );
      if (inventorys?.data?.success) {
        const newData = inventorys?.data?.data.map(item => ({
          name: item.product,
          population: item.quantity,
          color: getRandomColor(),
          legendFontColor: getRandomColor(),
          legendFontSize: 16,
        }));
        setDataInventory(newData);
      } else {
        throw new Error('not.data');
      }
    } catch (error) {
      showAlert(error.message);
    }
  };

  const get_all_daily_report_with_field = async () => {
    try {
      const search_value = {
        department_id: authData?.data?.data?.department_id,
      };

      if (typeof shiftValue === 'string' && shiftValue !== '') {
        search_value.shift = shiftValue;
      }

      if (typeof productValue === 'string' && productValue !== '') {
        search_value.product = productValue;
      }

      const dailyReports = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${DAILY_REPORT}${GET_ALL}`,
        search_value,
      );
      if (dailyReports?.data?.success) {
        const dailyData = {};
        const newLabels = [];
        for (const report of dailyReports?.data?.data) {
          const dayOfWeek = moment(report.date).format('dd');
          if (!newLabels.includes(dayOfWeek)) {
            newLabels.push(t(dayOfWeek));
          }
          const shift = report.shift;
          const product = report.product;
          const quantity = parseFloat(report.quantity);

          if (!dailyData[dayOfWeek]) {
            dailyData[dayOfWeek] = {A: {}, B: {}};
          }
          if (!dailyData[dayOfWeek][shift][product]) {
            dailyData[dayOfWeek][shift][product] = 0;
          }
          dailyData[dayOfWeek][shift][product] += quantity;
        }

        const quantity = [];
        for (const dayOfWeek of Object.keys(dailyData)) {
          let totalQuantity = 0;
          for (const shift of ['A', 'B']) {
            for (const product of Object.keys(dailyData[dayOfWeek][shift])) {
              totalQuantity += dailyData[dayOfWeek][shift][product];
            }
          }
          quantity.push(totalQuantity);
        }

        setTotalQuantity(quantity);
        setLabels(newLabels);
      } else {
        throw new Error(dailyReports?.data?.message);
      }
    } catch (error) {
      showAlert(error.message);
    }
  };
  const data = {
    labels: labels,
    datasets: [
      {
        data: totalQuantity,
      },
    ],
  };
  useEffect(() => {
    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }
    };
    checkLanguage();
    get_all_inventory_with_dapertment();
    get_all_daily_report_with_field();
    setValueListShift(shiftArr);
  }, [shiftValue, productValue]);
  const width = Dimensions.get('screen').width * 1;
  const height = Dimensions.get('screen').height * 0.3;

  const chartConfig = {
    backgroundGradientFrom: getRandomColor(),
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: getRandomColor(),
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(100, 100, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };

  const setValueListShift = arr => {
    const formatShiftList = shiftArr.map(item => ({
      label: item.name,
      value: item.id,
    }));
    const formatProductList = products.map(item => ({
      label: item.name,
      value: item.id,
    }));
    setShiftValueList(formatShiftList);
    setProductValueList(formatProductList);
  };
  const handleSetShift = value => {
    setShiftValue(value);
  };
  const handleSetPro = value => {
    setProductValue(value);
  };
  return (
    <View style={[styles.container]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={[styles.inventoryView]}>
        <Text style={styles.text}>{t('inventory')}</Text>
        <PieChart
          data={dataInventory}
          width={width}
          height={height}
          chartConfig={chartConfig}
          accessor={'population'}
          backgroundColor={'transparent'}
          paddingLeft={'20'}
          center={[10, -10]}
          absolute
        />
      </View>
      <View style={[styles.DailyReportView]}>
        <View style={styles.dailyReportHeader}>
          <View style={styles.dailyReportHeaderTitle}>
            <Text style={styles.text}>{t('Dai')}</Text>
          </View>
          <View style={styles.dailyReportHeaderShiftChanger}>
            <DropDownPicker
              open={open}
              value={value}
              setValue={val => setValue(val)}
              setOpen={() => setOpen(!open)}
              items={shiftValueList}
              maxHeight={300}
              autoScroll
              onChangeValue={item => handleSetShift(item)}
              placeholder={t('S')}
              placeholderStyle={{color: TEXT_COLOR}}
              zIndexInverse={1}
              dropDownContainerStyle={{
                backgroundColor: '#dfdfdf',
              }}
            />
          </View>
          <View style={styles.dailyReportHeaderShiftChanger}>
            <DropDownPicker
              open={proOpen}
              value={productVal}
              setValue={val => setProductVal(val)}
              setOpen={() => setProOpen(!proOpen)}
              items={productValueList}
              maxHeight={300}
              onChangeValue={item => handleSetPro(item)}
              placeholder={t('product')}
              placeholderStyle={{color: TEXT_COLOR}}
              zIndexInverse={1}
              dropDownContainerStyle={{
                backgroundColor: '#dfdfdf',
              }}
            />
          </View>
        </View>
        <View style={[styles.dailyReportBody, {zIndex: -1}]}>
          <BarChart
            style={{borderColor: 'red'}}
            data={data}
            width={width}
            height={220}
            yAxisLabel="個"
            chartConfig={chartConfig}
            verticalLabelRotation={30}
          />
        </View>
      </View>
    </View>
  );
};
const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;
const styles = StyleSheet.create({
  dailyReportHeaderShiftChanger: {
    width: '30%',
  },
  dailyReportHeaderTitle: {
    width: '20%',
  },
  dailyReportHeader: {
    width: width,
    maxHeight: height * 0.5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 5,
  },
  DailyReportView: {
    width: width,
    maxHeight: height * 0.5,
  },
  inventoryView: {
    width: width,
    maxHeight: height * 0.5,
    borderBottomWidth: 0.3,
    borderBottomColor: 'gray',
  },
  container: {
    flex: 1,
    marginHorizontal: 10,
  },
  text: {
    color: TEXT_COLOR,
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});

export default Report;
