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

const SelectProductTab = ({USER_INFOR, isDarkMode, colors}) => {
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

  const showMessage = (msg, type, dur = 2000) => {
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
      
      if (uniformOrder?.data.success) {
        // Thành công
        setIsChecked(false);
        setNotes('');
        setCart([]);
        setModalVisible(false);
        showMessage('success', 'success', 1500);
      } else {
        // Thất bại
        showMessage('not.success', 'warning', 1500);
      }
    } catch (error) {
      showMessage('err', 'error', 2000);
    }
  };

  const handleRemoveFromCart = itemId => {
    setCart(prevCart => prevCart.filter(item => item.itemId !== itemId));
  };

  const renderCartItem = ({item}) => {
    const product = uniformProducts.find(p => p.id === item.itemId);

    return (
      <Animated.View style={[styles.cartItem, {backgroundColor: colors.background}]}>
        <Image source={product.image} style={styles.cartImage} />
        <View style={styles.cartDetails}>
          <Text style={[styles.cartName, {color: colors.text}]}>{t(item.uniform_type)}</Text>
          <View style={styles.cartInfo}>
            <Text style={[styles.cartText, {color: colors.textSecondary}]}>
              {t('size')}:{' '}
              <Text style={[styles.cartTextBold, {color: colors.text}]}>{item.uniform_size}</Text>
            </Text>
            <Text style={[styles.cartText, {color: colors.textSecondary}]}>
              {t('qty')}:{' '}
              <Text style={[styles.cartTextBold, {color: colors.text}]}>{item.quantity}</Text>
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
    <View style={[styles.itemContainer, {backgroundColor: colors.surface}]}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} />
        <View style={styles.imageOverlay}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('new')}</Text>
          </View>
        </View>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.headerSection}>
            <Text style={[styles.name, {color: colors.text}]}>{t(item.type)}</Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceLabel, {color: colors.textSecondary}]}>{t('price')}:</Text>
            <Text style={[styles.price, {color: COLORS.success}]}>Free</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, {color: colors.textSecondary}]}>{t('size')}:</Text>
          <View style={styles.sizePicker}>
            {item.sizes.map(size => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeOption,
                  {backgroundColor: colors.surface, borderColor: colors.borderColor},
                  selectedSize[item.id] === size && styles.selectedSize,
                ]}
                onPress={() =>
                  setSelectedSize({...selectedSize, [item.id]: size})
                }>
                <Text
                  style={[
                    styles.sizeText,
                    {color: colors.text},
                    selectedSize[item.id] === size && styles.selectedSizeText,
                  ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, {color: colors.textSecondary}]}>{t('qty')}:</Text>
          <View style={[styles.quantityContainer, {backgroundColor: colors.background}]}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                const currentQty = qty[item.id] || 1;
                if (currentQty > 1) {
                  setQuantity({...qty, [item.id]: currentQty - 1});
                }
              }}>
              <Icon name="remove" size={16} color={COLORS.primary} />
            </TouchableOpacity>
            <TextInput
              style={[styles.quantityInput, {color: colors.text}]}
              keyboardType="numeric"
              value={qty[item.id]?.toString() || '1'}
              onChangeText={value =>
                setQuantity({...qty, [item.id]: parseInt(value) || 1})
              }
              placeholderTextColor={colors.placeholder}
            />
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                const currentQty = qty[item.id] || 1;
                setQuantity({...qty, [item.id]: currentQty + 1});
              }}>
              <Icon name="add" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(item.id)}>
          <Icon name="add" size={18} color={COLORS.white} />
          <Text style={styles.addButtonText}>{t('add_cart')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
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
          <View style={[styles.modalContent, {backgroundColor: colors.surface}]}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, {color: colors.text}]}>{t('cart')}</Text>

            <FlatList
              data={cart}
              renderItem={renderCartItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.cartList}
              ListEmptyComponent={
                <Text style={[styles.emptyCartText, {color: colors.textSecondary}]}>{t('cart_empty')}</Text>
              }
            />

            {cart.length > 0 && (
              <View style={styles.checkboxContainer}>
                <CheckBox
                  tintColors={{true: COLORS.primary, false: COLORS.dark}}
                  value={isChecked}
                  onValueChange={newValue => setIsChecked(newValue)}
                />
                <Text style={[styles.checkboxLabel, {color: colors.text}]}>{t('note')}</Text>
              </View>
            )}

            {isChecked && (
              <TextInput
                style={[styles.noteInput, {color: colors.text, borderColor: colors.borderColor}]}
                placeholder={t('enter_note')}
                value={notes}
                onChangeText={text => setNotes(text)}
                placeholderTextColor={colors.placeholder}
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
        isVisible={isMessageModalVisible}
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
  },
  list: {
    padding: SIZES.padding,
  },
  itemContainer: {
    borderRadius: SIZES.radius * 2,
    marginBottom: SIZES.padding,
    ...SHADOWS.large,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: SIZES.base,
    right: SIZES.base,
  },
  badge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius,
  },
  badgeText: {
    ...FONTS.body5,
    color: COLORS.white,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: SIZES.padding,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  name: {
    ...FONTS.h2,
    flex: 1,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    ...FONTS.body5,
  },
  price: {
    ...FONTS.h3,
    color: COLORS.success,
    fontWeight: '700',
  },
  section: {
    marginBottom: SIZES.base,
  },
  label: {
    ...FONTS.body4,
    marginBottom: SIZES.base / 2,
    fontWeight: '600',
  },
  sizePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.base / 2,
    marginBottom: SIZES.base,
  },
  sizeOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  selectedSize: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  sizeText: {
    ...FONTS.body4,
    fontWeight: '600',
    fontSize: 14,
  },
  selectedSizeText: {
    color: COLORS.white,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radius,
    padding: SIZES.base / 2,
    minHeight: 44,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  quantityInput: {
    flex: 1,
    height: 36,
    textAlign: 'center',
    ...FONTS.body4,
    fontWeight: '600',
    marginHorizontal: SIZES.base,
    paddingVertical: 0,
    paddingHorizontal: SIZES.base / 2,
    fontSize: 16,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    ...SHADOWS.medium,
  },
  addButtonText: {
    color: COLORS.white,
    ...FONTS.h4,
    marginLeft: SIZES.base / 2,
    fontWeight: '600',
  },
  cartButton: {
    position: 'absolute',
    bottom: SIZES.padding,
    right: SIZES.padding,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius * 2,
    ...SHADOWS.large,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButtonText: {
    color: COLORS.white,
    ...FONTS.h4,
    marginLeft: SIZES.base / 2,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: SIZES.radius * 3,
    borderTopRightRadius: SIZES.radius * 3,
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
    marginBottom: SIZES.padding,
    textAlign: 'center',
    fontWeight: '700',
  },
  cartList: {
    marginBottom: SIZES.padding,
  },
  cartItem: {
    flexDirection: 'row',
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
    marginBottom: SIZES.base / 2,
    fontWeight: '600',
  },
  cartInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cartText: {
    ...FONTS.body4,
  },
  cartTextBold: {
    ...FONTS.h4,
    fontWeight: '600',
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
    marginLeft: SIZES.base,
    fontWeight: '600',
  },
  noteInput: {
    height: SIZES.inputHeight * 2,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.inputPaddingHorizontal,
    marginBottom: SIZES.padding,
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
    ...SHADOWS.medium,
  },
  checkoutButtonText: {
    color: COLORS.white,
    ...FONTS.h4,
    fontWeight: '600',
  },
  emptyCartText: {
    ...FONTS.body3,
    textAlign: 'center',
    marginTop: SIZES.padding,
  },
});

export default SelectProductTab;
