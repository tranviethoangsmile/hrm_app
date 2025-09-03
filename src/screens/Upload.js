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
import moment from 'moment';
import LinkPreview from 'react-native-link-preview';
import ModalMessage from '../components/ModalMessage';
import {useNavigation} from '@react-navigation/native';
import Loader from '../components/Loader';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

const PostInput = ({onPost, loading, onShowMessage}) => {
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const user = authData?.data?.data;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [errorTitle, setErrorTitle] = useState(false);
  const [errorContent, setErrorContent] = useState(false);

  const pickImage = () => {
    ImagePicker.launchImageLibrary({mediaType: 'photo'}, response => {
      if (
        !response.didCancel &&
        response.assets &&
        response.assets.length > 0
      ) {
        setImage(response.assets[0]);
      }
    });
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
    <View style={styles.inputBlockModern}>
      <TextInput
        style={[styles.inputTitleModern, errorTitle && styles.inputError]}
        placeholder={t('til')}
        placeholderTextColor="#b0b3b8"
        value={title}
        onChangeText={handleTitleChange}
        maxLength={100}
      />
      <TextInput
        style={[styles.inputContentModern, errorContent && styles.inputError]}
        placeholder={t('what_are_you_thinking', 'Bạn đang nghĩ gì?')}
        placeholderTextColor="#b0b3b8"
        value={content}
        onChangeText={handleContentChange}
        multiline
        maxLength={1000}
      />
      {image && (
        <View style={styles.mediaPreviewModern}>
          <Image source={{uri: image.uri}} style={styles.mediaImageModern} />
          <TouchableOpacity
            onPress={() => setImage(null)}
            style={styles.removeMediaBtnModern}>
            <Icon name="close" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.inputActionsRowModern}>
        <TouchableOpacity style={styles.inputIconBtnModern} onPress={pickImage}>
          <Icon name="image" size={20} color={THEME_COLOR_2} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.privacyBtnModern}
          onPress={() => setIsPublic(v => !v)}>
          <Icon
            name={isPublic ? 'globe' : 'lock'}
            size={18}
            color={isPublic ? THEME_COLOR_2 : '#b0b3b8'}
          />
        </TouchableOpacity>
        <View style={{flex: 1}} />
        <TouchableOpacity
          style={styles.postBtnModern}
          onPress={handlePost}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Icon name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
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
    <View style={styles.feedBlock}>
      {showMenu && (
        <TouchableOpacity
          style={styles.menuBtnFlat}
          onPress={() => setMenuVisible(true)}>
          <Icon name="ellipsis-v" size={18} color="#b0b3b8" />
        </TouchableOpacity>
      )}
      {item.title ? <Text style={styles.feedTitle}>{item.title}</Text> : null}
      <Text style={styles.feedContent}>{item.content}</Text>
      {linkPreview && (
        <TouchableOpacity
          style={styles.linkPreviewBoxFlat}
          onPress={() => onPressLink(linkPreview.url)}
          activeOpacity={0.7}>
          {linkPreview.image && (
            <Image
              source={{uri: linkPreview.image}}
              style={styles.linkPreviewImgFlat}
            />
          )}
          <View style={{flex: 1, marginLeft: linkPreview.image ? 12 : 0}}>
            <Text style={styles.linkPreviewTitleFlat} numberOfLines={2}>
              {linkPreview.title}
            </Text>
            {linkPreview.description ? (
              <Text style={styles.linkPreviewDescFlat} numberOfLines={2}>
                {linkPreview.description}
              </Text>
            ) : null}
            <Text style={styles.linkPreviewUrlFlat} numberOfLines={1}>
              {linkPreview.url}
            </Text>
          </View>
          <Icon name="external-link" size={16} color="#667eea" style={{marginLeft: 8}} />
        </TouchableOpacity>
      )}
      {item.media && (
        <Image source={{uri: item.media}} style={styles.feedImage} />
      )}
      <Text style={styles.feedDate}>
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
          <View style={styles.menuModal}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onEdit(item);
              }}>
              <Icon name="edit" size={18} color={THEME_COLOR_2} />
              <Text style={styles.menuText}>{t('edit')}</Text>
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
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
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
        style={{flex: 1, backgroundColor: '#f5f6fa'}}>
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
            <>
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
                <View style={styles.feedSeparator} />
              )}
            </>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{paddingBottom: 40, paddingTop: 4}}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator color={THEME_COLOR} />
            ) : (
              <Text
                style={{
                  color: '#b0b3b8',
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
      <Loader visible={isLoading || posting} />
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
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 16,
    marginBottom: 20,
    marginTop: 12,
    padding: 20,
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  inputTitleModern: {
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontWeight: '500',
  },
  inputContentModern: {
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  inputActionsRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  inputIconBtnModern: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  privacyBtnModern: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  postBtnModern: {
    backgroundColor: '#667eea',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mediaPreviewModern: {
    marginTop: 8,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  mediaImageModern: {
    width: 120,
    height: 120,
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
  feedBlock: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    marginTop: 0,
    lineHeight: 24,
  },
  feedContent: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 12,
    lineHeight: 24,
  },
  linkPreviewBoxFlat: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  linkPreviewImgFlat: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#ddd',
  },
  linkPreviewTitleFlat: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 1,
  },
  linkPreviewDescFlat: {
    color: '#888',
    fontSize: 13,
    marginBottom: 1,
  },
  linkPreviewUrlFlat: {
    color: THEME_COLOR_2,
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
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 8,
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
    backgroundColor: '#23272f',
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
    color: '#fff',
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
