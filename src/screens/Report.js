/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  Dimensions,
  Alert,
  StyleSheet,
  StatusBar,
  Switch,
  useColorScheme,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {TEXT_COLOR, THEME_COLOR, THEME_COLOR_2} from '../utils/Colors';
import Loader from '../components/Loader';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from '../../services/i18next';
import Header from '../components/common/Header';

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

// Danh sách ngày trong tuần chuẩn hóa
const weekDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const Report = () => {
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const navigation = useNavigation();
  const [dataInventory, setDataInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shiftValueList, setShiftValueList] = useState([]);
  const [productValueList, setProductValueList] = useState([]);
  const [open, setOpen] = useState(false);
  const [proOpen, setProOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [productVal, setProductVal] = useState(null);
  const [shiftValue, setShiftValue] = useState('');
  const [productValue, setProductValue] = useState('');
  const [compareShift, setCompareShift] = useState(false);
  const [dailyReports, setDailyReports] = useState([]);
  const isDarkMode = useColorScheme() === 'dark';

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
      setIsLoading(true);
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
        setDataInventory([]);
        throw new Error('not.data');
      }
    } catch (error) {
      setDataInventory([]);
      showAlert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const get_all_daily_report_with_field = async () => {
    try {
      setIsLoading(true);
      const search_value = {
        department_id: authData?.data?.data?.department_id,
      };
      if (typeof shiftValue === 'string' && shiftValue !== '') {
        search_value.shift = shiftValue;
      }
      if (typeof productValue === 'string' && productValue !== '') {
        search_value.product = productValue;
      }
      const res = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${DAILY_REPORT}${GET_ALL}`,
        search_value,
      );
      if (res?.data?.success) {
        setDailyReports(res.data.data);
      } else {
        setDailyReports([]);
        throw new Error(res?.data?.message);
      }
    } catch (error) {
      setDailyReports([]);
      showAlert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const setValueListShift = () => {
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
    setValueListShift();
    // Tắt switch so sánh ca khi chọn ca
    if (shiftValue) {
      setCompareShift(false);
    }
    // eslint-disable-next-line
  }, [shiftValue, productValue]);

  const width = Dimensions.get('screen').width * 1;
  const height = Dimensions.get('screen').height * 0.3;

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#fff',
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(100, 100, 146, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#fff',
    },
  };

  // Tổng hợp dữ liệu cho biểu đồ
  // Lấy danh sách ngày thực tế (unique, sort tăng dần)
  const allDates = Array.from(new Set(dailyReports.map(r => r.date))).sort();
  // Nếu muốn chỉ lấy 7 ngày gần nhất:
  const maxDays = 7;
  const dates = allDates.slice(-maxDays);

  // Tổng sản lượng/ngày (tất cả ca, tất cả sản phẩm)
  const totalByDate = dates.map(date => {
    return dailyReports
      .filter(r => r.date === date)
      .reduce((sum, r) => sum + parseFloat(r.quantity), 0);
  });

  // Tổng sản lượng/ngày cho từng ca
  const totalByDateShiftA = dates.map(date => {
    return dailyReports
      .filter(r => r.date === date && r.shift === 'A')
      .reduce((sum, r) => sum + parseFloat(r.quantity), 0);
  });
  const totalByDateShiftB = dates.map(date => {
    return dailyReports
      .filter(r => r.date === date && r.shift === 'B')
      .reduce((sum, r) => sum + parseFloat(r.quantity), 0);
  });

  // Nếu chọn ca: hiển thị sản lượng từng sản phẩm/ngày cho ca đó
  let productLines = [];
  if (shiftValue) {
    // Lấy danh sách sản phẩm
    const allProducts = Array.from(new Set(dailyReports.map(r => r.product)));
    productLines = allProducts.map((prod, idx) => ({
      data: dates.map(date => {
        return dailyReports
          .filter(r => r.date === date && r.product === prod)
          .reduce((sum, r) => sum + parseFloat(r.quantity), 0);
      }),
      color: () => `hsl(${(idx * 60) % 360}, 70%, 50%)`,
      strokeWidth: 3,
      label: prod,
    }));
  }

  // Nếu chọn sản phẩm: chỉ hiển thị sản lượng sản phẩm/ngày
  let productLine = null;
  if (productValue) {
    productLine = {
      data: dates.map(date => {
        return dailyReports
          .filter(r => r.date === date && r.product === productValue)
          .reduce((sum, r) => sum + parseFloat(r.quantity), 0);
      }),
      color: () => '#8e44ad',
      strokeWidth: 3,
      label: productValue,
    };
  }

  // Chuẩn bị dữ liệu cho LineChart
  let lineData = {
    labels: dates.map(d => moment(d).format('DD/MM')),
    datasets: [],
    legend: [],
  };
  if (shiftValue && productLines.length > 0) {
    lineData.datasets = productLines.map((line, idx) => ({
      ...line,
      datasetIndex: idx,
    }));
    lineData.legend = productLines.map(l => l.label);
  } else if (productValue && productLine) {
    lineData.datasets = [{...productLine, datasetIndex: 0}];
    lineData.legend = [productLine.label];
  } else if (compareShift) {
    lineData.datasets = [
      {
        data: totalByDateShiftA,
        color: () => '#3498db',
        strokeWidth: 3,
        label: 'Ca A',
        datasetIndex: 0,
      },
      {
        data: totalByDateShiftB,
        color: () => '#e74c3c',
        strokeWidth: 3,
        label: 'Ca B',
        datasetIndex: 1,
      },
    ];
    lineData.legend = ['Ca A', 'Ca B'];
  } else {
    lineData.datasets = [
      {
        data: totalByDate,
        color: () => '#27ae60',
        strokeWidth: 3,
        label: t('total', 'Tổng'),
        datasetIndex: 0,
      },
    ];
    lineData.legend = [t('total', 'Tổng')];
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <Header
        title={t('report.title', 'Báo cáo')}
        onBack={() => navigation.goBack()}
      />
      <Loader visible={isLoading} />
      {/* Inventory Card */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Icon
            name="pie-chart"
            size={22}
            color={THEME_COLOR}
            style={{marginRight: 8}}
          />
          <Text style={styles.sectionTitle}>{t('inventory')}</Text>
        </View>
        {dataInventory && dataInventory.length > 0 ? (
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
        ) : (
          <Text style={styles.emptyText}>{t('no_data')}</Text>
        )}
      </View>
      {/* Daily Report Card */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Icon
            name="bar-chart"
            size={22}
            color={THEME_COLOR}
            style={{marginRight: 8}}
          />
          <Text style={styles.sectionTitle}>{t('Dai')}</Text>
        </View>
        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
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
              dropDownContainerStyle={styles.dropdown}
              style={styles.dropdown}
              ArrowDownIconComponent={() => (
                <Icon name="chevron-down" size={16} color={THEME_COLOR_2} />
              )}
            />
          </View>
          <View style={styles.filterItem}>
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
              dropDownContainerStyle={styles.dropdown}
              style={styles.dropdown}
              ArrowDownIconComponent={() => (
                <Icon name="chevron-down" size={16} color={THEME_COLOR_2} />
              )}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}>
            <Switch
              value={compareShift}
              onValueChange={setCompareShift}
              disabled={!!shiftValue || !!productValue}
              trackColor={{false: '#767577', true: '#27ae60'}}
              thumbColor={compareShift ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
            <Text style={{marginLeft: 8, color: '#333'}}>
              {t('compare_shift', 'So sánh ca')}
            </Text>
          </View>
        </View>
        <View style={styles.chartBody}>
          {lineData.datasets.length > 0 ? (
            <LineChart
              data={lineData}
              width={width}
              height={240}
              chartConfig={chartConfig}
              bezier
              style={{
                borderRadius: 16,
                backgroundColor: '#fff',
                marginBottom: 8,
                paddingRight: 8,
              }}
              verticalLabelRotation={30}
              fromZero
              withDots
              withShadow={false}
              withInnerLines
              withOuterLines
              renderDotContent={({x, y, index, indexData, datasetIndex}) => {
                const dataset = lineData.datasets[datasetIndex];
                return (
                  <View
                    key={`dot-${dataset?.datasetIndex || 0}-${index}`}
                    style={{
                      position: 'absolute',
                      top: y + 12,
                      left: x - 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      padding: 1,
                      borderRadius: 2,
                      borderWidth: 1,
                      borderColor: '#ddd',
                    }}>
                    <Text style={{fontSize: 8, color: '#333'}}>
                      {Math.round(indexData)}
                    </Text>
                  </View>
                );
              }}
            />
          ) : (
            <Text style={styles.emptyText}>{t('no_data')}</Text>
          )}
          {/* Chú thích màu sắc */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 10,
            }}>
            {lineData.datasets.map((dataset, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 16,
                }}>
                <View
                  style={{
                    width: 16,
                    height: 4,
                    backgroundColor: dataset.color(),
                    marginRight: 6,
                    borderRadius: 2,
                  }}
                />
                <Text style={{color: '#3498db', fontWeight: 'bold'}}>
                  {lineData.legend[index]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginVertical: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: THEME_COLOR,
    letterSpacing: 0.2,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 2,
  },
  dropdown: {
    borderRadius: 12,
    borderColor: THEME_COLOR_2,
    backgroundColor: '#f4f6fa',
    minHeight: 44,
  },
  chartBody: {
    minHeight: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 30,
  },
});

export default Report;
