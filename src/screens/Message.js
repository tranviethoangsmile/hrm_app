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
  FlatList,
  TextInput,
  Image,
  TouchableWithoutFeedback,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
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
} from '../utils/constans';
import Loader from '../components/Loader';
import {UserModal, ModalMessage} from '../components';
import {THEME_COLOR, THEME_COLOR_2, TEXT_COLOR} from '../utils/Colors';
import {COLORS, SIZES, FONTS, SHADOWS} from '../config/theme';
import defaultAvatar from '../assets/images/avatar.jpg';
import {decrypt} from '../services';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const Message = () => {
  const {t} = useTranslation();
  const authData = useSelector(state => state.auth);
  const USER_INFOR = authData?.data?.data;
  const navigation = useNavigation();

  const [searchText, setSearchText] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [allConversations, setAllConversations] = useState([]);
  const [uniqueConversations, setUniqueConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [showMenuId, setShowMenuId] = useState(null);
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
    }
  }, [USER_INFOR, showMessage]);

  const handleGetConversations = useCallback(async () => {
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

      // Remove duplicates
      const uniqueConversations = filteredConversations.reduce(
        (acc, current) => {
          const found = acc.find(
            item => item.conversation_id === current.conversation_id,
          );
          if (!found) {
            acc.push(current);
          }
          return acc;
        },
        [],
      );
      setUniqueConversations(uniqueConversations);
    } catch (error) {
      showMessage('networkError', 'error', 1000);
    }
  }, [USER_INFOR, showMessage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await handleGetConversations();
    setRefreshing(false);
  }, [handleGetConversations]);

  const onClose = () => {
    setModalVisible(false);
    Keyboard.dismiss();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setShowMenuId(null);
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
      setUniqueConversations(prev =>
        prev.filter(conversation => conversation.conversation_id !== id),
      );
      setShowMenuId(null);
    } catch (error) {
      showAlert(error?.message || 'unSuccess');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await handleGetConversations();
      await getAllFriendList();
      setIsLoading(false);
    };
    loadData();
  }, [navigation, handleGetConversations, getAllFriendList]);

  const handleSearch = text => {
    setSearchText(text);
    if (text.trim() === '') {
      const uniqueConversations = allConversations.reduce((acc, current) => {
        const found = acc.find(
          item => item.conversation_id === current.conversation_id,
        );
        if (!found) {
          acc.push(current);
        }
        return acc;
      }, []);
      setUniqueConversations(uniqueConversations);
    } else {
      const filtered = allConversations.filter(conversation => {
        const isGroupChat = conversation.group_type === 'GROUP';
        const name = isGroupChat
          ? conversation.conversation?.title ||
            conversation.conversation?.name ||
            t('group_chat')
          : conversation.users?.name;
        return name?.toLowerCase().includes(text.toLowerCase());
      });
      const uniqueFiltered = filtered.reduce((acc, current) => {
        const found = acc.find(
          item => item.conversation_id === current.conversation_id,
        );
        if (!found) {
          acc.push(current);
        }
        return acc;
      }, []);
      setUniqueConversations(uniqueFiltered);
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
      handleSelectConversation(conversationId, user);
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

  const renderConversationItem = ({item}) => {
    const messages = item.conversation?.messages || [];
    let lastMessageText = '';
    let messageTime = '';

    // Phân biệt Group chat vs Personal chat
    const isGroupChat = item.group_type === 'GROUP';
    const name = isGroupChat
      ? item.conversation?.title || item.conversation?.name || t('group_chat')
      : item.users?.name;
    const avatar = isGroupChat ? null : item.users?.avatar;
    const friend = {name, avatar};
    const hasUnreadMessages =
      messages.length > 0 && messages[0].user_id !== USER_INFOR.id;

    if (messages.length > 0) {
      if (messages[0].message_type === 'TEXT' && !messages[0].is_unsend) {
        lastMessageText = messages[0].message;
      } else if (messages[0].message_type === 'IMAGE') {
        lastMessageText = t('image_message');
      } else if (messages[0].message_type === 'FILE') {
        lastMessageText = t('file_message');
      } else {
        lastMessageText = t('message');
      }

      // Format message time with safe date handling
      try {
        const createdAt = messages[0].created_at;
        if (createdAt) {
          const messageDate = new Date(createdAt);

          // Check if date is valid
          if (!isNaN(messageDate.getTime())) {
            const now = new Date();
            const diffInHours = (now - messageDate) / (1000 * 60 * 60);

            if (diffInHours < 1) {
              messageTime = t('just_now');
            } else if (diffInHours < 24) {
              messageTime = messageDate.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              });
            } else if (diffInHours < 48) {
              messageTime = t('yesterday');
            } else if (diffInHours < 168) {
              // Less than a week
              const days = [
                t('sunday_short'),
                t('monday_short'),
                t('tuesday_short'),
                t('wednesday_short'),
                t('thursday_short'),
                t('friday_short'),
                t('saturday_short'),
              ];
              messageTime = days[messageDate.getDay()];
            } else {
              messageTime = messageDate.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
              });
            }
          } else {
            messageTime = ''; // Invalid date, show empty
          }
        } else {
          messageTime = ''; // No created_at field
        }
      } catch (error) {
        console.log('Date parsing error:', error);
        messageTime = ''; // Fallback to empty string
      }
    }

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          hasUnreadMessages && styles.unreadConversationItem,
        ]}
        activeOpacity={0.7}
        onPress={() => handleSelectConversation(item.conversation_id, friend)}>
        {/* Avatar with online status */}
        <View style={styles.avatarContainer}>
          {isGroupChat ? (
            <View style={[styles.avatar, styles.groupAvatarContainer]}>
              <Icon name="account-group" size={26} color="#667eea" />
            </View>
          ) : (
            <Image
              source={avatar ? {uri: avatar} : defaultAvatar}
              style={styles.avatar}
            />
          )}
          {!isGroupChat && <View style={styles.onlineIndicator} />}
          {hasUnreadMessages && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>●</Text>
            </View>
          )}
        </View>

        {/* Conversation info */}
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.friendName} numberOfLines={1}>
              {name}
            </Text>
            {messageTime ? (
              <Text style={styles.messageTime}>{messageTime}</Text>
            ) : null}
          </View>

          <View style={styles.messageRow}>
            <Text
              style={[
                styles.messagePreview,
                hasUnreadMessages && styles.unreadMessagePreview,
              ]}
              numberOfLines={1}>
              {lastMessageText
                ? decrypt(lastMessageText, item.conversation_id)
                : t('no_messages')}
            </Text>
            {hasUnreadMessages && <View style={styles.unreadIndicator} />}
          </View>
        </View>

        {/* Menu button */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() =>
              setShowMenuId(
                showMenuId === item.conversation_id
                  ? null
                  : item.conversation_id,
              )
            }>
            <Icon name="dots-vertical" size={18} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Menu popup */}
        {showMenuId === item.conversation_id && (
          <View style={styles.menuPopup}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleDeleteConversation(item.conversation_id)}>
              <Icon name="delete-outline" size={16} color="#FF3B30" />
              <Text style={styles.menuText}>{t('dl')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="message-text-outline" size={80} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>{t('not.mess')}</Text>
      <Text style={styles.emptySubtitle}>{t('start_first_conversation')}</Text>
    </View>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.headerGradient}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('messages_title')}</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setSearchText('')}>
          <Icon name="broom" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {renderHeader()}

      {/* Search Section */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder={t('search_conversations')}
              value={searchText}
              onChangeText={handleSearch}
              placeholderTextColor="#8E8E93"
              autoCapitalize="none"
            />
            {searchText ? (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Icon name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Content */}
      <View style={styles.contentContainer}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.listContainer}>
            {uniqueConversations.length > 0 ? (
              <FlatList
                data={uniqueConversations}
                keyExtractor={item => item.conversation_id.toString()}
                renderItem={renderConversationItem}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[THEME_COLOR]}
                    tintColor={THEME_COLOR}
                  />
                }
                showsVerticalScrollIndicator={false}
                onScroll={dismissKeyboard}
                onScrollBeginDrag={dismissKeyboard}
                scrollEventThrottle={16}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            ) : (
              <EmptyState />
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>

      {/* FAB Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleOpenModal}
        activeOpacity={0.8}>
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Loading */}
      <Loader visible={isLoading} />

      {/* Modals */}
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
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    paddingTop: (StatusBar.currentHeight || 44) + 5,
    paddingBottom: 12,
    shadowColor: '#667eea',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 5,
  },
  backButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
  },
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 36,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: TEXT_COLOR,
    marginLeft: 8,
    paddingVertical: 0,
  },
  contentContainer: {
    flex: 1,
    marginTop: 5,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  listContainer: {
    flex: 1,
    paddingTop: 16,
  },
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  separator: {
    height: 12,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F2F2F7',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  groupAvatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34C759',
    borderWidth: 2.5,
    borderColor: '#fff',
    shadowColor: '#34C759',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_COLOR,
    letterSpacing: 0.2,
    flex: 1,
    marginRight: 8,
  },
  messageTime: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messagePreview: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
    flex: 1,
    marginRight: 8,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  menuBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  menuPopup: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 100,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  menuText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    color: TEXT_COLOR,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: THEME_COLOR,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  unreadConversationItem: {
    backgroundColor: '#F8F9FF',
    borderColor: 'rgba(88, 86, 214, 0.1)',
    borderWidth: 1,
    shadowColor: THEME_COLOR,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  unreadMessagePreview: {
    fontWeight: '600',
    color: '#3C3C43',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME_COLOR,
    shadowColor: THEME_COLOR,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});

export default Message;
