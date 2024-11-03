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
import Icon from 'react-native-vector-icons/FontAwesome';
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
      return 'text'; // Trường hợp tin nhắn là văn bản
    }

    // Kiểm tra loại file dựa trên asset.type
    if (asset.type.startsWith('image/')) {
      return 'IMAGE';
    } else if (asset.type.startsWith('video/')) {
      return 'VIDEO';
    } else if (asset.type === 'application/pdf') {
      return 'DOCUMENT';
    }

    // Nếu không xác định được, mặc định là 'other'
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

    // Mở thư viện ảnh hoặc video
    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('Người dùng đã hủy việc chọn ảnh.');
      } else if (response.errorCode) {
        console.log('Lỗi: ', response.errorCode);
      } else {
        const asset = response.assets[0];
        try {
          setIsloading(true);

          // Lấy đường dẫn thực của file
          const realUri = await getRealPathFromURI(asset.uri);

          const form = new FormData();
          form.append('media', {
            uri: realUri, // Đường dẫn thực của file
            name: asset.fileName, // Tên file
            type: asset.type || 'image/jpeg', // Xác định kiểu MIME
          });

          const res = await axios.post(
            `${BASE_URL}${PORT}${API}${VERSION}${V1}${MESSAGE}${CREATE}`,
            form,
            {
              headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
              },
            },
          );

          if (!res?.data.success) {
            showMessage('image.send.error', 'error', 2000);
          }
          showMessage('image.send.success', 'success', 1000);
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
          setIsloading(false);
          showMessage('image.send.error', 'error', 2000);
          // Log chi tiết lỗi Axios
          if (error.response) {
            showMessage('networkError', 'error', 2000);
            console.log('Error response data:', error.response.data);
            console.log('Error response status:', error.response.status);
          } else if (error.request) {
            showMessage('networkError', 'error', 2000);
            console.log('Error request:', error.request);
          } else {
            showMessage('networkError', 'error', 2000);
            console.log('Error message:', error.message);
          }
        } finally {
          setIsloading(false);
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
          message: message,
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

        // Lọc tin nhắn dựa vào delete_messages
        const filteredMessages = messages.filter(message => {
          const deleteMessages = Array.isArray(message.delete_messages)
            ? message.delete_messages
            : [];
          // Kiểm tra xem người dùng đã xóa tin nhắn này chưa
          const isDeletedByUser = deleteMessages.some(
            deleteMessage => deleteMessage.user_id === USER_INFOR.id,
          );
          return !isDeletedByUser; // Giữ lại những tin nhắn chưa bị xóa
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
      // Find the message with the provided ID
      const messageToCopy = messages.find(msg => msg.id === messageId);

      if (!messageToCopy) {
        showMessage('copy.not.success', 'error', 1500);
        return;
      }
      Clipboard.setString(messageToCopy.message);
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
        q: messageToTranslate.message,
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
      setShowEmojiPicker(false); // Đóng emoji picker khi focus vào TextInput
    }
  };
  const handleOutsidePress = () => {
    setShowOptions(false);
    setSelectedMessageId(null);
    handleToggleEmojiPicker(false);
    Keyboard.dismiss();
  };

  const Message = ({item, isUser}) => {
    const renderMessageContent = () => {
      if (item.is_unsend) {
        return <Text style={styles.unsendMessageText}>{t('un_send')}</Text>;
      }
      switch (item.message_type) {
        case 'IMAGE':
          return (
            <Image
              source={{uri: item.message}}
              style={styles.imageStyle}
              resizeMode="cover"
            />
          );
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
          return (
            <Text
              style={[
                isUser ? styles.userMessageText : styles.otherMessageText,
                item.translatedMessage ? styles.translatedMessageText : null,
              ]}>
              {item.translatedMessage || item.message}
            </Text>
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

  const renderItem = ({item}) => (
    <Message item={item} isUser={item.user_id === USER_INFOR.id} />
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Image source={{uri: friendAvatar}} style={styles.avatar} />
            <Text style={styles.headerText}>{friendName}</Text>
            <View style={styles.callButtonsContainer}>
              <TouchableOpacity style={styles.callButton}>
                <Icon name="phone" color={THEME_COLOR} size={30} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.callButton}>
                <Icon name="video-camera" color={THEME_COLOR} size={30} />
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
              data={messages}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.messagesList}
              contentInset={{bottom: 65}}
            />
          )}
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleToggleEmojiPicker}>
              <Icon name="smile-o" color={THEME_COLOR} size={24} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleImagePicker}>
              <Icon name="image" color={THEME_COLOR} size={24} />
            </TouchableOpacity>

            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder={t('tymess')}
              placeholderTextColor="#999" // Màu placeholder nhẹ
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
          {isLoading && <Loader t={t} />}
          <ModalMessage
            isVisible={isMessageModalVisible}
            onClose={() => setMessageModalVisible(false)}
            message={messageModal}
            type={messageType}
            t={t}
            duration={duration}
          />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fafafa', // Màu nền nhẹ nhàng
  },
  iconButton: {
    paddingHorizontal: 4, // Đảm bảo khoảng cách tốt giữa các biểu tượng
  },
  textInput: {
    flex: 1,
    borderRadius: 25, // Bo góc cho mềm mại
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    backgroundColor: '#f0f0f0', // Màu nền input nhẹ
    fontSize: 16,
    color: TEXT_COLOR, // Màu chữ chính
  },
  sendButton: {
    backgroundColor: THEME_COLOR, // Nền nổi bật cho nút gửi
    borderRadius: 25,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  showEmojiTab: {
    height: 250,
    backgroundColor: 'white',
    zIndex: 1000,
  },
  header: {
    height: 60,
    backgroundColor: '#003366',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
  },
  callButtonsContainer: {
    flexDirection: 'row',
  },
  callButton: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    elevation: 2,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#D0E6F4',
    borderRadius: 20,
    marginVertical: 4,
    padding: 10, // Increased to fit text and options better
    maxWidth: '75%',
    marginRight: 10,
    position: 'relative',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F9E6',
    borderRadius: 20,
    marginVertical: 4,
    padding: 10, // Increased to fit text and options better
    maxWidth: '75%',
    marginLeft: 10,
    position: 'relative',
  },
  userMessageText: {
    fontSize: 18,
    color: '#003366',
  },
  otherMessageText: {
    fontSize: 18,
    color: '#004d00',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  notMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notMessageText: {
    fontSize: 18,
    color: TEXT_COLOR,
  },
  messageContainer: {
    padding: 5,
    marginBottom: 5, // Adds space to prevent overlapping with the next message
  },
  optionsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    elevation: 2,
    flexDirection: 'row',
    padding: 5, // Ensures options fit better within the message
    marginTop: 5, // Space between message text and options
    justifyContent: 'space-around',
  },
  optionButton: {
    padding: 5,
  },
  optionText: {
    color: THEME_COLOR,
    fontSize: 16,
  },
  unsendMessageContainer: {
    opacity: 0.7,
  },
  unsendMessageText: {
    color: '#A9A9A9', // Gray color for unsent messages
    fontStyle: 'italic', // Optional: Makes the text italic for emphasis
  },
  translatedMessageText: {
    color: '#FF5733', // Different color for translated messages
    fontStyle: 'black',
  },
  imageStyle: {
    width: 200, // Adjust the size as needed
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  // Video message style
  videoStyle: {
    width: 250,
    height: 150,
    borderRadius: 10,
    marginTop: 10,
  },
});

export default ChatScreen;
