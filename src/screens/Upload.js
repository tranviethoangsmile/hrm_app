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
  FlatList,
  Linking,
  TextInput,
  ActivityIndicator,
  Modal,
  Dimensions,
  ActionSheetIOS,
} from 'react-native';
import {useSelector} from 'react-redux';
import Video from 'react-native-video';
import axios from 'axios';
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
import {
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
  BG_COLOR,
} from '../utils/Colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useTranslation} from 'react-i18next';
import * as ImagePicker from 'react-native-image-picker';
// Alternative: import ImagePicker from 'react-native-image-crop-picker';
// Alternative: import DocumentPicker from 'react-native-document-picker';
import moment from 'moment';
import LinkPreview from 'react-native-link-preview';
import ModalMessage from '../components/ModalMessage';
import {useNavigation} from '@react-navigation/native';
import OptimizedLoader from '../components/OptimizedLoader';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../hooks/useTheme';

const {width} = Dimensions.get('window');

const PostInput = ({onPost, loading, onShowMessage}) => {
  const {t} = useTranslation();
  const {colors, isDarkMode} = useTheme();
  const authData = useSelector(state => state.auth);
  const user = authData?.data?.data;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [errorTitle, setErrorTitle] = useState(false);
  const [errorContent, setErrorContent] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);

  const pickImage = () => {
    setIsPickingImage(true);
    
    // iOS-optimized configuration
    const options = {
      mediaType: 'photo',
      quality: Platform.OS === 'ios' ? 0.3 : 0.5,
      includeBase64: false,
      maxWidth: Platform.OS === 'ios' ? 800 : 1024,
      maxHeight: Platform.OS === 'ios' ? 800 : 1024,
      allowsEditing: false,
      selectionLimit: 1,
    };

    console.log('Launching image library with iOS-optimized options:', options);

    // Shorter timeout for iOS to prevent hanging
    const timeoutId = setTimeout(() => {
      console.log('ImagePicker timeout - resetting state');
      setIsPickingImage(false);
      Alert.alert('Lỗi', 'Hết thời gian chờ. Vui lòng thử lại.');
    }, Platform.OS === 'ios' ? 15000 : 30000);

    ImagePicker.launchImageLibrary(options, (response) => {
      clearTimeout(timeoutId);
      setIsPickingImage(false);
      console.log('ImagePicker Response:', response);
      
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }
      
      if (response.error) {
        console.log('ImagePicker Error:', response.error);
        Alert.alert('Lỗi', 'Không thể chọn ảnh: ' + response.error);
        return;
      }
      
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        console.log('Selected image:', asset);
        setImage(asset);
      } else if (response.uri) {
        console.log('Selected image (old API):', response);
        setImage(response);
      } else {
        console.log('No image selected');
        Alert.alert('Lỗi', 'Không có ảnh nào được chọn');
      }
    });
  };

  const pickImageFromCamera = () => {
    setIsPickingImage(true);
    
    // iOS-optimized camera configuration
    const options = {
      mediaType: 'photo',
      quality: Platform.OS === 'ios' ? 0.5 : 0.7,
      maxWidth: Platform.OS === 'ios' ? 800 : 1024,
      maxHeight: Platform.OS === 'ios' ? 800 : 1024,
      includeBase64: false,
      allowsEditing: false,
      selectionLimit: 1,
    };

    console.log('Launching camera with iOS-optimized options:', options);

    // Add timeout for camera as well
    const timeoutId = setTimeout(() => {
      console.log('Camera timeout - resetting state');
      setIsPickingImage(false);
      Alert.alert('Lỗi', 'Hết thời gian chờ. Vui lòng thử lại.');
    }, Platform.OS === 'ios' ? 15000 : 30000);

    ImagePicker.launchCamera(options, (response) => {
      clearTimeout(timeoutId);
      setIsPickingImage(false);
      console.log('Camera Response:', response);
      
      if (response.didCancel) {
        console.log('User cancelled camera');
        return;
      }
      
      if (response.error) {
        console.log('Camera Error:', response.error);
        Alert.alert('Lỗi', 'Không thể chụp ảnh: ' + response.error);
        return;
      }
      
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        console.log('Captured image:', asset);
        setImage(asset);
      } else if (response.uri) {
        console.log('Captured image (old API):', response);
        setImage(response);
      } else {
        console.log('No image captured');
        Alert.alert('Lỗi', 'Không có ảnh nào được chụp');
      }
    });
  };

  // iOS ActionSheet method to avoid modal conflicts
  const showImagePickerIOS = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Hủy', 'Chọn từ thư viện', 'Chụp ảnh mới'],
          cancelButtonIndex: 0,
          title: 'Chọn ảnh',
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            pickImage();
          } else if (buttonIndex === 2) {
            pickImageFromCamera();
          }
        }
      );
    }
  };


  const handlePost = () => {
    let hasError = false;
    if (!title.trim()) {
      setErrorTitle(true);
      hasError = true;
    } else {
      setErrorTitle(false);
    }
    if (!content.trim()) {
      setErrorContent(true);
      hasError = true;
    } else {
      setErrorContent(false);
    }
    if (hasError) {
      if (onShowMessage) onShowMessage('upload.input_required', 'error', 1800);
      return;
    }
    setErrorTitle(false);
    setErrorContent(false);
    onPost({title, content, image, is_public: isPublic});
    setTitle('');
    setContent('');
    setImage(null);
    setIsPublic(true);
  };
  const handleTitleChange = text => {
    setTitle(text);
    if (errorTitle && text.trim()) setErrorTitle(false);
  };
  const handleContentChange = text => {
    setContent(text);
    if (errorContent && text.trim()) setErrorContent(false);
  };
  return (
    <View style={[styles.inputBlockModern, {backgroundColor: colors.surface}]}>
      {/* Simple header */}
      <View style={styles.inputHeaderModern}>
        <View style={[styles.userAvatarModern, {backgroundColor: colors.primary}]}>
          <Text style={styles.userAvatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
        </View>
        <Text style={[styles.userNameModern, {color: colors.text}]}>{user?.name || 'User'}</Text>
        <View style={{flex: 1}} />
        <TouchableOpacity 
          style={[styles.privacyBtnModern, {backgroundColor: colors.background}]}
          onPress={() => setIsPublic(!isPublic)}>
          <Icon name={isPublic ? "globe" : "lock"} size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Input fields */}
      <TextInput
        style={[
          styles.inputTitleModern, 
          {backgroundColor: colors.background, color: colors.text, borderColor: colors.border},
          errorTitle && styles.inputError
        ]}
        placeholder={t('til')}
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={handleTitleChange}
        maxLength={100}
      />
      <TextInput
        style={[
          styles.inputContentModern, 
          {backgroundColor: colors.background, color: colors.text, borderColor: colors.border},
          errorContent && styles.inputError
        ]}
        placeholder={t('what_are_you_thinking', 'Bạn đang nghĩ gì?')}
        placeholderTextColor={colors.textSecondary}
        value={content}
        onChangeText={handleContentChange}
        multiline
        maxLength={1000}
      />

      {/* Media preview */}
      {image && (
        <View style={styles.mediaPreviewModern}>
          <Image source={{uri: image.uri}} style={styles.mediaImageModern} />
          <TouchableOpacity
            onPress={() => setImage(null)}
            style={styles.removeMediaBtnModern}>
            <Icon name="close" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.inputActionsRowModern}>
        <TouchableOpacity 
          style={[styles.inputIconBtnModern, {backgroundColor: colors.background}]}
          onPress={() => {
            if (Platform.OS === 'ios') {
              // Use ActionSheet for iOS to avoid modal conflicts
              showImagePickerIOS();
            } else {
              setShowImagePicker(true);
            }
          }}
          disabled={isPickingImage}>
          {isPickingImage ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Icon name="image" size={18} color={colors.primary} />
          )}
        </TouchableOpacity>
        <View style={{flex: 1}} />
        <TouchableOpacity 
          style={[styles.postBtnModern, {backgroundColor: colors.primary}]}
          onPress={handlePost}
          disabled={loading || isPickingImage}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={{color: '#fff', fontWeight: '600', fontSize: 14}}>
              {t('post', 'Đăng')}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}>
        <View style={styles.imagePickerModal}>
          <View style={[styles.imagePickerContent, {backgroundColor: colors.surface}]}>
            <Text style={[styles.imagePickerTitle, {color: colors.text}]}>
              Chọn ảnh
            </Text>
            <TouchableOpacity
              style={[styles.imagePickerOption, {backgroundColor: colors.background}]}
              onPress={() => {
                setShowImagePicker(false);
                // Add delay for iOS to prevent modal conflict
                setTimeout(() => {
                  pickImage();
                }, Platform.OS === 'ios' ? 500 : 100);
              }}
              disabled={isPickingImage}>
              <Icon name="photo" size={24} color={colors.primary} />
              <Text style={[styles.imagePickerOptionText, {color: colors.text}]}>
                {isPickingImage ? 'Đang tải...' : 'Chọn từ thư viện'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.imagePickerOption, {backgroundColor: colors.background}]}
              onPress={() => {
                setShowImagePicker(false);
                // Add delay for iOS to prevent modal conflict
                setTimeout(() => {
                  pickImageFromCamera();
                }, Platform.OS === 'ios' ? 500 : 100);
              }}
              disabled={isPickingImage}>
              <Icon name="camera" size={24} color={colors.primary} />
              <Text style={[styles.imagePickerOptionText, {color: colors.text}]}>
                {isPickingImage ? 'Đang tải...' : 'Chụp ảnh mới'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.imagePickerCancel, {backgroundColor: colors.background}]}
              onPress={() => setShowImagePicker(false)}>
              <Text style={[styles.imagePickerCancelText, {color: colors.text}]}>
                Hủy
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Hàm nhận diện link trong text - Cải thiện regex
function extractFirstUrl(text) {
  if (!text) return null;
  
  // Regex pattern mạnh hơn để nhận diện nhiều loại URL
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}[^\s]*)/gi;
  const matches = text.match(urlRegex);
  
  if (matches && matches.length > 0) {
    let url = matches[0];
    
    // Thêm protocol nếu thiếu
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    return url;
  }
  
  return null;
}

