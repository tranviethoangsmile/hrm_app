import React, {useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {TEXT_COLOR} from '../utils/Colors';
import {NativeModules} from 'react-native';
import {useTheme} from '../hooks/useTheme';
const {height} = Dimensions.get('window');
const topPosition = height * 0.1;
const ModalMessage = ({isVisible, onClose, message, type, t, duration}) => {
  const {colors, isDarkMode} = useTheme();
  const getModalStyles = () => {
    switch (type) {
      case 'success':
        return styles.successModalContent;
      case 'warning':
        return styles.warningModalContent;
      case 'error':
        return styles.errorModalContent;
      default:
        return styles.defaultModalContent;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <Icon
            name="checkmark-circle"
            size={36}
            color="#2ecc40"
            style={{marginBottom: 6}}
          />
        );
      case 'warning':
        return (
          <Icon
            name="alert-circle"
            size={36}
            color="#f1c40f"
            style={{marginBottom: 6}}
          />
        );
      case 'error':
        return (
          <Icon
            name="close-circle"
            size={36}
            color="#e74c3c"
            style={{marginBottom: 6}}
          />
        );
      default:
        return (
          <Icon
            name="information-circle"
            size={36}
            color="#3498db"
            style={{marginBottom: 6}}
          />
        );
    }
  };

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  return (
    <View style={styles.nonBlockingContainer}>
      <View style={[getModalStyles(), styles.shadowBox, {backgroundColor: colors.surface}]}>
        {getIcon()}
        <Text style={[styles.modalMessage, {color: colors.text}]}>
          {message ? t(message) : message}
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name={'close'} size={28} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nonBlockingContainer: {
    position: 'absolute',
    top: topPosition,
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  successModalContent: {
    width: '90%',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  warningModalContent: {
    width: '90%',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  errorModalContent: {
    width: '90%',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  defaultModalContent: {
    width: '90%',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  modalMessage: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  shadowBox: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default ModalMessage;
