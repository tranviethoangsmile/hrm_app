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
const {height} = Dimensions.get('window');
const topPosition = height * 0.1;
const ModalMessage = ({isVisible, onClose, message, type, t, duration}) => {
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
      <View style={getModalStyles()}>
        <Text style={styles.modalMessage}>{t(message)}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name={'close'} size={30} color={TEXT_COLOR} />
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
    padding: 15,
    backgroundColor: '#01c727',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  warningModalContent: {
    width: '90%',
    padding: 15,
    backgroundColor: '#f89802',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  errorModalContent: {
    width: '90%',
    padding: 15,
    backgroundColor: '#f83b2f',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  defaultModalContent: {
    width: '90%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#1A1A1A',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    color: '#4CAF50',
    fontSize: 18,
  },
});

export default ModalMessage;
