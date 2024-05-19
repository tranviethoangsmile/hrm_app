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
  TouchableNativeFeedback,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import CheckBox from '@react-native-community/checkbox';
import VideoPlayer from 'react-native-video-player';
import Loader from './Loader';
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
import axios from 'axios';
import {TEXT_COLOR, THEME_COLOR, THEME_COLOR_2} from '../utils/Colors';
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
  const [fileSelected, setFileSelected] = useState(false); // State to track file selection

  const showAlert = message => {
    Alert.alert(t('noti'), message);
  };

  const handlePostInformation = async () => {
    try {
      setError(null);
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
      if (response?.data?.success) {
        setIsloading(false);
        showAlert(t('success'));
        setContent('');
        setMediaUri(null);
        setMediaName('');
        setIsVideo(false);
        setTitle('');
        setFileSelected(false); // Reset file selection state
        onClose(); // Close the modal
        setError(null);
        refresh();
      } else {
        setIsloading(false);
        showAlert(t('unSuccess'));
      }
    } catch (error) {
      setIsloading(false); // Dừng hiển thị loader
      setError('Failed to post information. Please try again.'); //
    }
  };

  const chooseMedia = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images, DocumentPicker.types.video],
        allowMultiSelection: false,
      });

      setMediaName(res.name);
      setIsVideo(res.type === 'video/mp4' || res.type === 'video/quicktime');
      setMediaUri(res.uri);
      setFileSelected(true); // Set fileSelected to true when file is selected
      Keyboard.dismiss(); // Dismiss the keyboard
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the file selection.');
      } else {
        console.log('Error: ', err);
      }
    }
  };

  const closeModal = () => {
    setContent('');
    setMediaUri(null);
    setMediaName('');
    setIsVideo(false);
    setTitle('');
    setFileSelected(false);
    setError(null);
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
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            placeholder={t('til')}
            style={styles.input}
            onChangeText={text => setTitle(text)}
            placeholderTextColor={THEME_COLOR_2}
          />
          <TextInput
            placeholder={t('post')}
            style={[styles.input, styles.captionInput]}
            onChangeText={text => setContent(text)}
            placeholderTextColor={THEME_COLOR_2}
            multiline
            numberOfLines={5}
            onFocus={() => {
              if (fileSelected) Keyboard.dismiss();
            }}
          />
          <TouchableOpacity
            onPress={chooseMedia}
            style={styles.chooseMediaButton}>
            <Text>{t('choo')}</Text>
          </TouchableOpacity>
          {mediaUri && (
            <View style={styles.mediaContainer}>
              {isVideo ? (
                <VideoPlayer
                  autoplay={false}
                  video={{uri: mediaUri}}
                  defaultMuted={true}
                  videoWidth={300}
                  videoHeight={200}
                  thumbnail={require('../assets/images/thumbnail.jpg')}
                />
              ) : (
                <Image source={{uri: mediaUri}} style={styles.selectedImage} />
              )}
            </View>
          )}
          <View style={styles.postOptions}>
            <CheckBox
              tintColors={{true: 'red', false: 'black'}}
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
        </View>
      </View>
      <Loader visible={isloading} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  input: {
    color: TEXT_COLOR,
    borderBottomWidth: 1,
    borderColor: THEME_COLOR_2,
    marginBottom: 20,
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
    borderRadius: 5,
  },
  mediaContainer: {
    marginBottom: 20,
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
  captionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    color: TEXT_COLOR,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_COLOR,
  },
  closeButton: {
    fontSize: 20,
    color: TEXT_COLOR,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default PostInformationModal;
