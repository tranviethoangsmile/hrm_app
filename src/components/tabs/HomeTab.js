/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {useSelector} from 'react-redux';
import {TEXT_COLOR, THEME_COLOR_2} from '../../utils/Colors';
import Control from '../Control';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import i18next from '../../../services/i18next';
import VideoPlayer from 'react-native-video-player';

import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  INFORMATION,
  GET_ALL_BY_FIELD,
} from '../../utils/Strings';

const HomeTab = () => {
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };

  const {t} = useTranslation();
  const [visible, setVisible] = useState(false);
  const authData = useSelector(state => state.auth);
  const [userInfo, setUserInfo] = useState({});
  const [err, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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
        console.log(sortedPosts);
        setPosts(sortedPosts);
      } else {
        setError('Not have information here');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const renderPost = ({item}) => {
    return (
      <View style={styles.card}>
        <View style={styles.headerPost}>
          <View style={styles.avatarContainer}>
            <Image style={styles.avatar} source={{uri: item.user.avatar}} />
          </View>
          <View style={styles.NameAndDayContainer}>
            <Text style={styles.nameText}>{item.user.name}</Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        </View>
        <View style={styles.separator}></View>
        <Text style={styles.titleText}>{item.title}</Text>
        <Text numberOfLines={3} ellipsizeMode="tail">
          {item.content}
        </Text>
        {item.content.length > 100 && (
          <TouchableOpacity onPress={() => alert(item.content)}>
            <Text style={{color: 'blue', marginTop: 5}}>Xem thêm</Text>
          </TouchableOpacity>
        )}
        {item.is_video ? (
          <VideoPlayer
            autoplay={false}
            video={{uri: item.media}}
            defaultMuted={true}
            videoWidth={300}
            videoHeight={200}
            thumbnail={require('../../images/thumbnail.jpg')}
          />
        ) : (
          <Image source={{uri: item.media}} style={styles.media} />
        )}
      </View>
    );
  };

  const handleControl = () => {
    setVisible(!visible);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    get_all_information().then(() => setRefreshing(false));
  }, [userInfo]); // Update data when userInfo changes

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
        <Text style={styles.title}>{t('info')}</Text>
        <TouchableOpacity onPress={handleControl}>
          <Image
            source={
              userInfo.avatar
                ? {uri: userInfo.avatar}
                : require('../../images/avatar.jpg')
            }
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Control
          visible={visible}
          onClose={() => {
            setVisible(!visible);
          }}
          t={t}
        />
      </View>
      <View style={styles.postContainer}>
        {err ? <Text>{err}</Text> : ''}
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
  avatarContainer: {
    marginRight: 5,
  },
  headerPost: {
    flexDirection: 'row',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  titleText: {
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 10,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  titleView: {
    width: '100%',
    height: 50,
    backgroundColor: THEME_COLOR_2,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    fontSize: 20,
    color: TEXT_COLOR,
    fontWeight: '700',
    marginLeft: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  postContainer: {
    marginHorizontal: 10,
    marginTop: 10,
  },
  card: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
});

export default HomeTab;
