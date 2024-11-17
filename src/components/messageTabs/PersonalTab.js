import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {TEXT_COLOR, THEME_COLOR} from '../../utils/Colors';
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
  // Remove duplicates by grouping conversations based on conversation_id
  useEffect(() => {
    const filteredUniqueConversations = filteredConversations.reduce((acc, current) => {
      const found = acc.find(
        item => item.conversation_id === current.conversation_id
      );
      if (!found) {
        acc.push(current);
      }
      return acc;
    }, []);
    setUniqueConversations(filteredUniqueConversations);
  }, [filteredConversations]);

  const onLongPressHandler = message => {
    setSelectedMessageId(prevId =>
      prevId === message.conversation_id ? null : message.conversation_id,
    );
    handleLongPress(message);
  };

  const onDeleteConversation = (conversationId) => {
    handleDeleteConversation(conversationId);
    setUniqueConversations(prev =>
      prev.filter(conversation => conversation.conversation_id !== conversationId)
    );
  };

  const renderItem = ({item}) => {
    const messages = item.conversation?.messages || [];
    let lastMessageText = '';
  
    // Determine the display name or title based on conversation type
    const name =
      item.group_type === 'GROUP'
        ? item.conversation?.title || 'Group Conversation'
        : item.users?.name;
    const avatar = item.group_type === 'GROUP'? null :
     item.users.avatar 
    // Check if there is a last message to display
    const friend = {
      name, avatar
    }
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
        style={[
          styles.conversationItem,
          selectedMessageId === item.conversation_id && styles.selectedItem,
        ]}
        onPress={() =>
          handleSelectConversation(item.conversation_id, friend)
        } // Pass displayName, which is either the title or user's name
        onLongPress={() => onLongPressHandler(item)}>
        <View style={styles.itemContent}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                item.users?.avatar ? {uri: item.users.avatar} : defaultAvatar
              }
              style={styles.avatar}
            />
            <View style={styles.onlineStatus} />
          </View>
  
          <View style={styles.conversationInfo}>
            <Text style={styles.friendName}>{name}</Text>
            <Text style={styles.messagePreview}>
              {decrypt(lastMessageText, item.conversation_id)}
            </Text>
          </View>
  
          {selectedMessageId === item.conversation_id && (
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                onPress={() => onDeleteConversation(item.conversation_id)}
                style={styles.optionButton}>
                <Text style={styles.optionText}>{t('dl')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('search')}
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
      </View>
      {uniqueConversations.length > 0 ? (
        <FlatList
          data={uniqueConversations} // Use unique conversations
          keyExtractor={item => item.conversation_id.toString()}
          renderItem={renderItem}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>{t('not.mess')}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  messagePreview: {
    color: '#e0e0e0',
  },
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E2E2E',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#333333',
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    position: 'relative',
  },
  selectedItem: {
    backgroundColor: '#444444',
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
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  onlineStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    position: 'absolute',
    right: -2,
    bottom: -2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  optionsContainer: {
    position: 'absolute',
    top: '50%',
    right: 15,
    backgroundColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444444',
  },
  optionButton: {
    backgroundColor: THEME_COLOR,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  optionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#999999',
  },
});


export default PersonalTab;
