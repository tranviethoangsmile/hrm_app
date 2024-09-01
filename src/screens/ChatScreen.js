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
} from 'react-native';
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
import {
  API,
  BASE_URL,
  PORT,
  V1,
  VERSION,
  CREATE,
  MESSAGE,
  SEARCH_MESSAGE_WITH_CONVERSATION,
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
      setIsloading(true);
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${MESSAGE}${SEARCH_MESSAGE_WITH_CONVERSATION}`,
        {
          conversation_id: conversationId,
        },
      );
      if (!response?.data.success) {
        setNotMessage('not.mess');
        setIsloading(false);
      } else {
        // Đảo ngược thứ tự tin nhắn để tin nhắn mới nhất nằm đầu tiên
        setMessages(response?.data.data.reverse() || []);
        setIsloading(false);
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
      setMessages(prevMessages => {
        // Thêm tin nhắn mới vào đầu danh sách
        if (prevMessages.find(msg => msg.id === newMessage.data.id)) {
          return prevMessages; // Nếu tin nhắn đã tồn tại, không thêm vào danh sách
        }
        return [newMessage.data, ...prevMessages];
      });
    };

    socket.emit('joinConversation', conversationId);
    socket.on(`${conversationId}`, handleNewMessage);

    return () => {
      socket.off(`${conversationId}`, handleNewMessage);
    };
  }, [conversationId]);

  useEffect(() => {
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
  }, [messages]);

  const Message = ({item, isUser}) => (
    <View
      style={
        isUser ? styles.userMessageContainer : styles.otherMessageContainer
      }>
      <Text style={isUser ? styles.userMessageText : styles.otherMessageText}>
        {item.message}
      </Text>
    </View>
  );

  const renderItem = ({item}) => (
    <Message item={item} isUser={item.user_id === USER_INFOR.id} />
  );

  return (
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
          keyExtractor={item => item.id.toString()} // Đảm bảo `id` là chuỗi
          contentContainerStyle={styles.messagesList}
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
          <Icon name="send" color={THEME_COLOR} size={30} />
        </TouchableOpacity>
      </View>
      <Loader visible={isLoading} />
    </SafeAreaView>
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
    padding: 10,
    maxWidth: '75%',
    marginRight: 10,
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F9E6',
    borderRadius: 20,
    marginVertical: 4,
    padding: 10,
    maxWidth: '75%',
    marginLeft: 10,
  },
  userMessageText: {
    fontSize: 16,
    color: '#003366',
  },
  otherMessageText: {
    fontSize: 16,
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
    fontSize: 16,
    color: '#333',
  },
});

export default ChatScreen;
