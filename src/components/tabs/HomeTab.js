/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useCallback} from 'react';
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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {
  THEME_COLOR,
  THEME_COLOR_2,
  BG_COLOR,
  TEXT_COLOR,
} from '../../utils/Colors';
import Control from '../Control';
import Notifications from '../Notifications';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import i18next from '../../../services/i18next';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
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
  SEARCH_BY_ID,
  GET_EVENTS_WITH_POSITION,
  UPDATE,
  GET_EVENT_WITH_POSITION,
} from '../../utils/constans';
import Loader from '../Loader';
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
  const [visibleControl, setVisibleControl] = useState(false);
  const [isVisiblePopup, setIsVisiblePopup] = useState(false);
  const [isVisibleHappy, setIsVisibleHappy] = useState(false);
  const [isVisibleNewYear, setIsVisibleNewYear] = useState(false);
  const [showBirthdayToast, setShowBirthdayToast] = useState(false);
  const [showNewYearToast, setShowNewYearToast] = useState(false);
  const authData = useSelector(state => state.auth);
  const [userInfo, setUserInfo] = useState(authData?.data.data);
  const [err, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
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

  // Animation values - keeping minimal for like button only
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;

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

  const handleGoToEventScreen = async () => {
    try {
      setIsLoading(true);
      const url = `${BASE_URL}${PORT}${API}${VERSION}${V1}${EVENTS}${GET_EVENT_WITH_POSITION}`;
      const events = await axios.post(url, {
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
  };

  const get_event_detail = async () => {
    try {
      const url = `${BASE_URL}${PORT}${API}${VERSION}${V1}${EVENTS}${GET_EVENTS_WITH_POSITION}`;

      const events = await axios.post(url, {
        position: userInfo.position,
      });
      if (events?.data?.success) {
        setEvent(events?.data.data[0]);
        setTimeout(() => {
          setIsVisiblePopup(true);
        }, 3000);
      }
    } catch (error) {
      showMessage('not.event', 'warning', 500);
    }
  };

  const get_all_information = async () => {
    try {
      setIsLoading(true);
      const userInforString = await AsyncStorage.getItem('userInfor');
      const userInfor = JSON.parse(userInforString);

      const field = {
        position: userInfor?.position,
        is_public: true,
      };

      const url = `${BASE_URL}${PORT}${API}${VERSION}${V1}${INFORMATION}${GET_ALL_BY_FIELD}`;
      const informations = await axios.post(url, {field});

      if (informations?.data?.success) {
        setIsLoading(false);
        setError('');
        const sortedPosts = informations.data.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date),
        );
        setPosts(sortedPosts);
      } else {
        setIsLoading(false);
        setError('Not have information here');
      }
    } catch (error) {
      setIsLoading(false);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handle_get_notification = async () => {
    try {
      const user_id = userInfo?.id;
      const notifications = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${NOTIFICATION}${SEARCH_BY_ID}`,
        {
          user_id,
        },
      );
      if (notifications?.data?.success) {
        setNotificationCount(notifications?.data.data.length);
      }
    } catch (error) {
      showMessage(error?.message || 'networkError', 'error', 500);
    }
  };

  const handle_notification_click = async notification => {
    try {
      const field = {
        id: notification.id,
        user_id: userInfo?.id,
        is_read: true,
      };
      const updateNotification = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${NOTIFICATION}${UPDATE}`,
        {field},
      );
      if (updateNotification?.data?.success) {
        handle_get_notification();
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

  const PostItem = ({item, t, handleGoToEventScreen, index}) => {
    const [linkPreview, setLinkPreview] = React.useState(null);
    const [isLiked, setIsLiked] = React.useState(false);
    const isAdmin = item.user.role === 'ADMIN';

    const scaleAnim = React.useRef(new Animated.Value(1)).current;

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
              ? ['#ffffff', '#fef7f7', '#ffffff']
              : ['#ffffff', '#fbfcfd', '#ffffff']
          }
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[styles.postContent, isAdmin && styles.adminPostContent]}>
          {/* Glass overlay for modern effect */}
          <View style={styles.glassOverlay} />

          <View style={styles.postHeader}>
            <View style={styles.avatarContainer}>
              <Image style={styles.avatar} source={{uri: item.user.avatar}} />
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.nameAndDayContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.nameText}>{item.user.name}</Text>
                {isAdmin && (
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.adminBadge}>
                    <MaterialIcon name="shield-crown" size={12} color="#fff" />
                    <Text style={styles.adminBadgeText}>Admin</Text>
                  </LinearGradient>
                )}
              </View>
              <Text style={styles.dateText}>
                {moment(item.date).format('DD/MM/YYYY • HH:mm')}
              </Text>
            </View>
          </View>

          {item.title && <Text style={styles.postTitleText}>{item.title}</Text>}

          <Text
            style={styles.postContentText}
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
                colors={['#667eea', '#764ba2']}
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
                colors={['#667eea', '#764ba2']}
                style={styles.moreButton}>
                <Text style={styles.moreText}>{t('more')}</Text>
                <MaterialIcon name="chevron-right" size={16} color="#fff" />
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
                  <MaterialIcon
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

          <View style={styles.postMetaContainer}>
            <View style={styles.postActionsGroup}>
              <Animated.View style={{transform: [{scale: scaleAnim}]}}>
                <TouchableOpacity
                  onPress={handleLike}
                  style={[styles.actionButton, isLiked && styles.likedButton]}>
                  <MaterialIcon
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isLiked ? '#ff6b6b' : '#94a3b8'}
                  />
                  <Text
                    style={[styles.actionText, isLiked && styles.likedText]}>
                    {isLiked ? 'Liked' : 'Like'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity
                onPress={handleComment}
                style={styles.actionButton}>
                <MaterialIcon
                  name="comment-outline"
                  size={20}
                  color="#94a3b8"
                />
                <Text style={styles.actionText}>Comment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                style={styles.actionButton}>
                <MaterialIcon name="share-outline" size={20} color="#94a3b8" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.viewCountContainer}>
              <MaterialIcon name="eye" size={16} color="#94a3b8" />
              <Text style={styles.metaText}>
                {formattedViewCount} {t('views')}
              </Text>
            </View>
          </View>

          {item.is_event && (
            <TouchableOpacity
              style={styles.eventButton}
              onPress={handleGoToEventScreen}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.eventButtonGradient}>
                <MaterialIcon name="calendar-check" size={18} color="#fff" />
                <Text style={styles.eventButtonText}>{t('confirm.c')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>
    );
  };

  const handleControl = () => {
    setVisibleControl(!visibleControl);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    get_all_information().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }
      await get_all_information();
      await get_event_detail();
    };

    handle_get_notification();
    fetchData();
  }, []);

  useEffect(() => {
    if (userInfo) {
      checkSpecialDays();
    }
  }, [userInfo]);

  const checkSpecialDays = async () => {
    try {
      // Check Birthday
      const userBirthday = moment(userInfo.dob).format('MM-DD');
      if (today === userBirthday) {
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

  const renderPosts = () => {
    const displayPosts = showAllPosts ? posts : posts.slice(0, 5);

    return (
      <>
        {displayPosts.map((item, index) => (
          <PostItem
            key={item.id}
            item={item}
            index={index}
            t={t}
            handleGoToEventScreen={handleGoToEventScreen}
          />
        ))}

        {!showAllPosts && posts.length > 5 && (
          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={() => setShowAllPosts(true)}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.viewMoreGradient}>
              <MaterialIcon name="chevron-down" size={20} color="#fff" />
              <Text style={styles.viewMoreText}>{t('viewMore')}</Text>
              <MaterialIcon name="chevron-down" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Loader visible={isLoading} />

      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        <View style={styles.headerOverlay} />
        <View style={styles.telegramHeader}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={handleControl}
              style={styles.headerIconContainer}>
              <MaterialIcon name="menu" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{t('info')}</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Notifications');
              }}
              style={styles.headerIconContainer}>
              <MaterialIcon name="bell" size={24} color="#ffffff" />
              {notificationCount > 0 && (
                <LinearGradient
                  colors={['#ff6b6b', '#ff8e8e']}
                  style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>
                    {notificationCount}
                  </Text>
                </LinearGradient>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Profile');
              }}
              style={styles.profileContainer}>
              <Image
                source={
                  userInfo.avatar
                    ? {uri: userInfo.avatar}
                    : require('../../assets/images/avatar.jpg')
                }
                style={styles.headerAvatar}
              />
              <View style={styles.avatarRing} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <Control visible={visibleControl} t={t} onClose={onClose} />
      <Notifications
        visible={is_notification}
        t={t}
        onClose={onClose}
        onNotificationClick={handle_notification_click}
      />

      <View style={styles.feedContainer}>
        {err ? <Text style={styles.errorText}>{err}</Text> : null}
        <ScrollView
          onScroll={onScrollList}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#667eea', '#764ba2']}
              tintColor="#667eea"
            />
          }
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {renderPosts()}
        </ScrollView>
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
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  profileContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    top: -4,
    left: -4,
  },
  notificationBadge: {
    position: 'absolute',
    right: 2,
    top: 2,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  notificationText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  feedContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 16,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  postItemContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  postContent: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  adminPostContent: {
    borderWidth: 3,
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  adminBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  postTitleText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    lineHeight: 26,
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
