import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Keyboard,
  Platform,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import Video from 'react-native-video';
import {launchImageLibrary} from 'react-native-image-picker';
import OptimizedLoader from './OptimizedLoader';
import moment from 'moment';
import {
  API,
  BASE_URL,
  CREATE,
  INFORMATION,
  PORT,
  V1,
  VERSION,
} from '../utils/constans';
import axios from 'axios';
import {TEXT_COLOR, THEME_COLOR, THEME_COLOR_2} from '../utils/Colors';
import RNFS from 'react-native-fs';

const PostInformationModal = ({visible, onClose, t, USER_IF, refresh}) => {
  const date = moment().format('YYYY-MM-DD');
  const [content, setContent] = useState('');
  const [mediaUri, setMediaUri] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [mediaName, setMediaName] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState(null);
  const [fileSelected, setFileSelected] = useState(false);
  const getRealPathFromURI = async uri => {
    if (Platform.OS === 'android') {
      const fileStat = await RNFS.stat(uri);
      return fileStat.path;
    }
    return uri;
  };
  const handleImagePicker = () => {
    const options = {
      mediaType: 'mixed',
      quality: 1,
      selectionLimit: 1,
    };

    // Mở thư viện ảnh hoặc video
    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('Người dùng đã hủy việc chọn ảnh.');
      } else if (response.errorCode) {
        console.log('Lỗi: ', response.errorCode);
      } else {
        const asset = response.assets[0];
        const realUri = await getRealPathFromURI(asset.uri);
        setMediaName(asset.fileName);
        setIsVideo(asset.type.includes('video'));
        setMediaUri(realUri);
        setFileSelected(true);
        Keyboard.dismiss();
      }
    });
  };

  const showAlert = message => {
    Alert.alert(t('noti'), message);
  };

  const handlePostInformation = async () => {
    try {
      setError(null);
      setIsloading(true);
      const formData = new FormData();
      if (mediaUri) {
        formData.append('media', {
          uri: mediaUri,
          type: isVideo ? 'video/mp4' : 'image/jpeg',
          name: mediaName,
        });
      }
      formData.append('user_id', USER_IF.id);
      formData.append('title', title);
      formData.append('content', content);
      formData.append('date', date);
      formData.append('is_video', isVideo);
      formData.append('is_public', isPublic);

      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${INFORMATION}${CREATE}`,
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );

      if (response?.data?.success) {
        setIsloading(false);
        showAlert(t('success'));
        resetForm();
        onClose();
        refresh();
      } else {
        setIsloading(false);
        showAlert(t('unSuccess'));
      }
    } catch (error) {
      setIsloading(false);
      setError('Failed to post information. Please try again.');
    } finally {
      setIsloading(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setMediaUri(null);
    setMediaName('');
    setIsVideo(false);
    setTitle('');
    setFileSelected(false);
    setError(null);
  };

  const closeModal = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={closeModal}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <View style={styles.header}>
            <Text style={styles.modalTitle}>
              {t('Up')} {t('info')}
            </Text>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            placeholder={t('til')}
            style={styles.input}
            onChangeText={setTitle}
            placeholderTextColor={THEME_COLOR_2}
            value={title}
          />
          <TextInput
            placeholder={t('post')}
            style={[styles.input, styles.captionInput]}
            onChangeText={setContent}
            placeholderTextColor={THEME_COLOR_2}
            multiline
            numberOfLines={5}
            value={content}
            onFocus={() => {
              if (fileSelected) Keyboard.dismiss();
            }}
          />
          <TouchableOpacity
            onPress={handleImagePicker}
            style={styles.chooseMediaButton}>
            <Text style={styles.chooseMediaButtonText}>{t('choo')}</Text>
          </TouchableOpacity>
          {mediaUri && (
            <View style={styles.mediaContainer}>
              {isVideo ? (
                <Video
                  source={{uri: mediaUri}}
                  style={{width: '100%', height: 200, borderRadius: 10}}
                  controls={true}
                  paused={true}
                  resizeMode="cover"
                  poster={require('../assets/images/thumbnail.jpg')}
                  posterResizeMode="cover"
                />
              ) : (
                <Image source={{uri: mediaUri}} style={styles.selectedImage} />
              )}
            </View>
          )}
          <View style={styles.postOptions}>
            <CheckBox
              tintColors={{true: THEME_COLOR, false: 'black'}}
              value={isPublic}
              onValueChange={setIsPublic}
              style={styles.checkbox}
            />
            <Text style={styles.label}>{t('pub')}</Text>
            <TouchableOpacity
              onPress={handlePostInformation}
              style={styles.postButton}>
              <Text style={styles.postButtonText}>{t('P')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <OptimizedLoader visible={isloading} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: TEXT_COLOR,
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 22,
    color: THEME_COLOR,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  input: {
    color: TEXT_COLOR,
    borderBottomWidth: 1,
    borderColor: THEME_COLOR_2,
    marginBottom: 20,
    fontSize: 16,
  },
  captionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  chooseMediaButton: {
    backgroundColor: THEME_COLOR,
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  chooseMediaButtonText: {
    color: 'white',
    fontSize: 16,
  },
  mediaContainer: {
    marginBottom: 20,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  postOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkbox: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    color: TEXT_COLOR,
  },
  postButton: {
    backgroundColor: THEME_COLOR,
    padding: 10,
    borderRadius: 5,
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PostInformationModal;
