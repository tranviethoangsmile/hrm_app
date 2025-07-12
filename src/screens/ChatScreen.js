/* eslint-disable no-shadow */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, useRef, Fragment} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StatusBar,
  ActivityIndicator,
  Modal,
  Dimensions,
  Linking,
} from 'react-native';
import Video from 'react-native-video';
import RNFS from 'react-native-fs';
import Clipboard from '@react-native-clipboard/clipboard';
import LinearGradient from 'react-native-linear-gradient';
import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';
import {useSelector} from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EmojiSelector from 'react-native-emoji-selector';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  API,
  BASE_URL,
  PORT,
  V1,
  VERSION,
  MESSAGE,
  SEARCH_MESSAGE_WITH_CONVERSATION,
  UNSEND,
  DELETE,
  API_KEY_GOOGLE,
  CREATE,
} from '../utils/constans';
import socket from '../socket.io/socket.io';
import {Loader} from '../components';
import {encrypt, decrypt} from '../services';
import {ModalMessage} from '../components';
import MediaViewer from '../components/common/MediaViewer';
import defaultAvatar from '../assets/images/avatar.jpg';
import {COLORS, SIZES, FONTS, SHADOWS} from '../config/theme';
import LinkPreview from 'react-native-link-preview';
import IconFA from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';

