/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-unreachable */
import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Keyboard,
  Alert,
} from 'react-native';
import socket from '../socket.io/socket.io';
import i18next from '../../services/i18next';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Ai = () => {
  const {t} = useTranslation();
  const getLanguage = async () => {
    return await AsyncStorage.getItem('Language');
  };
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const checkLanguage = async () => {
      const lang = await getLanguage();
      if (lang != null) {
        i18next.changeLanguage(lang);
      }
    };
    const handleMessage = receivedMessage => {
      setMessages(prevMessages => [
        ...prevMessages,
        {text: receivedMessage, sent: false},
      ]);
    };

    // Listen for incoming messages from the server
    socket.on('messgpt', handleMessage);

    // Cleanup socket event listener when the component is unmounted
    return () => {
      socket.off('messgpt', handleMessage);
    };
    checkLanguage();
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() === '') {
      Alert.alert('Enter your text');
      return;
    }

    // Emit the new message to the server
    socket.emit('sendMessage', {chat: newMessage});

    // Update the local state with the sent message
    setMessages(prevMessages => [
      ...prevMessages,
      {text: newMessage, sent: true},
    ]);

    // Clear the input field
    setNewMessage('');

    // Scroll to the end of the ScrollView when a new message is sent
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesContainer}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({animated: true});
          }
        }}>
        {messages.map((item, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              {
                alignSelf: item.sent ? 'flex-end' : 'flex-start',
                backgroundColor: item.sent ? '#4CAF50' : '#2196F3',
              },
            ]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('tymess')}
          placeholderTextColor="#757575"
          value={newMessage}
          onChangeText={text => setNewMessage(text)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>{t('Send')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    flexDirection: 'row',
    marginBottom: 5,
    padding: 10,
    borderRadius: 8,
  },
  messageText: {
    fontSize: 16,
    marginHorizontal: 5,
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginRight: 10,
    color: 'black', // Text color
  },
  sendButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Ai;
