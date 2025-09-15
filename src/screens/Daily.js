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
  Animated,
  Easing,
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
import {useTheme} from '../hooks/useTheme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const Daily = () => {
  const {t} = useTranslation();
  const {colors, sizes, fonts, shadows, isDarkMode} = useTheme();
  const authData = useSelector(state => state.auth);
  const today = moment().toDate();
  const navigation = useNavigation();
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
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
  }, []);

  const renderProductCard = () => (
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
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Icon name="package-variant" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {t('product_information', 'Thông tin sản phẩm')}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.productSelector, { 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border 
          }]}
          onPress={() => setIsModalProductChoiceVisible(true)}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.productText, 
              { color: colors.text },
              !productName && { color: colors.placeholder }
            ]}>
            {productName || t('select_product', 'Chọn sản phẩm')}
          </Text>
          <Icon name="chevron-down" size={20} color={colors.primary} />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
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
        <View style={[styles.inputIconContainer, { backgroundColor: colors.primary + '15' }]}>
          <IconFA name={iconName} size={12} color={colors.primary} />
        </View>
        <Text style={[styles.inputLabelText, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <TextInput
        style={[styles.modernInput, { 
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
          color: colors.text 
        }]}
        keyboardType="number-pad"
        value={value === 0 || value === '0' ? '' : value.toString()}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
      />
    </View>
  );

  const renderProductionCard = () => (
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
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
            <Icon name="factory" size={24} color={colors.success} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
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
      </LinearGradient>
    </Animated.View>
  );

  const renderResultsCard = () =>
    isShowSendBtn && (
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
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.info + '20' }]}>
              <Icon name="chart-line" size={24} color={colors.info} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {t('calculation_results', 'Kết quả tính toán')}
            </Text>
          </View>
          <View style={[styles.resultsContainer, { backgroundColor: colors.backgroundTertiary }]}>
            {percent !== 0 && percent !== '0' && percent !== '0.0' && (
              <View style={[styles.resultItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                  {t('efficiency_percentage', 'Hiệu suất')}:
                </Text>
                <Text style={[styles.resultValue, { color: colors.success }]}>{percent}%</Text>
              </View>
            )}
            {fisrtPercent !== 0 &&
              fisrtPercent !== '0' &&
              fisrtPercent !== '0.0' && (
                <View style={[styles.resultItem, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                    {t('low_speed', 'Tốc độ thấp')}:
                  </Text>
                  <Text style={[styles.resultValue, { color: colors.warning }]}>{fisrtPercent}%</Text>
                </View>
              )}
            {tempPercent !== 0 &&
              tempPercent !== '0' &&
              tempPercent !== '0.0' && (
                <View style={[styles.resultItem, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                    {t('high_speed', 'Tốc độ cao')}:
                  </Text>
                  <Text style={[styles.resultValue, { color: colors.warning }]}>{tempPercent}%</Text>
                </View>
              )}
            {errPercemt !== 0 && errPercemt !== '0' && errPercemt !== '0.0' && (
              <View style={[styles.resultItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>{t('error_count', 'Lỗi')}:</Text>
                <Text style={[styles.resultValue, { color: colors.danger }]}>{errPercemt}%</Text>
              </View>
            )}
            {quantity !== 0 && quantity !== '0' && (
              <View style={[styles.resultItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                  {t('final_quantity', 'Tổng số lượng cuối')}:
                </Text>
                <Text style={[styles.resultValue, { color: colors.primary }]}>{quantity}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    );

  const renderActionButtons = () => (
    <Animated.View 
      style={[
        styles.actionButtonsContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}>
      <TouchableOpacity 
        style={styles.primaryButton} 
        onPress={handleCal}
        activeOpacity={0.8}>
        <LinearGradient
          colors={[colors.primary, colors.primary2]}
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
          onPress={() => setShowModalSendReport(true)}
          activeOpacity={0.8}>
          <LinearGradient
            colors={[colors.success, '#00B894']}
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

      <TouchableOpacity 
        style={[styles.outlineButton, { borderColor: colors.primary }]} 
        onPress={handleCancel}
        activeOpacity={0.7}>
        <Text style={[styles.outlineButtonText, { color: colors.primary }]}>
          {t('cancel', 'Hủy')}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSendModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isShowModalSendReport}
      onRequestClose={() => setShowModalSendReport(false)}>
      <View style={[styles.modalOverlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          <LinearGradient
            colors={[colors.primary, colors.primary2]}
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
            <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
              {t('select_work_shift', 'Chọn ca làm việc')}
            </Text>
            <View style={styles.shiftSelector}>
              <TouchableOpacity
                style={[
                  styles.shiftButton,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border 
                  },
                  shift === 'A' && [styles.shiftButtonActive, { backgroundColor: colors.primary }],
                ]}
                onPress={() => setShift('A')}>
                <Text
                  style={[
                    styles.shiftButtonText,
                    { color: colors.textSecondary },
                    shift === 'A' && [styles.shiftButtonTextActive, { color: '#fff' }],
                  ]}>
                  {t('shift_a', 'Ca A')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.shiftButton,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border 
                  },
                  shift === 'B' && [styles.shiftButtonActive, { backgroundColor: colors.primary }],
                ]}
                onPress={() => setShift('B')}>
                <Text
                  style={[
                    styles.shiftButtonText,
                    { color: colors.textSecondary },
                    shift === 'B' && [styles.shiftButtonTextActive, { color: '#fff' }],
                  ]}>
                  {t('shift_b', 'Ca B')}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
              {t('operator_history', 'Lịch sử vận hành')}
            </Text>
            <TextInput
              style={[styles.modalTextInput, { 
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={operator_history}
              onChangeText={setOperator_history}
              placeholder={t('enter_operator_history', 'Nhập lịch sử vận hành')}
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={3}
            />

            <View style={[styles.summaryContainer, { backgroundColor: colors.backgroundTertiary }]}>
              <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
                {t('summary', 'Tóm tắt')}
              </Text>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  {t('product', 'Sản phẩm')}:
                </Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>{productName}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  {t('quantity', 'Số lượng')}:
                </Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>{quantity}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('date', 'Ngày')}:</Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>
                  {moment(today).format('DD/MM/YYYY')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalSendButton}
              onPress={handleSendDailyReport}
              activeOpacity={0.8}>
              <LinearGradient
                colors={[colors.primary, colors.primary2]}
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
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
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  cardGradient: {
    padding: 24,
  },
  cardHeader: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  productSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
  },
  productText: {
    fontSize: 16,
    flex: 1,
    fontWeight: '500',
  },
  placeholderText: {
    opacity: 0.6,
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
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  inputLabelText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  modernInput: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    fontSize: 16,
    fontWeight: '500',
  },
  resultsContainer: {
    borderRadius: 16,
    padding: 20,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    marginTop: 24,
  },
  primaryButton: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  successButton: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  outlineButton: {
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  modalContent: {
    padding: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  shiftSelector: {
    flexDirection: 'row',
    marginBottom: 28,
    gap: 16,
  },
  shiftButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
  },
  shiftButtonActive: {
    borderColor: 'transparent',
  },
  shiftButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  shiftButtonTextActive: {
    color: '#fff',
  },
  modalTextInput: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    fontSize: 16,
    marginBottom: 28,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  summaryContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalSendButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default Daily;
