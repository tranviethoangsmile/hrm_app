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
  ActivityIndicator,
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
import IconFA from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import Loader from '../components/Loader';
import ModalMessage from '../components/ModalMessage';
import Header from '../components/common/Header';
import LinearGradient from 'react-native-linear-gradient';
import {format} from 'date-fns';

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
  const [showReview, setShowReview] = useState(false);
  const [content, setContent] = useState('');

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

  const handleSubmit = () => {
    if (!content.trim()) {
      Alert.alert(t('error'), t('please_enter_content'));
      return;
    }
    setShowReview(true);
  };

  const handleConfirm = async () => {
    setLoader(true);
    try {
      await handleSendDailyReport();
      setShowReview(false);
      Alert.alert(t('success'), t('daily_report_sent'));
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('error'), error.message);
    } finally {
      setLoader(false);
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
  }, []);

  const formatDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const renderReviewModal = () => (
    <Modal
      visible={showReview}
      transparent
      animationType="slide"
      onRequestClose={() => setShowReview(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('review_daily')}</Text>
            <TouchableOpacity
              onPress={() => setShowReview(false)}
              style={styles.closeButton}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.reviewContent}>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>{t('date')}</Text>
              <Text style={styles.reviewValue}>{formatDate()}</Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>{t('content')}</Text>
              <Text style={styles.reviewValue}>{content}</Text>
            </View>

            <View style={styles.reviewButtonContainer}>
              <TouchableOpacity
                style={[styles.reviewButton, styles.cancelButton]}
                onPress={() => setShowReview(false)}>
                <Text
                  style={[styles.reviewButtonText, styles.cancelButtonText]}>
                  {t('cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reviewButton, styles.confirmButton]}
                onPress={handleConfirm}>
                <Text
                  style={[styles.reviewButtonText, styles.confirmButtonText]}>
                  {t('confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.modernContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <Header
        title={t('daily.report', 'Báo cáo ngày')}
        onBack={() => navigation.goBack()}
      />
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
            <View style={styles.inputGridRow}>
              <View style={styles.inputGridCol}>
                <Input
                  label={
                    <>
                      <IconFA name="hashtag" size={14} color={COLORS.primary} />{' '}
                      {t('quantity')}
                    </>
                  }
                  keyboardType="number-pad"
                  value={
                    quatity === 0 || quatity === '0' ? '' : quatity.toString()
                  }
                  onChangeText={txt => setQuatity(txt)}
                  placeholder={t('enter.quantity')}
                  containerStyle={styles.inputField}
                />
                <Input
                  label={
                    <>
                      <IconFA
                        name="tachometer-alt"
                        size={14}
                        color={COLORS.primary}
                      />{' '}
                      {t('l.speed')}
                    </>
                  }
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
                  label={
                    <>
                      <IconFA
                        name="thermometer-half"
                        size={14}
                        color={COLORS.primary}
                      />{' '}
                      {t('h.speed')}
                    </>
                  }
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
              </View>
              <View style={styles.inputGridCol}>
                <Input
                  label={
                    <>
                      <IconFA
                        name="exclamation-triangle"
                        size={14}
                        color={COLORS.primary}
                      />{' '}
                      {t('err')}
                    </>
                  }
                  keyboardType="number-pad"
                  value={error === 0 || error === '0' ? '' : error.toString()}
                  onChangeText={txt => setError(txt)}
                  placeholder={t('enter.error.count')}
                  containerStyle={styles.inputField}
                />
                <Input
                  label={
                    <>
                      <IconFA
                        name="power-off"
                        size={14}
                        color={COLORS.primary}
                      />{' '}
                      {t('shutdown_time')}
                    </>
                  }
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
                  label={
                    <>
                      <IconFA name="clock" size={14} color={COLORS.primary} />{' '}
                      {t('operated_time')}
                    </>
                  }
                  keyboardType="number-pad"
                  value={
                    timeWork === 0 || timeWork === '0'
                      ? ''
                      : timeWork.toString()
                  }
                  onChangeText={txt => setTimeWork(txt)}
                  placeholder={t('enter.operated.time')}
                  containerStyle={styles.inputField}
                />
              </View>
            </View>
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
                backgroundColor: 'rgba(0,0,0,0.35)',
              }}>
              <View
                style={{
                  width: 330,
                  minHeight: 340,
                  backgroundColor: '#fff',
                  borderRadius: 18,
                  padding: 20,
                  alignItems: 'stretch',
                  justifyContent: 'flex-start',
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.18,
                  shadowRadius: 8,
                  elevation: 8,
                }}>
                {/* Header */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: COLORS.primary,
                      letterSpacing: 0.2,
                    }}>
                    {t('confirm.report.submission')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowModalSendReport(false)}>
                    <Icon name="close" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                {/* Shift selector */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    marginBottom: 16,
                  }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      marginHorizontal: 8,
                      paddingVertical: 12,
                      borderRadius: 24,
                      backgroundColor:
                        shift === 'A' ? COLORS.primary : '#f4f6fb',
                      borderWidth: 1.5,
                      borderColor: COLORS.primary,
                      alignItems: 'center',
                      shadowColor:
                        shift === 'A' ? COLORS.primary : 'transparent',
                      shadowOpacity: shift === 'A' ? 0.15 : 0,
                      elevation: shift === 'A' ? 2 : 0,
                    }}
                    onPress={() => setShift('A')}>
                    <Text
                      style={{
                        color: shift === 'A' ? '#fff' : COLORS.primary,
                        fontWeight: 'bold',
                        fontSize: 16,
                        letterSpacing: 1,
                      }}>
                      {t('shiftA', 'A')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      marginHorizontal: 8,
                      paddingVertical: 12,
                      borderRadius: 24,
                      backgroundColor:
                        shift === 'B' ? COLORS.primary : '#f4f6fb',
                      borderWidth: 1.5,
                      borderColor: COLORS.primary,
                      alignItems: 'center',
                      shadowColor:
                        shift === 'B' ? COLORS.primary : 'transparent',
                      shadowOpacity: shift === 'B' ? 0.15 : 0,
                      elevation: shift === 'B' ? 2 : 0,
                    }}
                    onPress={() => setShift('B')}>
                    <Text
                      style={{
                        color: shift === 'B' ? '#fff' : COLORS.primary,
                        fontWeight: 'bold',
                        fontSize: 16,
                        letterSpacing: 1,
                      }}>
                      {t('shiftB', 'B')}
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* Operator history */}
                <Text
                  style={{
                    fontWeight: 'bold',
                    marginBottom: 6,
                    color: COLORS.text,
                    fontSize: 15,
                  }}>
                  {t('operator_history')}
                </Text>
                <TextInput
                  value={operator_history}
                  onChangeText={text => setOperator_history(text)}
                  placeholder={t('enter.operator.history')}
                  multiline
                  numberOfLines={3}
                  style={{
                    borderWidth: 1.2,
                    borderColor: COLORS.primary,
                    borderRadius: 10,
                    padding: 12,
                    minHeight: 54,
                    marginBottom: 14,
                    backgroundColor: '#f7fafd',
                    color: COLORS.text,
                    fontSize: 15,
                  }}
                  placeholderTextColor={COLORS.placeholder || '#888'}
                />
                {/* Summary */}
                <Text
                  style={{
                    fontWeight: 'bold',
                    marginBottom: 6,
                    color: COLORS.text,
                    fontSize: 15,
                  }}>
                  {t('summary')}
                </Text>
                <View
                  style={{
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#e3e6ee',
                    borderRadius: 10,
                    padding: 10,
                    backgroundColor: '#f9fafd',
                  }}>
                  <Text style={{color: COLORS.textSecondary, fontSize: 14}}>
                    {t('product')}:{' '}
                    <Text style={{color: COLORS.primary, fontWeight: 'bold'}}>
                      {t(productName, productName)}
                    </Text>
                  </Text>
                  <Text style={{color: COLORS.textSecondary, fontSize: 14}}>
                    {t('quantity')}:{' '}
                    <Text style={{color: COLORS.primary, fontWeight: 'bold'}}>
                      {quantity}
                    </Text>
                  </Text>
                  <Text style={{color: COLORS.textSecondary, fontSize: 14}}>
                    {t('shift')}:{' '}
                    <Text style={{color: COLORS.primary, fontWeight: 'bold'}}>
                      {t('shift' + shift, shift)}
                    </Text>
                  </Text>
                  <Text style={{color: COLORS.textSecondary, fontSize: 14}}>
                    {t('operated_time')}:{' '}
                    <Text style={{color: COLORS.primary, fontWeight: 'bold'}}>
                      {timeWork}
                    </Text>
                  </Text>
                  <Text style={{color: COLORS.textSecondary, fontSize: 14}}>
                    {t('cycle')}:{' '}
                    <Text style={{color: COLORS.primary, fontWeight: 'bold'}}>
                      {productValue}
                    </Text>
                  </Text>
                  <Text style={{color: COLORS.textSecondary, fontSize: 14}}>
                    {t('shutdown_time')}:{' '}
                    <Text style={{color: COLORS.primary, fontWeight: 'bold'}}>
                      {shutdown_time}
                    </Text>
                  </Text>
                  <Text style={{color: COLORS.textSecondary, fontSize: 14}}>
                    {t('date')}:{' '}
                    <Text style={{color: COLORS.primary, fontWeight: 'bold'}}>
                      {moment(today).format('YYYY-MM-DD')}
                    </Text>
                  </Text>
                </View>
                {/* Nút gửi báo cáo */}
                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.primary,
                    borderRadius: 10,
                    paddingVertical: 12,
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                  onPress={handleSendDailyReport}>
                  <Text
                    style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>
                    {t('Send')}
                  </Text>
                </TouchableOpacity>
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
      {renderReviewModal()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  modernContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  reviewContent: {
    padding: 16,
  },
  reviewSection: {
    marginBottom: 16,
  },
  reviewLabel: {
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 4,
    fontWeight: '500',
  },
  reviewValue: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  reviewButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  reviewButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
  },
  confirmButton: {
    backgroundColor: '#667eea',
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666',
  },
  confirmButtonText: {
    color: '#fff',
  },
  inputGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  inputGridCol: {
    flex: 1,
  },
});

export default Daily;
