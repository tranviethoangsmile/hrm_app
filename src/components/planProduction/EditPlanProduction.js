import {
  View,
  Text,
  Modal,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import CheckBox from '@react-native-community/checkbox';
import axios from 'axios';
import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  PLAN_PRODUCTION,
  UPDATE,
} from '../../utils/constans';
import {TEXT_COLOR} from '../../utils/Colors';
const EditPlanProduction = ({visible, planProduction, t, onClose, reCall}) => {
  const [editableData, setEditableData] = useState(planProduction);
  const showAlert = message => {
    Alert.alert(t('noti'), t(message));
  };

  useEffect(() => {
    setEditableData(planProduction);
  }, [planProduction]);

  const handleInputChange = (field, value) => {
    setEditableData({
      ...editableData,
      [field]: value,
    });
  };

  const handle_update_plan_production = async () => {
    try {
      const {department_id, position, department, ...dateUpdate} = editableData;
      const res = await axios.put(
        `${BASE_URL}${PORT}${API}${VERSION}${V1}${PLAN_PRODUCTION}${UPDATE}`,
        {
          ...dateUpdate,
        },
      );
      if (!res?.data.success) {
        throw new Error(`unSuccess`);
      }

      showAlert('success');
      reCall();
      onClose();
    } catch (error) {
      showAlert(error?.message || 'networkError');
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{t('planPro')}</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('dd')}</Text>
              <TextInput
                style={styles.input}
                value={editableData.date}
                onChangeText={text => handleInputChange('date', text)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('product')}</Text>
              <TextInput
                style={styles.input}
                value={editableData.product}
                onChangeText={text => handleInputChange('product', text)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('quantity')}</Text>
              <TextInput
                style={styles.input}
                value={String(editableData.quantity)}
                onChangeText={text => handleInputChange('quantity', text)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('ot')}</Text>
              <TextInput
                style={styles.input}
                value={String(editableData.operation_time)}
                onChangeText={text => handleInputChange('operation_time', text)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('line')}</Text>
              <TextInput
                style={styles.input}
                value={editableData.production_line}
                onChangeText={text =>
                  handleInputChange('production_line', text)
                }
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('change')}</Text>
              <CheckBox
                tintColors={{true: 'red', false: 'black'}}
                value={editableData.is_custom}
                onValueChange={value => handleInputChange('is_custom', value)}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                handle_update_plan_production();
              }}
              style={styles.updateButton}>
              <Text style={styles.updateButtonText}>{t('update')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: TEXT_COLOR,
  },
  updateButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditPlanProduction;
