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
  FlatList,
} from 'react-native';
import {
  API,
  BASE_URL,
  CREATE,
  DAILY_REPORT,
  PORT,
  V1,
  VERSION,
} from '../utils/constans';

import {useSelector} from 'react-redux';
import DailyModal from '../components/DailyModal';
import {TEXT_COLOR, THEME_COLOR, BG_COLOR} from '../utils/Colors';
import {useNavigation} from '@react-navigation/native';
import CheckBox from '@react-native-community/checkbox';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from '../../services/i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import Loader from '../components/Loader';
import ModalMessage from '../components/ModalMessage';

// Modern UI components and theme
import {COLORS, SIZES, FONTS, SHADOWS} from '../config/theme';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
        throw new Error('unSuccess');
      }
      setLoader(false);
      setShowModalSendReport(false);
      setShowSuccessModal(true);
    } catch (error) {
      setLoader(false);
      showAlert(error.message);
    } finally {
      setLoader(false);
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
      style={styles.modernContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Icon name="arrow-left" size={SIZES.h2} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('daily.report')}</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Loader visible={loader} />

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>{t('product.information')}</Text>
            <TouchableOpacity
              style={styles.productSelector}
              onPress={() => {
                setIsModalProductChoiceVisible(!isModalProductChoiceVisible);
              }}>
              <Text
                style={[
                  styles.productSelectorText,
                  !productName && styles.placeholderText,
                ]}>
                {productName || t('select.product')}
              </Text>
              <Icon name="chevron-down" size={SIZES.h3} color={COLORS.icon} />
            </TouchableOpacity>
            <DailyModal
              products={listProduct}
              visible={isModalProductChoiceVisible}
              onClose={() => {
                setIsModalProductChoiceVisible(!isModalProductChoiceVisible);
              }}
              onProductSelected={handleClickChoiceProduct}
            />
          </Card>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>{t('production.details')}</Text>
            <Input
              label={t('quantity')}
              keyboardType="number-pad"
              value={quatity === 0 || quatity === '0' ? '' : quatity.toString()}
              onChangeText={txt => setQuatity(txt)}
              placeholder={t('enter.quantity')}
              containerStyle={styles.inputField}
            />
            <Input
              label={t('l.speed')}
              keyboardType="number-pad"
              value={
                fisrtProduct === 0 || fisrtProduct === '0'
                  ? ''
                  : fisrtProduct.toString()
              }
              onChangeText={txt => setFisrtProduct(txt)}
              placeholder={t('enter.l.speed')}
              containerStyle={styles.inputField}
            />
            <Input
              label={t('h.speed')}
              keyboardType="number-pad"
              value={
                temperature === 0 || temperature === '0'
                  ? ''
                  : temperature.toString()
              }
              onChangeText={txt => setTemperature(txt)}
              placeholder={t('enter.h.speed')}
              containerStyle={styles.inputField}
            />
            <Input
              label={t('err')}
              keyboardType="number-pad"
              value={error === 0 || error === '0' ? '' : error.toString()}
              onChangeText={txt => setError(txt)}
              placeholder={t('enter.error.count')}
              containerStyle={styles.inputField}
            />
            <Input
              label={t('shutdown_time')}
              keyboardType="number-pad"
              value={
                shutdown_time === 0 || shutdown_time === '0'
                  ? ''
                  : shutdown_time.toString()
              }
              onChangeText={txt => setShutdown_time(txt)}
              placeholder={t('enter.shutdown.time')}
              containerStyle={styles.inputField}
            />
            <Input
              label={t('operated_time')}
              keyboardType="number-pad"
              value={
                timeWork === 0 || timeWork === '0' ? '' : timeWork.toString()
              }
              onChangeText={txt => setTimeWork(txt)}
              placeholder={t('enter.operated.time')}
              containerStyle={styles.inputField}
            />
          </Card>

          {isShowSendBtn && (
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>{t('results')}</Text>
              {percent !== 0 && percent !== '0' && percent !== '0.0' && (
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>{t('per')}:</Text>
                  <Text style={styles.resultValue}>{percent}%</Text>
                </View>
              )}
              {fisrtPercent !== 0 &&
                fisrtPercent !== '0' &&
                fisrtPercent !== '0.0' && (
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>{t('l.speed')}:</Text>
                    <Text style={styles.resultValue}>{fisrtPercent}%</Text>
                  </View>
                )}
              {tempPercent !== 0 &&
                tempPercent !== '0' &&
                tempPercent !== '0.0' && (
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>{t('h.speed')}:</Text>
                    <Text style={styles.resultValue}>{tempPercent}%</Text>
                  </View>
                )}
              {errPercemt !== 0 &&
                errPercemt !== '0' &&
                errPercemt !== '0.0' && (
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>{t('err')}:</Text>
                    <Text style={styles.resultValue}>{errPercemt}%</Text>
                  </View>
                )}
              {quantity !== 0 && quantity !== '0' && (
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>
                    {t('total.quantity.final')}:
                  </Text>
                  <Text style={styles.resultValue}>{quantity}</Text>
                </View>
              )}
            </Card>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title={t('acc')}
              onPress={handleCal}
              style={styles.actionButton}
              variant="primary"
            />
            {isShowSendBtn && (
              <Button
                title={t('Send')}
                onPress={() => {
                  setShowModalSendReport(true);
                }}
                style={styles.actionButton}
                variant="success"
              />
            )}
            <Button
              title={t('c')}
              onPress={handleCancel}
              style={styles.actionButton}
              variant="outline"
            />
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={isShowModalSendReport}
            onRequestClose={() => setShowModalSendReport(false)}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}>
              <View
                style={{
                  width: 300,
                  minHeight: 320,
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 20,
                  alignItems: 'stretch',
                  justifyContent: 'flex-start',
                }}>
                {/* Header */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: '#1976D2',
                    }}>
                    {t('confirm.report.submission')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowModalSendReport(false)}>
                    <Text style={{color: 'red', fontSize: 24}}>X</Text>
                  </TouchableOpacity>
                </View>
                {/* Shift selector */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    marginBottom: 12,
                  }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      marginHorizontal: 8,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: shift === 'A' ? '#1976D2' : '#fff',
                      borderWidth: 1,
                      borderColor: '#1976D2',
                      alignItems: 'center',
                    }}
                    onPress={() => setShift('A')}>
                    <Text
                      style={{
                        color: shift === 'A' ? '#fff' : '#1976D2',
                        fontWeight: 'bold',
                      }}>
                      A
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      marginHorizontal: 8,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: shift === 'B' ? '#1976D2' : '#fff',
                      borderWidth: 1,
                      borderColor: '#1976D2',
                      alignItems: 'center',
                    }}
                    onPress={() => setShift('B')}>
                    <Text
                      style={{
                        color: shift === 'B' ? '#fff' : '#1976D2',
                        fontWeight: 'bold',
                      }}>
                      B
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* Operator history */}
                <Text style={{fontWeight: 'bold', marginBottom: 4}}>
                  {t('operator_history')}
                </Text>
                <TextInput
                  value={operator_history}
                  onChangeText={text => setOperator_history(text)}
                  placeholder={t('enter.operator.history')}
                  multiline
                  numberOfLines={3}
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    padding: 10,
                    minHeight: 50,
                    marginBottom: 12,
                    backgroundColor: '#fafafa',
                  }}
                />
                {/* Summary */}
                <Text style={{fontWeight: 'bold', marginBottom: 4}}>
                  {t('summary')}
                </Text>
                <View style={{marginBottom: 12}}>
                  <Text>
                    {t('product')}: {productName}
                  </Text>
                  <Text>
                    {t('quantity')}: {quantity}
                  </Text>
                  <Text>
                    {t('shift')}: {shift}
                  </Text>
                  <Text>
                    {t('operated_time')}: {timeWork}
                  </Text>
                  <Text>
                    {t('cycle')}: {productValue}
                  </Text>
                  <Text>
                    {t('shutdown_time')}: {shutdown_time}
                  </Text>
                  <Text>
                    {t('date')}: {moment(today).format('YYYY-MM-DD')}
                  </Text>
                </View>
                {/* Buttons */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      marginRight: 8,
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor: '#fff',
                      borderWidth: 1,
                      borderColor: '#1976D2',
                      alignItems: 'center',
                    }}
                    onPress={() => setShowModalSendReport(false)}>
                    <Text style={{color: '#1976D2', fontWeight: 'bold'}}>
                      {t('cancel')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      marginLeft: 8,
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor: '#1976D2',
                      alignItems: 'center',
                    }}
                    onPress={handleSendDailyReport}>
                    <Text style={{color: '#fff', fontWeight: 'bold'}}>
                      {t('send')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
      <ModalMessage
        isVisible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.navigate('Main');
        }}
        message={'success'}
        type={'success'}
        t={t}
        duration={1500}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  modernContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding / 1.5,
    paddingVertical: SIZES.base * 1.5,
    backgroundColor: COLORS.primary,
    height: SIZES.headerHeight,
    ...SHADOWS.light,
  },
  headerButton: {
    padding: SIZES.base,
    minWidth: SIZES.h1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  scrollViewContent: {
    paddingBottom: SIZES.padding * 2,
  },
  formContainer: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
  },
  card: {
    marginBottom: SIZES.padding * 1.2,
    padding: SIZES.padding * 0.8,
  },
  cardTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: SIZES.padding * 0.8,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    paddingBottom: SIZES.base,
  },
  productSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base * 1.5,
    paddingHorizontal: SIZES.inputPaddingHorizontal || SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    height: SIZES.inputHeight,
    marginBottom: SIZES.base,
  },
  productSelectorText: {
    ...FONTS.body3,
    color: COLORS.text,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.placeholder,
  },
  inputField: {
    marginBottom: SIZES.base * 1.8,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray2,
    ':last-child': {
      borderBottomWidth: 0,
    },
  },
  resultLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  resultValue: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SIZES.base / 2,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalCardModern: {
    width: SIZES.width * 0.92,
    maxHeight: SIZES.height * 0.85,
    borderRadius: SIZES.radiusLg || 16,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
    padding: SIZES.padding,
  },
  modalHeaderModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    backgroundColor: COLORS.background,
  },
  modalTitleModern: {
    ...FONTS.h2,
    color: COLORS.primary,
    fontWeight: '700',
  },
  closeButtonModern: {
    padding: SIZES.base,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray3,
  },
  modalSectionTitleModern: {
    ...FONTS.h5,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SIZES.base,
    marginBottom: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray2,
  },
  summaryListModern: {
    marginVertical: SIZES.base,
  },
  summaryItemModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray3,
  },
  summaryLabelModern: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  summaryValueModern: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '500',
  },
  modalButtonContainerModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    paddingTop: SIZES.base,
  },
  modalButtonModern: {
    flex: 1,
    marginHorizontal: SIZES.base * 0.5,
  },
  inputFieldModalModern: {
    marginBottom: SIZES.padding,
  },
  modalInputTextStyleModern: {},
  shiftSelectorContainerModern: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SIZES.padding,
  },
  shiftButton: {
    flex: 1,
    marginHorizontal: SIZES.base / 2,
  },
  shiftButtonText: {},
  shiftButtonTextActive: {},
});

export default Daily;
