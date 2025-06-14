import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
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
import ModalMessage from './ModalMessage';

const UploadAvatar = ({
  visible,
  closeModal,
  t,
  user_id,
  avatar_url,
  onSuccess,
}) => {
  const [imageUri, setImageUri] = useState(null);
  const [imageName, setImageName] = useState('');
  const [isloading, setIsloading] = useState(false);
  const [updateDisabled, setUpdateDisabled] = useState(true);
  const [messageModal, setMessageModal] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1000);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);

  const showMessage = (msg, type, dur) => {
    setMessageModalVisible(true);
    setMessageModal(msg);
    setMessageType(type);
    setDuration(dur);
  };

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

  const handleUploadImage = async () => {
    try {
      setIsloading(true);
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
        showMessage(t('success'), 'success', 1000);
        if (onSuccess) {
          onSuccess();
        }
        setTimeout(() => {
          setMessageModalVisible(false);
          closeModal();
        }, 1000);
      } else {
        setIsloading(false);
        showMessage(t('unSuccess'), 'error', 1000);
      }
    } catch (error) {
      setIsloading(false);
      showMessage(t('unSuccess'), 'error', 1000);
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
        <ModalMessage
          visible={isMessageModalVisible}
          message={messageModal}
          type={messageType}
          duration={duration}
          onClose={() => setMessageModalVisible(false)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
  },
  body: {
    alignItems: 'center',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  updateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default UploadAvatar;
