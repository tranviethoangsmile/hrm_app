import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import {useSelector} from 'react-redux';

import DocumentPicker from 'react-native-document-picker';
import CheckBox from '@react-native-community/checkbox';
import VideoPlayer from 'react-native-video-player';
import {THEME_COLOR, TEXT_COLOR} from '../utils/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import i18next from '../../services/i18next';
import axios from 'axios';
import moment from 'moment';
import {
  API,
  BASE_URL,
  CREATE,
  INFORMATION,
  PORT,
  V1,
  VERSION,
} from '../utils/Strings';
import Loader from '../components/Loader';
const Upload = () => {
  const authData = useSelector(state => state.auth);
  const USER_IF = authData?.data?.data;
  const [content, setContent] = useState('');
  const [mediaUri, setMediaUri] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [postDisabled, setPostDisabled] = useState(true);
  const [mediaName, setMediaName] = useState('');
  const [title, setTitle] = useState('');
  const date = moment().format('YYYY-MM-DD');
  const showAlert = message => {
    Alert.alert(t('noti'), message);
  };
  const chooseMedia = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images, DocumentPicker.types.video],
        allowMultiSelection: false,
      });
      setMediaName(res.name);
      if ((res.type === 'video/mp4') | (res.type === 'video/quicktime')) {
        setIsVideo(true);
        setMediaUri(res.uri);
      } else {
        setIsVideo(false);
        setMediaUri(res.uri);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the file selection.');
      } else {
        console.log('Error: ', err);
      }
    }
  };
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const {t} = useTranslation();

  useEffect(() => {
    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }
    };
    checkLanguage();
  }, []);
  const handlePostInformation = async () => {
    try {
      setIsloading(true);
      const formData = new FormData();
      formData.append('media', {
        uri: mediaUri,
        type: 'image/jpeg',
        name: mediaName,
      });
      formData.append('user_id', USER_IF.id);
      formData.append('title', title);
      formData.append('content', content);
      formData.append('date', date);
      formData.append('is_video', isVideo);
      formData.append('is_public', isPublic);

      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${INFORMATION}${CREATE}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      console.log(response?.data);
      if (response?.data?.success) {
        setIsloading(false);
        showAlert(t('success'));
      } else {
        setIsloading(false);
        showAlert(t('unSuccess'));
      }
    } catch (error) {
      showAlert(error);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.userInforUpload}>
        <View style={styles.userInforAvatar}>
          <Image
            source={{uri: USER_IF.avatar}}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>
        <View style={styles.userInforName}>
          <Text style={styles.label}>{USER_IF.name}</Text>
        </View>
      </View>
      <View style={styles.titleInput}>
        <TextInput
          multiline={true}
          numberOfLines={5}
          placeholder={t('til')}
          style={styles.input}
          onChangeText={text => setTitle(text)}
          placeholderTextColor={TEXT_COLOR}
        />
      </View>
      <View style={styles.captionInput}>
        <TextInput
          multiline={true}
          numberOfLines={5}
          placeholder={t('post')}
          style={styles.input}
          onChangeText={text => setContent(text)}
          placeholderTextColor={TEXT_COLOR}
        />
      </View>
      <TouchableOpacity onPress={chooseMedia} style={styles.chooseMediaButton}>
        <Text>{t('choo')}</Text>
      </TouchableOpacity>
      {mediaUri &&
        (isVideo ? (
          <VideoPlayer
            autoplay={false}
            video={{
              uri: mediaUri,
            }}
            defaultMuted={true}
            videoWidth={300}
            videoHeight={200}
            thumbnail={require('../images/thumbnail.jpg')}
          />
        ) : (
          <Image source={{uri: mediaUri}} style={styles.selectedImage} />
        ))}
      <View style={styles.postOptions}>
        <CheckBox
          value={isPublic}
          onValueChange={() => setIsPublic(!isPublic)}
          style={styles.checkbox}
        />
        <Text style={styles.label}>{t('pub')}</Text>
        <TouchableOpacity
          onPress={handlePostInformation}
          style={styles.postButton}>
          <Text style={styles.postButtonText}>{t('P')}</Text>
        </TouchableOpacity>
      </View>
      <Loader visible={isloading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  userInforUpload: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInforAvatar: {
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInforName: {},
  captionInput: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  titleInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 5,
    marginBottom: 20,
  },
  input: {
    flex: 1,
  },
  chooseMediaButton: {
    backgroundColor: THEME_COLOR,
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  selectedImage: {
    width: 300,
    height: 200,
    marginBottom: 20,
    borderRadius: 5,
  },
  postOptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    marginRight: 10,
    color: TEXT_COLOR,
  },
  postButton: {
    backgroundColor: THEME_COLOR,
    padding: 10,
    borderRadius: 5,
  },
  postButtonText: {
    color: TEXT_COLOR,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Upload;
