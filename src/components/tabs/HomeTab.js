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
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from 'react-native-vector-icons/FontAwesome';
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
} from '../../utils/constans';
import Loader from '../Loader';
import HappyModal from '../HappyModal';
import moment from 'moment';
import LinkPreview from 'react-native-link-preview';

const {width} = Dimensions.get('window');

const HomeTab = ({onScrollList}) => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const [visibleControl, setVisibleControl] = useState(false);
  const [isVisiblePopup, setIsVisiblePopup] = useState(false);
  const [isVisibleHappy, setIsVisibleHappy] = useState(false);
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
  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
  };

  const onClose = () => {
    setVisibleControl(false);
    setIsNotification(false);
    setIsVisiblePopup(false);
    setIsVisibleHappy(false);
  };

  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const handleGoToEventScreen = () => {
    navigation.navigate('Event');
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
      showAlert('not.event');
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
      const informations = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${INFORMATION}${GET_ALL_BY_FIELD}`,
        {field},
      );
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
      showAlert(error?.message || 'networkError');
    }
  };

  // Hàm nhận diện link trong text
  function extractFirstUrl(text) {
    const urlRegex =
      /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)|(www\.[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/gi;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  }

  const PostItem = ({item, t, handleGoToEventScreen}) => {
    const [linkPreview, setLinkPreview] = React.useState(null);
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
    const handleLike = () => console.log('Liked post:', item.id);
    const handleComment = () => console.log('Comment on post:', item.id);
    const handleShare = () => console.log('Share post:', item.id);

    return (
      <View style={styles.postItemContainer}>
        <View style={styles.postHeader}>
          <Image style={styles.avatar} source={{uri: item.user.avatar}} />
          <View style={styles.nameAndDayContainer}>
            <Text style={styles.nameText}>{item.user.name}</Text>
            <Text style={styles.dateText}>
              {moment(item.date).format('DD/MM/YYYY HH:mm')}
            </Text>
          </View>
        </View>
        {item.title && <Text style={styles.postTitleText}>{item.title}</Text>}
        <Text style={styles.postContent} numberOfLines={3} ellipsizeMode="tail">
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
            {linkPreview.image && (
              <Image
                source={{uri: linkPreview.image}}
                style={styles.linkPreviewImg}
              />
            )}
            <View style={{flex: 1, marginLeft: 10}}>
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
          </TouchableOpacity>
        )}
        {item.content.length > 100 && (
          <TouchableOpacity
            onPress={() =>
              Alert.alert(item.title || t('Detail'), item.content)
            }>
            <Text style={styles.moreText}>{t('more')}</Text>
          </TouchableOpacity>
        )}
        {item.media &&
          (item.is_video ? (
            <Video
              source={{uri: item.media}}
              style={[
                styles.mediaPlayer,
                {width: width - 30, height: (width - 30) * (9 / 16)},
              ]}
              controls={true}
              paused={true}
              resizeMode="cover"
              poster={require('../../assets/images/thumbnail.jpg')}
              posterResizeMode="cover"
            />
          ) : (
            <TouchableOpacity
              onPress={() => {
                /* Handle image press, maybe open in viewer */
              }}>
              <Image source={{uri: item.media}} style={styles.mediaImage} />
            </TouchableOpacity>
          ))}
        <View style={styles.postMetaContainer}>
          <View style={styles.postActionsGroup}>
            <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
              <Icon name="heart-o" size={18} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleComment}
              style={styles.actionButton}>
              <Icon name="comment-o" size={18} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              style={styles.actionButtonLast}>
              <Icon name="share-square-o" size={18} color="#555" />
            </TouchableOpacity>
          </View>
          <View style={styles.viewCountContainer}>
            <Icon name="eye" size={14} color="#777" style={styles.metaIcon} />
            <Text style={styles.metaText}>
              {formattedViewCount} {t('views')}
            </Text>
          </View>
        </View>
        {item.is_event ? (
          <TouchableOpacity
            style={styles.eventButton}
            onPress={handleGoToEventScreen}>
            <Text style={styles.eventButtonText}>{t('confirm.c')}</Text>
          </TouchableOpacity>
        ) : null}
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
      get_all_information();
      get_event_detail();
    };
    handle_get_notification();
    fetchData();
  }, []);

  useEffect(() => {
    if (userInfo) {
      checkBirthDay();
    }
  }, [userInfo]);

  const checkBirthDay = () => {
    try {
      const userBirthday = moment(userInfo.dob).format('MM-DD');
      if (today === userBirthday) {
        setIsVisibleHappy(true);
        setTimeout(() => {
          setIsVisibleHappy(false);
        }, 10000);
      } else {
        setIsVisibleHappy(false);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const renderItemSeparator = () => <View style={styles.itemSeparator} />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Loader visible={isLoading} />
      <View style={styles.telegramHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={handleControl}
            style={styles.headerIconContainer}>
            <Icon name="bars" size={22} color="#555" />
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
            <Icon name="bell" size={22} color="#555" />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Profile');
            }}
            style={styles.headerIconContainer}>
            <Image
              source={
                userInfo.avatar
                  ? {uri: userInfo.avatar}
                  : require('../../assets/images/avatar.jpg')
              }
              style={styles.headerAvatar}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Control visible={visibleControl} t={t} onClose={onClose} />
      <Notifications visible={is_notification} t={t} onClose={onClose} />
      <View style={styles.feedContainer}>
        {err ? <Text style={styles.errorText}>{err}</Text> : null}
        <FlatList
          data={posts}
          renderItem={({item}) => (
            <PostItem
              item={item}
              t={t}
              handleGoToEventScreen={handleGoToEventScreen}
            />
          )}
          keyExtractor={item => item.id.toString()}
          ItemSeparatorComponent={renderItemSeparator}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{paddingBottom: 10}}
          onScroll={onScrollList}
          scrollEventThrottle={16}
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
      <HappyModal onClose={onClose} visible={isVisibleHappy} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  telegramHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    height: 56,
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
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    padding: 8,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  notificationBadge: {
    position: 'absolute',
    right: 5,
    top: 5,
    backgroundColor: 'red',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  feedContainer: {
    flex: 1,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  postItemContainer: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  nameAndDayContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  dateText: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  postTitleText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  postContent: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  moreText: {
    color: THEME_COLOR,
    fontWeight: '500',
    marginTop: 5,
    paddingBottom: 5,
  },
  mediaImage: {
    width: '100%',
    height: 220,
    borderRadius: 6,
    marginTop: 8,
  },
  mediaPlayer: {
    borderRadius: 6,
    marginTop: 8,
    backgroundColor: '#000',
  },
  eventButton: {
    backgroundColor: THEME_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  eventButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#F0F0F0', // Lighter color for separator
  },
  postMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 0,
  },
  postActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
    paddingVertical: 5,
  },
  actionButtonLast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#555',
  },
  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#777',
  },
  linkPreviewBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#181a20',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  linkPreviewImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  linkPreviewTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  linkPreviewDesc: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 2,
  },
  linkPreviewUrl: {
    color: THEME_COLOR_2,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});

export default HomeTab;
