import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Keyboard,
  Platform,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {
  API,
  BASE_URL,
  PORT,
  V1,
  USER_URL,
  FIND_USER_BY_FIELD,
  GROUP_MEMBER,
  GET_GROUP_MEMBER_OF_USER,
  VERSION,
  CONVERSATION,
  CREATE,
  DELETE,
  CREATE_GROUP,
} from '../utils/constans';
import Loader from '../components/Loader';
import {UserModal, ModalMessage, PersonalTab, GroupTabs} from '../components';
import {THEME_COLOR_2} from '../utils/Colors';
import Header from '../components/common/Header';
import {COLORS, SIZES, FONTS, SHADOWS} from '../config/theme';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const Message = () => {
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const USER_INFOR = authData?.data?.data;
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState('personal');
  const [searchText, setSearchText] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [allConversations, setAllConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [messageModal, setMessageModal] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1000);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);

  const showMessage = useCallback((msg, type, dur) => {
    setMessageModalVisible(true);
    setMessageModal(msg);
    setMessageType(type);
    setDuration(dur);
  }, []);

  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
  };

  const getAllFriendList = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}${FIND_USER_BY_FIELD}`,
        {position: USER_INFOR?.position},
      );
      if (response?.data?.success) {
        const friends = response.data.data || [];
        const filteredFriends = friends.filter(
          friend => friend.id !== USER_INFOR.id,
        );
        setFriendsList(filteredFriends);
      }
    } catch (error) {
      showMessage('networkError', 'error', 1000);
    } finally {
      setIsLoading(false);
    }
  }, [USER_INFOR, showMessage]);

  const handleGetConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${GROUP_MEMBER}${GET_GROUP_MEMBER_OF_USER}`,
        {user_id: USER_INFOR?.id},
      );
      const conversations = response.data.data || [];
      if (!Array.isArray(conversations)) {
        throw new Error('Data format is invalid.');
      }
      const filteredConversations = conversations.filter(
        conversation =>
          !conversation.conversation?.delete_conversations?.some(
            deleted => deleted.user_id === USER_INFOR.id,
          ),
      );
      setAllConversations(filteredConversations);
      setFilteredConversations(filteredConversations);
    } catch (error) {
      showMessage('networkError', 'error', 1000);
    } finally {
      setIsLoading(false);
    }
  }, [USER_INFOR, showMessage]);

  const handleLongPress = message => {
    setSelectedMessageId(message.conversation_id);
    setShowOptions(!showOptions);
  };

  const onClose = () => {
    setModalVisible(false);
    Keyboard.dismiss();
  };

  const handleDeleteConversation = async id => {
    try {
      const result = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${CONVERSATION}${DELETE}`,
        {
          user_id: USER_INFOR?.id,
          conversation_id: id,
        },
      );
      if (!result?.data?.success) {
        showAlert('unSuccess');
        return;
      }
      showAlert('success');
      handleGetConversations();
    } catch (error) {
      showAlert(error?.message || 'unSuccess');
    } finally {
      setShowOptions(false);
    }
  };

  useEffect(() => {
    handleGetConversations();
    getAllFriendList();
  }, [navigation, handleGetConversations, getAllFriendList]);

  const handleSearch = text => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredConversations(allConversations);
    } else {
      const filtered = allConversations.filter(conversation =>
        conversation.users?.name.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredConversations(filtered);
    }
  };

  const handleOpenModal = async () => {
    setIsLoading(true);
    try {
      await getAllFriendList();
      setModalVisible(true);
    } catch (error) {
      showMessage('networkError', 'error', 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = async (selectedUsers, title) => {
    try {
      if (selectedUsers.length === 1) {
        const user = selectedUsers[0];
        const conversation = await axios.post(
          `${BASE_URL}${PORT}${API}${VERSION}${V1}${CONVERSATION}${CREATE}`,
          {
            sender_id: USER_INFOR?.id,
            receiver_id: user.id,
          },
        );
        if (!conversation?.data.success) {
          throw new Error('contactAdmin');
        }
        const conversationId = conversation.data.data.conversation_id;
        setIsLoading(false);
        handleSelectConversation(conversationId, user);
      } else {
        const receivers = selectedUsers.map(user => ({user_id: user.id}));
        const conversation = await axios.post(
          `${BASE_URL}${PORT}${API}${VERSION}${V1}${CONVERSATION}${CREATE_GROUP}`,
          {
            title: title,
            sender_id: USER_INFOR?.id,
            receivers: receivers,
          },
        );
        if (!conversation?.data.success) {
          showMessage('contactAdmin', 'error', 1500);
        }
        const conversationId = conversation?.data.conversation_id;
        handleSelectConversation(conversationId, {
          name: title,
          avatar: null,
        });
      }
    } catch (error) {
      showMessage(error?.message || 'networkError', 'error', 1000);
    } finally {
      setModalVisible(false);
      setIsLoading(false);
    }
  };

  const handleSelectConversation = (conversationId, friend) => {
    navigation.navigate('ChatScreen', {
      conversationId,
      friendName: friend.name,
      friendAvatar: friend.avatar,
    });
  };

  return (
    <View style={styles.root}>
      <Header
        title={t('Mess', 'Tin nhắn')}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'personal' && styles.activeTabBtn,
          ]}
          onPress={() => setActiveTab('personal')}
          activeOpacity={0.8}>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'personal' && styles.activeTabLabel,
            ]}>
            {t('oneChat')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'group' && styles.activeTabBtn]}
          onPress={() => setActiveTab('group')}
          activeOpacity={0.8}
          disabled={true}>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'group' && styles.activeTabLabel,
            ]}>
            {t('groupChat')}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
        {activeTab === 'personal' ? (
          <PersonalTab
            filteredConversations={filteredConversations}
            t={t}
            handleLongPress={handleLongPress}
            handleDeleteConversation={handleDeleteConversation}
            handleSelectConversation={handleSelectConversation}
            searchText={searchText}
            setSearchText={setSearchText}
            handleSearch={handleSearch}
            USER_INFOR={USER_INFOR}
          />
        ) : (
          <GroupTabs />
        )}
      </View>
      <TouchableOpacity
        style={styles.fab}
        onPress={handleOpenModal}
        activeOpacity={0.85}>
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>
      <Loader visible={isLoading} />
      {modalVisible && (
        <UserModal
          isVisible={modalVisible}
          users={friendsList}
          onClose={onClose}
          onSelectUser={handleSelectUser}
          t={t}
        />
      )}
      <ModalMessage
        isVisible={isMessageModalVisible}
        onClose={() => setMessageModalVisible(false)}
        message={messageModal}
        type={messageType}
        t={t}
        duration={duration}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.base,
    marginTop: 10,
    marginBottom: 2,
    overflow: 'hidden',
    ...SHADOWS.light,
    height: 44,
    alignItems: 'center',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: COLORS.white,
  },
  activeTabBtn: {
    backgroundColor: COLORS.lightGray1,
  },
  tabLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: THEME_COLOR_2,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: THEME_COLOR_2,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
    zIndex: 10,
  },
});

export default Message;
