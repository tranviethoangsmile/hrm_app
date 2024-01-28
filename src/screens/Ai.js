import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import socket from '../socket.io/socket.io';

const Ai = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
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
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() === '') {
      console.log('Enter your text');
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
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <View
            style={[
              styles.messageContainer,
              {
                alignSelf: item.sent ? 'flex-end' : 'flex-start',
                backgroundColor: item.sent ? '#F4C2C2' : '#F0F4F7',
              },
            ]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({animated: true});
          }
        }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={newMessage}
          onChangeText={text => setNewMessage(text)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
    backgroundColor: '#EAEFF2',
  },
  messagesContainer: {
    paddingVertical: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 16,
    marginHorizontal: 5,
    color: '#2E3A59',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#BDC6D8',
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BDC6D8',
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: 'white',
  },
  sendButton: {
    backgroundColor: '#3F65F7',
    padding: 12,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Ai;
