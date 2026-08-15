import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import {useSelector} from 'react-redux';
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
import apiClient from '../services/apiClient';
import OptimizedLoader from '../components/OptimizedLoader';
import {FONTS} from '../config/theme';
import {useTheme} from '../hooks/useTheme';

const Notifications = ({navigation}) => {
  const {t} = useTranslation();
  const {colors} = useTheme();
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
      const response = await apiClient.post(
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
        return colors.success;
      case 'SYSTEM':
        return colors.danger;
      case 'INFO':
        return colors.info;
      case 'WARNING':
        return colors.warning;
      case 'ERROR':
        return colors.error;
      default:
        return colors.primary;
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
      const response = await apiClient.put(
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

  const unreadCount = notifications.filter(item => !item.is_readed).length;

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

  const systemCount = notifications.filter(
    item => item.type?.toUpperCase() === 'SYSTEM',
  ).length;

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const unreadNotifications = notifications.filter(n => !n.is_readed);

      const responses = await Promise.all(
        unreadNotifications.map(notification =>
          apiClient.put(
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
      colors={colors.primaryGradient}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.headerGradient}>
      <View style={styles.headerOverlay} />
      <View style={styles.telegramHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerIconContainer}>
            <Icon name="arrow-back" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {t('notifications_title', 'Thông báo')}
          </Text>
          <Text style={styles.headerSubtitle}>
            {t('notification_unread', {count: unreadCount})}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[
              styles.headerIconContainer,
              unreadCount === 0 && styles.headerIconDisabled,
            ]}
            onPress={markAllAsRead}
            disabled={unreadCount === 0}>
            <Icon
              name="checkmark-done"
              size={22}
              color={unreadCount === 0 ? 'rgba(255,255,255,0.45)' : '#ffffff'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTabContainer = () => (
    <View
      style={[
        styles.tabContainer,
        {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        },
      ]}>
      {[
        {key: 'all', title: t('notification_all'), icon: 'notifications'},
        {key: 'system', title: t('notification_system'), icon: 'settings'},
      ].map(tab => {
        const isActive = activeTab === tab.key;
        const count = tab.key === 'all' ? notifications.length : systemCount;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.85}
            style={[styles.tab, isActive && {backgroundColor: colors.primary}]}
            onPress={() => setActiveTab(tab.key)}>
            <Icon
              name={tab.icon}
              size={15}
              color={isActive ? '#fff' : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                {color: isActive ? '#fff' : colors.textSecondary},
              ]}>
              {tab.title}
            </Text>
            <View
              style={[
                styles.tabBadge,
                isActive
                  ? {backgroundColor: 'rgba(255,255,255,0.22)'}
                  : {backgroundColor: colors.surface},
              ]}>
              <Text
                style={[
                  styles.tabBadgeText,
                  {color: isActive ? '#fff' : colors.textSecondary},
                ]}>
                {count}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderNotifications = ({item}) => {
    const isUnread = !item.is_readed;
    const notificationColor = getNotificationColor(item.type);
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        style={[styles.card, isUnread && styles.unreadCard]}
        onPress={() => handle_notification_click(item)}
        activeOpacity={0.7}>
        {isUnread && (
          <LinearGradient
            colors={colors.primaryGradient}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.cardAccent}
          />
        )}
        <View style={styles.cardRow}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: isUnread
                  ? notificationColor + '1A'
                  : colors.surfaceSecondary,
              },
            ]}>
            <Icon
              name={getNotificationIcon(item.type)}
              size={22}
              color={isUnread ? notificationColor : colors.textTertiary}
            />
            {isUnread && (
              <View
                style={[
                  styles.unreadDot,
                  {
                    backgroundColor: notificationColor,
                    borderColor: colors.surface,
                  },
                ]}
              />
            )}
          </View>
          <View style={styles.cardBody}>
            <View style={styles.titleRow}>
              <Text
                style={styles.title}
                numberOfLines={isExpanded ? undefined : 2}>
                {item.title}
              </Text>
              <View
                style={[
                  styles.typeChip,
                  {backgroundColor: notificationColor + '1A'},
                ]}>
                <Text style={[styles.typeText, {color: notificationColor}]}>
                  {item.type?.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text
              style={styles.message}
              numberOfLines={isExpanded ? undefined : 3}>
              {item.message}
            </Text>
            <View style={styles.footerRow}>
              <View style={styles.timeRow}>
                <Icon
                  name="time-outline"
                  size={13}
                  color={colors.textTertiary}
                />
                <Text style={styles.time}>
                  {moment(item.created_at).format('DD/MM/YYYY HH:mm')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={e => {
                  e.stopPropagation();
                  handleExpand(item.id);
                }}
                style={styles.expandBtn}>
                <Text style={styles.expandBtnText}>
                  {isExpanded
                    ? t('notification_collapse', 'Thu gọn')
                    : t('notification_expand', 'Xem thêm')}
                </Text>
                <Icon
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <LinearGradient
          colors={colors.primaryGradient}
          style={styles.emptyIconGradient}>
          <IconMCI name="bell-off" size={60} color="#ffffff" />
        </LinearGradient>
      </View>
      <Text style={styles.emptyTitle}>
        {t('notification_empty_title', 'Không có thông báo')}
      </Text>
      <Text style={styles.emptyDescription}>
        {t(
          'notification_empty_description',
          'Thông báo của bạn sẽ xuất hiện ở đây khi có cập nhật mới',
        )}
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Icon name="refresh" size={18} color="#ffffff" />
        <Text style={styles.refreshButtonText}>
          {t('notification_refresh', 'Làm mới')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        headerGradient: {
          paddingTop: Platform.OS === 'ios' ? 50 : 20,
          shadowColor: colors.primary,
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
          fontSize: 24,
          fontWeight: '700',
          color: '#ffffff',
          textShadowColor: 'rgba(0,0,0,0.3)',
          textShadowOffset: {width: 0, height: 1},
          textShadowRadius: 3,
        },
        headerSubtitle: {
          fontSize: 14,
          fontWeight: '500',
          color: 'rgba(255,255,255,0.8)',
          marginTop: 2,
        },
        headerRight: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          minWidth: 50,
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
        headerIconDisabled: {
          backgroundColor: 'rgba(255,255,255,0.08)',
        },
        content: {
          flex: 1,
          backgroundColor: colors.background,
        },
        notificationsList: {
          paddingTop: 4,
          paddingBottom: 32,
        },
        tabContainer: {
          flexDirection: 'row',
          marginHorizontal: 16,
          marginVertical: 12,
          borderRadius: 16,
          borderWidth: 1,
          padding: 5,
        },
        tab: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 12,
          paddingVertical: 10,
        },
        tabText: {
          fontSize: 13,
          fontWeight: '700',
          marginLeft: 6,
        },
        tabBadge: {
          borderRadius: 10,
          paddingHorizontal: 7,
          paddingVertical: 2,
          marginLeft: 6,
          minWidth: 18,
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBadgeText: {
          fontSize: 11,
          fontWeight: '700',
        },
        card: {
          backgroundColor: colors.surface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          marginHorizontal: 16,
          marginBottom: 14,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 3},
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
          overflow: 'hidden',
        },
        unreadCard: {
          backgroundColor: colors.primaryLight,
          borderColor: colors.primary + '30',
        },
        cardAccent: {
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
        },
        cardRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
        },
        iconWrap: {
          width: 46,
          height: 46,
          borderRadius: 15,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        },
        unreadDot: {
          position: 'absolute',
          width: 10,
          height: 10,
          borderRadius: 5,
          borderWidth: 2,
          right: -1,
          top: -1,
        },
        cardBody: {
          flex: 1,
        },
        titleRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
        },
        title: {
          ...FONTS.h4,
          color: colors.text,
          fontWeight: '700',
          flex: 1,
          marginRight: 8,
        },
        typeChip: {
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 8,
          marginTop: 1,
        },
        typeText: {
          fontSize: 10,
          fontWeight: '700',
        },
        message: {
          ...FONTS.body3,
          color: colors.textSecondary,
          lineHeight: 20,
          marginTop: 5,
        },
        footerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 10,
        },
        timeRow: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        time: {
          ...FONTS.body4,
          color: colors.textTertiary,
          marginLeft: 4,
        },
        expandBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 4,
          paddingHorizontal: 10,
          borderRadius: 8,
          backgroundColor: colors.surfaceSecondary,
        },
        expandBtnText: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.primary,
          marginRight: 4,
        },
        emptyContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 60,
          paddingHorizontal: 32,
        },
        emptyIconContainer: {
          marginBottom: 24,
        },
        emptyIconGradient: {
          width: 120,
          height: 120,
          borderRadius: 60,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: colors.primary,
          shadowOffset: {width: 0, height: 8},
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        },
        emptyTitle: {
          fontSize: 20,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 8,
          textAlign: 'center',
        },
        emptyDescription: {
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 24,
        },
        refreshButton: {
          paddingVertical: 14,
          paddingHorizontal: 24,
          borderRadius: 28,
          backgroundColor: colors.primary,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: colors.primary,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        },
        refreshButtonText: {
          fontSize: 14,
          fontWeight: '600',
          color: '#fff',
          marginLeft: 8,
        },
      }),
    [colors],
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
          <OptimizedLoader visible={true} />
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

export default Notifications;
