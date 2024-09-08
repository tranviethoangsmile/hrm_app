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
  Modal,
  TouchableWithoutFeedback,
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
} from '../utils/Strings';
import Loader from '../components/Loader';
import defaultAvatar from '../assets/images/avatar.jpg';
import UserModal from '../components/UserModal';
import {TEXT_COLOR} from '../utils/Colors';

const Message = () => {
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const USER_INFOR = authData?.data?.data;
  const navigation = useNavigation();

  const [searchText, setSearchText] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [allConversations, setAllConversations] = useState([]);
  const [isLoading, setIsloading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [friendsList, setFriendsList] = useState([]);

  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
  };

  const getAllFriendList = async () => {
    try {
      setIsloading(true);
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}${FIND_USER_BY_FIELD}`,
        {
          position: USER_INFOR?.position,
        },
      );
      if (response?.data?.success) {
        const friends = response?.data?.data || [];
        setFriendsList(friends);
      }
    } catch (error) {
      showAlert(error?.message || 'networkError');
    } finally {
      setIsloading(false);
    }
  };

  const onClose = () => {
    setModalVisible(false);
    Keyboard.dismiss(); // Ẩn bàn phím khi đóng modal
  };

  const handleGetConversations = async () => {
    try {
      setIsloading(true);
      const response = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${GROUP_MEMBER}${GET_GROUP_MEMBER_OF_USER}`,
        {
          user_id: USER_INFOR?.id,
        },
      );
      if (!response?.data?.success) {
        throw new Error('not.data');
      }
      const conversations = response?.data?.data || [];
      setAllConversations(conversations);
      setFilteredConversations(conversations);
    } catch (error) {
      showAlert(error?.message || 'networkError');
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    handleGetConversations();
    getAllFriendList();
  }, []);

  const handleSearch = text => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredConversations(allConversations);
    } else {
      const filtered = allConversations.filter(conversation => {
        const user = conversation.users;
        return user && user.name.toLowerCase().includes(text.toLowerCase());
      });
      setFilteredConversations(filtered);
    }
  };

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleSelectUser = user => {
    // Xử lý khi chọn người bạn
    // handleSelectConversation('new-conversation-id', user);
    // setModalVisible(false);
    console.log(user);
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
      onPress={() =>
        handleSelectConversation(item.conversation_id, item.users)
      }>
      <View style={styles.avatarContainer}>
        <Image
          source={item.users.avatar ? {uri: item.users.avatar} : defaultAvatar}
          style={styles.avatar}
        />
        <View style={styles.onlineStatus} />
      </View>
      <View style={styles.conversationInfo}>
        <Text style={styles.friendName}>{item.users?.name}</Text>
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
        keyExtractor={item => item.conversation_id}
        renderItem={renderItem}
      />
      <TouchableOpacity
        style={styles.createConversationButton}
        onPress={handleOpenModal}>
        <Icon name="plus" size={30} color="#fff" />
      </TouchableOpacity>
      <Loader visible={isLoading} />
      <UserModal
        isVisible={modalVisible}
        users={friendsList}
        onClose={onClose}
        onSelectUser={handleSelectUser}
        t={t}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 15,
    zIndex: -1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Nền mờ xung quanh
  },
  modalContent: {
    width: '70%', // Modal chiếm 70% màn hình
    maxHeight: '70%', // Đảm bảo modal không quá cao
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: 'green',
    borderWidth: 2,
    borderColor: '#fff',
  },
  conversationInfo: {
    flex: 1,
  },
  friendName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
  },
  createConversationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Message;
