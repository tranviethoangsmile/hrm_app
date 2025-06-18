import React, {useState, useRef} from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  Text,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/FontAwesome';
import {THEME_COLOR} from '../../utils/Colors';
import moment from 'moment';

const {width, height} = Dimensions.get('window');

const MediaViewer = ({
  visible,
  onClose,
  mediaUrl,
  mediaType,
  postInfo,
  onEventConfirm,
  showMessage,
}) => {
  const [paused, setPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef(null);

  const handleEventConfirm = async () => {
    try {
      await onEventConfirm();
      showMessage('success.confirm', 'success', 500);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      showMessage(error?.message || 'networkError', 'error', 500);
    }
  };

  return (
    <Modal visible={visible} transparent={false} animationType="fade">
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Image
              source={{
                uri:
                  postInfo?.user?.avatar ||
                  `https://ui-avatars.com/api/?name=${postInfo?.user?.name}`,
              }}
              style={styles.avatar}
            />
            <View style={styles.userTextInfo}>
              <Text style={styles.userName}>{postInfo?.user?.name}</Text>
              <Text style={styles.postTime}>
                {moment(postInfo?.date).format('DD/MM/YYYY')}
              </Text>
            </View>
          </View>
        </View>

        {/* Media Content */}
        <TouchableWithoutFeedback
          onPress={() => {
            if (mediaType === 'video') {
              setShowControls(!showControls);
            }
          }}>
          <View style={styles.mediaContainer}>
            {mediaType === 'video' ? (
              <Video
                ref={videoRef}
                source={{uri: mediaUrl}}
                style={styles.media}
                resizeMode="contain"
                paused={paused}
                controls={true}
              />
            ) : (
              <Image
                source={{uri: mediaUrl}}
                style={styles.media}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableWithoutFeedback>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.caption} numberOfLines={2}>
            {postInfo?.content}
          </Text>

          {/* Event Confirm Button */}
          {postInfo?.is_event && (
            <TouchableOpacity
              style={styles.eventButton}
              onPress={handleEventConfirm}>
              <Text style={styles.eventButtonText}>Xác nhận tham gia</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userTextInfo: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  postTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  mediaContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  media: {
    width: width,
    height: height - 180,
  },
  footer: {
    padding: 15,
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderTopWidth: 1,
  },
  caption: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  eventButton: {
    backgroundColor: THEME_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  eventButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MediaViewer;
