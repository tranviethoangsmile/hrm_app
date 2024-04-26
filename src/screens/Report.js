/* eslint-disable react-hooks/exhaustive-deps */
import {View, Text, Dimensions, Alert, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
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
} from '../utils/Strings';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from 'react-native-chart-kit';
const Report = () => {
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const [dataInventory, setDataInventory] = useState([]);
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
      console.log(inventorys?.data);
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
        throw new Error(inventorys?.data?.message);
      }
    } catch (error) {
      showAlert('contactAdmin');
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
    get_all_inventory_with_dapertment();
  }, []);
  const width = Dimensions.get('screen').width * 0.95;
  const height = Dimensions.get('screen').height * 0.3;

  const chartConfig = {
    backgroundGradientFrom: '#1E2923',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#08130D',
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };
  return (
    <View style={{flex: 1, marginHorizontal: 5}}>
      <Text style={styles.text}>{t('inventory')}</Text>
      <PieChart
        data={dataInventory}
        width={width}
        height={height}
        chartConfig={chartConfig}
        accessor={'population'}
        backgroundColor={'transparent'}
        paddingLeft={'15'}
        center={[10, 20]}
        absolute
      />
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    color: TEXT_COLOR,
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});

export default Report;
