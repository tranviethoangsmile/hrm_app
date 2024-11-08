import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Keyboard,
  SafeAreaView,
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
import {THEME_COLOR} from '../utils/Colors';

const Message = () => {
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const USER_INFOR = authData?.data?.data;
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState('personal'); // personal hoặc group
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

  const showMessage = (msg, type, dur) => {
    setMessageModalVisible(true);
    setMessageModal(msg);
    setMessageType(type);
    setDuration(dur);
  };

  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
  };

  const getAllFriendList = async () => {
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
  };

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

  const handleGetConversations = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${GROUP_MEMBER}${GET_GROUP_MEMBER_OF_USER}`,
        {user_id: USER_INFOR?.id},
      );
      if (!response?.data?.success) {
        throw new Error('Failed to fetch conversations.');
      }

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
  };

  useEffect(() => {
    handleGetConversations();
    getAllFriendList();
  }, [navigation]);

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E1E" />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'personal' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('personal')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'personal' && styles.activeTabText,
            ]}>
            {t('oneChat')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'group' && styles.activeTab]}
          onPress={() => setActiveTab('group')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'group' && styles.activeTabText,
            ]}>
            {t('groupChat')}
          </Text>
        </TouchableOpacity>
      </View>
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

      <TouchableOpacity
        style={styles.createConversationButton}
        onPress={handleOpenModal}>
        <Icon name="plus" size={30} color="#fff" />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    padding: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E2E2E',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: THEME_COLOR,
  },
  tabText: {
    color: '#B0B0B0',
    fontSize: 16,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  createConversationButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: THEME_COLOR,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
});

export default Message;
