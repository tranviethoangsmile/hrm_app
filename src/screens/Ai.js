import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
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

    // Scroll to the end of the FlatList when a new message is sent
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <View
            style={[
              styles.messageContainer,
              {alignSelf: item.sent ? 'flex-end' : 'flex-start'},
            ]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={newMessage}
          onChangeText={text => setNewMessage(text)}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  messageContainer: {
    backgroundColor: '#eee',
    maxWidth: '80%',
    flexDirection: 'row',
    marginBottom: 5,
    padding: 10,
    borderRadius: 8,
  },
  messageText: {
    fontSize: 16,
    marginHorizontal: 5,
    color: 'red',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginRight: 10,
  },
});

export default Ai;
