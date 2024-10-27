import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ModalMessage from '../ModalMessage';
import {THEME_COLOR, TEXT_COLOR} from '../../utils/Colors';
import moment from 'moment';
import CheckBox from '@react-native-community/checkbox';
import {
  BASE_URL,
  API,
  VERSION,
  V1,
  UNIFORM_ORDER,
  CREATE,
  PORT,
} from '../../utils/constans';
import {useTranslation} from 'react-i18next';
import axios from 'axios';

import {uniformProducts} from '../../utils/uniform/uniform';
const SelectProductTab = ({USER_INFOR}) => {
  const {t} = useTranslation();
  const [selectedSize, setSelectedSize] = useState({});
  const [qty, setQuantity] = useState({});
  const [cart, setCart] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isMessageModalVisible, setMessageModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isChecked, setIsChecked] = useState(false);
  const [notes, setNotes] = useState('');
  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setMessageModalVisible(true);
  };
  const handleAddToCart = itemId => {
    const uniform_size = selectedSize[itemId];
    const quantity = qty[itemId] || 1;
    const product = uniformProducts.find(p => p.id === itemId);

    if (!uniform_size) {
      showMessage('choose.size.before', 'warning');
      setMessageModalVisible(true);
      return;
    }
    const existingItemIndex = cart.findIndex(
      item => item.itemId === itemId && item.uniform_size === uniform_size,
    );
    if (existingItemIndex >= 0) {
      setCart(
        cart.map((item, index) =>
          index === existingItemIndex
            ? {...item, quantity: item.quantity + quantity}
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {itemId, uniform_size, quantity, uniform_type: product.type},
      ]);
    }
    showMessage('add.to.cart', 'success');
  };

  const handleCart = cart => {
    const items = cart.map(({itemId, ...rest}) => rest);
    return items;
  };
  const handleCheckout = async () => {
    try {
      const date = moment().format('YYYY-MM-DD');
      const value = {
        user_id: USER_INFOR.id,
        position: USER_INFOR.position,
        date: date,
        notes: notes,
        items: handleCart(cart),
      };
      const URL = `${BASE_URL}${PORT}${API}${VERSION}${V1}${UNIFORM_ORDER}${CREATE}`;
      const uniformOrder = await axios.post(URL, {
        ...value,
      });
      setIsChecked(false);
      setNotes('');
      if (!uniformOrder?.data.success) {
        showMessage('not.success', 'warning');
      }
      setCart([]);
      showMessage('success', 'success');
    } catch (error) {
      setMessageModalVisible(true);
      showMessage('err', 'error');
    } finally {
      setModalVisible(false);
    }
  };

  const handleRemoveFromCart = itemId => {
    setCart(prevCart => prevCart.filter(item => item.itemId !== itemId));
  };

  const renderCartItem = ({item}) => {
    const product = uniformProducts.find(p => p.id === item.itemId);

    return (
      <View style={styles.cartItem}>
        {/* Product Image */}
        <Image source={product.image} style={styles.cartImage} />

        {/* Product Details */}
        <View style={styles.cartDetails}>
          <Text style={styles.cartName}>{t(item.uniform_type)}</Text>
          <View style={styles.cartInfo}>
            <Text style={styles.cartText}>
              {t('si.ze')}:{' '}
              <Text style={styles.cartTextBold}>{item.uniform_size}</Text>
            </Text>
            <Text style={styles.cartText}>
              {t('qty')}:{' '}
              <Text style={styles.cartTextBold}>{item.quantity}</Text>
            </Text>
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleRemoveFromCart(item.itemId)}>
          <Icon name={'trash-outline'} size={20} color={'white'} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({item}) => (
    <View style={styles.itemContainer}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{t(item.type)}</Text>

        <Text style={styles.label}>{t('choose_size')}:</Text>
        <View style={styles.sizePicker}>
          {item.sizes.map(size => (
            <Text
              key={size}
              style={[
                styles.sizeOption,
                selectedSize[item.id] === size && styles.selectedSize,
              ]}
              onPress={() =>
                setSelectedSize({...selectedSize, [item.id]: size})
              }>
              {size}
            </Text>
          ))}
        </View>

        <Text style={styles.label}>{t('qty')}:</Text>
        <TextInput
          style={styles.quantityInput}
          keyboardType="numeric"
          value={qty[item.id]?.toString() || '1'}
          onChangeText={value =>
            setQuantity({...qty, [item.id]: parseInt(value) || 1})
          }
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(item.id)}>
          <Text style={styles.addButtonText}>{t('add_cart')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={uniformProducts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />

      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.cartButtonText}>
          {t('cart')} ({cart.length})
        </Text>
      </TouchableOpacity>

      {/* Modal hiển thị giỏ hàng */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('cart')}</Text>

            <FlatList
              data={cart}
              renderItem={renderCartItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.cartList}
              ListEmptyComponent={<Text>{t('cart_empty')}</Text>}
            />

            {/* Checkbox */}
            <View style={styles.checkboxContainer}>
              <CheckBox
                value={isChecked}
                onValueChange={newValue => setIsChecked(newValue)}
              />
              <Text style={styles.checkboxLabel}>{t('note')}</Text>
            </View>

            {/* TextInput for Note (conditionally rendered) */}
            {isChecked && (
              <TextInput
                style={styles.noteInput}
                placeholder={t('enter_note')}
                value={notes}
                onChangeText={text => setNotes(text)}
                placeholderTextColor={TEXT_COLOR}
              />
            )}

            {/* Nút Mua Hàng */}
            {cart.length > 0 && (
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}>
                <Text style={styles.checkoutButtonText}>{t('buy')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
      <ModalMessage
        isVisible={isMessageModalVisible}
        onClose={() => setMessageModalVisible(false)}
        message={message}
        type={messageType}
        t={t}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f8f8f8',
    marginBottom: 5,
    borderRadius: 8,
  },
  image: {
    width: 150,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '500',
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  sizePicker: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  sizeOption: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
  },
  selectedSize: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  quantityInput: {
    width: 60,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: THEME_COLOR,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 30,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  closeIcon: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  cartDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cartName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cartInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartText: {
    fontSize: 14,
    color: '#777',
    marginRight: 4,
  },
  cartTextBold: {
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#FF4D4D',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },

  cartList: {
    maxHeight: 300,
  },
  checkoutButton: {
    backgroundColor: '#FF5722',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  noteInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 15,
    paddingHorizontal: 10,
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
export default SelectProductTab;
