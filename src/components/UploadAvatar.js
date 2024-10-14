import React, {useState, useEffect} from 'react';
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
} from '../utils/constans';
import Loader from './Loader';
import RNFS from 'react-native-fs';
import {launchImageLibrary} from 'react-native-image-picker';

const UploadAvatar = ({visible, closeModal, t, user_id, avatar_url}) => {
  const [imageUri, setImageUri] = useState(null);
  const [imageName, setImageName] = useState('');
  const [isloading, setIsloading] = useState(false);
  const [updateDisabled, setUpdateDisabled] = useState(true);
  const getRealPathFromURI = async uri => {
    if (Platform.OS === 'android') {
      const fileStat = await RNFS.stat(uri);
      return fileStat.path;
    }
    return uri;
  };
  const handleImagePicker = () => {
    const options = {
      mediaType: 'image',
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
        setImageName(asset.fileName);
        setImageUri(realUri);
      }
    });
  };

  useEffect(() => {
    setUpdateDisabled(!imageUri);
  }, [imageUri]);

  const showAlert = mess => {
    Alert.alert('Notification!! ', mess);
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
      if (response?.data?.success) {
        setIsloading(false);
        showAlert(t('success'));
        closeModal();
      } else {
        showAlert(t('unSuccess'));
        setIsloading(false);
        closeModal();
      }
    } catch (error) {
      setIsloading(false);
      showAlert(t('unSuccess'));
    } finally {
      setIsloading(false);
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
            <TouchableOpacity onPress={handleImagePicker}>
              <Image
                source={
                  imageUri
                    ? {uri: imageUri}
                    : require('../assets/images/avatar.jpg')
                }
                style={styles.avatar}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleUploadImage}
              style={[
                styles.updateButton,
                updateDisabled && styles.disabledButton,
              ]}>
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
  disabledButton: {
    backgroundColor: 'gray',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default UploadAvatar;
