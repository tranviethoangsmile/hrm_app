// SelectDate.js
import React, {useState} from 'react';
import {Modal, View, StyleSheet, Button} from 'react-native';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';
const SelectDate = ({visible, onClose, setSelectedDate, getCheckin}) => {
  const [today, setToday] = useState(moment().toDate());
  const handlePress = () => {
    getCheckin();
    onClose();
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <DatePicker
            date={today}
            mode="date"
            onDateChange={date => {
              setToday(date);
              setSelectedDate(date);
              getCheckin();
            }}
            textColor={TEXT_COLOR} // Color of the selected date
            dayTextColor="#333" // Color of the day text
            monthTextColor="#333" // Color of the month text
            yearTextColor="#333" // Color of the year text
          />
          <Button title="Close" onPress={handlePress} color={THEME_COLOR} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
});

export default SelectDate;
