import React, {memo} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

const PopupEvent = ({visible, event, onClose, t, navigation}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>{t('event')}</Text>
          </View>
          <Image source={{uri: event.media}} style={styles.modalImage} />
          <TouchableWithoutFeedback
            onPress={() => {
              onClose();
            }}>
            <View style={styles.modalBody}>
              <ScrollView>
                <Text style={styles.modalTitle}>{event.name}</Text>
                <View style={styles.descriptionContainer}>
                  <Text style={styles.modalDescription}>
                    {event.description}
                  </Text>
                </View>
                <Text style={styles.modalText}>
                  {t('d.start')}: {event.date_start}
                </Text>
                <Text style={styles.modalText}>
                  {t('d.end')}: {event.date_end}
                </Text>
                <Text style={styles.modalText}>
                  {t('position')}: {event.position}
                </Text>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
          <View style={styles.confirmBtn}>
            <TouchableOpacity
              onPress={() => {
                onClose();
                navigation.navigate('Event');
              }}>
              <Icon name="arrow-right" size={40} color={THEME_COLOR} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  confirmBtn: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  modalView: {
    width: '95%',
    marginHorizontal: 10,
    backgroundColor: BG_COLOR,
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLOR_2,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalImage: {
    width: '100%',
    height: 200,
  },
  modalBody: {
    padding: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: THEME_COLOR,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
    color: TEXT_COLOR,
  },
  modalHeaderText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    width: '90%',
    textAlign: 'center',
  },
  descriptionContainer: {
    backgroundColor: THEME_COLOR_2,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 20,
    color: 'white',
    fontWeight: '400',
  },
});

export default memo(PopupEvent);
