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
import i18next, {translateMessage} from '../../services/i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import apiClient from '../services/apiClient';
import OptimizedLoader from '../components/OptimizedLoader';
import ModalMessage from '../components/ModalMessage';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/common/Header';

// Modern UI components and theme
import {useTheme} from '../hooks/useTheme';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const ERROR_OPTIONS = [
  {code: '21', labelKey: 'daily_error_name_21'},
  {code: '22', labelKey: 'daily_error_name_22'},
  {code: '23', labelKey: 'daily_error_name_23'},
  {code: '24', labelKey: 'daily_error_name_24'},
  {code: '31', labelKey: 'daily_error_name_31'},
  {code: '33', labelKey: 'daily_error_name_33'},
  {code: '41', labelKey: 'daily_error_name_41'},
  {code: '44', labelKey: 'daily_error_name_44'},
  {code: '45', labelKey: 'daily_error_name_45'},
  {code: '46', labelKey: 'daily_error_name_46'},
  {code: '47', labelKey: 'daily_error_name_47'},
  {code: '48', labelKey: 'daily_error_name_48'},
  {code: '49', labelKey: 'daily_error_name_49'},
  {code: '61', labelKey: 'daily_error_name_61'},
  {code: '62', labelKey: 'daily_error_name_62'},
  {code: '63', labelKey: 'daily_error_name_63'},
  {code: '65', labelKey: 'daily_error_name_65'},
  {code: '66', labelKey: 'daily_error_name_66'},
  {code: '67', labelKey: 'daily_error_name_67'},
  {code: '71', labelKey: 'daily_error_name_71'},
  {code: '73', labelKey: 'daily_error_name_73'},
  {code: '74', labelKey: 'daily_error_name_74'},
  {code: '76', labelKey: 'daily_error_name_76'},
  {code: '81', labelKey: 'daily_error_name_81'},
  {code: '91', labelKey: 'daily_error_name_91'},
  {code: '92', labelKey: 'daily_error_name_92'},
  {code: '94', labelKey: 'daily_error_name_94'},
  {code: '95', labelKey: 'daily_error_name_95'},
];

