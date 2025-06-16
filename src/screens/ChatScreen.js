/* eslint-disable no-shadow */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, useRef} from 'react';
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
} from 'react-native';
import Video from 'react-native-video';
import RNFS from 'react-native-fs';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
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
import defaultAvatar from '../assets/images/avatar.jpg';
import {COLORS, SIZES, FONTS, SHADOWS} from '../config/theme';
import LinkPreview from 'react-native-link-preview';
import IconFA from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import moment from 'moment';

const extractFirstUrl = text => {
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
  messages.forEach(msg => {
    // Giả sử msg.createdAt là timestamp hoặc ISO string
    const msgDate = moment(msg.created_at).startOf('day');
    if (!lastDate || !msgDate.isSame(lastDate)) {
      let label = '';
      if (msgDate.isSame(moment(), 'day')) label = 'Hôm nay';
      else if (msgDate.isSame(moment().subtract(1, 'day'), 'day'))
        label = 'Hôm qua';
      else label = msgDate.format('DD/MM/YYYY');
      result.push({
        type: 'date',
        label,
        id: `date-${msgDate.format('YYYYMMDD')}`,
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
  const [notMessage, setNotMessage] = useState('');
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
        console.log('Người dùng đã hủy việc chọn ảnh.');
      } else if (response.errorCode) {
        console.log('Lỗi: ', response.errorCode);
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
        setMessages(filteredMessages);
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

  useEffect(() => {
    flatListRef.current?.scrollToEnd({animated: true});
  }, [messages]);

  const handleLongPress = message => {
    setSelectedMessageId(message.id);
    setShowOptions(true);
  };

  const handleUnsendMessage = async messageId => {
    try {
      socket.emit('un_send_message', {
        message_id: messageId,
        conversation_id: conversationId,
      });
      setShowOptions(false);
    } catch (error) {
      showMessage('networkError', 'error', 2000);
    } finally {
      setShowOptions(false);
    }
  };

  const handleDeleteMessage = async messageId => {
    try {
      socket.emit('delete_message', {
        message_id: messageId,
        user_id: USER_INFOR.id,
        conversation_id: conversationId,
      });
      setShowOptions(false);
    } catch (error) {
      showMessage('networkError', 'error', 2000);
    } finally {
      setShowOptions(false);
    }
  };

  const handleCopy = async messageId => {
    try {
      const messageToCopy = messages.find(msg => msg.id === messageId);
      if (!messageToCopy) {
        showMessage('copy.not.success', 'error', 1500);
        return;
      }
      Clipboard.setString(decrypt(messageToCopy.message, conversationId));
      showMessage('co.py', 'success', 1000);
      setShowOptions(false);
    } catch (error) {
      showMessage('err', 'error', 1500);
    } finally {
      setShowOptions(false);
      setSelectedMessageId(null);
    }
  };

  const handleTranslateMessage = async messageId => {
    try {
      const lang = await getLanguage();
      const messageToTranslate = messages.find(msg => msg.id === messageId);

      if (!messageToTranslate) {
        throw new Error('Message not found');
      }

      const response = await axios.post(url, {
        q: decrypt(messageToTranslate.message, conversationId),
        target: lang,
        key: API_KEY_GOOGLE,
      });

      if (
        !response ||
        !response.data ||
        !response.data.data ||
        !response.data.data.translations ||
        response.data.data.translations.length === 0
      ) {
        throw new Error('Translation error');
      }

      const translatedText = response.data.data.translations[0]?.translatedText;
      if (!translatedText) {
        throw new Error('Translation not found');
      }
      setShowOptions(false);
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId
            ? {...msg, translatedMessage: translatedText}
            : msg,
        ),
      );
    } catch (error) {
      showMessage('networkError', 'error', 1500);
    } finally {
      setShowOptions(false);
    }
  };
  const handleFocusInput = () => {
    if (showEmojiPicker) {
      setShowEmojiPicker(false);
    }
  };
  const handleOutsidePress = () => {
    setShowOptions(false);
    setSelectedMessageId(null);
    handleToggleEmojiPicker(false);
    Keyboard.dismiss();
  };

  const Message = ({item, isUser, isLastFromSender}) => {
    const [linkPreview, setLinkPreview] = React.useState(null);
    React.useEffect(() => {
      if (item.message_type === 'TEXT') {
        const text =
          item.translatedMessage || decrypt(item.message, conversationId);
        const url = extractFirstUrl(text);
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
            .catch(() => setLinkPreview(null));
        } else {
          setLinkPreview(null);
        }
      } else {
        setLinkPreview(null);
      }
    }, [item]);

    if (item.message_type === 'IMAGE') {
      return (
        <View
          style={{
            alignItems: isUser ? 'flex-end' : 'flex-start',
            marginVertical: 4,
          }}>
          <TouchableOpacity
            onLongPress={() => handleLongPress(item)}
            activeOpacity={0.95}>
            <Image
              source={{uri: item.message}}
              style={styles.imageStyle}
              resizeMode="cover"
            />
          </TouchableOpacity>
          {!isUser && isLastFromSender && (
            <Image
              source={
                item?.user.avatar ? {uri: item?.user.avatar} : defaultAvatar
              }
              style={styles.senderAvatar}
            />
          )}
          {showOptions && selectedMessageId === item.id && (
            <View style={styles.optionsContainer}>
              {isUser ? (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        t('dl.mess'),
                        '',
                        [
                          {
                            text: t('dl'),
                            onPress: () => handleDeleteMessage(item.id),
                          },
                          {
                            text: t('c'),
                            onPress: () => handleOutsidePress(),
                            style: 'cancel',
                          },
                        ],
                        {cancelable: true},
                      );
                    }}
                    style={styles.optionButton}>
                    <Text style={styles.optionText}>{t('dl')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        t('un.send.noti'),
                        '',
                        [
                          {
                            text: t('back'),
                            onPress: () => handleUnsendMessage(item.id),
                          },
                          {
                            text: t('c'),
                            onPress: () => handleOutsidePress(),
                            style: 'cancel',
                          },
                        ],
                        {cancelable: true},
                      );
                    }}
                    style={styles.optionButton}>
                    <Text style={styles.optionText}>{t('back')}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => handleCopy(item.id)}
                    style={styles.optionButton}>
                    <Text style={styles.optionText}>{t('copy')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleTranslateMessage(item.id)}
                    style={styles.optionButton}>
                    <Text style={styles.optionText}>{t('tranS')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      );
    }

    const renderMessageContent = () => {
      if (item.is_unsend) {
        return <Text style={styles.unsendMessageText}>{t('un_send')}</Text>;
      }
      switch (item.message_type) {
        case 'VIDEO':
          return (
            <Video
              source={{uri: item.message}}
              style={styles.videoStyle}
              resizeMode="cover"
              controls
            />
          );
        case 'TEXT':
        default:
          const text =
            item.translatedMessage || decrypt(item.message, conversationId);
          return (
            <>
              <Text
                style={[
                  styles.messageText,
                  isUser ? styles.userMessageText : styles.otherMessageText,
                  item.translatedMessage ? styles.translatedMessageText : null,
                ]}>
                {text}
              </Text>
              {linkPreview && (
                <TouchableOpacity
                  style={styles.linkPreviewBox}
                  onPress={() => {
                    if (linkPreview.url) {
                      try {
                        require('react-native').Linking.openURL(
                          linkPreview.url,
                        );
                      } catch (e) {}
                    }
                  }}>
                  {linkPreview.image && (
                    <Image
                      source={{uri: linkPreview.image}}
                      style={styles.linkPreviewImg}
                    />
                  )}
                  <View style={{flex: 1, marginLeft: 10}}>
                    <Text style={styles.linkPreviewTitle} numberOfLines={2}>
                      {linkPreview.title}
                    </Text>
                    {linkPreview.description ? (
                      <Text style={styles.linkPreviewDesc} numberOfLines={2}>
                        {linkPreview.description}
                      </Text>
                    ) : null}
                    <Text style={styles.linkPreviewUrl} numberOfLines={1}>
                      {linkPreview.url}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </>
          );
      }
    };

    return (
      <View
        style={
          isUser ? styles.userMessageContainer : styles.otherMessageContainer
        }>
        <TouchableOpacity
          style={[
            styles.messageContainer,
            item.is_unsend ? styles.unsendMessageContainer : null,
          ]}
          onLongPress={() => handleLongPress(item)}>
          {renderMessageContent()}
        </TouchableOpacity>
        {!isUser && isLastFromSender && (
          <Image
            source={
              item?.user.avatar ? {uri: item?.user.avatar} : defaultAvatar
            }
            style={styles.senderAvatar}
          />
        )}
        {showOptions && selectedMessageId === item.id && (
          <View style={styles.optionsContainer}>
            {isUser ? (
              <>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      t('dl.mess'),
                      '',
                      [
                        {
                          text: t('dl'),
                          onPress: () => handleDeleteMessage(item.id),
                        },
                        {
                          text: t('c'),
                          onPress: () => handleOutsidePress(),
                          style: 'cancel',
                        },
                      ],
                      {cancelable: true},
                    );
                  }}
                  style={styles.optionButton}>
                  <Text style={styles.optionText}>{t('dl')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      t('un.send.noti'),
                      '',
                      [
                        {
                          text: t('back'),
                          onPress: () => handleUnsendMessage(item.id),
                        },
                        {
                          text: t('c'),
                          onPress: () => handleOutsidePress(),
                          style: 'cancel',
                        },
                      ],
                      {cancelable: true},
                    );
                  }}
                  style={styles.optionButton}>
                  <Text style={styles.optionText}>{t('back')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => handleCopy(item.id)}
                  style={styles.optionButton}>
                  <Text style={styles.optionText}>{t('copy')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleTranslateMessage(item.id)}
                  style={styles.optionButton}>
                  <Text style={styles.optionText}>{t('tranS')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  // Khi render FlatList, dùng dữ liệu đã inject nhãn ngày
  const messagesWithDateLabels = injectDateLabels(messages);

  // Bọc Message bằng React.memo để tránh render lại không cần thiết
  const MemoizedMessage = React.memo(({item, isUser, isLastFromSender}) => {
    return (
      <Message
        item={item}
        isUser={isUser}
        isLastFromSender={isLastFromSender}
      />
    );
  });

  // Tối ưu renderItem bằng useCallback
  const renderItem = React.useCallback(
    ({item, index}) => {
      if (item.type === 'date') {
        return (
          <View style={{alignItems: 'center', marginVertical: 10}}>
            <Text
              style={{
                backgroundColor: '#222',
                color: '#fff',
                paddingHorizontal: 16,
                paddingVertical: 4,
                borderRadius: 12,
                fontWeight: 'bold',
                fontSize: 13,
                overflow: 'hidden',
              }}>
              {item.label}
            </Text>
          </View>
        );
      }
      const isUser = item.user_id === USER_INFOR.id;
      const isLastFromSender =
        index === messages.length - 1 ||
        messages[index + 1]?.user_id !== item.user_id;
      return (
        <MemoizedMessage
          item={item}
          isUser={isUser}
          isLastFromSender={isLastFromSender}
        />
      );
    },
    [USER_INFOR.id, messages],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <SafeAreaView style={styles.container}>
          <View style={styles.headerCompact}>
            <TouchableOpacity
              style={styles.headerBackBtn}
              onPress={() => navigation.goBack()}>
              <IconFA name="arrow-left" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <Image
              source={friendAvatar ? {uri: friendAvatar} : defaultAvatar}
              style={styles.headerAvatarSmall}
            />
            <View style={styles.nameContainerCompact}>
              <Text style={styles.headerNameCompact} numberOfLines={1}>
                {friendName}
              </Text>
              <View style={styles.encryptedMessageContainer}>
                <Text style={styles.encryptedMessageText}>
                  {t(`encryptedMessage`)}
                </Text>
                <Icon
                  name="lock-closed-sharp"
                  size={13}
                  style={styles.lockIcon}
                  color={COLORS.placeholder}
                />
              </View>
            </View>
            <View style={styles.headerActionsCompact}>
              <TouchableOpacity style={styles.headerActionBtnCompact}>
                <Icon name="call" color={COLORS.primary} size={18} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerActionBtnCompact}>
                <Icon name="videocam" color={COLORS.primary} size={18} />
              </TouchableOpacity>
            </View>
          </View>

          {messages.length === 0 ? (
            <View style={styles.notMessageContainer}>
              <Text style={styles.notMessageText}>{t(notMessage)}</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messagesWithDateLabels}
              renderItem={renderItem}
              keyExtractor={item =>
                item.type === 'date' ? item.id : `message-${item.id}`
              }
              contentContainerStyle={styles.messagesList}
              contentInset={{bottom: 65}}
              onEndReached={getAllMessage}
              onEndReachedThreshold={0.1}
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
              placeholder={t('tymess')}
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
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    color: 'red',
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
    elevation: 2,
    flexDirection: 'row',
    padding: 5,
    marginTop: 5,
    justifyContent: 'space-around',
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
  headerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.base,
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    zIndex: 10,
  },
  headerBackBtn: {
    padding: 4,
    marginRight: 6,
  },
  headerAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray2,
    borderWidth: 1,
    borderColor: COLORS.lightGray2,
    marginRight: 8,
  },
  nameContainerCompact: {
    flex: 1,
    justifyContent: 'center',
  },
  headerNameCompact: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: 'bold',
    textAlign: 'left',
    maxWidth: 140,
  },
  headerActionsCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  headerActionBtnCompact: {
    padding: 4,
    marginLeft: 2,
    borderRadius: 16,
  },
  imageStyle: {
    width: 180,
    height: 180,
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: 2,
  },
  videoStyle: {
    width: 250,
    height: 150,
    borderRadius: 10,
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
  linkPreviewTitle: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  linkPreviewDesc: {
    ...FONTS.body5,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  linkPreviewUrl: {
    color: COLORS.primary,
    fontSize: 12,
    textDecorationLine: 'underline',
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
});

export default ChatScreen;
