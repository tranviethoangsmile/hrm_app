import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import axios from 'axios';
import {
  API,
  BASE_URL,
  UPLOAD_AVATAR,
  USER_URL,
  PORT,
  V1,
  VERSION,
} from '../utils/Strings';
import Loader from './Loader';

const UploadAvatar = ({visible, closeModal, t, user_id, avatar_url}) => {
  const [imageUri, setImageUri] = useState(null);
  const [imageName, setImageName] = useState('');
  const [isloading, setIsloading] = useState(false);
  const showAlert = mess => {
    Alert.alert('Notification!! ', mess);
  };
  const handleChoiceImage = async () => {
    try {
      const image = await DocumentPicker.pickSingle({
        type: DocumentPicker.types.images,
        allowMultiSelection: false,
      });
      const maxSizeInBytes = 10 * 1024 * 1024; // 5MB
      if (image.size > maxSizeInBytes) {
        showAlert(t('size'));
      } else {
        setImageUri(image.uri);
        setImageName(image.name);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUploadImage = async () => {
    try {
      setIsloading(!isloading);
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageUri,
        type: 'image/jpeg',
        name: imageName,
      });
      formData.append('id', user_id);
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}${UPLOAD_AVATAR}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      setIsloading(false);
      showAlert(t('success'));
      closeModal();
    } catch (error) {
      console.log(error);
      showAlert(t('unSuccess'));
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={closeModal}>
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.modalTitle}>Avatar Upload</Text>
            </View>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.body}>
            <TouchableOpacity onPress={handleChoiceImage}>
              <Image
                source={
                  avatar_url
                    ? {uri: avatar_url}
                    : require('../images/avatar.jpg')
                }
                style={styles.avatar}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleUploadImage}
              style={styles.updateButton}>
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Loader visible={isloading} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#999',
  },
  body: {
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  updateButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default UploadAvatar;
