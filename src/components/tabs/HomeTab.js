/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
  ScrollView,
  Animated,
  Platform,
  SafeAreaView,
  Easing,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Control from '../Control';
import Notifications from '../Notifications';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from '../../../services/i18next';
import Video from 'react-native-video';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../hooks/useTheme';
import apiClient from '../../services/apiClient';
import PopupEvent from '../PopupEvent';
import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  INFORMATION,
  GET_ALL_BY_FIELD,
  EVENTS,
  NOTIFICATION,
  GET_EVENTS_WITH_POSITION,
  UPDATE,
  GET_EVENT_WITH_POSITION,
} from '../../utils/constans';
import OptimizedLoader from '../OptimizedLoader';
import {useUserProfile} from '../../hooks/useUserProfile';
import HappyModal from '../HappyModal';
import moment from 'moment';
import LinkPreview from 'react-native-link-preview';
import ModalMessage from '../ModalMessage';
import MediaViewer from '../common/MediaViewer';
import BirthdayToast from '../BirthdayToast';
import NewYearModal from '../NewYearModal';
import NewYearToast from '../NewYearToast';
const {width} = Dimensions.get('window');

const HomeTab = ({onScrollList}) => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors} = useTheme();
  const [visibleControl, setVisibleControl] = useState(false);
  const [isVisiblePopup, setIsVisiblePopup] = useState(false);
  const [isVisibleHappy, setIsVisibleHappy] = useState(false);
  const [isVisibleNewYear, setIsVisibleNewYear] = useState(false);
  const [showBirthdayToast, setShowBirthdayToast] = useState(false);
  const [showNewYearToast, setShowNewYearToast] = useState(false);
  const authData = useSelector(state => state.auth);
  const [userInfo, setUserInfo] = useState(authData?.data?.data);
  const [err, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [is_notification, setIsNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [event, setEvent] = useState({});
  const today = moment().format('MM-DD');
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [messageModal, setMessageModal] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1000);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const {userInfo: profileUser} = useUserProfile();

  const getUserFullName = () =>
    userInfo?.full_name ||
    userInfo?.name ||
    profileUser?.full_name ||
    profileUser?.name ||
    authData?.data?.data?.full_name ||
    authData?.data?.data?.name ||
    userInfo?.user_name ||
    profileUser?.user_name ||
    t('home.user', 'User');

  const getGreeting = () => {
    const hour = moment().hour();
    if (hour < 12) {
      return t('home.greeting_morning', 'Good morning');
    }
    if (hour < 18) {
      return t('home.greeting_afternoon', 'Good afternoon');
    }
    return t('home.greeting_evening', 'Good evening');
  };

  // Animation values - removed to prevent flickering
  // const fadeAnim = useRef(new Animated.Value(0)).current;
  // const slideAnim = useRef(new Animated.Value(50)).current;
  // const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const onClose = () => {
    setVisibleControl(false);
    setIsNotification(false);
    setIsVisiblePopup(false);
    setIsVisibleHappy(false);
    setIsVisibleNewYear(false);
  };
  const showMessage = (msg, type, dur) => {
    setMessageModalVisible(true);
    setMessageModal(msg);
    setMessageType(type);
    setDuration(dur);
  };
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };

  const handleGoToEventScreen = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const url = `${BASE_URL}${PORT}${API}${VERSION}${V1}${EVENTS}${GET_EVENT_WITH_POSITION}`;
      const events = await apiClient.post(url, {
        position: userInfo.position,
      });
      if (events?.data?.success) {
        setIsLoading(false);
        navigation.navigate('Event');
      } else {
        setIsLoading(false);
        showMessage('not.event', 'warning', 500);
      }
    } catch (error) {
      showMessage(error?.message || 'networkError', 'error', 500);
    } finally {
      setIsLoading(false);
    }
  }, [userInfo.position, navigation]);

  const get_event_detail = async () => {
    try {
      if (!userInfo?.position) {
        return;
      } // Early return if no position

      const url = `${BASE_URL}${PORT}${API}${VERSION}${V1}${EVENTS}${GET_EVENTS_WITH_POSITION}`;

      const events = await apiClient.post(
        url,
        {
          position: userInfo.position,
        },
      );

      if (events?.data?.success && events?.data?.data?.length > 0) {
        setEvent(events?.data.data[0]);
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          setTimeout(() => {
            setIsVisiblePopup(true);
          }, 3000);
        });
      }
    } catch (error) {
      console.error('Error getting event detail:', error);
      showMessage('not.event', 'warning', 500);
    }
  };

  const get_all_information = async () => {
    try {
      // Don't set loading here as it's handled in the main useEffect
      const userInforString = await AsyncStorage.getItem('userInfor');
      if (!userInforString) {
        setError('User information not found');
        return;
      }

      const userInfor = JSON.parse(userInforString);
      if (!userInfor?.position) {
        setError('User position not found');
        return;
      }

      const field = {
        position: userInfor.position,
        is_public: true,
      };

      const url = `${BASE_URL}${PORT}${API}${VERSION}${V1}${INFORMATION}${GET_ALL_BY_FIELD}`;
      const informations = await apiClient.post(url, {});

      if (informations?.data?.success) {
        setError('');
        // Use requestAnimationFrame for better performance when sorting
        requestAnimationFrame(() => {
          const sortedPosts = informations.data.data.sort(
            (a, b) => new Date(b.date) - new Date(a.date),
          );
          setPosts(sortedPosts);
        });
      } else {
        setError('Not have information here');
      }
    } catch (error) {
      console.error('Error getting all information:', error);
      setError(error.message || 'Failed to load information');
    }
  };

  const handle_notification_click = async notification => {
    try {
      const field = {
        id: notification.id,
        user_id: userInfo?.id,
        is_read: true,
      };
      const updateNotification = await apiClient.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${NOTIFICATION}${UPDATE}`,
        {field},
      );
      if (updateNotification?.data?.success) {
        // Notification updated successfully
      }
    } catch (error) {
      showMessage(error?.message || 'networkError', 'error', 500);
    }
  };

  // Hàm nhận diện link trong text
  function extractFirstUrl(text) {
    const urlRegex =
      /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)|(www\.[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/gi;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  }

  const PostItem = React.memo(({item, t, handleGoToEventScreen, index}) => {
    const [linkPreview, setLinkPreview] = React.useState(null);
    const [isLiked, setIsLiked] = React.useState(false);
    const isAdmin = item.user.role === 'ADMIN';

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current; // Start with 1 to avoid animation
    const slideAnim = useRef(new Animated.Value(0)).current; // Start with 0 to avoid animation

    // Remove entrance animation to prevent flickering
    // React.useEffect(() => {
    //   Animated.parallel([
    //     Animated.timing(fadeAnim, {
    //       toValue: 1,
    //       duration: 600,
    //       delay: index * 100,
    //       easing: Easing.out(Easing.cubic),
    //       useNativeDriver: true,
    //     }),
    //     Animated.timing(slideAnim, {
    //       toValue: 0,
    //       duration: 600,
    //       delay: index * 100,
    //       easing: Easing.out(Easing.cubic),
    //       useNativeDriver: true,
    //     }),
    //   ]).start();
    // }, [index]);

    React.useEffect(() => {
      const url = extractFirstUrl(item.content);
      if (url) {
        LinkPreview.getPreview(url)
          .then(data => {
            setLinkPreview({
              title: data.title || url,
              description: data.description || '',
              image:
                data.images && data.images.length > 0 ? data.images[0] : null,
              url: data.url || url,
            });
          })
          .catch(e => {
            setLinkPreview(null);
          });
      } else {
        setLinkPreview(null);
      }
    }, [item.content]);

    const viewCount = Math.floor(Math.random() * 5000) + 100;
    const formattedViewCount =
      viewCount > 1000
        ? `${(viewCount / 1000).toFixed(1)}K`
        : viewCount.toString();

    const handleLike = () => {
      setIsLiked(!isLiked);
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const handleComment = () => console.log('Comment on post:', item.id);
    const handleShare = () => console.log('Share post:', item.id);

    return (
      <View style={styles.postItemContainer}>
        <LinearGradient
          colors={
            isAdmin
              ? [colors.surface, colors.surfaceSecondary, colors.surface]
              : [colors.surface, colors.surfaceSecondary, colors.surface]
          }
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[
            styles.postContent,
            isAdmin && styles.adminPostContent,
            {backgroundColor: colors.surface},
          ]}>
          {/* Glass overlay for modern effect */}
          <View
            style={[
              styles.glassOverlay,
              {backgroundColor: colors.primary + '05'},
            ]}
          />

          {/* Admin indicator overlay - only on header area */}
          {isAdmin && (
            <View style={styles.adminIndicatorOverlay}>
              <LinearGradient
                colors={['rgba(10, 132, 255, 0.1)', 'rgba(10, 132, 255, 0.05)']}
                style={styles.adminIndicatorGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              />
            </View>
          )}

          <View style={styles.postHeader}>
            <View style={styles.avatarContainer}>
              <Image style={styles.avatar} source={{uri: item.user.avatar}} />
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.nameAndDayContainer}>
              <View style={styles.nameRow}>
                <Text style={[styles.nameText, {color: colors.text}]}>
                  {item.user.name}
                </Text>
                {isAdmin && (
                  <LinearGradient
                    colors={[colors.primary, colors.primary2]}
                    style={[
                      styles.adminBadge,
                      {backgroundColor: colors.primary},
                    ]}>
                    <IconFA name="crown" size={12} color="#fff" />
                    <Text style={styles.adminBadgeText}>Admin</Text>
                  </LinearGradient>
                )}
              </View>
              <Text style={[styles.dateText, {color: colors.textSecondary}]}>
                {moment(item.date).format('DD/MM/YYYY')}
              </Text>
            </View>
          </View>

          {item.title && (
            <Text
              style={[
                styles.postTitleText,
                {color: colors.text},
                isAdmin && styles.adminTitleText,
              ]}>
              {item.title}
            </Text>
          )}

          <Text
            style={[styles.postContentText, {color: colors.textSecondary}]}
            numberOfLines={3}
            ellipsizeMode="tail">
            {item.content}
          </Text>

          {linkPreview && (
            <TouchableOpacity
              style={styles.linkPreviewBox}
              onPress={() => {
                if (linkPreview.url) {
                  try {
                    require('react-native').Linking.openURL(linkPreview.url);
                  } catch (e) {}
                }
              }}>
              <LinearGradient
                colors={[colors.primary, colors.primary2]}
                style={styles.linkPreviewGradient}>
                {linkPreview.image && (
                  <Image
                    source={{uri: linkPreview.image}}
                    style={styles.linkPreviewImg}
                  />
                )}
                <View style={styles.linkPreviewContent}>
                  <Text style={styles.linkPreviewTitle} numberOfLines={2}>
                    {linkPreview.title}
                  </Text>
                  {linkPreview.description ? (
                    <Text style={styles.linkPreviewDesc} numberOfLines={2}>
                      {linkPreview.description}
                    </Text>
                  ) : null}
                  <Text style={styles.linkPreviewUrl} numberOfLines={1}>
                    {linkPreview.url}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {item.content.length > 100 && (
            <TouchableOpacity
              onPress={() =>
                Alert.alert(item.title || t('Detail'), item.content)
              }>
              <LinearGradient
                colors={[colors.primary, colors.primary2]}
                style={styles.moreButton}>
                <Text style={styles.moreText}>{t('more')}</Text>
                <IconFA name="chevron-right" size={14} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {item.media &&
            (item.is_video ? (
              <TouchableOpacity
                style={styles.mediaContainer}
                onPress={() => {
                  setSelectedMedia({
                    url: item.media,
                    type: 'video',
                    postInfo: {
                      user: item.user,
                      content: item.content,
                      date: item.date,
                      is_event: item.is_event,
                    },
                  });
                }}>
                <Video
                  source={{uri: item.media}}
                  style={styles.mediaPlayer}
                  controls={true}
                  paused={true}
                  resizeMode="cover"
                  poster={require('../../assets/images/thumbnail.jpg')}
                  posterResizeMode="cover"
                />
                <View style={styles.playIcon}>
                  <IconFA
                    name="play-circle"
                    size={60}
                    color="rgba(255,255,255,0.9)"
                  />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.mediaContainer}
                onPress={() => {
                  setSelectedMedia({
                    url: item.media,
                    type: 'image',
                    postInfo: {
                      user: item.user,
                      content: item.content,
                      date: item.date,
                      is_event: item.is_event,
                    },
                  });
                }}>
                <Image source={{uri: item.media}} style={styles.mediaImage} />
              </TouchableOpacity>
            ))}

          <View
            style={[styles.postMetaContainer, {borderTopColor: colors.border}]}>
            <View style={styles.postActionsGroup}>
              <Animated.View style={{transform: [{scale: scaleAnim}]}}>
                <TouchableOpacity
                  onPress={handleLike}
                  style={[styles.actionButton, isLiked && styles.likedButton]}>
                  <IconFA
                    name={isLiked ? 'heart' : 'heart'}
                    size={18}
                    color={isLiked ? colors.danger : colors.gray400}
                    solid={isLiked}
                  />
                  <Text
                    style={[
                      styles.actionText,
                      isLiked && styles.likedText,
                      {color: colors.textSecondary},
                    ]}>
                    {isLiked ? 'Liked' : 'Like'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity
                onPress={handleComment}
                style={styles.actionButton}>
                <IconFA name="comment" size={18} color={colors.gray400} />
                <Text
                  style={[styles.actionText, {color: colors.textSecondary}]}>
                  Comment
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                style={styles.actionButton}>
                <IconFA name="share" size={18} color={colors.gray400} />
                <Text
                  style={[styles.actionText, {color: colors.textSecondary}]}>
                  Share
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.viewCountContainer}>
              <IconFA name="eye" size={14} color={colors.gray400} />
              <Text style={[styles.metaText, {color: colors.gray400}]}>
                {formattedViewCount} {t('views')}
              </Text>
            </View>
          </View>

          {item.is_event && (
            <TouchableOpacity
              style={styles.eventButton}
              onPress={handleGoToEventScreen}>
              <LinearGradient
                colors={[colors.primary, colors.primary2]}
                style={[
                  styles.eventButtonGradient,
                  {backgroundColor: colors.primary},
                ]}>
                <IconFA name="calendar-check" size={18} color="#fff" />
                <Text style={styles.eventButtonText}>{t('confirm.c')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>
    );
  });

  const handleControl = () => {
    setVisibleControl(!visibleControl);
  };

  const [heroExpanded, setHeroExpanded] = useState(true);
  const heroBodyHeight = useRef(new Animated.Value(280)).current;
  const heroBodyOpacity = useRef(new Animated.Value(1)).current;
  const heroArrowRotate = useRef(new Animated.Value(0)).current;

  const toggleHero = () => {
    const next = !heroExpanded;
    setHeroExpanded(next);
    Animated.parallel([
      Animated.timing(heroBodyHeight, {
        toValue: next ? 280 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(heroBodyOpacity, {
        toValue: next ? 1 : 0,
        duration: 260,
        useNativeDriver: false,
      }),
      Animated.timing(heroArrowRotate, {
        toValue: next ? 0 : 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([get_all_information()]).then(() => setRefreshing(false));
  }, [get_all_information]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true); // Show loading immediately

        // Run language check and API calls in parallel for better performance
        const [lang] = await Promise.all([getLanguage()]);

        if (lang != null) {
          i18next.changeLanguage(lang);
        }

        // Run API calls in parallel instead of sequential
        await Promise.all([get_all_information(), get_event_detail()]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setIsLoading(false); // Hide loading when done
      }
    };

    fetchData();

    // Removed entrance animations to prevent flickering
    // Animated.parallel([
    //   Animated.timing(fadeAnim, {
    //     toValue: 1,
    //     duration: 800,
    //     easing: Easing.out(Easing.cubic),
    //     useNativeDriver: true,
    //   }),
    //   Animated.timing(slideAnim, {
    //     toValue: 0,
    //     duration: 800,
    //     easing: Easing.out(Easing.cubic),
    //     useNativeDriver: true,
    //   }),
    //   Animated.spring(scaleAnim, {
    //     toValue: 1,
    //     friction: 8,
    //     tension: 100,
    //     useNativeDriver: true,
    //   }),
    // ]).start();
  }, []);

  useEffect(() => {
    if (userInfo) {
      // Use setTimeout to prevent blocking the main thread
      setTimeout(() => {
        checkSpecialDays();
      }, 100);
    }
  }, [userInfo]);

  const checkSpecialDays = async () => {
    try {
      // Check Birthday
      const userBirthday = userInfo?.dob
        ? moment(userInfo.dob).format('MM-DD')
        : null;
      if (userBirthday && today === userBirthday) {
        const lastBirthdayShow = await AsyncStorage.getItem('lastBirthdayShow');
        const today = new Date().toISOString().split('T')[0];

        if (lastBirthdayShow !== today) {
          setIsVisibleHappy(true);
          setTimeout(() => {
            setIsVisibleHappy(false);
            setShowBirthdayToast(true);
          }, 10000);
        } else {
          setShowBirthdayToast(true);
        }
      } else {
        setIsVisibleHappy(false);
        setShowBirthdayToast(false);
      }

      // Check New Year
      const isNewYear = moment().format('MM-DD') === '01-01';
      if (isNewYear) {
        const lastNewYearShow = await AsyncStorage.getItem('lastNewYearShow');
        const today = new Date().toISOString().split('T')[0];

        if (lastNewYearShow !== today) {
          setIsVisibleNewYear(true);
          setTimeout(() => {
            setIsVisibleNewYear(false);
            setShowNewYearToast(true);
          }, 10000);
        } else {
          setShowNewYearToast(true);
        }
      } else {
        setIsVisibleNewYear(false);
        setShowNewYearToast(false);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleShowBirthdayModal = () => {
    setIsVisibleHappy(true);
    setTimeout(() => {
      setIsVisibleHappy(false);
      setShowBirthdayToast(true);
    }, 10000);
  };

  const handleShowNewYearModal = () => {
    setIsVisibleNewYear(true);
    setTimeout(() => {
      setIsVisibleNewYear(false);
      setShowNewYearToast(true);
    }, 10000);
  };

  // Removed renderPosts function - now using FlatList directly

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <OptimizedLoader visible={isLoading} />

      {/* Modern Hero Header */}
      <LinearGradient
        colors={colors.primaryGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[styles.hero, !heroExpanded && styles.heroCollapsed]}>
        <View
          style={[
            styles.heroTopRow,
            !heroExpanded && styles.heroTopRowCollapsed,
          ]}>
          <TouchableOpacity
            onPress={handleControl}
            style={styles.heroIconBtn}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <IconFA name="bars" size={18} color="#fff" />
          </TouchableOpacity>

          {!heroExpanded && (
            <Text style={styles.heroTitle} numberOfLines={1}>
              {t('home.info_board')}
            </Text>
          )}

          <TouchableOpacity
            onPress={toggleHero}
            style={styles.heroIconBtn}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: heroArrowRotate.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    }),
                  },
                ],
              }}>
              <MaterialIcon name="chevron-up" size={18} color="#fff" />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.heroBody,
            {
              maxHeight: heroBodyHeight,
              opacity: heroBodyOpacity,
            },
          ]}>
          <View style={styles.heroMain}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroGreeting}>{getGreeting()},</Text>
              <Text style={styles.heroName} numberOfLines={1}>
                {getUserFullName()}
              </Text>
              <Text style={styles.heroDate}>
                {moment().format('dddd, DD/MM/YYYY')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.heroAvatarWrap}
              activeOpacity={0.8}>
              <Image
                source={
                  userInfo?.avatar
                    ? {uri: userInfo.avatar}
                    : require('../../assets/images/avatar.jpg')
                }
                style={styles.heroAvatar}
              />
              <View style={styles.heroAvatarRing} />
              <View style={styles.onlineDot} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>

      <Control visible={visibleControl} t={t} onClose={onClose} />
      <Notifications
        visible={is_notification}
        t={t}
        onClose={onClose}
        onNotificationClick={handle_notification_click}
      />

      <View
        style={[styles.feedContainer, {backgroundColor: colors.background}]}>
        {err ? (
          <Text style={[styles.errorText, {color: colors.danger}]}>{err}</Text>
        ) : null}
        <FlatList
          data={showAllPosts ? posts : posts.slice(0, 5)}
          renderItem={({item, index}) => (
            <PostItem
              key={item.id}
              item={item}
              t={t}
              handleGoToEventScreen={handleGoToEventScreen}
              index={index}
            />
          )}
          keyExtractor={(item, index) =>
            item.id?.toString() || index.toString()
          }
          onScroll={onScrollList}
          scrollEventThrottle={32}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary, colors.primary2]}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          windowSize={5}
          initialNumToRender={2}
          getItemLayout={(data, index) => ({
            length: 200, // Approximate height of each item
            offset: 200 * index,
            index,
          })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
                {t('no_posts', 'No posts available')}
              </Text>
            </View>
          }
          ListFooterComponent={
            !showAllPosts && posts.length > 5 ? (
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={() => setShowAllPosts(true)}>
                <LinearGradient
                  colors={[colors.primary, colors.primary2]}
                  style={styles.viewMoreGradient}>
                  <IconFA name="chevron-down" size={18} color="#fff" />
                  <Text style={styles.viewMoreText}>{t('viewMore')}</Text>
                  <IconFA name="chevron-down" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            ) : null
          }
        />
      </View>

      <PopupEvent
        visible={isVisiblePopup}
        event={event}
        onClose={() => {
          setIsVisiblePopup(false);
        }}
        t={t}
        navigation={navigation}
      />
      <HappyModal
        visible={isVisibleHappy}
        onClose={() => {
          setIsVisibleHappy(false);
          setShowBirthdayToast(true);
        }}
        userName={userInfo?.full_name}
      />
      <NewYearModal
        visible={isVisibleNewYear}
        onClose={() => {
          setIsVisibleNewYear(false);
          setShowNewYearToast(true);
        }}
        userName={userInfo?.full_name}
      />
      <BirthdayToast
        visible={showBirthdayToast}
        onClose={() => setShowBirthdayToast(false)}
        onShowModal={handleShowBirthdayModal}
      />
      <NewYearToast
        visible={showNewYearToast}
        onClose={() => setShowNewYearToast(false)}
        onShowModal={handleShowNewYearModal}
      />
      <ModalMessage
        isVisible={isMessageModalVisible}
        onClose={() => setMessageModalVisible(false)}
        message={messageModal}
        type={messageType}
        t={t}
        duration={duration}
      />
      <MediaViewer
        visible={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        mediaUrl={selectedMedia?.url}
        mediaType={selectedMedia?.type}
        postInfo={selectedMedia?.postInfo}
        onEventConfirm={handleGoToEventScreen}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingTop: Platform.OS === 'ios' ? 52 : 34,
    paddingBottom: 0,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heroCollapsed: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  heroTopRowCollapsed: {
    marginBottom: 0,
  },
  heroTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  heroIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroBody: {
    overflow: 'hidden',
  },
  heroMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextWrap: {
    flex: 1,
    paddingRight: 16,
  },
  heroGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    marginBottom: 4,
  },
  heroName: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  heroDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    fontWeight: '500',
  },
  heroAvatarWrap: {
    position: 'relative',
  },
  heroAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  heroAvatarRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    top: -4,
    left: -4,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  feedContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 0,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  postItemContainer: {
    marginHorizontal: 0,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  postContent: {
    borderRadius: 0,
    padding: 20,
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    overflow: 'hidden',
  },
  adminPostContent: {
    borderLeftWidth: 6,
    borderLeftColor: '#0A84FF',
    backgroundColor: 'rgba(10, 132, 255, 0.08)',
    shadowColor: '#0A84FF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginVertical: 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(10, 132, 255, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(10, 132, 255, 0.2)',
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 0,
  },
  adminIndicatorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80, // Only cover header area
    zIndex: 1,
  },
  adminIndicatorGradient: {
    flex: 1,
    borderRadius: 0,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  nameAndDayContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
  },
  dateText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    shadowColor: '#0A84FF',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  adminBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  postTitleText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    lineHeight: 26,
  },
  adminTitleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0A84FF',
    textShadowColor: 'rgba(10, 132, 255, 0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  postContentText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    gap: 4,
  },
  moreText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  mediaContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    zIndex: 10, // Higher than admin overlay
  },
  mediaImage: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  mediaPlayer: {
    width: '100%',
    height: 240,
    backgroundColor: '#000',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -30,
    marginLeft: -30,
  },
  postMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  postActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  likedButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  actionText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  likedText: {
    color: '#ff6b6b',
  },
  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  linkPreviewBox: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  linkPreviewGradient: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  linkPreviewImg: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  linkPreviewContent: {
    flex: 1,
  },
  linkPreviewTitle: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4,
  },
  linkPreviewDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 18,
  },
  linkPreviewUrl: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '500',
  },
  eventButton: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  eventButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  eventButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  viewMoreButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  viewMoreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  viewMoreText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeTab;
