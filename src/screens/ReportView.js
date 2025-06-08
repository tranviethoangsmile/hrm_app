/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Button,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  StatusBar,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import i18next from '../../services/i18next';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  API,
  BASE_URL,
  PORT,
  V1,
  VERSION,
  USER_URL,
  GET_USER_WITH_DEPARTMENT_ID,
  PAID_LEAVE,
  CREATE,
  SEARCH,
  UPDATE,
} from '../utils/constans';
import axios from 'axios';
import {TEXT_COLOR, THEME_COLOR, THEME_COLOR_2} from '../utils/Colors';
import CheckBox from '@react-native-community/checkbox';
import Loader from '../components/Loader';
import {SwipeListView} from 'react-native-swipe-list-view';
import {useNavigation} from '@react-navigation/native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import Header from '../components/common/Header';

const ReportView = () => {
  const [err, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leaveRequested, setLeaveRequested] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModalFeedback, setShowModalFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [leaveId, setLeaveId] = useState('');
  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
  };
  const navigation = useNavigation();
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  //   check role
  const check_user = () => {
    const role = authData?.data?.data.role;
    if (role === 'STAFF') {
      showAlert(t('auth'));
      navigation.navigate('Main');
    }
  };
  const handleUnApproveLeaveRequest = async () => {
    try {
      setIsLoading(true);
      const field = {
        id: leaveId,
        feedback: feedback,
      };
      const update = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${PAID_LEAVE}${UPDATE}`,
        {
          ...field,
        },
      );
      if (update?.data.success) {
        setIsLoading(false);
        setShowModalFeedback(false);
        onRefresh();
        showAlert('success');
      } else {
        setShowModalFeedback(false);
        setIsLoading(false);
        onRefresh();
        showAlert('unSuccess');
      }
    } catch (error) {
      showAlert('contactAdmin');
    }
  };
  const showModalFeedbackUnApprove = async => {
    try {
      setShowModalFeedback(true);
    } catch (error) {
      showAlert('contactAdmin');
    }
  };
  const renderHiddenItem = ({item}) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => {
          setLeaveId(item.id);
          showModalFeedbackUnApprove();
        }}>
        <Text style={styles.btnTitle}>{t('un_approve')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            t('plzcof'),
            t('confirm_approve'),
            [
              {
                text: t('is_approve'),
                onPress: () => {
                  handleApproveLeaveRequest(item.id);
                },
              },
            ],
            {cancelable: true},
          );
        }}
        style={styles.deleteBtn}>
        <Text style={styles.btnTitle}>{t('is_approve')}</Text>
      </TouchableOpacity>
    </View>
  );
  const handleApproveLeaveRequest = async id => {
    try {
      const field = {
        id: id,
      };
      const update = await axios.put(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${PAID_LEAVE}`,
        {
          ...field,
        },
      );
      if (update?.data?.success) {
        showAlert('success');
        onRefresh();
      } else {
        showAlert('unSuccess');
        onRefresh();
      }
    } catch (error) {
      showAlert('contactAdmin');
    }
  };
  const renderItem = ({item, index}) => (
    <View
      key={index}
      style={[
        styles.rowFront,
        {
          backgroundColor: item.is_approve ? 'yellow' : 'white',
        },
      ]}>
      <Text style={[styles.text]}>{item.staff.name}</Text>
      <Text style={[styles.text]}>{item.date_leave}</Text>
      <Text style={[styles.text]}>
        {item.is_paid ? t('off.p') : t('unPaid')}
      </Text>
      <Text style={[styles.text]}>{item.reason}</Text>

      {item.feedback ? (
        <Text style={[styles.text, {color: 'red'}]}>{item.feedback}</Text>
      ) : (
        ''
      )}
    </View>
  );
  const onRefresh = () => {
    setRefreshing(true);
    getValueRequestLeave();
    setRefreshing(false);
  };
  const getValueRequestLeave = async () => {
    try {
      const field = {
        leader_id: authData?.data?.data?.id,
      };
      const leaves = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${PAID_LEAVE}${SEARCH}`,
        {
          ...field,
        },
      );

      if (leaves?.data.success) {
        setError('');
        setIsLoading(false);
        const sortedPosts = leaves.data.data.sort(
          (a, b) => new Date(b.date_leave) - new Date(a.date_leave),
        );
        setLeaveRequested(sortedPosts);
      }
    } catch (error) {
      setIsLoading(false);
      setError(t('contactAdmin'));
    }
  };
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  useEffect(() => {
    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }
    };
    checkLanguage();
    getValueRequestLeave();
    check_user();
  }, []);
  const onClose = () => {
    setShowModalFeedback(false);
  };
  const handleCancelFeedback = () => {
    onClose();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header
        title={t('reportview.title', 'Duyệt đơn nghỉ')}
        onBack={() => navigation.goBack()}
      />
      <Loader visible={isLoading} />
      {err ? <Text style={styles.title}>{err}</Text> : ''}
      <SwipeListView
        data={leaveRequested}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        leftOpenValue={75}
        rightOpenValue={-75}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <Modal
        transparent={true}
        animationType="slide"
        visible={showModalFeedback}>
        <View style={styles.modalFeedbackContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalFeedbackHeader}>
              <Text style={[styles.text, {color: 'red', paddingLeft: 10}]}>
                {t('feedback')}
              </Text>
              <TouchableOpacity onPress={handleCancelFeedback}>
                <Icon name="remove" size={40} color={'red'} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalFeedbackBody}>
              <Text style={[styles.text, {textDecorationLine: 'underline'}]}>
                {t('feedback')}:
              </Text>
              <TextInput
                placeholder={t('tymess')}
                multiline={true}
                onChangeText={text => setFeedback(text)}
                style={[
                  {color: TEXT_COLOR},
                  {
                    borderWidth: 1,
                    borderRadius: 20,
                    height: '40%',
                    paddingHorizontal: 10,
                    marginTop: 5,
                  },
                ]}
                placeholderTextColor={TEXT_COLOR}
              />
            </View>
            <View style={styles.modalFeedbackFooter}>
              <TouchableOpacity
                onPress={() => {
                  setFeedback('');
                  setShowModalFeedback(false);
                }}
                style={styles.cancelBtn}>
                <Text style={[styles.text, {color: '#fff'}]}>{t('c')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUnApproveLeaveRequest}
                style={[styles.sendBtn]}>
                <Text style={[styles.text, {color: '#fff'}]}>{t('Send')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  sendBtn: {
    backgroundColor: 'blue',
    borderWidth: 1,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  cancelBtn: {
    backgroundColor: 'red',
    borderWidth: 1,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  modalFeedbackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: '10%',
  },
  modalFeedbackBody: {
    paddingTop: 20,
    paddingHorizontal: 10,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    flex: 1,
  },
  modalFeedbackHeader: {
    flexDirection: 'row',
    width: '100%',
    height: '10%',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  modalContent: {
    flex: 1,
    flexDirection: 'column',
    width: Dimensions.get('screen').width * 0.95,
    maxHeight: Dimensions.get('screen').height * 0.5,
    backgroundColor: '#fff',
  },
  modalFeedbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  rowFront: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: Dimensions.get('screen').width * 0.95,
    height: Dimensions.get('screen').height * 0.05,
  },
  btnTitle: {
    fontSize: 17,
    color: 'white',
    fontWeight: '600',
  },
  deleteBtn: {
    width: '20%',
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    width: '20%',
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowBack: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: TEXT_COLOR,
  },
  titleListLeaveRequest: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxHeight: Dimensions.get('screen').height * 0.05,
    width: Dimensions.get('screen').width * 0.95,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  text: {
    fontSize: 20,
    color: TEXT_COLOR,
    fontWeight: '600',
  },
});

export default ReportView;
