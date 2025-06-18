import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useTranslation} from 'react-i18next';
import {THEME_COLOR_2} from '../utils/Colors';

const OvertimeConfirm = ({navigation}) => {
  const {t} = useTranslation();
  const [showGuide, setShowGuide] = useState(false);

  const renderGuideModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showGuide}
        onRequestClose={() => setShowGuide(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGuide(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('guide_title')}</Text>
              <TouchableOpacity onPress={() => setShowGuide(false)}>
                <Icon name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.guideText}>{t('guide_content')}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-left" size={20} color={THEME_COLOR_2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('overtime_request')}</Text>
        <View style={styles.rightHeader}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowGuide(true)}>
            <Icon name="question-circle" size={20} color={THEME_COLOR_2} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>Đang phát triển</Text>
      </View>
      {renderGuideModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: THEME_COLOR_2,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '85%',
    maxWidth: 400,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME_COLOR_2,
  },
  modalBody: {
    paddingHorizontal: 20,
  },
  guideText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});

export default OvertimeConfirm;
