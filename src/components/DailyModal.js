import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React from 'react';
import {BG, BG_COLOR, THEME_COLOR} from '../utils/Colors';

const DailyModal = ({visible, onClose, products, onProductSelected}) => {
  const handleProductClick = product => {
    onProductSelected(product);
    onClose();
  };
  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.container}>
          <View style={styles.mainModalChoiceProduct}>
            <ScrollView>
              {products.map(product => (
                <TouchableOpacity
                  key={product.label}
                  onPress={() => handleProductClick(product)}>
                  <Text style={styles.text}>{product.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DailyModal;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainModalChoiceProduct: {
    width: 300,
    height: 300,
    backgroundColor: BG_COLOR,
    position: 'absolute',
    right: 30,
    ...Platform.select({
      ios: {
        top: 140,
      },
      android: {
        top: 94,
      },
    }),
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});
