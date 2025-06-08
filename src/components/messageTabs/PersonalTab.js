import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {COLORS, SIZES, FONTS, SHADOWS} from '../../config/theme';
import defaultAvatar from '../../assets/images/avatar.jpg';
import {decrypt} from '../../services';

const PersonalTab = ({
  filteredConversations,
  t,
  handleLongPress,
  handleDeleteConversation,
  handleSelectConversation,
  handleSearch,
  searchText,
  USER_INFOR,
}) => {
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [uniqueConversations, setUniqueConversations] = useState([]);
  const [showMenuId, setShowMenuId] = useState(null);
  // Remove duplicates by grouping conversations based on conversation_id
  useEffect(() => {
    const filteredUniqueConversations = filteredConversations.reduce(
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
    setUniqueConversations(filteredUniqueConversations);
  }, [filteredConversations]);

  const onLongPressHandler = message => {
    setSelectedMessageId(prevId =>
      prevId === message.conversation_id ? null : message.conversation_id,
    );
    handleLongPress(message);
  };

  const onDeleteConversation = conversationId => {
    handleDeleteConversation(conversationId);
    setUniqueConversations(prev =>
      prev.filter(
        conversation => conversation.conversation_id !== conversationId,
      ),
    );
  };

  const renderItem = ({item}) => {
    const messages = item.conversation?.messages || [];
    let lastMessageText = '';
    const name =
      item.group_type === 'GROUP'
        ? item.conversation?.title || 'Group Conversation'
        : item.users?.name;
    const avatar = item.group_type === 'GROUP' ? null : item.users.avatar;
    const friend = {name, avatar};
    if (
      messages.length > 0 &&
      messages[0].message_type === 'TEXT' &&
      !messages[0].is_unsend &&
      messages[0].user_id !== USER_INFOR.id
    ) {
      lastMessageText = messages[0].message;
    }
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        activeOpacity={0.8}
        onPress={() => handleSelectConversation(item.conversation_id, friend)}
        onLongPress={() => onLongPressHandler(item)}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              item.users?.avatar ? {uri: item.users.avatar} : defaultAvatar
            }
            style={styles.avatar}
          />
        </View>
        <View style={styles.conversationInfo}>
          <Text
            style={styles.friendName}
            numberOfLines={1}
            ellipsizeMode="tail">
            {name}
          </Text>
          <Text
            style={styles.messagePreview}
            numberOfLines={1}
            ellipsizeMode="tail">
            {decrypt(lastMessageText, item.conversation_id)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() =>
            setShowMenuId(
              showMenuId === item.conversation_id ? null : item.conversation_id,
            )
          }>
          <Icon name="ellipsis-v" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
        {showMenuId === item.conversation_id && (
          <View style={styles.menuPopup}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onDeleteConversation(item.conversation_id);
                setShowMenuId(null);
              }}>
              <Text style={styles.menuText}>{t('dl')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={() => setShowMenuId(null)}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={18}
            color={COLORS.placeholder}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search')}
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor={COLORS.placeholder}
          />
        </View>
        {uniqueConversations.length > 0 ? (
          <FlatList
            data={uniqueConversations}
            keyExtractor={item => item.conversation_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>{t('not.mess')}</Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.base,
    paddingTop: SIZES.base,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 0,
    marginBottom: 8,
    ...SHADOWS.light,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textSecondary,
    paddingLeft: 2,
    paddingVertical: 6,
  },
  listContent: {
    paddingBottom: 24,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    ...SHADOWS.light,
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.lightGray2,
    backgroundColor: COLORS.lightGray1,
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  friendName: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  messagePreview: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  menuBtn: {
    marginLeft: 10,
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuPopup: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    ...SHADOWS.light,
    zIndex: 100,
  },
  menuItem: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  menuText: {
    ...FONTS.body4,
    color: COLORS.danger,
    fontWeight: 'bold',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 40,
  },
});

export default PersonalTab;
