import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Image,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import defaultAvatar from '../assets/images/avatar.jpg';
import {COLORS, SIZES, FONTS, SHADOWS} from '../config/theme';
import {THEME_COLOR, TEXT_COLOR} from '../utils/Colors';
import ModalMessage from './ModalMessage';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const UserModal = ({isVisible, onClose, users, onSelectUser, t}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [messageModal, setMessageModal] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [duration, setDuration] = useState(1000);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      e => {
        setKeyboardHeight(e.endCoordinates.height);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

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

  const handleScroll = () => {
    Keyboard.dismiss();
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleClose = () => {
    setSelectedUsers([]);
    setGroupName('');
    setSearchText('');
    onClose();
  };

  const renderUserItem = ({item}) => {
    const isSelected = selectedUsers.some(selected => selected.id === item.id);

    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.selectedUserItem]}
        onPress={() => toggleUserSelection(item)}
        activeOpacity={0.7}>
        <View style={styles.avatarContainer}>
          <Image
            source={item.avatar ? {uri: item.avatar} : defaultAvatar}
            style={styles.avatar}
          />
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Icon name="check" size={14} color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.userDepartment} numberOfLines={1}>
            {item.department?.name || 'Chưa có phòng ban'}
          </Text>
        </View>

        <View style={styles.selectionIndicator}>
          {isSelected ? (
            <Icon name="check-circle" size={24} color={THEME_COLOR} />
          ) : (
            <View style={styles.unselectedCheckbox} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleCreateChat = () => {
    if (selectedUsers.length === 0) {
      showMessage('Vui lòng chọn người để trò chuyện', 'warning', 1500);
      return;
    }

    if (selectedUsers.length > 1 && groupName.trim() === '') {
      showMessage('Vui lòng nhập tên nhóm', 'warning', 1500);
      return;
    }

    onSelectUser(selectedUsers, groupName);
    handleClose();
  };

  const renderSelectedUsers = () => {
    if (selectedUsers.length === 0) return null;

    return (
      <View style={styles.selectedSection}>
        <Text style={styles.selectedTitle}>
          Đã chọn ({selectedUsers.length})
        </Text>
        <FlatList
          horizontal
          data={selectedUsers}
          keyExtractor={item => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => (
            <View style={styles.selectedUserChip}>
              <Image
                source={item.avatar ? {uri: item.avatar} : defaultAvatar}
                style={styles.selectedUserAvatar}
              />
              <TouchableOpacity
                style={styles.removeUserBtn}
                onPress={() => toggleUserSelection(item)}>
                <Icon name="close-circle" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.selectedUsersList}
        />
      </View>
    );
  };

  const renderGroupNameInput = () => {
    if (selectedUsers.length <= 1) return null;

    return (
      <View style={styles.groupNameSection}>
        <View style={styles.groupNameContainer}>
          <Icon name="account-group" size={20} color="#8E8E93" />
          <TextInput
            style={styles.groupNameInput}
            placeholder="Nhập tên nhóm chat..."
            placeholderTextColor="#8E8E93"
            value={groupName}
            onChangeText={setGroupName}
            autoCapitalize="words"
          />
          {groupName ? (
            <TouchableOpacity onPress={() => setGroupName('')}>
              <Icon name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  if (!isVisible) return null;

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isVisible}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen">
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <View
            style={[
              styles.modalContent,
              {
                marginBottom:
                  keyboardHeight > 0 ? Math.min(keyboardHeight * 0.05, 20) : 0,
              },
            ]}>
            {/* Header */}
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.headerGradient}>
              <View style={styles.headerContent}>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.backButton}>
                  <Icon name="close" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                  {selectedUsers.length > 1
                    ? 'Tạo nhóm chat'
                    : 'Chọn người trò chuyện'}
                </Text>
                <View style={styles.headerRight}>
                  {selectedUsers.length > 0 && (
                    <Text style={styles.selectedCount}>
                      {selectedUsers.length}
                    </Text>
                  )}
                </View>
              </View>
            </LinearGradient>

            {/* Search Bar */}
            <View style={styles.searchSection}>
              <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color="#8E8E93" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm kiếm đồng nghiệp..."
                  placeholderTextColor="#8E8E93"
                  value={searchText}
                  onChangeText={handleSearch}
                  autoCapitalize="none"
                />
                {searchText ? (
                  <TouchableOpacity onPress={() => setSearchText('')}>
                    <Icon name="close-circle" size={20} color="#8E8E93" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Selected Users */}
            {renderSelectedUsers()}

            {/* Group Name Input */}
            {renderGroupNameInput()}

            {/* User List */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.listContainer}>
                <FlatList
                  data={filteredUsers}
                  keyExtractor={item => item.id.toString()}
                  renderItem={renderUserItem}
                  contentContainerStyle={[
                    styles.flatListContent,
                    {
                      paddingBottom:
                        keyboardHeight > 0 ? keyboardHeight + 20 : 20,
                    },
                  ]}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  onScroll={handleScroll}
                  onScrollBeginDrag={handleScroll}
                  scrollEventThrottle={16}
                  ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                      <Icon name="account-search" size={60} color="#C7C7CC" />
                      <Text style={styles.emptyTitle}>
                        Không tìm thấy kết quả
                      </Text>
                      <Text style={styles.emptySubtitle}>
                        {searchText
                          ? 'Thử tìm kiếm với từ khóa khác'
                          : 'Danh sách trống'}
                      </Text>
                    </View>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>

            {/* Bottom Button */}
            {selectedUsers.length > 0 && (
              <View style={styles.bottomSection}>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateChat}
                  activeOpacity={0.8}>
                  <Icon
                    name={selectedUsers.length > 1 ? 'account-group' : 'send'}
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.createButtonText}>
                    {selectedUsers.length > 1
                      ? 'Tạo nhóm chat'
                      : 'Bắt đầu trò chuyện'}
                  </Text>
                </TouchableOpacity>
              </View>
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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_HEIGHT * 0.85,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 5,
  },
  backButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  headerRight: {
    minWidth: 32,
    alignItems: 'center',
  },
  selectedCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: TEXT_COLOR,
    marginLeft: 8,
    paddingVertical: 0,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flatListContent: {
    paddingVertical: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F2F2F7',
  },
  selectedUserItem: {
    backgroundColor: '#F8F9FF',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
  },
  selectedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: THEME_COLOR,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_COLOR,
    marginBottom: 2,
  },
  userDepartment: {
    fontSize: 14,
    color: '#8E8E93',
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  unselectedCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    backgroundColor: 'transparent',
  },
  bottomSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  createButton: {
    backgroundColor: THEME_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_COLOR,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  selectedSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_COLOR,
    marginBottom: 12,
  },
  selectedUsersList: {
    paddingVertical: 4,
  },
  selectedUserChip: {
    position: 'relative',
    marginRight: 12,
    alignItems: 'center',
  },
  selectedUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    borderWidth: 2,
    borderColor: THEME_COLOR,
  },
  removeUserBtn: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  groupNameSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  groupNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 44,
  },
  groupNameInput: {
    flex: 1,
    fontSize: 16,
    color: TEXT_COLOR,
    marginLeft: 8,
    paddingVertical: 0,
  },
});

export default UserModal;
