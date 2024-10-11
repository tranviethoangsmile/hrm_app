/* eslint-disable no-alert */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
} from 'react-native';
import {
  API,
  BASE_URL,
  CREATE,
  DAILY_REPORT,
  PORT,
  V1,
  VERSION,
} from '../utils/Strings';

import {useSelector} from 'react-redux';
import DailyModal from '../components/DailyModal';
import {TEXT_COLOR, THEME_COLOR, BG_COLOR} from '../utils/Colors';
import {useNavigation} from '@react-navigation/native';
import CheckBox from '@react-native-community/checkbox';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from '../../services/i18next';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import Loader from '../components/Loader';
const Daily = () => {
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const today = moment().toDate();
  const navigation = useNavigation();
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
  };
  const listProduct = [
    {label: 'C84_BUV', value: '0.55'},
    {label: 'D16E_COP', value: '0.42'},
    {label: 'D637F', value: '1'},
    {label: 'D93F_PAO_DC2', value: '0.97'},
    {label: 'D67E_PAO', value: '1.02'},
    {label: 'D61F_PAO_DC2', value: '0.88'},
    {label: 'D66_DC3', value: '1.26'},
    {label: 'DF93_4', value: '0.95'},
    {label: 'DF93_3', value: '0.95'},
    {label: 'D042F_PAO_DC3', value: '1.08'},
    {label: 'D14KFR', value: '1.03'},
    {label: 'DK05FR_1', value: '1.03'},
    {label: 'DK05FR_2', value: '1.03'},
    {label: 'C84N', value: '1.13'},
    {label: 'C089', value: '1.13'},
    {label: 'D860F_PAO_DC3', value: '1.26'},
    {label: 'D67E_CTC', value: '0.80'},
    {label: 'D66_5', value: '0.85'},
    {label: 'D66_6', value: '0.85'},
    {label: 'D93F_PAO_DC4', value: '1.08'},
    {label: 'D042F_PAO_DC4', value: '0.97'},
    {label: 'D14KRR', value: '1.02'},
    {label: 'DK05RR_1', value: '0.91'},
    {label: 'DK05RR_2', value: '0.91'},
    {label: 'D61F_PAO_DC4', value: '0.8'},
  ];
  const [isShowModalSendReport, setShowModalSendReport] = useState(false);
  const [isModalProductChoiceVisible, setIsModalProductChoiceVisible] =
    useState(false);
  const [loader, setLoader] = useState(false);

  const [shift, setShift] = useState('');
  const [productName, setProductName] = useState('');
  const [productValue, setProductValue] = useState('');
  const [operator_history, setOperator_history] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [Acheck, setAcheck] = useState(false);
  const [Bcheck, setBcheck] = useState(false);
  const [quatity, setQuatity] = useState(0);
  const [fisrtProduct, setFisrtProduct] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [error, setError] = useState(0);
  const [shutdown_time, setShutdown_time] = useState(0);
  const [timeWork, setTimeWork] = useState(0);
  const [percent, setPercent] = useState(0);
  const [errPercemt, setErrPercent] = useState(0);
  const [fisrtPercent, setFisrtPercent] = useState(0);
  const [tempPercent, setTempPercent] = useState(0);
  const [isShowSendBtn, setIsShowSendBtn] = useState(false);

  const handleSendDailyReport = async () => {
    try {
      setLoader(true);
      if (operator_history === '' || shift === '') {
        setLoader(false);
        throw new Error('not.empty');
      }
      const field = {
        product: productName,
        user_id: authData?.data?.data?.id,
        department_id: authData?.data?.data?.department_id,
        date: moment(today).format('YYYY-MM-DD'),
        shift: shift,
        quantity: quantity,
        operated_time: timeWork,
        shutdown_time: shutdown_time,
        operator_history: operator_history,
      };
      const dailyReport = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${DAILY_REPORT}${CREATE}`,
        {
          ...field,
        },
      );
      if (!dailyReport?.data?.success) {
        setLoader(false);
        console.log(dailyReport?.data?.message);
        throw new Error('unSuccess');
      }
      setLoader(false);
      showAlert('success');
      navigation.navigate('Main');
    } catch (error) {
      showAlert(error.message);
    }
  };
  const handleClickChoiceProduct = product => {
    setProductName(product.label);
    setProductValue(product.value);
  };

  const handleCal = () => {
    try {
      if (productValue === '') {
        throw new Error('not.empty');
      } else {
        setIsShowSendBtn(true);
        let per =
          ((parseFloat(quatity) * parseFloat(productValue)) /
            (parseFloat(timeWork) - parseFloat(shutdown_time))) *
          100;
        let errPer = (parseFloat(error) / parseFloat(quatity)) * 100;
        let firstPer = (parseFloat(fisrtProduct) / parseFloat(quatity)) * 100;
        let tempPer = (parseFloat(temperature) / parseFloat(quatity)) * 100;
        setQuantity(
          parseFloat(quatity) -
            parseFloat(error) -
            parseFloat(fisrtProduct) -
            parseFloat(temperature),
        );
        setPercent(per.toFixed(1));
        setErrPercent(errPer.toFixed(1));
        setFisrtPercent(firstPer.toFixed(1));
        setTempPercent(tempPer.toFixed(1));
      }
    } catch (error) {
      showAlert(error.message);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };
  useEffect(() => {
    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }
    };
    checkLanguage();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        contentContainerStyle={styles.scrollView}
        keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Loader visible={loader} />
          <View style={styles.productChoice}>
            <Text style={styles.text}>
              {t('product')} {productName}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setIsModalProductChoiceVisible(!isModalProductChoiceVisible);
              }}>
              <Image
                style={styles.arrowChoiceProduct}
                source={require('../assets/images/arrow_icon.png')}
              />
            </TouchableOpacity>
            <DailyModal
              products={listProduct}
              visible={isModalProductChoiceVisible}
              onClose={() => {
                setIsModalProductChoiceVisible(!isModalProductChoiceVisible);
              }}
              onProductSelected={handleClickChoiceProduct}
            />
          </View>
          <View style={styles.quatityProduct}>
            <Text style={styles.text}>{t('quantity')}</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="number-pad"
              onChangeText={txt => {
                setQuatity(txt);
              }}
            />
          </View>
          <View style={styles.quatityProduct}>
            <Text style={styles.text}>{t('l.speed')}:</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="number-pad"
              onChangeText={txt => {
                setFisrtProduct(txt);
              }}
            />
          </View>
          <View style={styles.quatityProduct}>
            <Text style={styles.text}>{t('h.speed')}:</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="number-pad"
              onChangeText={txt => {
                setTemperature(txt);
              }}
            />
          </View>
          <View style={styles.quatityProduct}>
            <Text style={styles.text}>{t('err')}:</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="number-pad"
              onChangeText={txt => {
                setError(txt);
              }}
            />
          </View>
          <View style={styles.quatityProduct}>
            <Text style={styles.text}>{t('shutdown_time')}</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="number-pad"
              onChangeText={txt => {
                setShutdown_time(txt);
              }}
            />
          </View>
          <View style={styles.quatityProduct}>
            <Text style={styles.text}>{t('operated_time')}</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="number-pad"
              onChangeText={txt => {
                setTimeWork(txt);
              }}
            />
          </View>
          <View style={styles.resulView}>
            <View style={styles.resultViewElement}>
              <Text style={[styles.text, styles.resultText]}>
                {t('per')}: {percent}
              </Text>
            </View>
            <View style={styles.resultViewElement}>
              <Text style={[styles.text, styles.resultText]}>
                {t('l.speed')}: {fisrtPercent}
              </Text>
            </View>
            <View style={styles.resultViewElement}>
              <Text style={[styles.text, styles.resultText]}>
                {t('h.speed')}: {tempPercent}
              </Text>
            </View>
            <View style={styles.resultViewElement}>
              <Text style={[styles.text, styles.resultText]}>
                {t('err')}: {errPercemt}
              </Text>
            </View>
          </View>
          <View style={styles.handleBtn}>
            <TouchableOpacity onPress={handleCal} style={styles.btnCal}>
              <Text style={styles.btnText}>{t('acc')}</Text>
            </TouchableOpacity>
            {isShowSendBtn && (
              <TouchableOpacity
                onPress={() => {
                  setShowModalSendReport(true);
                }}
                style={styles.btnCal}>
                <Text style={styles.btnText}>{t('Send')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleCancel} style={styles.btnCancel}>
              <Text style={styles.btnText}>{t('c')}</Text>
            </TouchableOpacity>
          </View>
          <Modal
            animationType="none"
            transparent
            visible={isShowModalSendReport}>
            <View style={styles.modalSenReportContainer}>
              <View style={styles.cancelModal}>
                <TouchableOpacity
                  onPress={() => {
                    setShowModalSendReport(!isShowModalSendReport);
                  }}>
                  <Icon name="times" color={THEME_COLOR} size={30} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalContent}>
                <View style={styles.modalTile}>
                  <View>
                    <Text style={styles.textTitle}>{t('dailyRP')}</Text>
                  </View>
                  <View>
                    <Text style={styles.textTitle}>
                      {moment(today).format('YYYY-MM-DD')}
                    </Text>
                  </View>
                </View>
                <View style={styles.modalBody}>
                  <View style={styles.modalBodyElement}>
                    <Text style={styles.text}>{t('product')}</Text>
                    <Text style={styles.text}>{productName}</Text>
                  </View>
                  <View style={styles.modalBodyElement}>
                    <Text style={styles.text}>{t('quantity')}</Text>
                    <Text style={styles.text}>{quantity}</Text>
                  </View>
                  <View style={styles.modalBodyElement}>
                    <CheckBox
                      tintColors={{true: 'red', false: 'black'}}
                      value={Acheck}
                      style={styles.checkBox}
                      onChange={() => {
                        setShift('A');
                        setAcheck(true);
                        setBcheck(false);
                      }}
                    />
                    <Text style={[styles.text, {padding: 10}]}>{t('A.s')}</Text>
                    <CheckBox
                      tintColors={{true: 'red', false: 'black'}}
                      value={Bcheck}
                      style={styles.checkBox}
                      onChange={() => {
                        setShift('B');
                        setAcheck(false);
                        setBcheck(true);
                      }}
                    />
                    <Text style={[styles.text, {padding: 10}]}>{t('B.s')}</Text>
                  </View>
                  <View style={styles.modalBodyElement}>
                    <Text style={styles.text}>{t('operated_time')}</Text>
                    <Text style={styles.text}>{timeWork}</Text>
                  </View>
                  <View style={styles.modalBodyElement}>
                    <Text style={styles.text}>{t('cycle')}: </Text>
                    <Text style={styles.text}>{productValue}</Text>
                  </View>
                  <View style={styles.modalBodyElement}>
                    <Text style={styles.text}>{t('shutdown_time')}</Text>
                    <Text style={styles.text}>{shutdown_time}</Text>
                  </View>
                  <View
                    style={[
                      styles.modalBodyElement,
                      {flexDirection: 'column'},
                    ]}>
                    <Text style={styles.text}>{t('operator_history')}</Text>
                    <TextInput
                      placeholder={t('his.operation')}
                      placeholderTextColor={TEXT_COLOR}
                      style={{
                        borderWidth: 1,
                        marginTop: 10,
                        borderRadius: 20,
                        padding: 5,
                        height: 90,
                        width: '100%',
                        borderColor: 'black',
                        color: TEXT_COLOR,
                      }}
                      multiline={true}
                      onChangeText={text => {
                        setOperator_history(text);
                      }}
                    />
                  </View>
                  <View style={styles.modalFooter}>
                    <View style={[styles.btnCal, {borderRadius: 20}]}>
                      <TouchableOpacity onPress={handleSendDailyReport}>
                        <Icon name="send" size={30} color={BG_COLOR} />
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.btnCal, {borderRadius: 20}]}>
                      <TouchableOpacity
                        onPress={() => {
                          setShowModalSendReport(!isShowModalSendReport);
                        }}>
                        <Icon name="remove" size={30} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Daily;

const styles = StyleSheet.create({
  resultViewElement: {
    width: '25%',
    padding: 10,
  },
  modalFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  checkBox: {
    borderColor: 'black',
    color: TEXT_COLOR,
    marginTop: 5,
  },
  modalBodyElement: {
    flexDirection: 'row',
    marginTop: 5,
  },
  modalBody: {
    marginTop: 10,
    padding: 20,
  },
  modalTile: {
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cancelModal: {
    position: 'absolute',
    top: 100,
    right: 30,
  },
  modalContent: {
    width: Dimensions.get('screen').width * 0.9,
    height: Dimensions.get('screen').height * 0.6,
    backgroundColor: BG_COLOR,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'column',
  },
  modalSenReportContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: BG_COLOR,
  },
  productChoice: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME_COLOR,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  arrowChoiceProduct: {
    width: 30,
    height: 30,
  },
  text: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
  textTitle: {
    color: TEXT_COLOR,
    fontSize: 20,
    fontWeight: 'bold',
  },
  quatityProduct: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME_COLOR,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  textInput: {
    width: '50%',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 5,
    color: TEXT_COLOR,
  },
  resulView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
    borderRadius: 5,
  },
  resultText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  handleBtn: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
    flex: 1,
  },
  btnCal: {
    backgroundColor: THEME_COLOR,
    borderWidth: 1,
    height: 40,
    borderRadius: 5,
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnsend: {
    backgroundColor: THEME_COLOR,
    borderWidth: 1,
    height: 40,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  btnCancel: {
    backgroundColor: 'red',
    borderWidth: 1,
    height: 40,
    borderRadius: 5,
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
