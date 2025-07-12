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
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ModalMessage from '../ModalMessage';
import {COLORS, SIZES, FONTS, SHADOWS, LAYOUT} from '../../config/theme';
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
  const [duration, setDuration] = useState(1000);
  const [isChecked, setIsChecked] = useState(false);
  const [notes, setNotes] = useState('');

  const showMessage = (msg, type, dur) => {
    setMessage(msg);
    setMessageType(type);
    setDuration(dur);
    setMessageModalVisible(true);
  };

  const handleAddToCart = itemId => {
    const uniform_size = selectedSize[itemId];
    const quantity = qty[itemId] || 1;
    const product = uniformProducts.find(p => p.id === itemId);

    if (!uniform_size) {
      showMessage('choose.size.before', 'warning', 1500);
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
    showMessage('add.to.cart', 'success', 1000);
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
        showMessage('not.success', 'warning', 1500);
      }
      setCart([]);
      showMessage('success', 'success', 1000);
    } catch (error) {
      setMessageModalVisible(true);
      showMessage('err', 'error', 2000);
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
      <Animated.View style={styles.cartItem}>
        <Image source={product.image} style={styles.cartImage} />
        <View style={styles.cartDetails}>
          <Text style={styles.cartName}>{t(item.uniform_type)}</Text>
          <View style={styles.cartInfo}>
            <Text style={styles.cartText}>
              {t('size')}:{' '}
              <Text style={styles.cartTextBold}>{item.uniform_size}</Text>
            </Text>
            <Text style={styles.cartText}>
              {t('qty')}:{' '}
              <Text style={styles.cartTextBold}>{item.quantity}</Text>
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleRemoveFromCart(item.itemId)}>
          <Icon name={'trash-outline'} size={20} color={COLORS.white} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderItem = ({item}) => (
    <View style={styles.itemContainer}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{t(item.type)}</Text>

        <Text style={styles.label}>{t('size')}:</Text>
        <View style={styles.sizePicker}>
          {item.sizes.map(size => (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizeOption,
                selectedSize[item.id] === size && styles.selectedSize,
              ]}
              onPress={() =>
                setSelectedSize({...selectedSize, [item.id]: size})
              }>
              <Text
                style={[
                  styles.sizeText,
                  selectedSize[item.id] === size && styles.selectedSizeText,
                ]}>
                {size}
              </Text>
            </TouchableOpacity>
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
          placeholderTextColor={COLORS.placeholder}
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
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.cartButtonText}>
          {t('cart')} ({cart.length})
        </Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color={COLORS.dark} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('cart')}</Text>

            <FlatList
              data={cart}
              renderItem={renderCartItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.cartList}
              ListEmptyComponent={
                <Text style={styles.emptyCartText}>{t('cart_empty')}</Text>
              }
            />

            {cart.length > 0 && (
              <View style={styles.checkboxContainer}>
                <CheckBox
                  tintColors={{true: COLORS.primary, false: COLORS.dark}}
                  value={isChecked}
                  onValueChange={newValue => setIsChecked(newValue)}
                />
                <Text style={styles.checkboxLabel}>{t('note')}</Text>
              </View>
            )}

            {isChecked && (
              <TextInput
                style={styles.noteInput}
                placeholder={t('enter_note')}
                value={notes}
                onChangeText={text => setNotes(text)}
                placeholderTextColor={COLORS.placeholder}
                multiline
              />
            )}

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
        visible={isMessageModalVisible}
        message={message}
        type={messageType}
        duration={duration}
        onClose={() => setMessageModalVisible(false)}
        t={t}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SIZES.padding,
  },
  itemContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base * 2,
    ...SHADOWS.medium,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: SIZES.padding,
  },
  name: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  label: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base / 2,
  },
  sizePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SIZES.base,
  },
  sizeOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.base,
    marginBottom: SIZES.base,
  },
  selectedSize: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sizeText: {
    ...FONTS.body4,
    color: COLORS.text,
  },
  selectedSizeText: {
    color: COLORS.white,
  },
  quantityInput: {
    height: SIZES.inputHeight,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.inputPaddingHorizontal,
    marginBottom: SIZES.base,
    color: COLORS.text,
    ...FONTS.body4,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    height: SIZES.inputHeight,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    ...FONTS.h4,
  },
  cartButton: {
    position: 'absolute',
    bottom: SIZES.padding,
    right: SIZES.padding,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  cartButtonText: {
    color: COLORS.white,
    ...FONTS.h4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
    maxHeight: '80%',
  },
  closeIcon: {
    alignSelf: 'flex-end',
    padding: SIZES.base,
    marginTop: SIZES.base,
  },
  modalTitle: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: SIZES.padding,
    textAlign: 'center',
  },
  cartList: {
    marginBottom: SIZES.padding,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    padding: SIZES.base,
    ...SHADOWS.light,
  },
  cartImage: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radius,
  },
  cartDetails: {
    flex: 1,
    marginLeft: SIZES.base,
  },
  cartName: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: SIZES.base / 2,
  },
  cartInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cartText: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  cartTextBold: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SIZES.base,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  checkboxLabel: {
    ...FONTS.body4,
    color: COLORS.text,
    marginLeft: SIZES.base,
  },
  noteInput: {
    height: SIZES.inputHeight * 2,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.inputPaddingHorizontal,
    marginBottom: SIZES.padding,
    color: COLORS.text,
    ...FONTS.body4,
    textAlignVertical: 'top',
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    height: SIZES.inputHeight,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.base,
  },
  checkoutButtonText: {
    color: COLORS.white,
    ...FONTS.h4,
  },
  emptyCartText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.padding,
  },
});

export default SelectProductTab;
