import React, {useState} from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';

const SelectDate = ({visible, onClose, setSelectedDate, getCheckin}) => {
  const [selectedMonth, setSelectedMonth] = useState(moment().month());
  const [selectedYear, setSelectedYear] = useState(moment().year());

  const months = moment.months();
  const years = Array.from({length: 10}, (_, i) => moment().year() - 5 + i);

  const handleMonthSelect = month => {
    setSelectedMonth(month);
  };

  const handleYearSelect = year => {
    setSelectedYear(year);
  };

  const handleConfirm = () => {
    const date = moment()
      .year(selectedYear)
      .month(selectedMonth)
      .startOf('month')
      .format('YYYY-MM-DD');

    setSelectedDate(date);
    getCheckin();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Month and Year</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Month</Text>
            <ScrollView style={styles.gridContainer}>
              <View style={styles.grid}>
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.gridItem,
                      selectedMonth === index && styles.selectedItem,
                    ]}
                    onPress={() => handleMonthSelect(index)}>
                    <Text
                      style={[
                        styles.gridItemText,
                        selectedMonth === index && styles.selectedItemText,
                      ]}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Year</Text>
            <ScrollView style={styles.gridContainer}>
              <View style={styles.grid}>
                {years.map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.gridItem,
                      selectedYear === year && styles.selectedItem,
                    ]}
                    onPress={() => handleYearSelect(year)}>
                    <Text
                      style={[
                        styles.gridItemText,
                        selectedYear === year && styles.selectedItemText,
                      ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}>
            <LinearGradient
              colors={['#4FACFE', '#00F2FE']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.gradient}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a202c',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#64748b',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
  },
  gridContainer: {
    maxHeight: 150,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '30%',
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: '#4FACFE',
  },
  gridItemText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  selectedItemText: {
    color: '#fff',
  },
  confirmButton: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SelectDate;
