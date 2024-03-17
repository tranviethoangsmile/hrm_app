import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import VideoPlayer from 'react-native-video-player';
import {TEXT_COLOR, THEME_COLOR, THEME_COLOR_2} from '../utils/Colors';

const InformationDetail = ({visible, onClose, t, post}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>{t('infoDetail')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mediaContainer}>
            {post.is_video ? (
              <VideoPlayer
                autoplay={false}
                video={{uri: post.media}}
                defaultMuted={true}
                videoWidth={300}
                videoHeight={200}
                thumbnail={require('../images/thumbnail.jpg')}
              />
            ) : (
              <Image source={{uri: post.media}} style={styles.media} />
            )}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{post.title}</Text>
            <Text>{post.date}</Text>
            <ScrollView style={styles.contentContainer}>
              <Text>{post.content}</Text>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%', // Limit the maximum height of the modal content
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 20,
  },
  mediaContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  media: {
    width: 300,
    height: 200,
    resizeMode: 'cover',
    borderRadius: 5,
  },
  textContainer: {
    marginLeft: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contentContainer: {
    maxHeight: 200, // Limit the maximum height of the content
  },
});

export default InformationDetail;
