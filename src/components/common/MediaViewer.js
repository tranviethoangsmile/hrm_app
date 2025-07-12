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
import ModalMessage from '../ModalMessage';
import {useTranslation} from 'react-i18next';

const {width, height} = Dimensions.get('window');

const MediaViewer = ({
  visible,
  onClose,
  mediaUrl,
  mediaType,
  postInfo,
  onEventConfirm,
}) => {
  const {t} = useTranslation();
  const [paused, setPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('');
  const videoRef = useRef(null);

  const handleEventConfirm = async () => {
    try {
      await onEventConfirm();
      setMessageText('success.confirm');
      setMessageType('success');
      setIsMessageVisible(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      setMessageText(error?.message || 'networkError');
      setMessageType('error');
      setIsMessageVisible(true);
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
            <Text style={styles.backText}>{t('media.back')}</Text>
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
                {t('media.posted_on')}{' '}
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
              <Text style={styles.eventButtonText}>{t('confirm_join')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <ModalMessage
          visible={isMessageVisible}
          message={messageText}
          type={messageType}
          duration={1000}
          onClose={() => setIsMessageVisible(false)}
          containerStyle={styles.messageContainer}
          t={t}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  messageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 15,
  },
  backText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  eventButton: {
    backgroundColor: THEME_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  eventButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default MediaViewer;
