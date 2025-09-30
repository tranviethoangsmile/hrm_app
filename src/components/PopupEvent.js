/* eslint-disable react-hooks/exhaustive-deps */
import React, {memo, useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../hooks/useTheme';

const {width} = Dimensions.get('window');

const PopupEvent = ({visible, event, onClose, t, navigation}) => {
  const {colors, isDarkMode} = useTheme();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          delay: 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, {opacity: overlayOpacity}]}>
        <Animated.View 
          style={[
            styles.modalContainer, 
            {
              backgroundColor: isDarkMode ? 'rgba(20, 20, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              opacity: fadeAnim,
              transform: [
                {scale: scaleAnim},
                {translateY: slideAnim}
              ]
            }
          ]}>
          {/* Clean Header */}
          <View style={[styles.header, {backgroundColor: colors.surface}]}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={[styles.iconContainer, {backgroundColor: colors.primary}]}>
                  <Icon name="calendar" size={20} color="#fff" />
                </View>
                <View>
                  <Text style={[styles.headerTitle, {color: colors.text}]}>{t('event')}</Text>
                  <Text style={[styles.headerSubtitle, {color: colors.textSecondary}]}>{t('new_event_available', 'New Event Available')}</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={onClose} 
                style={[styles.closeButton, {backgroundColor: colors.background}]}
                activeOpacity={0.7}>
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Clean Event Image */}
          <View style={styles.imageContainer}>
            <Image source={{uri: event.media}} style={styles.eventImage} />
            <View style={styles.imageBadge}>
              <Icon name="calendar" size={14} color="#fff" />
              <Text style={styles.imageBadgeText}>{t('event')}</Text>
            </View>
          </View>

          {/* Clean Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}>
            <View style={styles.titleSection}>
              <Text style={[styles.eventTitle, {color: colors.text}]}>{event.name}</Text>
              <Text style={[styles.eventDescription, {color: colors.textSecondary}]}>{event.description}</Text>
            </View>

            <View style={[styles.detailsContainer, {backgroundColor: colors.background}]}>
              <Text style={[styles.detailsTitle, {color: colors.text}]}>{t('event_details', 'Event Details')}</Text>
              
              <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                  <Icon name="play" size={16} color={colors.primary} />
                  <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>{t('start_date', 'Start Date')}:</Text>
                  <Text style={[styles.detailText, {color: colors.text}]}>{event.date_start}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Icon name="stop" size={16} color={colors.primary} />
                  <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>{t('end_date', 'End Date')}:</Text>
                  <Text style={[styles.detailText, {color: colors.text}]}>{event.date_end}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Icon name="business" size={16} color={colors.primary} />
                  <Text style={[styles.detailLabel, {color: colors.textSecondary}]}>{t('position')}:</Text>
                  <Text style={[styles.detailText, {color: colors.text}]}>{event.position}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Clean Actions */}
          <View style={[styles.actions, {backgroundColor: colors.surface}]}>
            <TouchableOpacity
              style={[styles.laterButton, {backgroundColor: colors.background, borderColor: colors.border}]}
              onPress={onClose}
              activeOpacity={0.7}>
              <Icon name="time-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.laterText, {color: colors.textSecondary}]}>{t('maybe_later', 'Maybe Later')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.viewButton, {backgroundColor: colors.primary}]}
              onPress={() => {
                onClose();
                navigation.navigate('Event');
              }}
              activeOpacity={0.8}>
              <Icon name="arrow-forward" size={18} color="#fff" />
              <Text style={styles.viewText}>{t('view_details', 'View Details')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    opacity: 0.7,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    marginHorizontal: 20,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  imageBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    padding: 20,
    maxHeight: 300,
  },
  titleSection: {
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  detailsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailsList: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  laterButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
  },
  laterText: {
    fontSize: 15,
    fontWeight: '600',
  },
  viewButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
  },
  viewText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});

export default memo(PopupEvent);
