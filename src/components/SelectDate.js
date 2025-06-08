// SelectDate.js
import React, {useState} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Button,
  TouchableOpacity,
  Text,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import moment from 'moment';
import {
  BG_COLOR,
  TEXT_COLOR,
  THEME_COLOR,
  THEME_COLOR_2,
} from '../utils/Colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useTranslation} from 'react-i18next';
import i18next from 'i18next';

const SelectDate = ({visible, onClose, setSelectedDate, getCheckin}) => {
  const {t} = useTranslation();
  const now = moment();
  const currentYear = now.year();
  const [month, setMonth] = useState(now.month() + 1); // 1-12
  const [year, setYear] = useState(currentYear);
  const [openMonth, setOpenMonth] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  // Tạo danh sách tháng và năm
  const monthItems = Array.from({length: 12}, (_, i) => ({
    label: t('month') + ' ' + (i + 1),
    value: i + 1,
  }));
  const yearItems = Array.from({length: 8}, (_, i) => ({
    label: (2020 + i).toString(),
    value: 2020 + i,
  }));
  const handleConfirm = () => {
    const date = moment(`${year}-${month}-01`, 'YYYY-MM-DD').toDate();
    setSelectedDate(date);
    getCheckin();
    onClose();
  };
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Icon
              name="calendar"
              size={22}
              color={THEME_COLOR}
              style={{marginRight: 8}}
            />
            <Text style={styles.modalTitle}>{t('select.month.year')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={22} color={THEME_COLOR_2} />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-between',
              marginVertical: 16,
            }}>
            <View style={{flex: 1, marginRight: 8}}>
              <DropDownPicker
                open={openMonth}
                setOpen={setOpenMonth}
                value={month}
                items={monthItems}
                setValue={setMonth}
                setItems={() => {}}
                placeholder={t('month')}
                style={{borderRadius: 12, minHeight: 44}}
                dropDownContainerStyle={{borderRadius: 12}}
                listMode="SCROLLVIEW"
                zIndex={2}
                zIndexInverse={1}
                onOpen={() => setOpenYear(false)}
              />
            </View>
            <View style={{flex: 1, marginLeft: 8}}>
              <DropDownPicker
                open={openYear}
                setOpen={setOpenYear}
                value={year}
                items={yearItems}
                setValue={setYear}
                setItems={() => {}}
                placeholder={t('year')}
                style={{borderRadius: 12, minHeight: 44}}
                dropDownContainerStyle={{borderRadius: 12}}
                listMode="SCROLLVIEW"
                zIndex={1}
                zIndexInverse={2}
                onOpen={() => setOpenMonth(false)}
              />
            </View>
          </View>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmBtnText}>{t('confirm')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  modalCard: {
    width: 320,
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLOR,
    textAlign: 'center',
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f4f6fa',
  },
  confirmBtn: {
    marginTop: 18,
    backgroundColor: THEME_COLOR,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default SelectDate;
