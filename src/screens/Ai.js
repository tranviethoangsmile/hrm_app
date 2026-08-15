/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import socket from '../socket.io/socket.io';
import i18next from '../../services/i18next';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/common/Header';
import {useTheme} from '../hooks/useTheme';

const Ai = () => {
  const {t} = useTranslation();
  const {colors} = useTheme();
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
    checkLanguage();

    const handleMessage = receivedMessage => {
      setMessages(prevMessages => [
        ...prevMessages,
        {text: receivedMessage, sent: false},
      ]);
    };

    socket.on('messgpt', handleMessage);

    return () => {
      socket.off('messgpt', handleMessage);
    };
  }, []);

  const sendMessage = () => {
    if (newMessage.trim() === '') {
      Alert.alert(t('Ai'), t('tymess'));
      return;
    }

    socket.emit('sendMessage', {chat: newMessage});

    setMessages(prevMessages => [
      ...prevMessages,
      {text: newMessage, sent: true},
    ]);

    setNewMessage('');

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Header title={t('Ai')} />
      <KeyboardAvoidingView
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
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
                styles.messageRow,
                {justifyContent: item.sent ? 'flex-end' : 'flex-start'},
              ]}>
              <LinearGradient
                colors={
                  item.sent
                    ? colors.primaryGradient
                    : [colors.surfaceSecondary, colors.surfaceSecondary]
                }
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.bubble}>
                <Text
                  style={[
                    styles.messageText,
                    {color: item.sent ? '#fff' : colors.text},
                  ]}>
                  {item.text}
                </Text>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>

        <View
          style={[
            styles.inputContainer,
            {borderTopColor: colors.border, backgroundColor: colors.surface},
          ]}>
          <TextInput
            style={[styles.input, {color: colors.text, backgroundColor: colors.backgroundSecondary}]}
            placeholder={t('tymess')}
            placeholderTextColor={colors.textTertiary}
            value={newMessage}
            onChangeText={text => setNewMessage(text)}
          />
          <TouchableOpacity onPress={sendMessage} activeOpacity={0.85}>
            <LinearGradient
              colors={colors.primaryGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.sendButton}>
              <Icon name="send" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 15,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Ai;