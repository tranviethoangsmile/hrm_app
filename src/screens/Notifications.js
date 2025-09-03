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
  Platform,
  Dimensions,
} from 'react-native';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';
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
import {COLORS, SIZES, FONTS, SHADOWS} from '../config/theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const Notifications = ({navigation}) => {
  const {t} = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'system'
  const [expandedId, setExpandedId] = useState(null);
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

  const onRefresh = () => {
    setRefreshing(true);
    getNotifications().then(() => setRefreshing(false));
  };

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
        return '#667eea';
    }
  };

  const getNotificationIcon = type => {
    switch (type?.toUpperCase()) {
      case 'SUCCESS':
        return 'checkmark-circle';
      case 'SYSTEM':
        return 'settings';
      case 'INFO':
        return 'information-circle';
      case 'WARNING':
        return 'warning';
      case 'ERROR':
        return 'close-circle';
      default:
        return 'notifications';
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
          prevNotifications.filter(item => item.id !== notification.id),
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const filteredNotifications = useCallback(() => {
    switch (activeTab) {
      case 'system':
        return notifications.filter(
          item => item.type?.toUpperCase() === 'SYSTEM',
        );
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const unreadNotifications = notifications.filter(n => !n.is_readed);

      const responses = await Promise.all(
        unreadNotifications.map(notification =>
          axios.put(
            `${BASE_URL}${PORT}${API}${VERSION}${V1}${NOTIFICATION}${UPDATE}`,
            {
              id: notification.id,
            },
          ),
        ),
      );

      const allSuccess = responses.every(response => response.data.success);
      if (allSuccess) {
        setNotifications(prevNotifications =>
          prevNotifications.filter(
            notification =>
              !unreadNotifications.some(
                unread => unread.id === notification.id,
              ),
          ),
        );
      }
    } catch (error) {
      console.error(t('notification_error_mark_read'), error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = id => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderModernHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.headerGradient}>
      <View style={styles.headerOverlay} />
      <View style={styles.telegramHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerIconContainer}>
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {t('notifications_title', 'Thông báo')}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconContainer}
            onPress={markAllAsRead}>
            <Icon name="checkmark-done" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTabContainer = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'all' && styles.activeTab]}
        onPress={() => setActiveTab('all')}>
        <Icon
          name="notifications"
          size={18}
          color={activeTab === 'all' ? '#667eea' : '#94a3b8'}
        />
        <Text
          style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
          {t('notification_all', 'Tất cả')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'system' && styles.activeTab]}
        onPress={() => setActiveTab('system')}>
        <Icon
          name="settings"
          size={18}
          color={activeTab === 'system' ? '#667eea' : '#94a3b8'}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'system' && styles.activeTabText,
          ]}>
          {t('notification_system', 'Hệ thống')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderNotifications = ({item}) => {
    const isUnread = !item.is_readed;
    const notificationColor = getNotificationColor(item.type);
    const isExpanded = expandedId === item.id;
    const isSystemNotification = item.type?.toUpperCase() === 'SYSTEM';

    return (
      <TouchableOpacity
        style={[styles.notificationItem, isUnread && styles.unreadItem]}
        onPress={() => handle_notification_click(item)}>
        <View style={styles.notificationCard}>
          <View style={styles.notificationHeader}>
            <View
              style={[
                styles.iconContainer,
                {backgroundColor: notificationColor + '15'},
              ]}>
              <Icon
                name={getNotificationIcon(item.type)}
                size={20}
                color={notificationColor}
              />
              {isUnread && (
                <View
                  style={[
                    styles.unreadDot,
                    {backgroundColor: notificationColor},
                  ]}
                />
              )}
            </View>
            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text
                  style={[styles.title, isExpanded && styles.expandedTitle]}
                  numberOfLines={isExpanded ? undefined : 2}>
                  {item.title}
                </Text>
                <View style={styles.typeChip}>
                  <Text style={[styles.typeText, {color: notificationColor}]}>
                    {item.type?.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text
                style={[styles.message, isExpanded && styles.expandedMessage]}
                numberOfLines={isExpanded ? undefined : 3}>
                {item.message}
              </Text>
              <View style={styles.footerContainer}>
                <Text style={styles.time}>
                  {moment(item.created_at).format('DD/MM/YYYY HH:mm')}
                </Text>
                {isSystemNotification && (
                  <TouchableOpacity
                    onPress={e => {
                      e.stopPropagation();
                      handleExpand(item.id);
                    }}
                    style={styles.expandButton}>
                    <Text style={styles.expandButtonText}>
                      {isExpanded
                        ? t('notification_collapse', 'Thu gọn')
                        : t('notification_expand', 'Xem thêm')}
                    </Text>
                    <Icon
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color="#667eea"
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <IconMCI name="bell-off" size={80} color="#e2e8f0" />
      </View>
      <Text style={styles.emptyTitle}>
        {t('notification_empty_title', 'Không có thông báo')}
      </Text>
      <Text style={styles.emptyDescription}>
        {t(
          'notification_empty_description',
          'Thông báo của bạn sẽ xuất hiện ở đây',
        )}
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Icon name="refresh" size={18} color="#667eea" />
        <Text style={styles.refreshButtonText}>
          {t('notification_refresh', 'Làm mới')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      {renderModernHeader()}
      {renderTabContainer()}

      <View style={styles.content}>
        {loading && notifications.length === 0 ? (
          <Loader />
        ) : (
          <FlatList
            data={filteredNotifications()}
            renderItem={renderNotifications}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.notificationsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  telegramHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    height: 64,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 50,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 50,
    justifyContent: 'flex-end',
  },
  headerIconContainer: {
    padding: 10,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
    ...SHADOWS.light,
  },
  unreadItem: {
    ...SHADOWS.dark,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...SHADOWS.light,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 24,
    marginHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeTab: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  tabText: {
    ...FONTS.body4,
    color: '#64748b',
    fontWeight: '600',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#fff',
  },
  title: {
    ...FONTS.h4,
    color: '#1e293b',
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    ...FONTS.body3,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 6,
  },
  time: {
    ...FONTS.body4,
    color: '#94a3b8',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  expandedTitle: {
    marginBottom: 8,
  },
  expandedMessage: {
    marginBottom: 8,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  unreadDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    right: -2,
    top: -2,
  },
  notificationCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    ...SHADOWS.light,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#667eea',
    marginRight: 4,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  refreshButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});

export default Notifications;
