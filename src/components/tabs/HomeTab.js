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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {TEXT_COLOR, THEME_COLOR_2, THEME_COLOR} from '../../utils/Colors';
import Control from '../Control';
import Notifications from '../Notifications';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import i18next from '../../../services/i18next';
import VideoPlayer from 'react-native-video-player';
import ImageViewer from 'react-native-image-zoom-viewer'; // Import ImageViewer
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  INFORMATION,
  GET_ALL_BY_FIELD,
  EVENTS,
  GET_ALL,
} from '../../utils/Strings';

const HomeTab = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const [visibleControl, setVisibleControl] = useState(false);
  const authData = useSelector(state => state.auth);
  const [userInfo, setUserInfo] = useState({});
  const [err, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(5);
  const [is_notification, setIsNotification] = useState(false);
  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
  };
  const onClose = () => {
    setVisibleControl(false);
    setIsNotification(false);
  };
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const get_event_detail = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${EVENTS}${GET_ALL}`,
      );
      if (res?.data?.success) {
        navigation.navigate('Event');
      } else {
        showAlert('not.event');
      }
    } catch (error) {
      showAlert('not.event');
    }
  };
  const get_all_information = async () => {
    try {
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
        setError('');
        const sortedPosts = informations.data.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date),
        );
        setPosts(sortedPosts);
      } else {
        setError('Not have information here');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const renderPost = ({item}) => (
    <View style={styles.card}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.headerPost}>
        <Image style={styles.avatar} source={{uri: item.user.avatar}} />
        <View style={styles.nameAndDayContainer}>
          <Text style={styles.nameText}>{item.user.name}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.separator}></View>
      <Text style={styles.titleText}>{item.title}</Text>
      <Text style={styles.content} numberOfLines={3} ellipsizeMode="tail">
        {item.content}
      </Text>
      {item.content.length > 100 && (
        <TouchableOpacity onPress={() => alert(item.content)}>
          <Text style={styles.moreText}>{t('more')}</Text>
        </TouchableOpacity>
      )}
      {item.is_video ? (
        <VideoPlayer
          autoplay={false}
          video={{uri: item.media}}
          defaultMuted={true}
          videoWidth={300}
          videoHeight={200}
          thumbnail={require('../../assets/images/thumbnail.jpg')}
        />
      ) : (
        <TouchableOpacity>
          <Image source={{uri: item.media}} style={styles.media} />
        </TouchableOpacity>
      )}
      {item.is_event ? (
        <TouchableOpacity style={styles.safetyBtn} onPress={get_event_detail}>
          <Text style={styles.buttonText}>{t('confirm.c')}</Text>
        </TouchableOpacity>
      ) : (
        ''
      )}
    </View>
  );

  const handleControl = () => {
    setVisibleControl(!visibleControl);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    get_all_information().then(() => setRefreshing(false));
  }, []); // Update data when userInfo changes

  useEffect(() => {
    const fetchData = async () => {
      // Set user info if available
      if (authData?.data?.data) {
        setUserInfo(authData.data.data);
      }

      // Check and change language
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }

      // Fetch information
      get_all_information();
    };
    fetchData();
  }, [authData]); // Update data when authData changes

  return (
    <View style={styles.container}>
      <View style={styles.titleView}>
        <View style={styles.titleTextView}>
          <Text style={styles.title}>{t('info')}</Text>
        </View>
        <View style={styles.notificationBellContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Notifications');
            }}>
            <Icon name="bell" size={25} color="white" />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.titleAvatarView}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Profile');
            }}>
            <Image
              source={
                userInfo.avatar
                  ? {uri: userInfo.avatar}
                  : require('../../assets/images/avatar.jpg')
              }
              style={[styles.avatar, {marginRight: 0}]}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.titleBarsView}>
          <TouchableOpacity onPress={handleControl}>
            <Icon name="bars" size={40} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <Control visible={visibleControl} t={t} onClose={onClose} />
      <Notifications visible={is_notification} t={t} onClose={onClose} />
      <View style={styles.postContainer}>
        {err ? <Text style={styles.errorText}>{err}</Text> : null}
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={item => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  safetyBtn: {
    backgroundColor: '#ff6347', // Tomato color
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBarsView: {
    flex: 0.1,
    marginLeft: 10,
  },
  titleView: {
    width: '100%',
    backgroundColor: THEME_COLOR_2,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleTextView: {
    flex: 1,
  },
  titleAvatarView: {
    flex: 0.2,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  postContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  card: {
    marginVertical: 4,
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerPost: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  nameAndDayContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  content: {
    color: '#333',
    marginBottom: 10,
  },
  moreText: {
    color: 'blue',
    marginTop: 5,
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  notificationBellContainer: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HomeTab;
