import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  Alert,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import axios from 'axios';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  NOTIFICATION,
  SEARCH_BY_ID,
  UPDATE,
} from '../utils/constans';
import Loader from '../components/Loader';
import {TEXT_COLOR} from '../utils/Colors';

const Notifications = () => {
  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
  };

  // const navigation = useNavigation();
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const USER_INFOR = authData?.data?.data;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handle_get_notification = async () => {
    try {
      setLoading(true);
      const user_id = USER_INFOR?.id;
      const notifications = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${NOTIFICATION}${SEARCH_BY_ID}`,
        {
          user_id,
        },
      );
      if (!notifications?.data?.success) {
        throw new Error(`not.data`);
      }
      const sortNotifications = notifications?.data.data.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setNotifications(sortNotifications);
      setLoading(false);
    } catch (error) {
      showAlert(error?.message || 'networkError');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setLoading(true);
      await handle_get_notification();
    } catch (error) {
      showAlert(error?.message || 'networkError');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handle_click_notification = async id => {
    try {
      const result = await axios.put(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${NOTIFICATION}${UPDATE}`,
        {
          id,
        },
      );
      if (!result?.data.success) {
        throw new Error('contactAdmin');
      }
      onRefresh();
    } catch (error) {
      showAlert(error?.message || 'networkError');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    handle_get_notification();
  }, []);

  const getNotificationColor = type => {
    switch (type) {
      case 'SUCCESS':
        return '#4CAF50';
      case 'SYSTEM':
        return '#F44336';
      case 'INFO':
        return '#2196F3';
      case 'WARNING':
        return '#FF9800';
      case 'ERROR':
        return '#F44390';
      default:
        return '#757575';
    }
  };

  const renderNotifications = ({item}) => {
    return (
      <View style={styles.notificationItem}>
        <TouchableOpacity
          onPress={() => {
            handle_click_notification(item.id);
          }}>
          <View
            style={[
              styles.notificationIndicator,
              {backgroundColor: getNotificationColor(item.type)},
            ]}
          />
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationDate}>
              {moment(item.created_at).format('MMMM Do, YYYY')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.container}>
        {loading ? (
          <Loader />
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotifications}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.notificationsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  notificationsList: {
    padding: 5,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 5,
    marginBottom: 2,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  },
  notificationIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR,
  },
  notificationMessage: {
    fontSize: 14,
    color: TEXT_COLOR,
    marginVertical: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default Notifications;