const PostCard = ({item, onDelete, onEdit, onPressLink, showMenu}) => {
  const {t} = useTranslation();
  const {colors, isDarkMode} = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [linkPreview, setLinkPreview] = useState(null);
  useEffect(() => {
    const url = extractFirstUrl(item.content);
    
    if (url) {
      LinkPreview.getPreview(url)
        .then(data => {
          setLinkPreview({
            title: data.title || 'Link Preview',
            description: data.description || '',
            image: data.images && data.images.length > 0 ? data.images[0] : null,
            url: data.url || url,
          });
        })
        .catch(e => {
          // Fallback: tạo preview đơn giản
          setLinkPreview({
            title: url,
            description: 'Click to open link',
            image: null,
            url: url,
          });
        });
    } else {
      setLinkPreview(null);
    }
  }, [item.content]);
  return (
    <View style={[styles.feedBlock, {backgroundColor: colors.surface}]}>
      {showMenu && (
        <TouchableOpacity
          style={styles.menuBtnFlat}
          onPress={() => setMenuVisible(true)}>
          <Icon name="ellipsis-v" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
      {item.title ? <Text style={[styles.feedTitle, {color: colors.text}]}>{item.title}</Text> : null}
      <Text style={[styles.feedContent, {color: colors.textSecondary}]}>{item.content}</Text>
      {linkPreview && (
        <TouchableOpacity
          style={[styles.linkPreviewBoxFlat, {backgroundColor: colors.background, borderColor: colors.border}]}
          onPress={() => onPressLink(linkPreview.url)}
          activeOpacity={0.7}>
          {linkPreview.image && (
            <Image
              source={{uri: linkPreview.image}}
              style={styles.linkPreviewImgFlat}
            />
          )}
          <View style={{flex: 1, marginLeft: linkPreview.image ? 12 : 0}}>
            <Text style={[styles.linkPreviewTitleFlat, {color: colors.text}]} numberOfLines={2}>
              {linkPreview.title}
            </Text>
            {linkPreview.description ? (
              <Text style={[styles.linkPreviewDescFlat, {color: colors.textSecondary}]} numberOfLines={2}>
                {linkPreview.description}
              </Text>
            ) : null}
            <Text style={[styles.linkPreviewUrlFlat, {color: colors.primary}]} numberOfLines={1}>
              {linkPreview.url}
            </Text>
          </View>
          <Icon name="external-link" size={16} color={colors.primary} style={{marginLeft: 8}} />
        </TouchableOpacity>
      )}
      {item.media && (
        <Image source={{uri: item.media}} style={styles.feedImage} />
      )}
      <Text style={[styles.feedDate, {color: colors.textSecondary}]}>
        {moment(item.date).format('DD/MM/YYYY HH:mm')}
      </Text>
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}>
          <View style={[styles.menuModal, {backgroundColor: colors.surface}]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onEdit(item);
              }}>
              <Icon name="edit" size={18} color={colors.primary} />
              <Text style={[styles.menuText, {color: colors.text}]}>{t('edit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onDelete(item.id);
              }}>
              <Icon name="trash" size={18} color="#e74c3c" />
              <Text style={[styles.menuText, {color: '#e74c3c'}]}>
                {t('delete')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const Upload = () => {
  const {t} = useTranslation();
  const {colors, isDarkMode} = useTheme();
  const authData = useSelector(state => state.auth);
  const USER_IF = authData?.data?.data;
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  // State cho ModalMessage
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  const [messageModal, setMessageModal] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1500);

  // Hàm showMessage chuẩn
  const showMessage = React.useCallback((msg, type, dur) => {
    setMessageModalVisible(true);
    setMessageModal(msg);
    setMessageType(type);
    setDuration(dur);
  }, []);

  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
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
      }
    } catch (error) {
      setIsLoading(false);
      showMessage(error.message, 'error', 1500);
    }
  };

  React.useEffect(() => {
    getInformationPostedOfUser();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    getInformationPostedOfUser();
    setRefreshing(false);
  };

  // Sử dụng showMessage khi đăng bài thành công/thất bại
  const handlePost = async ({title, content, image, is_public}) => {
    if (!title.trim() && !content.trim()) {
      showMessage(t('upload.input_required'), 'error', 1800);
      return;
    }
    setPosting(true);
    try {
      let res;
      const date = moment().format('YYYY-MM-DD');
      const formData = new FormData();
      formData.append('user_id', USER_IF.id);
      formData.append('title', title);
      formData.append('content', content);
      formData.append('is_public', is_public);
      formData.append('date', date);
      if (image) {
        formData.append('media', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || 'photo.jpg',
        });
      }
      res = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${INFORMATION}/create`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      if (res?.data?.success) {
        showMessage(t('upload.success'), 'success', 1500);
        getInformationPostedOfUser();
      } else {
        showMessage(t('upload.unSuccess'), 'error', 1500);
      }
    } catch (e) {
      showMessage(e.message, 'error', 1500);
    } finally {
      setPosting(false);
    }
  };

  // Sử dụng showMessage khi xóa bài thành công/thất bại
  const handleDelete = async id => {
    setIsLoading(true);
    try {
      const result = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${INFORMATION}${DELETE_INFORMATION_BY_ID}`,
        {id},
      );
      if (result.data.success) {
        showMessage('success', 'success', 1500);
        getInformationPostedOfUser();
      } else {
        showMessage('unSuccess', 'error', 1500);
      }
    } catch (e) {
      showMessage(e.message, 'error', 1500);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePressLink = url => {
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={isDarkMode ? ['#1a1a2e', '#16213e'] : ['#667eea', '#764ba2']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {t('upload.title', 'Tải lên')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        style={{flex: 1, backgroundColor: colors.background}}>
        <FlatList
          ListHeaderComponent={
            <PostInput
              onPost={handlePost}
              loading={posting}
              onShowMessage={showMessage}
            />
          }
          data={posts}
          keyExtractor={item => item.id?.toString()}
          renderItem={({item, index}) => (
            <View style={styles.feedItemContainer}>
              <PostCard
                item={item}
                onDelete={handleDelete}
                onEdit={() => {
                  /* TODO: handle edit */
                }}
                onPressLink={handlePressLink}
                showMenu={true}
              />
              {index < posts.length - 1 && (
                <View style={[styles.feedSeparator, {backgroundColor: colors.border}]} />
              )}
            </View>
          )}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={{paddingBottom: 40, paddingTop: 4}}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text
                style={{
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginTop: 40,
                  fontSize: 15,
                }}>
                {t('no_posts', 'Chưa có bài đăng nào')}
              </Text>
            )
          }
        />
      </KeyboardAvoidingView>
      {/* Loader ngoài cùng */}
      <OptimizedLoader visible={isLoading || posting} />
      {/* ModalMessage ngoài cùng */}
      <ModalMessage
        isVisible={isMessageModalVisible}
        onClose={() => setMessageModalVisible(false)}
        message={messageModal}
        type={messageType}
        t={t}
        duration={duration}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44,
    paddingBottom: 12,
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 5,
  },
  backButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  inputBlockModern: {
    width: '100%',
    borderRadius: 0,
    borderWidth: 0,
    marginBottom: 0,
    marginTop: 0,
    padding: 16,
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  inputHeaderModern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatarModern: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  userInfoModern: {
    flex: 1,
  },
  userNameModern: {
    fontSize: 14,
    fontWeight: '600',
  },
  userStatusModern: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputFieldsModern: {
    marginBottom: 16,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  imagePickerModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  imagePickerContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  imagePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  imagePickerOptionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  imagePickerCancel: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  imagePickerCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
  },
  inputTitleModern: {
    fontSize: 14,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    fontWeight: '500',
  },
  inputContentModern: {
    fontSize: 14,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 60,
    borderWidth: 1,
    marginBottom: 12,
    textAlignVertical: 'top',
    fontWeight: '400',
  },
  inputActionsRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  inputIconBtnModern: {
    padding: 8,
    borderRadius: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  privacyBtnModern: {
    padding: 8,
    borderRadius: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  postBtnModern: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  mediaPreviewModern: {
    marginTop: 8,
    position: 'relative',
    alignSelf: 'flex-start',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaImageModern: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  removeMediaBtnModern: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#000a',
    borderRadius: 12,
    padding: 2,
  },
  feedItemContainer: {
    width: '100%',
  },
  feedBlock: {
    width: '100%',
    borderRadius: 0,
    padding: 16,
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    position: 'relative',
  },
  feedSeparator: {
    height: 0.5,
    marginHorizontal: 16,
    marginVertical: 0,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 0,
    lineHeight: 20,
  },
  feedContent: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  linkPreviewBoxFlat: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  linkPreviewImgFlat: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#ddd',
  },
  linkPreviewTitleFlat: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 1,
  },
  linkPreviewDescFlat: {
    fontSize: 13,
    marginBottom: 1,
  },
  linkPreviewUrlFlat: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  feedImage: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginTop: 12,
    backgroundColor: '#f1f5f9',
    marginBottom: 8,
  },
  feedDate: {
    fontSize: 11,
    marginTop: 4,
    marginBottom: 0,
    fontWeight: '500',
  },
  menuBtnFlat: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 2,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModal: {
    borderRadius: 12,
    padding: 16,
    minWidth: 160,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  menuText: {
    fontSize: 15,
    marginLeft: 10,
  },
  feedSeparator: {
    height: 8,
    backgroundColor: 'transparent',
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2.5,
    borderRadius: 10,
  },
});

export default Upload;
