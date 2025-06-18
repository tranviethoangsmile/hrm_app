import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS, SIZES, FONTS} from '../../config/theme';

const GuideModal = ({visible, onClose, title, content}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.guideText}>{content}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  content: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    width: '90%',
    maxHeight: '80%',
    padding: SIZES.padding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.text,
    flex: 1,
  },
  closeButton: {
    padding: SIZES.base,
  },
  scrollView: {
    marginTop: SIZES.base,
  },
  guideText: {
    ...FONTS.body3,
    color: COLORS.text,
    lineHeight: 24,
  },
});

export default GuideModal;
