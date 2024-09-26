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
} from '../utils/Strings';
import socket from '../socket.io/socket.io';
import Loader from '../components/Loader';

const ChatScreen = ({route}) => {
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
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
  };

  const handleSend = () => {
    try {
      setIsloading(true);
      if (message.trim()) {
        const newMessage = {
          conversation_id: conversationId,
          user_id: USER_INFOR.id,
          message: message,
        };

        socket.emit('send-message', newMessage);
        setMessage('');
      } else {
        showAlert('tymess');
        setIsloading(false);
      }
    } catch (error) {
      showAlert('networkError');
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
      const unsend = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${MESSAGE}${UNSEND}`,
        {
          id: messageId,
        },
      );
      if (!unsend?.data.success) {
        setShowOptions(false);
        showAlert('unSuccess');
      }
      setShowOptions(false);
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId ? {...msg, is_unsend: true} : msg,
        ),
      );
    } catch (error) {
      showAlert(`${error.message}` | 'networkError');
    } finally {
      setShowOptions(false);
    }
  };

  const handleDeleteMessage = async messageId => {
    try {
      setShowOptions(false);
      const delete_ = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${MESSAGE}${DELETE}`,
        {
          message_id: messageId,
          user_id: USER_INFOR.id,
        },
      );
      if (!delete_?.data.success) {
        showAlert('unSuccess');
      }
      showAlert('success');
      getAllMessage();
    } catch (error) {
      showAlert(`${error.message}` | 'networkError');
    } finally {
      setShowOptions(false);
    }
  };

  const handleCopy = async messageId => {
    try {
      // Find the message with the provided ID
      const messageToCopy = messages.find(msg => msg.id === messageId);

      if (!messageToCopy) {
        showAlert('cannot copy Message');
        return;
      }
      Clipboard.setString(messageToCopy.message);
      setShowOptions(false);
    } catch (error) {
      showAlert('err');
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
      showAlert('err' | 'networkError');
    } finally {
      setShowOptions(false);
    }
  };

  const handleOutsidePress = () => {
    setShowOptions(false);
    setSelectedMessageId(null);
    Keyboard.dismiss();
  };

  const Message = ({item, isUser}) => (
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
        <Text
          style={[
            isUser ? styles.userMessageText : styles.otherMessageText,
            item.is_unsend ? styles.unsendMessageText : null,
            item.translatedMessage ? styles.translatedMessageText : null, // Apply different style for translated message
          ]}>
          {item.is_unsend
            ? t('un_send')
            : item.translatedMessage || item.message}
        </Text>
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
                        text: t('un'),
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

  const renderItem = ({item}) => (
    <Message item={item} isUser={item.user_id === USER_INFOR.id} />
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
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
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder={t('tymess')}
              placeholderTextColor={TEXT_COLOR}
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Icon name="send" color="#FFF" size={30} />
            </TouchableOpacity>
          </View>
          <Loader visible={isLoading} />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  textInput: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 25,
    paddingHorizontal: 16,
    backgroundColor: '#F7F7F7',
    fontSize: 16,
    color: TEXT_COLOR,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#003366',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
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
    fontStyle: 'italic',
  },
});

export default ChatScreen;
