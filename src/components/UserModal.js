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
import {COLORS, SIZES, FONTS, SHADOWS} from '../config/theme';
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
      onPress={() => toggleUserSelection(item)}
      activeOpacity={0.85}>
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
          <Icon name="check-circle" size={22} color={COLORS.primary} />
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
      animationType="fade"
      visible={isVisible}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerBackBtn}>
              <Icon name="arrow-left" size={22} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('newGroup')}</Text>
            <Text style={styles.headerSelectedCount}>{`${t('selected')}: ${
              selectedUsers.length
            }`}</Text>
          </View>

          {/* Group name input */}
          {selectedUsers.length > 1 && (
            <View style={styles.groupNameContainer}>
              <TextInput
                style={styles.groupNameInput}
                placeholder={t('groupNameMake')}
                placeholderTextColor={COLORS.placeholder}
                value={groupName}
                onChangeText={text => setGroupName(text)}
              />
            </View>
          )}

          {/* Search bar */}
          <View style={styles.searchBarWrap}>
            <Icon
              name="search"
              size={18}
              color={COLORS.placeholder}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchFriend')}
              placeholderTextColor={COLORS.placeholder}
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>

          {/* User list */}
          <FlatList
            data={filteredUsers}
            keyExtractor={item => item.id.toString()}
            renderItem={renderUserItem}
            contentContainerStyle={styles.flatListContent}
            keyboardShouldPersistTaps="handled"
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

          {/* Create group button */}
          {selectedUsers.length > 0 && (
            <TouchableOpacity
              style={styles.createGroupButton}
              onPress={handleCreateGroup}
              activeOpacity={0.85}>
              <Icon name="arrow-right" size={22} color={COLORS.white} />
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
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '92%',
    maxHeight: '90%',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2,
    paddingVertical: 18,
    paddingHorizontal: 0,
    ...SHADOWS.medium,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.base * 2,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    marginBottom: 8,
  },
  headerBackBtn: {
    padding: 6,
    marginRight: 4,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSelectedCount: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginLeft: 8,
    minWidth: 60,
    textAlign: 'right',
  },
  groupNameContainer: {
    paddingHorizontal: SIZES.base * 2,
    marginBottom: 8,
  },
  groupNameInput: {
    height: 40,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.lightGray1,
    paddingHorizontal: SIZES.inputPaddingHorizontal,
    color: COLORS.text,
    ...FONTS.body3,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray1,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.base * 2,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    height: 40,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  flatListContent: {
    paddingBottom: 16,
    paddingHorizontal: SIZES.base * 2,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray2,
    ...SHADOWS.light,
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.lightGray2,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  userSubInfo: {
    ...FONTS.body5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  checkbox: {
    paddingLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedUserList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 8,
    minHeight: 24,
  },
  selectedUserItem: {
    marginRight: 6,
    marginBottom: 6,
  },
  selectedUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightGray2,
  },
  createGroupButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: COLORS.primary,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
    zIndex: 10,
  },
});

export default UserModal;
