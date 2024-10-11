import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  StatusBar,
  Keyboard,
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
} from '../utils/Strings';
import Loader from '../components/Loader';
import defaultAvatar from '../assets/images/avatar.jpg';
import UserModal from '../components/UserModal';
import {TEXT_COLOR, THEME_COLOR, BG_COLOR} from '../utils/Colors';

const Message = () => {
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const USER_INFOR = authData?.data?.data;
  const navigation = useNavigation();

  const [searchText, setSearchText] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [allConversations, setAllConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

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
      showAlert(error?.message || 'networkError');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLongPress = message => {
    setSelectedMessageId(message.id);
    setShowOptions(true);
  };

  const onClose = () => {
    setModalVisible(false);
    Keyboard.dismiss();
  };

  const handleDeleteConversation = async id => {
    try {
      setModalVisible(false);
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
      setModalVisible(false);
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
      showAlert(error?.message || 'Network error');
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
      showAlert(error?.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = async user => {
    setIsLoading(true);
    try {
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
      handleSelectConversation(conversationId, user);
    } catch (error) {
      showAlert(error?.message || 'networkError');
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

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleSelectConversation(item.conversation_id, item.users)}
      onLongPress={() => handleLongPress(item)}>
      <View style={styles.itemContent}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              item.users.avatar ? {uri: item.users.avatar} : defaultAvatar
            }
            style={styles.avatar}
          />
          <View style={styles.onlineStatus} />
        </View>
        <View style={styles.conversationInfo}>
          <Text style={styles.friendName}>{item.users?.name}</Text>
        </View>
        {showOptions && selectedMessageId === item.id && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              onPress={() => handleDeleteConversation(item.conversation_id)}
              style={styles.optionButton}>
              <Text style={styles.optionText}>{t('dl')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('search')}
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor={TEXT_COLOR}
        />
      </View>
      <FlatList
        data={filteredConversations}
        keyExtractor={item => item.conversation_id.toString()}
        renderItem={renderItem}
      />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
    padding: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 25,
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
    color: TEXT_COLOR,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 15,
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'green',
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: '#fff',
  },
  conversationInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    color: TEXT_COLOR,
    fontWeight: 'bold',
  },
  optionsContainer: {
    marginLeft: 'auto',
  },
  optionButton: {
    backgroundColor: THEME_COLOR,
    padding: 10,
    borderRadius: 5,
  },
  optionText: {
    color: '#fff',
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
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
  },
});

export default Message;
