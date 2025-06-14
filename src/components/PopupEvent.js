/* eslint-disable react-hooks/exhaustive-deps */
import React, {memo, useState} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

const PopupEvent = ({visible, event, onClose, t, navigation}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Icon name="calendar" size={18} color="#667eea" />
              </View>
              <Text style={styles.headerTitle}>{t('event')}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Event Image */}
          <View style={styles.imageContainer}>
            <Image source={{uri: event.media}} style={styles.eventImage} />
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}>
            <Text style={styles.eventTitle}>{event.name}</Text>
            <Text style={styles.eventDescription}>{event.description}</Text>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Icon name="play" size={14} color="#64748b" />
                <Text style={styles.detailText}>
                  {t('d.start')}: {event.date_start}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="stop" size={14} color="#64748b" />
                <Text style={styles.detailText}>
                  {t('d.end')}: {event.date_end}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="business" size={14} color="#64748b" />
                <Text style={styles.detailText}>
                  {t('position')}: {event.position}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.laterButton}
              onPress={onClose}
              activeOpacity={0.7}>
              <Text style={styles.laterText}>Later</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => {
                onClose();
                navigation.navigate('Event');
              }}
              activeOpacity={0.7}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.viewButtonGradient}>
                <Text style={styles.viewText}>View Details</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
    paddingTop: 16,
    maxHeight: 200,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 26,
  },
  eventDescription: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 20,
  },
  detailsContainer: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 10,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 12,
    gap: 12,
  },
  laterButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  laterText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
  },
  viewButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  viewButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});

export default memo(PopupEvent);
