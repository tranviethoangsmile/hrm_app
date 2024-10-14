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
  KeyboardAvoidingView,
  Platform,
  StatusBar,
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
  DELETE_INFORMATION_BY_ID,
} from '../utils/constans';
import InformationDetail from '../components/InformationDetail';
import {TEXT_COLOR} from '../utils/Colors';
import Loader from '../components/Loader';
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
  const [isLoading, setIsLoading] = useState(false);
  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
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
      setIsLoading(true);
      const informationPosted = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${INFORMATION}${GET_INFOR_OF_USER}`,
        {user_id: USER_IF.id},
      );
      if (informationPosted?.data?.success) {
        setIsLoading(false);
        const sortedPosts = informationPosted.data.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date),
        );
        setPosts(sortedPosts);
        setError('');
      }
    } catch (error) {
      setIsLoading(true);
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
  const handleDeleteInformation = async id => {
    setIsLoading(true);
    try {
      const result = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${INFORMATION}${DELETE_INFORMATION_BY_ID}`,
        {
          id: id,
        },
      );
      if (result.data.success) {
        setIsLoading(false);
        onRefresh();
        setError('');
        showAlert('success');
      } else {
        setIsLoading(false);
        onRefresh();
        setError('');
        showAlert('unSuccess');
      }
    } catch (error) {
      setIsLoading(false);
      onRefresh();
      setError(error.message);
    }
  };

  const renderHiddenItem = ({item}) => (
    <View style={styles.rowBack}>
      <TouchableOpacity style={styles.editBtn}>
        <Text style={styles.btnTitle}>{t('EDIT')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            t('plzcof'),
            t('wantDelete'),
            [
              {
                text: t('dl'),
                onPress: () => {
                  handleDeleteInformation(item.id);
                },
              },
            ],
            {cancelable: true},
          );
        }}
        style={styles.deleteBtn}>
        <Text style={styles.btnTitle}>{t('DELETE')}</Text>
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
            thumbnail={require('../assets/images/thumbnail.jpg')}
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
          <Text style={styles.date}>{item.date}</Text>
          <Text styles={styles.content}>
            {item.content.length > 100
              ? `${item.content.substring(0, 100)}...`
              : item.content}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Loader visible={isLoading} />
      {err ? <Text style={styles.title}>{err}</Text> : ''}
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
        <Image
          style={styles.postIcon}
          source={require('../assets/images/post.png')}
        />
      </TouchableOpacity>
      <PostInformationModal
        visible={modalPostVisible}
        onClose={() => {
          setModalPostVisible(!modalPostVisible);
        }}
        t={t}
        USER_IF={USER_IF}
        refresh={onRefresh}
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
      <Loader visible={isLoading} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  content: {color: TEXT_COLOR},
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
    color: TEXT_COLOR,
  },
  date: {
    color: TEXT_COLOR,
  },
  rowBack: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default Upload;