const extractFirstUrl = text => {
  if (!text) return null;
  const urlRegex =
    /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)|(www\.[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/gi;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
};

// Hàm chèn nhãn ngày vào danh sách tin nhắn
function injectDateLabels(messages) {
  if (!messages.length) return [];
  let result = [];
  let lastDate = null;
  let dateKeyCount = {};
  messages.forEach(msg => {
    const msgDate = moment(msg.created_at).startOf('day');
    if (!lastDate || !msgDate.isSame(lastDate)) {
      let label = '';
      if (msgDate.isSame(moment(), 'day')) label = 'today';
      else if (msgDate.isSame(moment().subtract(1, 'day'), 'day'))
        label = 'yesterday';
      else label = msgDate.format('DD/MM/YYYY');
      // Tạo key unique cho nhãn ngày
      const baseId = `date-${msgDate.format('YYYYMMDD')}`;
      if (!dateKeyCount[baseId]) dateKeyCount[baseId] = 0;
      else dateKeyCount[baseId]++;
      const uniqueId =
        dateKeyCount[baseId] === 0
          ? baseId
          : `${baseId}-${dateKeyCount[baseId]}`;
      result.push({
        type: 'date',
        label,
        id: uniqueId,
      });
      lastDate = msgDate;
    }
    result.push({...msg, type: 'message'});
  });
  return result;
}

const ChatScreen = ({route}) => {
  const textInputRef = React.useRef(null);
  const {conversationId, friendName, friendAvatar} = route.params;
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [notMessage, setNotMessage] = useState('not.mess');
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const USER_INFOR = authData?.data?.data;
  const [isLoading, setIsloading] = useState(false);
  const flatListRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY_GOOGLE}`;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageModal, setMessageModal] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1000);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  const navigation = useNavigation();
  const [uploadingMedia, setUploadingMedia] = useState(null);
  // 1. Thêm state lưu vị trí modal
  const [modalPosition, setModalPosition] = useState({top: null, left: null});
  const [isTranslating, setIsTranslating] = useState(false);
  const [linkPreviews, setLinkPreviews] = useState({});
  const [selectedMedia, setSelectedMedia] = useState(null);

  const showMessage = (msg, type, dur) => {
    setMessageModalVisible(true);
    setMessageModal(msg);
    setMessageType(type);
    setDuration(dur);
  };
  const handleEmojiSelect = emoji => {
    setMessage(prevMessage => prevMessage + emoji);
  };
  const handleToggleEmojiPicker = () => {
    Keyboard.dismiss();
    setShowEmojiPicker(!showEmojiPicker);
  };
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  function getMessageType(asset) {
    if (!asset.type || asset.type === '') {
      return 'text';
    }
    if (asset.type.startsWith('image/')) {
      return 'IMAGE';
    } else if (asset.type.startsWith('video/')) {
      return 'VIDEO';
    } else if (asset.type === 'application/pdf') {
      return 'DOCUMENT';
    }
    return 'OTHER';
  }

  const handleImagePicker = () => {
    const options = {
      mediaType: 'mixed',
      quality: 1,
      selectionLimit: 1,
    };

    const getRealPathFromURI = async uri => {
      if (Platform.OS === 'android') {
        const fileStat = await RNFS.stat(uri);
        return fileStat.path;
      }
      return uri;
    };
    launchImageLibrary(options, async response => {
      if (response.didCancel) {
      } else if (response.errorCode) {
      } else {
        const asset = response.assets[0];
        setUploadingMedia({
          uri: asset.uri,
          percent: 0,
          type: getMessageType(asset),
        });
        try {
          const realUri = await getRealPathFromURI(asset.uri);
          const form = new FormData();
          form.append('media', {
            uri: realUri,
            name: asset.fileName,
            type: asset.type || 'image/jpeg',
          });
          const res = await axios.post(
            `${BASE_URL}${PORT}${API}${VERSION}${V1}${MESSAGE}${CREATE}`,
            form,
            {
              headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
              },
              onUploadProgress: progressEvent => {
                const percent = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total,
                );
                setUploadingMedia(prev => (prev ? {...prev, percent} : null));
              },
            },
          );
          if (!res?.data.success) {
            showMessage('image.send.error', 'error', 2000);
          }
          const newMessage = {
            conversation_id: conversationId,
            user_id: USER_INFOR.id,
            message: res?.data.data,
            message_type: getMessageType(asset),
          };
          socket.emit('send-message', newMessage);
          Keyboard.dismiss();
          setShowEmojiPicker(false);
        } catch (error) {
          showMessage('image.send.error', 'error', 2000);
          if (error.response) {
            showMessage('networkError', 'error', 2000);
          } else if (error.request) {
            showMessage('networkError', 'error', 2000);
          } else {
            showMessage('networkError', 'error', 2000);
          }
        } finally {
          setUploadingMedia(null);
        }
      }
    });
  };

  const handleSend = () => {
    try {
      setIsloading(true);
      if (message.trim()) {
        const newMessage = {
          conversation_id: conversationId,
          user_id: USER_INFOR.id,
          message: encrypt(message, conversationId),
          message_type: 'TEXT',
        };

        socket.emit('send-message', newMessage);
        setMessage('');
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({animated: true});
        }, 300);
      } else {
        showMessage('networkError', 'error', 2000);
        setIsloading(false);
      }
    } catch (error) {
      showMessage('networkError', 'error', 2000);
    } finally {
      setIsloading(false);
    }
  };

  const getAllMessage = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${MESSAGE}${SEARCH_MESSAGE_WITH_CONVERSATION}`,
        {
          conversation_id: conversationId,
        },
      );

      if (!response?.data.success) {
        setNotMessage('not.mess');
      } else {
        const messages = response?.data.data || [];
        const filteredMessages = messages.filter(message => {
          const deleteMessages = Array.isArray(message.delete_messages)
            ? message.delete_messages
            : [];
          const isDeletedByUser = deleteMessages.some(
            deleteMessage => deleteMessage.user_id === USER_INFOR.id,
          );
          return !isDeletedByUser;
        });

        // Load tin nhắn đã dịch từ AsyncStorage
        const lang = await getLanguage();
        const targetLang =
          lang === 'vi'
            ? 'vi'
            : lang === 'ja'
            ? 'ja'
            : lang === 'pt'
            ? 'pt'
            : 'en';

        const messagesWithTranslations = await Promise.all(
          filteredMessages.map(async msg => {
            const translationKey = `translation_${conversationId}_${msg.id}_${targetLang}`;
            const translatedText = await AsyncStorage.getItem(translationKey);
            return translatedText
              ? {...msg, translatedMessage: translatedText}
              : msg;
          }),
        );

        setMessages(messagesWithTranslations);
      }
    } catch (error) {
      showMessage('networkError', 'error', 2000);
      setNotMessage('err.load.mess');
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    getAllMessage();
    const handleNewMessage = newMessage => {
      setMessages(prevMessages => [...prevMessages, newMessage.data]);
    };

    socket.emit('joinConversation', conversationId);
    socket.on(`${conversationId}`, handleNewMessage);
    socket.on('message_un_sended', data => {
      if (data.success) {
        showMessage('un_send', 'success', 1000);
        setMessages(prevMessages =>
          prevMessages.map(message => {
            if (message.id === data.id) {
              return {
                ...message,
                is_unsend: true,
              };
            }
            return message;
          }),
        );
      } else {
        showMessage('unSuccess', 'error', 2000);
      }
    });

    socket.on('deleted_message', data => {
      if (data.success) {
        showMessage('delete.success', 'success', 1000);
        getAllMessage();
      } else {
        showMessage('unSuccess', 'error', 2000);
      }
    });

    return () => {
      socket.off(`${conversationId}`, handleNewMessage);
    };
  }, [conversationId]);

  // 1. Refactor modal position and style for Messenger-like floating effect
  const messagesWithDateLabels = React.useMemo(() => {
    const sortedMessages = [...messages]
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .filter(
        (message, index, self) =>
          index === 0 || message.id !== self[index - 1].id,
      );
    return injectDateLabels(sortedMessages);
  }, [messages]);

  // 2. Fix keyExtractor for FlatList
  const keyExtractor = React.useCallback((item, index) => {
    if (item.type === 'date') {
      return item.id;
    }
    return `message-${item.id}`;
  }, []);

  // 3. Ensure messagesWithDateLabels is memoized and not mutated
  const renderItem = React.useCallback(
    ({item, index}) => {
      if (item.type === 'date') {
        return (
          <View style={styles.dateLabelContainer}>
            <Text
              style={{
                color: '#888',
                fontSize: 13,
                overflow: 'hidden',
              }}>
              {item.label === 'today' || item.label === 'yesterday'
                ? safeTranslate(item.label, item.label)
                : item.label}
            </Text>
          </View>
        );
      }
      const isUser = item.user_id === USER_INFOR.id;

      // Tìm tin nhắn tiếp theo trong messagesWithDateLabels để xác định isLastFromSender
      const nextItem = messagesWithDateLabels[index + 1];
      const isLastFromSender =
        !nextItem ||
        nextItem.type === 'date' ||
        nextItem.user_id !== item.user_id;

      return (
        <Message
          item={item}
          isUser={isUser}
          isLastFromSender={isLastFromSender}
          handleLongPress={handleLongPress}
        />
      );
    },
    [USER_INFOR.id, messagesWithDateLabels, t],
  );

  // Get selected message for options
  const selectedMessage = messages.find(msg => msg.id === selectedMessageId);
  const isSelectedMessageUser = selectedMessage?.user_id === USER_INFOR.id;

  // Memory optimization for large message lists
  const optimizeMemory = React.useCallback(() => {
    if (messages.length > 100) {
      // Keep only the last 50 messages in memory for performance
      setMessages(prevMessages => prevMessages.slice(-50));
    }
  }, [messages.length]);

  React.useEffect(() => {
    optimizeMemory();
  }, [optimizeMemory]);

  // Improved translation error handling
  const safeTranslate = React.useCallback(
    (key, fallback = '') => {
      try {
        const result = t(key);
        return result === key ? fallback : result;
      } catch (error) {
        return fallback;
      }
    },
    [t],
  );

  // Re-add handlers and Message component above the return statement
  const handleDeleteMessage = async messageId => {
    try {
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${MESSAGE}${UNSEND}`,
        {
          message_id: messageId,
        },
      );
      if (response?.data.success) {
        showMessage('unsend.success', 'success', 500);
        getAllMessage();
      } else {
        showMessage('unsend.error', 'error', 2000);
      }
    } catch (error) {
      showMessage('networkError', 'error', 2000);
    }
  };

  const handleUnsendMessage = async messageId => {
    try {
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${MESSAGE}${UNSEND}`,
        {
          message_id: messageId,
        },
      );
      if (response?.data.success) {
        showMessage('unsend.success', 'success', 500);
        getAllMessage();
      } else {
        showMessage('unsend.error', 'error', 2000);
      }
    } catch (error) {
      showMessage('networkError', 'error', 2000);
    }
  };

  const handleCopy = async messageId => {
    const msg = messages.find(msg => msg.id === messageId);
    if (msg) {
      const messageToCopy =
        msg.translatedMessage || decrypt(msg.message, conversationId);
      Clipboard.setString(messageToCopy);
      showMessage('copy.success', 'success', 500);
    }
  };

  const handleMediaPress = (mediaUrl, mediaType, messageInfo) => {
    setSelectedMedia({
      url: mediaUrl,
      type: mediaType,
      postInfo: {
        user: messageInfo.user_name || friendName,
        content:
          messageInfo.translatedMessage ||
          decrypt(messageInfo.message, conversationId),
        date: messageInfo.created_at,
        is_event: false,
      },
    });
  };

  const handleOutsidePress = () => {
    setShowOptions(false);
    setSelectedMessageId(null);
  };

  const handleFocusInput = () => {
    textInputRef.current?.focus();
  };

  const handleTranslateMessage = async messageId => {
    const messageToTranslate = messages.find(msg => msg.id === messageId);
    if (!messageToTranslate) return;

    const originalMessage = decrypt(messageToTranslate.message, conversationId);

    // Kiểm tra nếu tin nhắn rỗng hoặc không có nội dung
    if (!originalMessage || originalMessage.trim() === '') {
      showMessage('translate.error', 'error', 1000);
      return;
    }

    try {
      setIsTranslating(true);
      // Sử dụng POST với JSON data như Google Translate API yêu cầu
      const data = {
        q: originalMessage,
        target: i18n.language,
        format: 'text',
      };
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response?.data?.data?.translations?.[0]?.translatedText) {
        const translatedText =
          response.data.data.translations[0].translatedText;
        const newMessage = {
          ...messageToTranslate,
          translatedMessage: translatedText,
        };
        setMessages(prevMessages =>
          prevMessages.map(msg => (msg.id === messageId ? newMessage : msg)),
        );
        showMessage('translate.success', 'success', 1000);
        setShowOptions(false); // Tắt modal khi dịch thành công
      } else {
        showMessage('translate.error', 'error', 2000);
        setShowOptions(false); // Tắt modal khi có lỗi
      }
    } catch (error) {
      console.error('Translation error:', error);

      // Kiểm tra nếu là rate limit error
      if (
        error.response?.data?.error?.code === 403 &&
        error.response?.data?.error?.message?.includes('Rate Limit')
      ) {
        showMessage('translate.rate.limit', 'error', 3000);
        setShowOptions(false); // Tắt modal khi bị rate limit
      } else {
        showMessage('networkError', 'error', 2000);
        setShowOptions(false); // Tắt modal khi có lỗi network
      }
    } finally {
      setIsTranslating(false);
    }
  };

  // Định nghĩa lại handleLongPress trong ChatScreen
  const handleLongPress = (message, ref) => {
    if (ref && ref.current) {
      ref.current.measure((fx, fy, width, height, px, py) => {
        setModalPosition({top: py - 80, left: px + width / 2});
        setSelectedMessageId(message.id);
        setShowOptions(true);
      });
    } else {
      setSelectedMessageId(message.id);
      setShowOptions(true);
    }
  };

  // Sửa lại Message component thành function component chuẩn
  // Component LinkPreview
  const LinkPreview = React.memo(function LinkPreview({url}) {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (url && !linkPreviews[url]) {
        fetchLinkPreview(url);
      } else if (url && linkPreviews[url]) {
        setPreview(linkPreviews[url]);
      }
    }, [url]);

    const fetchLinkPreview = async linkUrl => {
      setLoading(true);
      try {
        // Parse URL thủ công vì React Native không hỗ trợ URL.hostname
        let fullUrl = linkUrl;
        if (!linkUrl.startsWith('http')) {
          fullUrl = `https://${linkUrl}`;
        }

        // Extract domain và path thủ công
        const urlRegex = /^https?:\/\/([^\/]+)(.*)$/;
        const match = fullUrl.match(urlRegex);

        if (match) {
          const domain = match[1].replace('www.', '');
          const path = match[2] || '';

          // Tạo title từ domain
          let title = domain.charAt(0).toUpperCase() + domain.slice(1);
          if (path && path !== '/') {
            const pathParts = path.split('/').filter(part => part.length > 0);
            if (pathParts.length > 0) {
              const lastPart = pathParts[pathParts.length - 1];
              title += ' ' + lastPart.replace(/[-_]/g, ' ').substring(0, 20);
            }
          }

          const previewData = {
            title: title,
            description: `Visit ${domain}`,
            url: linkUrl,
            domain: domain,
          };
          setPreview(previewData);
          setLinkPreviews(prev => ({...prev, [linkUrl]: previewData}));
        } else {
          setPreview({title: 'Link', url: linkUrl});
        }
      } catch (error) {
        console.log('Failed to parse URL:', error);
        setPreview({title: 'Link', url: linkUrl});
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <View style={styles.linkPreviewContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.linkPreviewLoading}>Loading preview...</Text>
        </View>
      );
    }

    if (!preview) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.linkPreviewContainer}
        onPress={() => Linking.openURL(preview.url)}
        activeOpacity={0.7}>
        <View style={styles.linkPreviewIconContainer}>
          <Icon name="link" size={18} color="#007AFF" />
        </View>
        <View style={styles.linkPreviewContent}>
          <Text style={styles.linkPreviewTitle} numberOfLines={2}>
            {preview.title}
          </Text>
          {preview.description && (
            <Text style={styles.linkPreviewDescription} numberOfLines={2}>
              {preview.description}
            </Text>
          )}
          <Text style={styles.linkPreviewUrl} numberOfLines={1}>
            {preview.url}
          </Text>
        </View>
      </TouchableOpacity>
    );
  });

  const Message = React.memo(function Message({
    item,
    isUser,
    isLastFromSender,
    handleLongPress,
  }) {
    const messageRef = React.useRef(null);
    const isDeleted = item.is_unsend || item.is_deleted;
    const messageText =
      item.translatedMessage || decrypt(item.message, conversationId);
    const isLink = extractFirstUrl(messageText);
    const isImage = item.message_type === 'IMAGE';
    const isVideo = item.message_type === 'VIDEO';
    const isDocument = item.message_type === 'DOCUMENT';
    const isOther = item.message_type === 'OTHER';

    // Nếu là hình ảnh hoặc video, không sử dụng background color
    const shouldUseBackground = !isImage && !isVideo;

    return (
      <View
        ref={messageRef}
        style={[
          shouldUseBackground
            ? isUser
              ? styles.userMessageContainer
              : styles.otherMessageContainer
            : isUser
            ? styles.userMediaMessageContainer
            : styles.mediaMessageContainer,
          isDeleted && styles.unsendMessageContainer,
        ]}>
        <TouchableOpacity
          onLongPress={() => handleLongPress(item, messageRef)}
          delayLongPress={500}
          activeOpacity={0.8}
          style={styles.messageContainer}>
          <Text
            style={[
              isUser ? styles.userMessageText : styles.otherMessageText,
              isDeleted && styles.unsendMessageText,
            ]}>
            {messageText}
          </Text>
          {isLink && <LinkPreview url={isLink} />}
          {isImage && (
            <View style={styles.mediaWrapper}>
              <TouchableOpacity
                onPress={() => handleMediaPress(item.message, 'image', item)}
                activeOpacity={0.9}>
                <Image source={{uri: item.message}} style={styles.imageStyle} />
              </TouchableOpacity>
            </View>
          )}
          {isVideo && (
            <View style={styles.mediaWrapper}>
              <TouchableOpacity
                onPress={() => handleMediaPress(item.message, 'video', item)}
                activeOpacity={0.9}>
                <Video
                  source={{uri: item.message}}
                  style={styles.videoStyle}
                  controls={false}
                  resizeMode="cover"
                />
                <View style={styles.playIcon}>
                  <Icon
                    name="play-circle"
                    size={40}
                    color="rgba(255,255,255,0.9)"
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}
          {isDocument && (
            <View style={styles.documentContainer}>
              <IconFA name="file-o" size={20} color="#4A90E2" />
              <Text style={styles.documentText}>{item.message}</Text>
            </View>
          )}
          {isOther && (
            <View style={styles.otherMessageTextContainer}>
              <Text style={styles.otherMessageText}>{item.message}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  });

  return (
    <React.Fragment>
      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={handleOutsidePress}>
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.actionModalContainer,
                modalPosition.top !== null && modalPosition.left !== null
                  ? {
                      position: 'absolute',
                      top: modalPosition.top,
                      left: Math.max(
                        8,
                        Math.min(
                          modalPosition.left - 60,
                          Dimensions.get('window').width - 136,
                        ),
                      ),
                      // 120 là tổng width modal, 8 là padding lề, 136 là max lề phải
                      minWidth: undefined,
                      margin: 0,
                    }
                  : {},
              ]}>
              <View style={styles.actionGrid}>
                {isSelectedMessageUser ? (
                  <>
                    <TouchableOpacity
                      style={styles.actionItem}
                      onPress={() => handleDeleteMessage(selectedMessageId)}>
                      <View
                        style={[
                          styles.actionIcon,
                          {
                            backgroundColor: '#ff4444',
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                          },
                        ]}>
                        <Ionicons name="trash-outline" size={12} color="#fff" />
                      </View>
                      <Text style={styles.actionText}>{t('delete')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionItem}
                      onPress={() => handleUnsendMessage(selectedMessageId)}>
                      <View
                        style={[
                          styles.actionIcon,
                          {
                            backgroundColor: '#ff9500',
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                          },
                        ]}>
                        <Ionicons
                          name="close-circle-outline"
                          size={12}
                          color="#fff"
                        />
                      </View>
                      <Text style={styles.actionText}>{t('back_to_chat')}</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.actionItem}
                      onPress={() => handleTranslateMessage(selectedMessageId)}
                      disabled={isTranslating}>
                      <View
                        style={[
                          styles.actionIcon,
                          {
                            backgroundColor: '#007AFF',
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                          },
                        ]}>
                        {isTranslating ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Ionicons
                            name="language-outline"
                            size={12}
                            color="#fff"
                          />
                        )}
                      </View>
                      <Text style={styles.actionText}>
                        {isTranslating ? t('translating') : t('tranS')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionItem}
                      onPress={() => handleCopy(selectedMessageId)}>
                      <View
                        style={[
                          styles.actionIcon,
                          {
                            backgroundColor: '#34C759',
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                          },
                        ]}>
                        <Ionicons name="copy-outline" size={12} color="#fff" />
                      </View>
                      <Text style={styles.actionText}>{t('copy')}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <SafeAreaView style={styles.container}>
            <StatusBar
              barStyle="light-content"
              backgroundColor="transparent"
              translucent
            />
            <LinearGradient
              colors={['#4A90E2', '#357ABD', '#1E3A8A']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.headerContainer}>
              <View style={styles.headerContent}>
                <TouchableOpacity
                  style={styles.headerBackBtn}
                  onPress={() => navigation.goBack()}>
                  <IconFA name="arrow-left" size={20} color="#fff" />
                </TouchableOpacity>

                <View style={styles.userInfoContainer}>
                  <Image
                    source={friendAvatar ? {uri: friendAvatar} : defaultAvatar}
                    style={styles.userAvatar}
                  />
                  <View style={styles.userDetails}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {friendName}
                    </Text>
                    <View style={styles.encryptedMessageContainer}>
                      <Icon
                        name="lock-closed-sharp"
                        size={12}
                        color="rgba(255,255,255,0.8)"
                        style={styles.lockIcon}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.headerActionsCompact}>
                  <TouchableOpacity style={styles.headerActionBtnCompact}>
                    <Icon name="call" color="#fff" size={18} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.headerActionBtnCompact}>
                    <Icon name="videocam" color="#fff" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>

            {messages.length === 0 ? (
              <View style={styles.notMessageContainer}>
                <Text style={styles.notMessageText}>
                  {safeTranslate(notMessage, 'No messages to display')}
                </Text>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={messagesWithDateLabels}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.messagesList}
                contentInset={{bottom: 65}}
                onEndReached={getAllMessage}
                onEndReachedThreshold={0.1}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
                initialNumToRender={10}
                getItemLayout={(data, index) => ({
                  length: 80, // Approximate height of each item
                  offset: 80 * index,
                  index,
                })}
                ListFooterComponent={
                  isLoading ? (
                    <ActivityIndicator size="small" color="#888" />
                  ) : null
                }
              />
            )}

            {uploadingMedia && (
              <View style={styles.mediaContainer}>
                {uploadingMedia.type === 'IMAGE' ? (
                  <Image
                    source={{uri: uploadingMedia.uri}}
                    style={styles.media}
                  />
                ) : (
                  <Video
                    source={{uri: uploadingMedia.uri}}
                    style={styles.media}
                  />
                )}
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.percentText}>
                    {uploadingMedia.percent}%
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleToggleEmojiPicker}>
                <Icon name="happy-outline" color={THEME_COLOR} size={24} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleImagePicker}>
                <Icon name="images-outline" color={THEME_COLOR} size={24} />
              </TouchableOpacity>

              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                value={message}
                onChangeText={setMessage}
                placeholder={safeTranslate('tymess', 'Type your message...')}
                placeholderTextColor="#999"
                onFocus={handleFocusInput}
              />

              <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                <Icon name="send" color="#FFF" size={24} />
              </TouchableOpacity>
            </View>

            {showEmojiPicker && (
              <View style={styles.showEmojiTab}>
                <EmojiSelector
                  onEmojiSelected={handleEmojiSelect}
                  showSearchBar={false}
                  columns={8}
                  showTabs={true}
                  showSectionTitles={true}
                />
              </View>
            )}

            {isMessageModalVisible && (
              <ModalMessage
                isVisible={isMessageModalVisible}
                onClose={() => setMessageModalVisible(false)}
                message={messageModal}
                type={messageType}
                t={t}
                duration={duration}
              />
            )}
            <MediaViewer
              visible={!!selectedMedia}
              onClose={() => setSelectedMedia(null)}
              mediaUrl={selectedMedia?.url}
              mediaType={selectedMedia?.type}
              postInfo={selectedMedia?.postInfo}
            />
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius * 2,
    marginVertical: 4,
    padding: 12,
    maxWidth: '75%',
    marginRight: 10,
    position: 'relative',
    ...SHADOWS.light,
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lightGray1,
    borderRadius: SIZES.radius * 2,
    marginVertical: 4,
    padding: 12,
    maxWidth: '75%',
    marginLeft: 10,
    position: 'relative',
    ...SHADOWS.light,
  },
  mediaMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginVertical: 4,
    padding: 8,
    maxWidth: '75%',
    marginLeft: 10,
    position: 'relative',
    backdropFilter: 'blur(10px)',
  },
  userMediaMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
    marginVertical: 4,
    padding: 8,
    maxWidth: '75%',
    marginRight: 10,
    position: 'relative',
    backdropFilter: 'blur(10px)',
  },
  senderAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    position: 'absolute',
    bottom: -12,
    left: -12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D1D1',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.text,
  },
  translatedMessageText: {
    fontStyle: 'italic',
    color: '#4A90E2',
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messageContainer: {
    padding: 5,
    marginBottom: 5,
  },
  unsendMessageContainer: {
    opacity: 0.7,
  },
  unsendMessageText: {
    color: '#A9A9A9',
    fontStyle: 'italic',
  },
  optionsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    elevation: 10,
    flexDirection: 'row',
    padding: 8,
    marginTop: 5,
    justifyContent: 'space-around',
    zIndex: 9999,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  options: {
    justifyContent: 'space-around',
  },
  optionButton: {
    padding: 5,
  },
  optionText: {
    color: THEME_COLOR,
    fontSize: 16,
  },
  encryptedMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockIcon: {
    marginRight: 4,
  },
  headerContainer: {
    paddingTop: (StatusBar.currentHeight || 44) + 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  headerActionsCompact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionBtnCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  imageStyle: {
    width: 200,
    height: 200,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 0,
    backgroundColor: 'transparent',
  },
  videoStyle: {
    width: 250,
    height: 150,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  mediaWrapper: {
    marginVertical: 0,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -20}, {translateY: -20}],
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  iconButton: {
    paddingHorizontal: 10,
  },
  textInput: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    backgroundColor: '#E9E9E9',
    fontSize: 16,
    color: '#003366',
  },
  sendButton: {
    backgroundColor: THEME_COLOR,
    borderRadius: 25,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userMessageText: {
    color: COLORS.white,
  },
  otherMessageText: {
    color: COLORS.text,
  },
  notMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notMessageText: {
    fontSize: 18,
    color: '#777',
  },
  showEmojiTab: {
    height: 250,
    backgroundColor: 'white',
    zIndex: 1000,
    elevation: 4,
  },
  linkPreviewBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 10,
    marginTop: 10,
    marginBottom: 4,
    ...SHADOWS.light,
  },
  linkPreviewImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray2,
  },
  linkPreviewUrl: {
    color: COLORS.primary,
    fontSize: 10,
    textDecorationLine: 'underline',
    flexShrink: 1,
  },
  linkPreviewContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
    maxWidth: '100%',
    alignSelf: 'flex-start',
  },
  linkPreviewIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  linkPreviewContent: {
    flex: 1,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  linkPreviewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
    flexShrink: 1,
  },
  linkPreviewDescription: {
    fontSize: 11,
    color: '#6c757d',
    marginBottom: 2,
    flexShrink: 1,
  },
  linkPreviewLoading: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 8,
  },
  mediaContainer: {
    width: 150,
    height: 150,
    position: 'relative',
    margin: 8,
    alignSelf: 'flex-end',
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  percentText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModalContainer: {
    backgroundColor: '#23232a',
    borderRadius: 14,
    padding: 6,
    margin: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.13,
    shadowRadius: 3,
    elevation: 3,
    minWidth: undefined,
    maxWidth: 200,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionItem: {
    alignItems: 'center',
    margin: 2,
    minWidth: 36,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  actionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 0,
  },
  dateLabelContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
});

export default ChatScreen;