// Danh sách sản phẩm đồng bộ với Products enum bên BE (hrmMetal/src/enum/product.enum.ts)
// `code` = giá trị gửi lên BE; D14KRR_1/D14KRR_2 hiển thị 2 variant nhưng BE chỉ nhận `D14KRR`.
const listProduct = [
  {label: 'C84_BUV', value: '1.1'},
  {label: 'D16E_COP', value: '0.42'},
  {label: 'D637F', value: '1'},
  {label: 'D93F_PAO_DC2', value: '0.97'},
  {label: 'D67E_PAO', value: '0.87'},
  {label: 'D61F_PAO_DC2', value: '0.86'},
  {label: 'D66_DC3', value: '1.26'},
  {label: 'DF93_4', value: '1.07'},
  {label: 'DF93_3', value: '1.07'},
  {label: 'D042F_PAO_DC3', value: '1.08'},
  {label: 'D14KFR', value: '1.01'},
  {label: 'DK05FR_1', value: '1'},
  {label: 'DK05FR_2', value: '1'},
  {label: 'C84N', value: '1.13'},
  {label: 'C089', value: '1.23'},
  {label: 'D860F_PAO_DC3', value: '1.26'},
  {label: 'D67E_CTC', value: '0.98'},
  {label: 'D86_CTC', value: '0.98'},
  {label: 'D66_5', value: '0.88'},
  {label: 'D66_6', value: '0.88'},
  {label: 'D66_7', value: '0.91'},
  {label: 'D93F_PAO_DC4', value: '1.08'},
  {label: 'D042F_PAO_DC4', value: '0.97'},
  {label: 'D14KRR_1', value: '1.08', code: 'D14KRR'},
  {label: 'D14KRR_2', value: '0.95', code: 'D14KRR'},
  {label: 'DK05RR_1', value: '0.92'},
  {label: 'DK05RR_2', value: '0.92'},
  {label: 'DK05RR_3', value: '0.92'},
  {label: 'D61F_PAO_DC4', value: '0.8'},
  {label: 'D59P', value: '0.84'},
];
const Daily = () => {
  const {t} = useTranslation();
  const {colors, isDarkMode} = useTheme();
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
    Alert.alert(t('noti'), translateMessage(message));
  };
  const [isShowModalSendReport, setShowModalSendReport] = useState(false);
  const [isModalProductChoiceVisible, setIsModalProductChoiceVisible] =
    useState(false);
  const [isModalErrorChoiceVisible, setIsModalErrorChoiceVisible] =
    useState(false);
  const [selectedErrorRowId, setSelectedErrorRowId] = useState(null);
  const [loader, setLoader] = useState(false);

  const [shift, setShift] = useState('');
  const [productName, setProductName] = useState('');
  const [productCode, setProductCode] = useState('');
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
  const [reportErrors, setReportErrors] = useState([]);

  const getErrorDescriptionByCode = code => {
    const option = ERROR_OPTIONS.find(item => item.code === code);
    if (!option) {
      return '';
    }
    return t(option.labelKey);
  };

  const getErrorDisplayLabel = code => {
    if (!code) {
      return '';
    }
    return `${code} - ${getErrorDescriptionByCode(code)}`;
  };

  const errorOptionsForModal = ERROR_OPTIONS.map(item => ({
    label: `${item.code} - ${getErrorDescriptionByCode(item.code)}`,
    value: item.code,
  }));

  const handleAddErrorRow = () => {
    setReportErrors(prev => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        code: '',
        description: '',
        shutdown_time: '',
        error_date: moment(today).format('YYYY-MM-DD'),
      },
    ]);
  };

  const handleDeleteErrorRow = rowId => {
    setReportErrors(prev => prev.filter(item => item.id !== rowId));
  };

  const handleOpenErrorPicker = rowId => {
    setSelectedErrorRowId(rowId);
    setIsModalErrorChoiceVisible(true);
  };

  const handleSelectErrorCode = selected => {
    if (!selectedErrorRowId) {
      return;
    }
    setReportErrors(prev =>
      prev.map(item =>
        item.id === selectedErrorRowId
          ? {
              ...item,
              code: selected.value,
              description:
                !item.description ||
                item.description === getErrorDescriptionByCode(item.code)
                  ? getErrorDescriptionByCode(selected.value)
                  : item.description,
            }
          : item,
      ),
    );
    setSelectedErrorRowId(null);
    setIsModalErrorChoiceVisible(false);
  };

  const handleChangeErrorField = (rowId, field, value) => {
    setReportErrors(prev =>
      prev.map(item => (item.id === rowId ? {...item, [field]: value} : item)),
    );
  };

  const handleSendDailyReport = async () => {
    try {
      setLoader(true);
      if (
        operator_history === '' ||
        shift === '' ||
        productName === '' ||
        productCode === ''
      ) {
        setLoader(false);
        throw new Error('not.empty');
      }
      const totalQuantity = parseFloat(quatity) || 0;
      const defectiveQuantity = parseFloat(error) || 0;
      const cycleTime = parseFloat(productValue) || 0;
      const operatedTime = parseFloat(timeWork) || 0;
      const shutdownTime = parseFloat(shutdown_time) || 0;
      const goodQuantity =
        parseFloat(quantity - error - fisrtProduct - temperature) || 0;
      const mappedErrors = reportErrors
        .filter(item => item.code && item.description)
        .map(item => ({
          code: item.code,
          description: item.description,
          shutdown_time: parseFloat(item.shutdown_time) || 0,
          error_date: item.error_date || moment(today).format('YYYY-MM-DD'),
        }));
      const field = {
        product: productCode,
        user_id: authData?.data?.data?.id,
        department_id: authData?.data?.data?.department_id,
        date: moment(today).format('YYYY-MM-DD'),
        shift: shift,
        quantity: totalQuantity,
        good_quantity: goodQuantity,
        defective_quantity: defectiveQuantity,
        cycle_time: cycleTime,
        operated_time: operatedTime,
        shutdown_time: shutdownTime,
        operator_history: operator_history,
        errors: mappedErrors,
      };
      const dailyReport = await apiClient.post(
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
    setProductCode(product.code || product.label);
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

  const entryAnim = {
    opacity: fadeAnim,
    transform: [{translateY: slideAnim}, {scale: scaleAnim}],
  };

  const renderHeroCard = () => (
    <Animated.View style={[styles.heroCard, entryAnim]}>
      <LinearGradient
        colors={colors.primaryGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.heroGradient}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIconWrap}>
            <Icon name="calendar-month" size={24} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>
            {t('daily_report', 'Báo cáo ngày')}
          </Text>
        </View>
        <Text style={styles.heroDate}>
          {moment(today).format('dddd, DD/MM/YYYY')}
        </Text>
        <Text style={styles.heroDesc}>
          {t('daily_report_hero_desc', 'Ghi nhận chi tiết sản xuất theo ca')}
        </Text>
      </LinearGradient>
    </Animated.View>
  );

  const renderCardHeader = (icon, title, color) => (
    <View style={styles.cardHeader}>
      <View style={[styles.iconContainer, {backgroundColor: color + '20'}]}>
        <Icon name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.cardTitle, {color: colors.text}]}>{title}</Text>
    </View>
  );

  const renderProductCard = () => (
    <Animated.View
      style={[
        styles.card,
        {backgroundColor: colors.surface, borderColor: colors.border},
        entryAnim,
      ]}>
      {renderCardHeader(
        'package-variant',
        t('product_information', 'Thông tin sản phẩm'),
        colors.primary,
      )}
      <TouchableOpacity
        style={[
          styles.productSelector,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: productName ? colors.primary : colors.border,
          },
        ]}
        onPress={() => setIsModalProductChoiceVisible(true)}
        activeOpacity={0.7}>
        <View style={styles.productSelectorLeft}>
          <Icon
            name="cube-outline"
            size={18}
            color={productName ? colors.primary : colors.textTertiary}
          />
          <Text
            style={[
              styles.productText,
              {color: colors.text},
              !productName && {color: colors.placeholder},
            ]}>
            {productName || t('select_product', 'Chọn sản phẩm')}
          </Text>
        </View>
        <View
          style={[
            styles.productValueBadge,
            {backgroundColor: colors.primary + '15'},
          ]}>
          <Text style={[styles.productValueText, {color: colors.primary}]}>
            {productValue ? `${productValue}` : '—'}
          </Text>
          <Icon name="chevron-down" size={18} color={colors.primary} />
        </View>
      </TouchableOpacity>
      <Text style={[styles.cardHint, {color: colors.textTertiary}]}>
        {productName
          ? `${t('cycle_time', 'Thời gian chu kỳ')}: ${productValue}`
          : t('select_product_hint', 'Chạm để chọn sản phẩm sản xuất')}
      </Text>
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
        <View
          style={[
            styles.inputIconContainer,
            {backgroundColor: colors.primary + '12'},
          ]}>
          <IconFA name={iconName} size={11} color={colors.primary} />
        </View>
        <Text style={[styles.inputLabelText, {color: colors.textSecondary}]}>
          {label}
        </Text>
      </View>
      <TextInput
        style={[
          styles.modernInput,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
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
        {backgroundColor: colors.surface, borderColor: colors.border},
        entryAnim,
      ]}>
      {renderCardHeader(
        'factory',
        t('production_details', 'Chi tiết sản xuất'),
        colors.success,
      )}
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
    </Animated.View>
  );

  const renderResultRow = (label, value, color, icon) => (
    <View style={[styles.resultItem, {borderBottomColor: colors.border}]}>
      <View style={styles.resultLabelRow}>
        <Icon name={icon} size={15} color={color} />
        <Text style={[styles.resultLabel, {color: colors.textSecondary}]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.resultValue, {color}]}>{value}</Text>
    </View>
  );

  const renderResultsCard = () =>
    isShowSendBtn && (
      <Animated.View
        style={[
          styles.card,
          {backgroundColor: colors.surface, borderColor: colors.border},
          entryAnim,
        ]}>
        {renderCardHeader(
          'chart-line',
          t('calculation_results', 'Kết quả tính toán'),
          colors.info,
        )}
        <View
          style={[
            styles.resultsContainer,
            {backgroundColor: colors.backgroundTertiary},
          ]}>
          {percent !== 0 &&
            percent !== '0' &&
            percent !== '0.0' &&
            renderResultRow(
              t('efficiency_percentage', 'Hiệu suất'),
              `${percent}%`,
              colors.success,
              'speedometer',
            )}
          {fisrtPercent !== 0 &&
            fisrtPercent !== '0' &&
            fisrtPercent !== '0.0' &&
            renderResultRow(
              t('low_speed', 'Tốc độ thấp'),
              `${fisrtPercent}%`,
              colors.warning,
              'arrow-down',
            )}
          {tempPercent !== 0 &&
            tempPercent !== '0' &&
            tempPercent !== '0.0' &&
            renderResultRow(
              t('high_speed', 'Tốc độ cao'),
              `${tempPercent}%`,
              colors.warning,
              'arrow-up',
            )}
          {errPercemt !== 0 &&
            errPercemt !== '0' &&
            errPercemt !== '0.0' &&
            renderResultRow(
              t('error_count', 'Lỗi'),
              `${errPercemt}%`,
              colors.danger,
              'alert-circle-outline',
            )}
          {quantity !== 0 &&
            quantity !== '0' &&
            renderResultRow(
              t('final_quantity', 'Tổng số lượng cuối'),
              `${quantity}`,
              colors.primary,
              'check-circle-outline',
            )}
        </View>
      </Animated.View>
    );

  const renderActionButtons = () => (
    <Animated.View style={[styles.actionButtonsContainer, entryAnim]}>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleCal}
        activeOpacity={0.8}>
        <LinearGradient
          colors={colors.primaryGradient}
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
        style={[styles.outlineButton, {borderColor: colors.primary}]}
        onPress={handleCancel}
        activeOpacity={0.7}>
        <Text style={[styles.outlineButtonText, {color: colors.primary}]}>
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
      <View
        style={[
          styles.modalOverlay,
          {backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)'},
        ]}>
        <View
          style={[styles.modalContainer, {backgroundColor: colors.surface}]}>
          <LinearGradient
            colors={colors.primaryGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t('confirm_report_submission', 'Xác nhận gửi báo cáo')}
            </Text>
            <TouchableOpacity
              onPress={() => setShowModalSendReport(false)}
              style={styles.modalCloseButton}>
              <Icon name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            scrollEnabled={!isModalErrorChoiceVisible}
            keyboardShouldPersistTaps="handled">
            <View
              style={[
                styles.modalSectionCard,
                {backgroundColor: colors.backgroundTertiary},
              ]}>
              <Text style={[styles.modalSectionTitle, {color: colors.text}]}>
                {t('select_work_shift', 'Chọn ca làm việc')}
              </Text>
              <View style={styles.shiftSelector}>
                {['A', 'B'].map(shiftKey => {
                  const isActive = shift === shiftKey;
                  return (
                    <TouchableOpacity
                      key={shiftKey}
                      style={[
                        styles.shiftButton,
                        {
                          backgroundColor: isActive
                            ? colors.primary
                            : colors.backgroundSecondary,
                          borderColor: isActive
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                      onPress={() => setShift(shiftKey)}>
                      <Text
                        style={[
                          styles.shiftButtonText,
                          {color: isActive ? '#fff' : colors.textSecondary},
                        ]}>
                        {t(shiftKey === 'A' ? 'shift_a' : 'shift_b')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View
              style={[
                styles.modalSectionCard,
                {backgroundColor: colors.backgroundTertiary},
              ]}>
              <Text style={[styles.modalSectionTitle, {color: colors.text}]}>
                {t('operator_history', 'Lịch sử vận hành')}
              </Text>
              <TextInput
                style={[
                  styles.modalTextInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={operator_history}
                onChangeText={setOperator_history}
                placeholder={t(
                  'enter_operator_history',
                  'Nhập lịch sử vận hành',
                )}
                placeholderTextColor={colors.placeholder}
                multiline
                numberOfLines={3}
              />
            </View>

            <View
              style={[
                styles.modalSectionCard,
                {backgroundColor: colors.backgroundTertiary},
              ]}>
              <Text style={[styles.modalSectionTitle, {color: colors.text}]}>
                {t('summary', 'Tóm tắt')}
              </Text>
              <View style={styles.summaryRow}>
                <Text
                  style={[styles.summaryLabel, {color: colors.textSecondary}]}>
                  {t('product', 'Sản phẩm')}
                </Text>
                <Text style={[styles.summaryValue, {color: colors.text}]}>
                  {productName}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text
                  style={[styles.summaryLabel, {color: colors.textSecondary}]}>
                  {t('quantity', 'Số lượng')}
                </Text>
                <Text style={[styles.summaryValue, {color: colors.text}]}>
                  {quantity}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text
                  style={[styles.summaryLabel, {color: colors.textSecondary}]}>
                  {t('date', 'Ngày')}
                </Text>
                <Text style={[styles.summaryValue, {color: colors.text}]}>
                  {moment(today).format('DD/MM/YYYY')}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.modalSectionCard,
                {backgroundColor: colors.backgroundTertiary},
              ]}>
              <View style={styles.errorSectionHeader}>
                <Text
                  style={[
                    styles.modalSectionTitle,
                    {color: colors.text, marginBottom: 0},
                  ]}>
                  {t('error_list_input', 'Danh sách lỗi')}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.addErrorButton,
                    {backgroundColor: colors.primary},
                  ]}
                  onPress={handleAddErrorRow}
                  activeOpacity={0.8}>
                  <Icon name="plus" size={15} color="#fff" />
                  <Text style={styles.addErrorButtonText}>
                    {t('add_error', 'Thêm lỗi')}
                  </Text>
                </TouchableOpacity>
              </View>

              {reportErrors.length === 0 && (
                <Text
                  style={[styles.noErrorText, {color: colors.textSecondary}]}>
                  {t('no_error_added', 'Chưa có lỗi nào được thêm')}
                </Text>
              )}

              {reportErrors.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.errorRowCard,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}>
                  <View style={styles.errorRowHeader}>
                    <Text style={[styles.errorRowTitle, {color: colors.text}]}>
                      {t('error_entry', 'Lỗi')} #{index + 1}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteErrorRow(item.id)}
                      style={styles.errorDeleteButton}>
                      <Icon
                        name="delete-outline"
                        size={20}
                        color={colors.danger}
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.errorCodeSelector,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.backgroundSecondary,
                      },
                    ]}
                    onPress={() => handleOpenErrorPicker(item.id)}
                    activeOpacity={0.8}>
                    <Text
                      style={[
                        styles.errorCodeSelectorText,
                        {color: item.code ? colors.text : colors.placeholder},
                      ]}>
                      {item.code
                        ? getErrorDisplayLabel(item.code)
                        : t('select_error_code', 'Chọn mã lỗi')}
                    </Text>
                    <View
                      style={[
                        styles.errorCodeChip,
                        {backgroundColor: colors.primary + '12'},
                      ]}>
                      <Text
                        style={[
                          styles.errorCodeChipText,
                          {color: colors.primary},
                        ]}>
                        {item.code || '--'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View
                    style={[
                      styles.errorInputWrap,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.backgroundSecondary,
                      },
                    ]}>
                    <Icon name="text" size={15} color={colors.textTertiary} />
                    <TextInput
                      style={[
                        styles.errorDescriptionInput,
                        {color: colors.text},
                      ]}
                      value={item.description}
                      onChangeText={text =>
                        handleChangeErrorField(item.id, 'description', text)
                      }
                      placeholder={t('error_description', 'Mô tả lỗi')}
                      placeholderTextColor={colors.placeholder}
                    />
                  </View>

                  <View
                    style={[
                      styles.errorInputWrap,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.backgroundSecondary,
                      },
                    ]}>
                    <Icon name="timer" size={15} color={colors.textTertiary} />
                    <TextInput
                      style={[
                        styles.errorDescriptionInput,
                        {color: colors.text},
                      ]}
                      value={item.shutdown_time?.toString()}
                      onChangeText={text =>
                        handleChangeErrorField(item.id, 'shutdown_time', text)
                      }
                      keyboardType="number-pad"
                      placeholder={t(
                        'error_shutdown_time',
                        'Thời gian dừng (phút)',
                      )}
                      placeholderTextColor={colors.placeholder}
                    />
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalSendButton}
              onPress={handleSendDailyReport}
              activeOpacity={0.8}>
              <LinearGradient
                colors={colors.primaryGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.buttonGradient}>
                <Text style={styles.buttonText}>
                  {t('send_report', 'Gửi báo cáo')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
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
          scrollEnabled={
            !isShowModalSendReport &&
            !isModalProductChoiceVisible &&
            !isModalErrorChoiceVisible
          }
          showsVerticalScrollIndicator={false}>
          <OptimizedLoader visible={loader} />

          {renderHeroCard()}
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

          <DailyModal
            products={errorOptionsForModal}
            visible={isModalErrorChoiceVisible}
            onClose={() => {
              setIsModalErrorChoiceVisible(false);
              setSelectedErrorRowId(null);
            }}
            onProductSelected={handleSelectErrorCode}
          />
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
  heroCard: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  heroGradient: {
    padding: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  heroDate: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'capitalize',
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  productSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
  },
  productSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productText: {
    fontSize: 16,
    flex: 1,
    fontWeight: '600',
    marginLeft: 10,
  },
  productValueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  productValueText: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
  cardHint: {
    fontSize: 12,
    marginTop: 10,
    marginLeft: 2,
    fontWeight: '500',
  },
  inputGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  inputColumn: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  inputLabelText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  modernInput: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.2,
    fontSize: 15,
    fontWeight: '600',
  },
  resultsContainer: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  resultLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  actionButtonsContainer: {
    marginTop: 4,
  },
  primaryButton: {
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  successButton: {
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
    marginLeft: 10,
  },
  outlineButton: {
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '700',
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
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  modalTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    flex: 1,
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  modalContent: {
    padding: 20,
    paddingBottom: 30,
  },
  modalScrollView: {
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  modalSectionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  shiftSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  shiftButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  shiftButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalTextInput: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.2,
    fontSize: 14,
    minHeight: 84,
    textAlignVertical: 'top',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(128,128,128,0.18)',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalSendButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  errorSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addErrorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addErrorButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  noErrorText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  errorRowCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  errorRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  errorRowTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  errorDeleteButton: {
    padding: 4,
  },
  errorCodeSelector: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorCodeSelectorText: {
    flex: 1,
    marginRight: 6,
    fontSize: 13,
  },
  errorCodeChip: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  errorCodeChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  errorInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  errorDescriptionInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 13,
  },
});

export default Daily;
