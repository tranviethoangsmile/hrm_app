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

const {width} = Dimensions.get('window');

const PostInput = ({onPost, loading}) => {
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const user = authData?.data?.data;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [modal, setModal] = useState({
    visible: false,
    type: 'info',
    message: '',
  });
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
      setModal({
        visible: true,
        type: 'error',
        message: 'Vui lòng nhập tiêu đề và nội dung',
      });
      return;
    }
    setErrorTitle(false);
    setErrorContent(false);
    onPost({title, content, image, is_public: isPublic, setModal});
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
        placeholder={t('til', 'Tiêu đề')}
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
      <ModalMessage
        isVisible={modal.visible}
        type={modal.type}
        message={modal.message}
        onClose={() => setModal({...modal, visible: false})}
        duration={1800}
        t={t}
      />
    </View>
  );
};

// Hàm nhận diện link trong text
function extractFirstUrl(text) {
  const urlRegex =
    /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)|(www\.[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/gi;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
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
            title: data.title || url,
            description: data.description || '',
            image:
              data.images && data.images.length > 0 ? data.images[0] : null,
            url: data.url || url,
          });
        })
        .catch(e => {
          setLinkPreview(null);
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
          onPress={() => onPressLink(linkPreview.url)}>
          {linkPreview.image && (
            <Image
              source={{uri: linkPreview.image}}
              style={styles.linkPreviewImgFlat}
            />
          )}
          <View style={{flex: 1, marginLeft: 10}}>
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
              <Text style={styles.menuText}>Chỉnh sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onDelete(item.id);
              }}>
              <Icon name="trash" size={18} color="#e74c3c" />
              <Text style={[styles.menuText, {color: '#e74c3c'}]}>Xóa</Text>
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
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [modal, setModal] = useState({
    visible: false,
    type: 'info',
    message: '',
  });

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
      showAlert(error.message);
    }
  };

  useEffect(() => {
    getInformationPostedOfUser();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    getInformationPostedOfUser();
    setRefreshing(false);
  };

  const showModal = (type, message) => {
    setModal({visible: true, type, message});
  };

  const handlePost = async ({
    title,
    content,
    image,
    is_public,
    setModal: setInputModal,
  }) => {
    if (!title.trim() && !content.trim()) {
      if (setInputModal)
        setInputModal({
          visible: true,
          type: 'error',
          message: 'Vui lòng nhập tiêu đề hoặc nội dung',
        });
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
        if (setInputModal)
          setInputModal({
            visible: true,
            type: 'success',
            message: 'Đăng bài thành công!',
          });
        showModal('success', 'Đăng bài thành công!');
        getInformationPostedOfUser();
      } else {
        if (setInputModal)
          setInputModal({
            visible: true,
            type: 'error',
            message: 'Đăng bài thất bại!',
          });
        showModal('error', 'Đăng bài thất bại!');
      }
    } catch (e) {
      if (setInputModal)
        setInputModal({visible: true, type: 'error', message: e.message});
      showModal('error', e.message);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async id => {
    setIsLoading(true);
    try {
      const result = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${INFORMATION}${DELETE_INFORMATION_BY_ID}`,
        {id},
      );
      if (result.data.success) {
        showAlert('success');
        getInformationPostedOfUser();
      } else {
        showAlert('unSuccess');
      }
    } catch (e) {
      showAlert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePressLink = url => {
    Linking.openURL(url);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={{flex: 1, backgroundColor: '#f5f6fa'}}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f6fa" />
      <FlatList
        ListHeaderComponent={
          <PostInput onPost={handlePost} loading={posting} />
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
            {index < posts.length - 1 && <View style={styles.feedSeparator} />}
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
  );
};

const styles = StyleSheet.create({
  inputBlockModern: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    marginHorizontal: 12,
    marginBottom: 18,
    marginTop: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  inputTitleModern: {
    fontSize: 16,
    color: '#222',
    backgroundColor: '#f5f6fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e4e6eb',
  },
  inputContentModern: {
    fontSize: 16,
    color: '#222',
    backgroundColor: '#f5f6fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 60,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    marginBottom: 10,
  },
  inputActionsRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  inputIconBtnModern: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#f5f6fa',
    marginRight: 8,
  },
  privacyBtnModern: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#f5f6fa',
    marginRight: 8,
  },
  postBtnModern: {
    backgroundColor: THEME_COLOR,
    borderRadius: 22,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME_COLOR,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
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
    backgroundColor: 'transparent',
    paddingVertical: 0,
    marginBottom: 18,
    marginHorizontal: 0,
    position: 'relative',
  },
  feedTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
    marginTop: 0,
    paddingHorizontal: 20,
  },
  feedContent: {
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  linkPreviewBoxFlat: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    padding: 10,
    marginTop: 6,
    marginBottom: 2,
    marginHorizontal: 16,
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
    height: 220,
    borderRadius: 14,
    marginTop: 10,
    backgroundColor: '#eee',
    marginBottom: 2,
  },
  feedDate: {
    fontSize: 12,
    color: '#b0b3b8',
    marginTop: 6,
    marginBottom: 0,
    paddingHorizontal: 20,
  },
  menuBtnFlat: {
    position: 'absolute',
    top: 8,
    right: 12,
    zIndex: 2,
    padding: 4,
    borderRadius: 16,
    backgroundColor: 'transparent',
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
    height: 1,
    backgroundColor: '#e4e6eb',
    marginHorizontal: 16,
    borderRadius: 1,
    marginBottom: 2,
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2.5,
    borderRadius: 10,
  },
});

export default Upload;
