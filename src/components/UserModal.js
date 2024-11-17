import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Image,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import defaultAvatar from '../assets/images/avatar.jpg';
import {BG_COLOR, TEXT_COLOR, THEME_COLOR} from '../utils/Colors';
import ModalMessage from './ModalMessage';

const UserModal = ({isVisible, onClose, users, onSelectUser, t}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
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

  const handleSearch = text => {
    setSearchText(text);
  };

  const toggleUserSelection = user => {
    if (selectedUsers.some(selected => selected.id === user.id)) {
      setSelectedUsers(
        selectedUsers.filter(selected => selected.id !== user.id),
      );
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const renderUserItem = ({item}) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => toggleUserSelection(item)}>
      <View style={styles.avatarContainer}>
        <Image
          source={item.avatar ? {uri: item.avatar} : defaultAvatar}
          style={styles.avatar}
        />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userSubInfo}>{item.department.name}</Text>
      </View>
      <View style={styles.checkbox}>
        {selectedUsers.some(selected => selected.id === item.id) && (
          <Icon name="check-circle" size={24} color={THEME_COLOR} />
        )}
      </View>
    </TouchableOpacity>
  );

  const handleCreateGroup = () => {
    if (selectedUsers.length > 1 && groupName.trim() === '') {
      showMessage('Nhập tên nhóm', 'warning', 1000);
      return;
    }
    onSelectUser(selectedUsers, groupName);
    setGroupName('');
    setSelectedUsers([]);
    onClose();
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalContent}>
          <FlatList
            data={filteredUsers}
            keyExtractor={item => item.id.toString()}
            renderItem={renderUserItem}
            contentContainerStyle={styles.flatListContent}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <>
                {/* Header */}
                <View style={styles.header}>
                  <TouchableOpacity onPress={onClose}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>{t('newGroup')}</Text>
                  <Text style={styles.headerSelectedCount}>
                    {`${t('selected')}: ${selectedUsers.length}`}
                  </Text>
                </View>

                {/* Nhập tên nhóm */}
                {selectedUsers.length > 1 && (
                  <View style={styles.groupNameContainer}>
                    <TextInput
                      style={styles.groupNameInput}
                      placeholder={t('groupNameMake')}
                      placeholderTextColor="#999"
                      value={groupName}
                      onChangeText={text => setGroupName(text)}
                    />
                  </View>
                )}

                {/* Ô tìm kiếm */}
                <TextInput
                  style={styles.searchInput}
                  placeholder={t('searchFriend')}
                  placeholderTextColor="#999"
                  value={searchText}
                  onChangeText={handleSearch}
                />
              </>
            }
            ListFooterComponent={
              <View style={styles.selectedUserList}>
                {selectedUsers.map(user => (
                  <View key={user.id} style={styles.selectedUserItem}>
                    <Image
                      source={user.avatar ? {uri: user.avatar} : defaultAvatar}
                      style={styles.selectedUserAvatar}
                    />
                  </View>
                ))}
              </View>
            }
          />

          {/* Nút tạo nhóm */}
          {selectedUsers.length > 0 && (
            <TouchableOpacity
              style={styles.createGroupButton}
              onPress={handleCreateGroup}>
              <Icon name="arrow-right" size={20} color="#fff" />
            </TouchableOpacity>
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
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 15,
    elevation: 10,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSelectedCount: {
    fontSize: 14,
    color: '#888',
  },
  groupNameContainer: {
    marginVertical: 10,
  },
  groupNameInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    color: '#fff',
    paddingBottom: 5,
    fontSize: 16,
  },
  searchInput: {
    height: 40,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    color: '#fff',
    backgroundColor: '#333',
    marginVertical: 10,
    fontSize: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    color: '#fff',
  },
  userSubInfo: {
    fontSize: 12,
    color: '#aaa',
  },
  checkbox: {
    paddingRight: 15,
  },
  selectedUserList: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  selectedUserItem: {
    marginHorizontal: 5,
  },
  selectedUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  createGroupButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default UserModal;
