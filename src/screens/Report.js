/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  Dimensions,
  Alert,
  StyleSheet,
  StatusBar,
  Switch,
  ScrollView,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import OptimizedLoader from '../components/OptimizedLoader';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from '../../services/i18next';
import Header from '../components/common/Header';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../hooks/useTheme';

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
  const {colors, sizes, fonts, shadows, isDarkMode} = useTheme();
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
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line
  }, [shiftValue, productValue]);

  const width = Dimensions.get('screen').width * 1;
  const height = Dimensions.get('screen').height * 0.3;

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: colors.surface,
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `${colors.primary}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`,
    strokeWidth: 3,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForDots: {
      r: '5',
      strokeWidth: '3',
      stroke: colors.primary,
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <Header
        title={t('report.title', 'Báo cáo')}
        onBack={() => navigation.goBack()}
      />
      <OptimizedLoader visible={isLoading} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Inventory Card */}
        <Animated.View 
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}>
          <LinearGradient
            colors={isDarkMode ? [colors.surface, colors.surfaceSecondary] : [colors.white, colors.backgroundSecondary]}
            style={styles.cardGradient}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Icon
                  name="pie-chart"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('inventory')}
              </Text>
            </View>
            {dataInventory && dataInventory.length > 0 ? (
              <View style={styles.chartContainer}>
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
            ) : (
              <View style={styles.emptyContainer}>
                <IconFA name="chart-pie" size={48} color={colors.placeholder} />
                <Text style={[styles.emptyText, { color: colors.placeholder }]}>
                  {t('no_data')}
                </Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>
        {/* Daily Report Card */}
        <Animated.View 
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}>
          <LinearGradient
            colors={isDarkMode ? [colors.surface, colors.surfaceSecondary] : [colors.white, colors.backgroundSecondary]}
            style={styles.cardGradient}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
                <Icon
                  name="bar-chart"
                  size={24}
                  color={colors.success}
                />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('Dai')}
              </Text>
            </View>
            
            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <View style={styles.filterLabel}>
                  <IconFA name="clock" size={14} color={colors.primary} />
                  <Text style={[styles.filterLabelText, { color: colors.textSecondary }]}>
                    {t('S')}
                  </Text>
                </View>
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
                  placeholderStyle={{color: colors.placeholder}}
                  zIndexInverse={1}
                  dropDownContainerStyle={[styles.dropdown, { 
                    backgroundColor: colors.surface,
                    borderColor: colors.border 
                  }]}
                  style={[styles.dropdown, { 
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border 
                  }]}
                  ArrowDownIconComponent={() => (
                    <Icon name="chevron-down" size={16} color={colors.primary} />
                  )}
                />
              </View>
              <View style={styles.filterItem}>
                <View style={styles.filterLabel}>
                  <IconFA name="box" size={14} color={colors.primary} />
                  <Text style={[styles.filterLabelText, { color: colors.textSecondary }]}>
                    {t('product')}
                  </Text>
                </View>
                <DropDownPicker
                  open={proOpen}
                  value={productVal}
                  setValue={val => setProductVal(val)}
                  setOpen={() => setProOpen(!proOpen)}
                  items={productValueList}
                  maxHeight={300}
                  onChangeValue={item => handleSetPro(item)}
                  placeholder={t('product')}
                  placeholderStyle={{color: colors.placeholder}}
                  zIndexInverse={1}
                  dropDownContainerStyle={[styles.dropdown, { 
                    backgroundColor: colors.surface,
                    borderColor: colors.border 
                  }]}
                  style={[styles.dropdown, { 
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border 
                  }]}
                  ArrowDownIconComponent={() => (
                    <Icon name="chevron-down" size={16} color={colors.primary} />
                  )}
                />
              </View>
            </View>
            
            <View style={styles.chartBody}>
              {lineData.datasets.length > 0 ? (
                <View style={styles.chartWrapper}>
                  <LineChart
                    data={lineData}
                    width={width}
                    height={240}
                    chartConfig={chartConfig}
                    bezier
                    style={[styles.chartStyle, { backgroundColor: colors.surface }]}
                    verticalLabelRotation={30}
                    fromZero
                    withDots
                    withShadow={false}
                    withInnerLines
                    withOuterLines
                    renderDotContent={({x, y, index, indexData, datasetIndex}) => {
                      const dataset = lineData.datasets[datasetIndex];
                      const value = indexData || 0;
                      const displayValue = Number.isInteger(value) ? value.toString() : value.toFixed(1);
                      
                      // Điều chỉnh vị trí để tránh che khuất
                      const adjustedY = y < 30 ? y + 30 : y - 25;
                      const adjustedX = x < 20 ? x + 10 : x > width - 50 ? x - 20 : x - 15;
                      
                      return (
                        <View
                          key={`dot-${dataset?.datasetIndex || 0}-${index}`}
                          style={[
                            styles.dotContainer, 
                            { 
                              backgroundColor: colors.surface,
                              borderColor: dataset?.color() || colors.primary,
                              left: adjustedX,
                              top: adjustedY,
                              shadowColor: dataset?.color() || colors.primary,
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.3,
                              shadowRadius: 4,
                              elevation: 4,
                            }
                          ]}>
                          <Text style={[
                            styles.dotText, 
                            { 
                              color: colors.text,
                              fontWeight: '700',
                              fontSize: 11
                            }
                          ]}>
                            {displayValue}
                          </Text>
                        </View>
                      );
                    }}
                  />
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <IconFA name="chart-line" size={48} color={colors.placeholder} />
                  <Text style={[styles.emptyText, { color: colors.placeholder }]}>
                    {t('no_data')}
                  </Text>
                </View>
              )}
              
              {/* Legend */}
              {lineData.datasets.length > 0 && (
                <View style={styles.legendContainer}>
                  {lineData.datasets.map((dataset, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendColor,
                          { backgroundColor: dataset.color() }
                        ]}
                      />
                      <Text style={[styles.legendText, { color: colors.text }]}>
                        {lineData.legend[index]}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            
            {/* Floating Compare Button */}
            <TouchableOpacity
              style={[
                styles.floatingButton,
                { 
                  backgroundColor: compareShift ? colors.success : colors.primary,
                  opacity: (!!shiftValue || !!productValue) ? 0.5 : 1
                }
              ]}
              onPress={() => {
                if (!shiftValue && !productValue) {
                  setCompareShift(!compareShift);
                }
              }}
              disabled={!!shiftValue || !!productValue}
              activeOpacity={0.7}>
              <IconFA 
                name="exchange-alt" 
                size={12} 
                color="#fff" 
              />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
        
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 0,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 0,
    marginBottom: 1,
    overflow: 'hidden',
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  cardGradient: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabelText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  dropdown: {
    borderRadius: 16,
    minHeight: 48,
    borderWidth: 1.5,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  chartBody: {
    minHeight: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  chartStyle: {
    borderRadius: 16,
    marginBottom: 8,
    paddingRight: 8,
  },
  dotContainer: {
    position: 'absolute',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotText: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 4,
    marginRight: 8,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Report;
