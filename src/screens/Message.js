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
} from 'react-native';
import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  API,
  BASE_URL,
  PORT,
  USER_URL,
  V1,
  VERSION,
  FIND_USER_BY_FIELD,
  CONVERSATION,
  CREATE,
} from '../utils/Strings';
import Loader from '../components/Loader';
import defaultAvatar from '../assets/images/avatar.jpg';

const Message = () => {
  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
  };

  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const USER_INFOR = authData?.data?.data;
  const navigation = useNavigation();

  const [searchText, setSearchText] = useState('');
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [allFriends, setAllFriends] = useState([]);
  const [isLoading, setIsloading] = useState(false);

  const handleGetFriends = async () => {
    try {
      setIsloading(true);
      const friends = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${USER_URL}${FIND_USER_BY_FIELD}`,
        {
          position: USER_INFOR?.position,
        },
      );
      if (!friends?.data.success) {
        throw new Error('not.data');
      }
      // Lọc ra người dùng hiện tại khỏi danh sách bạn bè
      const filteredList = friends?.data.data.filter(
        friend => friend.id !== USER_INFOR.id,
      );
      setAllFriends(filteredList);
      setFilteredFriends(filteredList);
    } catch (error) {
      showAlert(error?.message || 'networkError');
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    handleGetFriends();
  }, []);

  const handleSearch = text => {
    setSearchText(text);
    if (text.trim() === '') {
      // Nếu ô tìm kiếm trống, hiển thị lại danh sách gốc
      setFilteredFriends(allFriends);
    } else {
      // Nếu có văn bản tìm kiếm, lọc danh sách bạn bè
      const filtered = allFriends.filter(friend =>
        friend.name.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredFriends(filtered);
    }
  };

  const handleSelectFriend = async (id, name, avata) => {
    try {
      const conversation = await axios.post(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${CONVERSATION}${CREATE}`,
        {
          sender_id: USER_INFOR.id,
          receiver_id: id,
        },
      );
      if (!conversation?.data.success) {
        throw new Error('not.data');
      }
      navigation.navigate('ChatScreen', {
        conversationId: conversation?.data.data.conversation_id,
        friendName: name,
        friendAvata: avata,
      });
    } catch (error) {
      showAlert(error?.message || 'networkError');
    } finally {
      setIsloading(false);
    }
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => handleSelectFriend(item.id, item.name, item.avatar)}>
      <View style={styles.avatarContainer}>
        <Image
          source={item.avatar ? {uri: item.avatar} : defaultAvatar}
          style={styles.avatar}
        />
        {/* Ví dụ về chỉ báo trạng thái */}
        <View style={styles.onlineStatus} />
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.department}>{item.department?.name}</Text>
        <Text style={styles.role}>{item.role}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={20}
          color={THEME_COLOR}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm bạn bè..."
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>
      <FlatList
        data={filteredFriends}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
      <Loader visible={isLoading} />
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
    borderColor: THEME_COLOR,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: TEXT_COLOR,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLOR_2,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
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
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: TEXT_COLOR,
  },
  department: {
    fontSize: 16,
    color: '#666', // Màu sáng hơn
  },
  role: {
    fontSize: 14,
    color: '#999', // Màu sáng hơn nữa
  },
});

export default Message;
