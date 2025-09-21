// BeautifulModal.js
// Usage example:
// <BeautifulModal
//   visible={modalVisible}
//   onClose={() => setModalVisible(false)}
//   title="Tạo báo cáo an toàn"
//   actions={[
//     {label: 'Huỷ', onPress: onCancel, style: 'cancel'},
//     {label: 'Tạo', onPress: onCreate, style: 'primary'},
//   ]}
// >
//   {/* Nội dung form ở đây */}
// </BeautifulModal>

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../hooks/useTheme';

const BeautifulModal = ({visible, onClose, title, children, actions = []}) => {
  const {colors, isDarkMode} = useTheme();
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, {backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)'}]}>
          <TouchableWithoutFeedback>
            <View style={styles.centeredView}>
              <View style={[styles.modalCard, {backgroundColor: colors.surface}]}>
                {/* Close button */}
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Icon name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                {/* Title */}
                {title ? <Text style={[styles.title, {color: colors.text}]}>{title}</Text> : null}
                {/* Content */}
                <ScrollView
                  contentContainerStyle={styles.content}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}>
                  {children}
                </ScrollView>
                {/* Actions */}
                <View style={styles.actionsRow}>
                  {actions.map((action, idx) => (
                    <TouchableOpacity
                      key={action.label + idx}
                      style={[
                        styles.actionBtn,
                        {backgroundColor: action.style === 'primary' ? colors.primary : action.style === 'danger' ? colors.danger : colors.border},
                        action.style === 'primary' && styles.primaryBtn,
                        action.style === 'cancel' && styles.cancelBtn,
                        action.style === 'danger' && styles.dangerBtn,
                        action.btnStyle,
                      ]}
                      onPress={action.onPress}>
                      <Text
                        style={[
                          styles.actionText,
                          {color: action.style === 'primary' || action.style === 'danger' ? '#fff' : colors.text},
                          action.style === 'primary' && styles.primaryText,
                          action.style === 'cancel' && styles.cancelText,
                          action.style === 'danger' && styles.dangerText,
                          action.textStyle,
                        ]}>
                        {action.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  centeredView: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 22,
    paddingTop: 32,
    paddingBottom: 18,
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
    alignItems: 'stretch',
    position: 'relative',
    minHeight: 120,
    maxHeight: '88%',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    backgroundColor: '#f2f2f2',
    borderRadius: 16,
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.2,
    marginTop: 2,
  },
  content: {
    paddingBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
    gap: 12,
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: 'center',
    marginLeft: 8,
  },
  primaryBtn: {
    // backgroundColor sẽ được set dynamic
  },
  cancelBtn: {
    // backgroundColor sẽ được set dynamic
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dangerBtn: {
    // backgroundColor sẽ được set dynamic
  },
  actionText: {
    fontWeight: '700',
    fontSize: 16,
  },
  primaryText: {
    // color sẽ được set dynamic
  },
  cancelText: {
    // color sẽ được set dynamic
  },
  dangerText: {
    // color sẽ được set dynamic
  },
});

export default BeautifulModal;
