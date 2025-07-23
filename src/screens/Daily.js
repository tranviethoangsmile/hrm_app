/* eslint-disable no-alert */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  SafeAreaView,
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
import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from '../../services/i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import Loader from '../components/Loader';
import ModalMessage from '../components/ModalMessage';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';

// Modern UI components and theme
import {COLORS, SIZES, FONTS, SHADOWS} from '../config/theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

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
    setIsModalProductChoiceVisible(false);
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

  const renderProductCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name="package-variant" size={20} color="#667eea" />
        <Text style={styles.cardTitle}>
          {t('product_information', 'Thông tin sản phẩm')}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.productSelector}
        onPress={() => setIsModalProductChoiceVisible(true)}>
        <Text
          style={[styles.productText, !productName && styles.placeholderText]}>
          {productName || t('select_product', 'Chọn sản phẩm')}
        </Text>
        <Icon name="chevron-down" size={20} color="#667eea" />
      </TouchableOpacity>
    </View>
  );

  const renderInputField = (
    label,
    value,
    onChangeText,
    placeholder,
    iconName,
  ) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputLabel}>
        <IconFA name={iconName} size={14} color="#667eea" />
        <Text style={styles.inputLabelText}>{label}</Text>
      </View>
      <TextInput
        style={styles.modernInput}
        keyboardType="number-pad"
        value={value === 0 || value === '0' ? '' : value.toString()}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#a0a0a0"
      />
    </View>
  );

  const renderProductionCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name="factory" size={20} color="#667eea" />
        <Text style={styles.cardTitle}>
          {t('production_details', 'Chi tiết sản xuất')}
        </Text>
      </View>
      <View style={styles.inputGrid}>
        <View style={styles.inputColumn}>
          {renderInputField(
            t('quantity', 'Số lượng'),
            quatity,
            setQuatity,
            t('enter_quantity', 'Nhập số lượng'),
            'hashtag',
          )}
          {renderInputField(
            t('low_speed', 'Tốc độ thấp'),
            fisrtProduct,
            setFisrtProduct,
            t('enter_low_speed', 'Nhập tốc độ thấp'),
            'tachometer-alt',
          )}
          {renderInputField(
            t('high_speed', 'Tốc độ cao'),
            temperature,
            setTemperature,
            t('enter_high_speed', 'Nhập tốc độ cao'),
            'thermometer-half',
          )}
        </View>
        <View style={styles.inputColumn}>
          {renderInputField(
            t('error_count', 'Lỗi'),
            error,
            setError,
            t('enter_error_count', 'Nhập số lỗi'),
            'exclamation-triangle',
          )}
          {renderInputField(
            t('shutdown_time', 'Thời gian dừng'),
            shutdown_time,
            setShutdown_time,
            t('enter_shutdown_time', 'Nhập thời gian dừng'),
            'power-off',
          )}
          {renderInputField(
            t('operated_time', 'Thời gian hoạt động'),
            timeWork,
            setTimeWork,
            t('enter_operated_time', 'Nhập thời gian hoạt động'),
            'clock',
          )}
        </View>
      </View>
    </View>
  );

  const renderResultsCard = () =>
    isShowSendBtn && (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="chart-line" size={20} color="#667eea" />
          <Text style={styles.cardTitle}>
            {t('calculation_results', 'Kết quả tính toán')}
          </Text>
        </View>
        <View style={styles.resultsContainer}>
          {percent !== 0 && percent !== '0' && percent !== '0.0' && (
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>
                {t('efficiency_percentage', 'Hiệu suất')}:
              </Text>
              <Text style={styles.resultValue}>{percent}%</Text>
            </View>
          )}
          {fisrtPercent !== 0 &&
            fisrtPercent !== '0' &&
            fisrtPercent !== '0.0' && (
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>
                  {t('low_speed', 'Tốc độ thấp')}:
                </Text>
                <Text style={styles.resultValue}>{fisrtPercent}%</Text>
              </View>
            )}
          {tempPercent !== 0 &&
            tempPercent !== '0' &&
            tempPercent !== '0.0' && (
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>
                  {t('high_speed', 'Tốc độ cao')}:
                </Text>
                <Text style={styles.resultValue}>{tempPercent}%</Text>
              </View>
            )}
          {errPercemt !== 0 && errPercemt !== '0' && errPercemt !== '0.0' && (
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>{t('error_count', 'Lỗi')}:</Text>
              <Text style={styles.resultValue}>{errPercemt}%</Text>
            </View>
          )}
          {quantity !== 0 && quantity !== '0' && (
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>
                {t('final_quantity', 'Tổng số lượng cuối')}:
              </Text>
              <Text style={styles.resultValue}>{quantity}</Text>
            </View>
          )}
        </View>
      </View>
    );

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity style={styles.primaryButton} onPress={handleCal}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.buttonGradient}>
          <Icon name="calculator" size={20} color="#fff" />
          <Text style={styles.buttonText}>{t('calculate', 'Tính toán')}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {isShowSendBtn && (
        <TouchableOpacity
          style={styles.successButton}
          onPress={() => setShowModalSendReport(true)}>
          <LinearGradient
            colors={['#00D4AA', '#00B894']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.buttonGradient}>
            <Icon name="send" size={20} color="#fff" />
            <Text style={styles.buttonText}>
              {t('send_report', 'Gửi báo cáo')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.outlineButton} onPress={handleCancel}>
        <Text style={styles.outlineButtonText}>{t('cancel', 'Hủy')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSendModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isShowModalSendReport}
      onRequestClose={() => setShowModalSendReport(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t('confirm_report_submission', 'Xác nhận gửi báo cáo')}
            </Text>
            <TouchableOpacity
              onPress={() => setShowModalSendReport(false)}
              style={styles.modalCloseButton}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>
              {t('select_work_shift', 'Chọn ca làm việc')}
            </Text>
            <View style={styles.shiftSelector}>
              <TouchableOpacity
                style={[
                  styles.shiftButton,
                  shift === 'A' && styles.shiftButtonActive,
                ]}
                onPress={() => setShift('A')}>
                <Text
                  style={[
                    styles.shiftButtonText,
                    shift === 'A' && styles.shiftButtonTextActive,
                  ]}>
                  {t('shift_a', 'Ca A')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.shiftButton,
                  shift === 'B' && styles.shiftButtonActive,
                ]}
                onPress={() => setShift('B')}>
                <Text
                  style={[
                    styles.shiftButtonText,
                    shift === 'B' && styles.shiftButtonTextActive,
                  ]}>
                  {t('shift_b', 'Ca B')}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionTitle}>
              {t('operator_history', 'Lịch sử vận hành')}
            </Text>
            <TextInput
              style={styles.modalTextInput}
              value={operator_history}
              onChangeText={setOperator_history}
              placeholder={t('enter_operator_history', 'Nhập lịch sử vận hành')}
              placeholderTextColor="#a0a0a0"
              multiline
              numberOfLines={3}
            />

            <View style={styles.summaryContainer}>
              <Text style={styles.modalSectionTitle}>
                {t('summary', 'Tóm tắt')}
              </Text>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>
                  {t('product', 'Sản phẩm')}:
                </Text>
                <Text style={styles.summaryValue}>{productName}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>
                  {t('quantity', 'Số lượng')}:
                </Text>
                <Text style={styles.summaryValue}>{quantity}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{t('date', 'Ngày')}:</Text>
                <Text style={styles.summaryValue}>
                  {moment(today).format('DD/MM/YYYY')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalSendButton}
              onPress={handleSendDailyReport}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.buttonGradient}>
                <Text style={styles.buttonText}>
                  {t('send_report', 'Gửi báo cáo')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Header
        title={t('daily_report', 'Báo cáo ngày')}
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}>
          <Loader visible={loader} />

          {renderProductCard()}
          {renderProductionCard()}
          {renderResultsCard()}
          {renderActionButtons()}

          <DailyModal
            products={listProduct}
            visible={isModalProductChoiceVisible}
            onClose={() => setIsModalProductChoiceVisible(false)}
            onProductSelected={handleClickChoiceProduct}
          />

          {renderSendModal()}
        </ScrollView>
      </KeyboardAvoidingView>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.light,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    ...FONTS.h4,
    color: '#1a202c',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  productSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  productText: {
    ...FONTS.body3,
    color: '#1a202c',
    flex: 1,
  },
  placeholderText: {
    color: '#a0a0a0',
  },
  inputGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  inputColumn: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabelText: {
    ...FONTS.body4,
    color: '#4a5568',
    marginLeft: 6,
    fontWeight: '600',
  },
  modernInput: {
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...FONTS.body3,
    color: '#1a202c',
  },
  resultsContainer: {
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 16,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  resultLabel: {
    ...FONTS.body4,
    color: '#4a5568',
  },
  resultValue: {
    ...FONTS.body4,
    color: '#667eea',
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    marginTop: 20,
  },
  primaryButton: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  successButton: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonText: {
    ...FONTS.h4,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  outlineButtonText: {
    ...FONTS.h4,
    color: '#667eea',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.dark,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    ...FONTS.h4,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  modalSectionTitle: {
    ...FONTS.h4,
    color: '#1a202c',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  shiftSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  shiftButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  shiftButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  shiftButtonText: {
    ...FONTS.body4,
    color: '#4a5568',
    fontWeight: 'bold',
  },
  shiftButtonTextActive: {
    color: '#fff',
  },
  modalTextInput: {
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...FONTS.body3,
    color: '#1a202c',
    marginBottom: 24,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  summaryContainer: {
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    ...FONTS.body4,
    color: '#4a5568',
  },
  summaryValue: {
    ...FONTS.body4,
    color: '#667eea',
    fontWeight: 'bold',
  },
  modalSendButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
});

export default Daily;
