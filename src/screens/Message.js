import React, {useEffect, useState, useCallback, useRef} from 'react';
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
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../hooks/useTheme';
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
import defaultAvatar from '../assets/images/avatar.jpg';
import {decrypt} from '../services';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ConversationItem component để có thể sử dụng hooks
const ConversationItem = ({item, index, colors, t, USER_INFOR, handleSelectConversation, handleDeleteConversation, showMenuId, setShowMenuId}) => {
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

  // Animation values
  const itemFadeAnim = useRef(new Animated.Value(0)).current;
  const itemSlideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(itemFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(itemSlideAnim, {
        toValue: 0,
        duration: 600,
        delay: index * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
    <Animated.View
      style={[
        {
          opacity: itemFadeAnim,
          transform: [{translateY: itemSlideAnim}],
        },
      ]}>
      <TouchableOpacity
        style={[
          styles.conversationItem,
          {backgroundColor: colors.surface},
          hasUnreadMessages && styles.unreadConversationItem,
        ]}
        activeOpacity={0.7}
        onPress={() => handleSelectConversation(item.conversation_id, friend)}>
        {/* Avatar with online status */}
        <View style={styles.avatarContainer}>
          {isGroupChat ? (
            <LinearGradient
              colors={[colors.primary, colors.primary2]}
              style={[styles.avatar, styles.groupAvatarContainer]}>
              <IconFA name="users" size={20} color="#fff" />
            </LinearGradient>
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
            <Text style={[styles.friendName, {color: colors.text}]} numberOfLines={1}>
              {name}
            </Text>
            {messageTime ? (
              <Text style={[styles.messageTime, {color: colors.textSecondary}]}>{messageTime}</Text>
            ) : null}
          </View>

          <View style={styles.messageRow}>
            <Text
              style={[
                styles.messagePreview,
                {color: colors.textSecondary},
                hasUnreadMessages && styles.unreadMessagePreview,
              ]}
              numberOfLines={1}>
              {lastMessageText
                ? decrypt(lastMessageText, item.conversation_id)
                : t('no_messages')}
            </Text>
            {hasUnreadMessages && <View style={[styles.unreadIndicator, {backgroundColor: colors.primary}]} />}
          </View>
        </View>

        {/* Menu button */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={[styles.menuBtn, {backgroundColor: colors.surfaceSecondary}]}
            onPress={() =>
              setShowMenuId(
                showMenuId === item.conversation_id
                  ? null
                  : item.conversation_id,
              )
            }>
            <IconFA name="ellipsis-v" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Menu popup */}
        {showMenuId === item.conversation_id && (
          <View style={[styles.menuPopup, {backgroundColor: colors.surface}]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleDeleteConversation(item.conversation_id)}>
              <IconFA name="trash" size={14} color={colors.danger} />
              <Text style={[styles.menuText, {color: colors.danger}]}>{t('dl')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const Message = () => {
  const {t} = useTranslation();
  const {colors, isDarkMode} = useTheme();
  const authData = useSelector(state => state.auth);
  const USER_INFOR = authData?.data?.data;
  const navigation = useNavigation();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

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

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []); // Chỉ chạy 1 lần khi component mount

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

  const renderConversationItem = ({item, index}) => (
    <ConversationItem
      item={item}
      index={index}
      colors={colors}
      t={t}
      USER_INFOR={USER_INFOR}
      handleSelectConversation={handleSelectConversation}
      handleDeleteConversation={handleDeleteConversation}
      showMenuId={showMenuId}
      setShowMenuId={setShowMenuId}
    />
  );

  const EmptyState = () => (
    <Animated.View 
      style={[
        styles.emptyContainer,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      <LinearGradient
        colors={[colors.primary + '20', colors.primary2 + '20']}
        style={styles.emptyIconContainer}>
        <IconFA name="comments" size={40} color={colors.primary} />
      </LinearGradient>
      <Text style={[styles.emptyTitle, {color: colors.text}]}>{t('not.mess')}</Text>
      <Text style={[styles.emptySubtitle, {color: colors.textSecondary}]}>{t('start_first_conversation')}</Text>
    </Animated.View>
  );

  const renderHeader = () => (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      <LinearGradient
        colors={[colors.primary, colors.primary2]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <IconFA name="arrow-left" size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {t('messages_title')}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSearchText('')}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <IconFA name="broom" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {renderHeader()}

      {/* Search Section */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View 
          style={[
            styles.searchSection,
            {backgroundColor: colors.surface},
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <View style={[styles.searchContainer, {backgroundColor: colors.surfaceSecondary}]}>
            <IconFA name="search" size={16} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, {color: colors.text}]}
              placeholder={t('search_conversations')}
              value={searchText}
              onChangeText={handleSearch}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
            {searchText ? (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <IconFA name="times-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Content */}
      <Animated.View 
        style={[
          styles.contentContainer,
          {backgroundColor: colors.background},
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
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
                    colors={[colors.primary, colors.primary2]}
                    tintColor={colors.primary}
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
      </Animated.View>

      {/* FAB Button */}
      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <TouchableOpacity
          style={[styles.fab, {backgroundColor: colors.primary}]}
          onPress={handleOpenModal}
          activeOpacity={0.8}>
          <LinearGradient
            colors={[colors.primary, colors.primary2]}
            style={styles.fabGradient}>
            <IconFA name="plus" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

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
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44,
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
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
    flex: 1,
    textAlign: 'center',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 36,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 0,
  },
  contentContainer: {
    flex: 1,
    marginTop: 5,
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
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    letterSpacing: 0.2,
    flex: 1,
    marginRight: 8,
  },
  messageTime: {
    fontSize: 12,
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
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuPopup: {
    position: 'absolute',
    top: 10,
    right: 10,
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
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
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
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadConversationItem: {
    borderColor: 'rgba(0, 122, 255, 0.2)',
    borderWidth: 1,
    shadowColor: '#007AFF',
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
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#007AFF',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});

export default Message;
