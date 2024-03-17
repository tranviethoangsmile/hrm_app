/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {useSelector} from 'react-redux';
import {SwipeListView} from 'react-native-swipe-list-view';
import VideoPlayer from 'react-native-video-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import i18next from '../../services/i18next';
import axios from 'axios';
import PostInformationModal from '../components/PostInformationModal';
import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  INFORMATION,
  GET_INFOR_OF_USER,
  GET_INFOR_BY_ID,
} from '../utils/Strings';
import InformationDetail from '../components/InformationDetail';

const Upload = () => {
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const USER_IF = authData?.data?.data;
  const [posts, setPosts] = useState([]);
  const [modalPostVisible, setModalPostVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalDetailVisible, setModalDetailVisible] = useState(false);
  const [post, setPost] = useState({});
  const [err, setError] = useState('');
  const showAlert = message => {
    Alert.alert(t('noti', message));
  };
  const handleGetValueOfInformation = async id => {
    try {
      const information = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${INFORMATION}${GET_INFOR_BY_ID}`,
        {id: id},
      );
      if (information?.data?.success) {
        setPost(information?.data?.data);
        setModalDetailVisible(!modalDetailVisible);
      } else {
        showAlert('not found');
      }
    } catch (error) {
      setError(error.message);
    }
  };
  const getInformationPostedOfUser = async () => {
    try {
      const informationPosted = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${INFORMATION}${GET_INFOR_OF_USER}`,
        {user_id: USER_IF.id},
      );
      if (informationPosted?.data?.success) {
        setPosts(informationPosted?.data?.data);
        setError('');
      }
    } catch (error) {
      setError(error.message);
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
    getInformationPostedOfUser();
    checkLanguage();
  }, []);
  const onRefresh = () => {
    setRefreshing(true);
    getInformationPostedOfUser();
    setRefreshing(false);
  };

  const renderHiddenItem = () => (
    <View style={styles.rowBack}>
      <TouchableOpacity style={styles.editBtn}>
        <Text style={styles.btnTitle}>EDIT</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn}>
        <Text style={styles.btnTitle}>DELETE</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({item, index}) => (
    <View key={index} style={styles.rowFront}>
      <TouchableOpacity style={styles.avatarContainer}>
        {item.is_video ? (
          <VideoPlayer
            autoplay={false}
            video={{uri: item.media}}
            defaultMuted={true}
            videoWidth={300}
            videoHeight={200}
            thumbnail={require('../images/thumbnail.jpg')}
          />
        ) : (
          <Image
            source={{uri: item.media}}
            style={[styles.avatar, {width: 50, height: 50}]}
          />
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleGetValueOfInformation(item.id)}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text>{item.date}</Text>
          <Text>
            {item.content.length > 100
              ? `${item.content.substring(0, 100)}...`
              : item.content}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {err ? <Text>{err}</Text> : ''}
      <SwipeListView
        data={posts}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        leftOpenValue={75}
        rightOpenValue={-75}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <TouchableOpacity
        onPress={() => {
          setModalPostVisible(!modalPostVisible);
        }}
        style={styles.fab}>
        <Image style={styles.postIcon} source={require('../images/post.png')} />
      </TouchableOpacity>
      <PostInformationModal
        visible={modalPostVisible}
        onClose={() => {
          setModalPostVisible(!modalPostVisible);
        }}
        t={t}
        USER_IF={USER_IF}
      />
      <InformationDetail
        visible={modalDetailVisible}
        onClose={() => {
          setModalDetailVisible(!modalDetailVisible);
        }}
        t={t}
        USER_IF={USER_IF}
        post={post}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  postIcon: {
    width: 50,
    height: 50,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    backgroundColor: '#5e81ac',
    borderRadius: 28,
    width: 130,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  btnTitle: {
    fontSize: 17,
    color: 'white',
    fontWeight: '600',
  },
  deleteBtn: {
    height: '100%',
    width: '20%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: 'red',
    paddingRight: 5,
  },
  editBtn: {
    height: '100%',
    width: '20%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: 'blue',
    paddingLeft: 20,
  },
  rowFront: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  rowBack: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default Upload;
