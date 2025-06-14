import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
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

const Notifications = ({navigation}) => {
  const {t} = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const authData = useSelector(state => state.auth);
  const userInfo = authData?.data?.data;

  const getNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${NOTIFICATION}${SEARCH_BY_ID}`,
        {
          user_id: userInfo?.id,
        },
      );
      if (response?.data?.success) {
        const sortedData = response.data.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
        setNotifications(sortedData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [userInfo?.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getNotifications().then(() => setRefreshing(false));
  }, [getNotifications]);

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  const getNotificationColor = type => {
    switch (type?.toUpperCase()) {
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

  const handle_notification_click = async notification => {
    try {
      const response = await axios.put(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${NOTIFICATION}${UPDATE}`,
        {
          id: notification.id,
        },
      );
      if (response.data.success) {
        setNotifications(prevNotifications =>
          prevNotifications.map(item =>
            item.id === notification.id ? {...item, is_readed: true} : item,
          ),
        );
      }
      getNotifications();
    } catch (error) {
      console.log(error.message);
    }
  };

  const renderNotifications = ({item}) => {
    const isUnread = !item.is_readed;
    const notificationColor = getNotificationColor(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationItem, isUnread && styles.unreadItem]}
        onPress={() => {
          handle_notification_click(item);
        }}>
        <LinearGradient
          colors={isUnread ? ['#fff', '#f0f9ff'] : ['#fff', '#fff']}
          style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={styles.iconContainer}>
              <View
                style={[styles.typeDot, {backgroundColor: notificationColor}]}
              />
              <Icon
                name={
                  item.type?.toUpperCase() === 'SUCCESS'
                    ? 'checkmark-circle'
                    : 'information-circle'
                }
                size={24}
                color={notificationColor}
              />
            </View>
            <View style={styles.textContainer}>
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                <View
                  style={[
                    styles.statusDot,
                    {backgroundColor: notificationColor},
                  ]}
                />
              </View>
              <Text style={styles.message} numberOfLines={3}>
                {item.message}
              </Text>
              <Text style={styles.time}>
                {moment(item.created_at).format('DD/MM/YYYY HH:mm')}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('noti')}</Text>
        <View style={styles.rightPlaceholder} />
      </View>
      <View style={styles.content}>
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
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Icon
                  name="notifications-off-outline"
                  size={64}
                  color="#94a3b8"
                />
                <Text style={styles.emptyText}>{t('no.notifications')}</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  rightPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  notificationsList: {
    paddingVertical: 8,
  },
  notificationItem: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  unreadItem: {
    shadowOpacity: 0.1,
    elevation: 3,
  },
  notificationContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  notificationHeader: {
    flexDirection: 'row',
    padding: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: '#94a3b8',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  typeDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    right: -2,
    top: -2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});

export default Notifications;
