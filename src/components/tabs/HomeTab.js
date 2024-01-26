/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useSelector} from 'react-redux';
import {TEXT_COLOR, THEME_COLOR, THEME_COLOR_2} from '../../utils/Colors';
import Control from '../Control';
import socket from '../../socket.io/socket.io';

const HomeTab = () => {
  const [visible, setVisible] = useState(false);
  const AUTH = useSelector(state => state.auth);

  const handleControl = () => {
    setVisible(!visible);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.titleView}>
        <Text style={styles.title}>Information</Text>
        <TouchableOpacity onPress={handleControl}>
          <Image
            source={require('../../images/avatar.jpg')}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Control
          visible={visible}
          onClose={() => {
            setVisible(!visible);
          }}
        />
      </View>
      <View style={styles.postContainer}>
        {/* Post 1 */}
        <View style={styles.post}>
          <Text style={styles.username}>John Doe</Text>
          <Text style={styles.time}>2 hours ago</Text>
          <Text style={styles.content}>
            What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the
            printing and typesetting industry. Lorem Ipsum has been the
            industry's standard dummy text ever since the 1500s, when an unknown
            printer took a galley of type and scrambled it to make a type
            specimen book.
          </Text>
          <Image
            source={{uri: 'https://example.com/image.jpg'}}
            style={styles.postImage}
          />
        </View>

        {/* Post 2 */}
        <View style={styles.post}>
          <Text style={styles.username}>Jane Smith</Text>
          <Text style={styles.time}>1 day ago</Text>
          <Text style={styles.content}>
            Another post with an amazing React Native image.
          </Text>
          <Image
            source={{uri: 'https://example.com/another-image.jpg'}}
            style={styles.postImage}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleView: {
    width: '100%',
    height: 50,
    backgroundColor: THEME_COLOR_2,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    fontSize: 20,
    color: TEXT_COLOR,
    fontWeight: '700',
    marginLeft: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  postContainer: {
    marginHorizontal: 10,
    marginTop: 10,
  },
  post: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  time: {
    color: '#777',
    marginBottom: 10,
  },
  content: {
    fontSize: 18,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});

export default HomeTab;
