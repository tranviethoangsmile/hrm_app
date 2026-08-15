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
import apiClient from '../../services/apiClient';
import LinearGradient from 'react-native-linear-gradient';

import {UniformType} from '../../utils/Enum';
import {uniformProducts} from '../../utils/uniform/uniform';

const UNIFORM_TYPE_BACKEND = {
  [UniformType.WORK_JACKET]: 'WORK JAKET',
  [UniformType.WORK_PANTS]: 'WORK PANTS',
  [UniformType.COVERALLS]: 'COVERALLS',
  [UniformType.REFLECTIVE_VEST]: 'REFLECTIVE VEST',
  [UniformType.ANTI_STATIC_CLOTHING]: 'ANTI STATIC CLOTHING',
  [UniformType.FLAME_RESISTANT]: 'FLAME RESISTANT',
  [UniformType.WORK_GLOVES]: 'WORK GLOVES',
  [UniformType.SAFETY_SHOES]: 'SAFETY SHOES',
  [UniformType.SAFETY_HELMET]: 'SAFETY HELMET',
  [UniformType.WORK_SHOES]: 'WORK SHOES',
  [UniformType.WORK_TROUSERS]: 'WORK TROUSERS',
};

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
    const items = cart.map(({itemId, uniform_type, ...rest}) => ({
      ...rest,
      uniform_type: UNIFORM_TYPE_BACKEND[uniform_type] || uniform_type,
    }));
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
      const uniformOrder = await apiClient.post(URL, {
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
      <View
        style={[
          styles.cartItem,
          {backgroundColor: colors.surface, borderColor: colors.border},
        ]}>
        <Image source={product.image} style={styles.cartImage} />
        <View style={styles.cartDetails}>
          <Text style={[styles.cartName, {color: colors.text}]}>
            {t(item.uniform_type)}
          </Text>
          <View style={styles.cartInfo}>
            <Text style={[styles.cartText, {color: colors.textSecondary}]}>
              {t('size')}:{' '}
              <Text style={[styles.cartTextBold, {color: colors.text}]}>
                {item.uniform_size}
              </Text>
            </Text>
            <Text style={[styles.cartText, {color: colors.textSecondary}]}>
              {t('qty')}:{' '}
              <Text style={[styles.cartTextBold, {color: colors.text}]}>
                {item.quantity}
              </Text>
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.deleteButton, {backgroundColor: colors.danger}]}
          onPress={() => handleRemoveFromCart(item.itemId)}>
          <Icon name="trash-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({item}) => (
    <View
      style={[
        styles.itemContainer,
        {backgroundColor: colors.surface, borderColor: colors.border},
      ]}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.45)']}
          style={styles.imageGradient}
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t('new')}</Text>
        </View>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.headerSection}>
          <Text style={[styles.name, {color: colors.text}]}>
            {t(item.type)}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceLabel, {color: colors.textSecondary}]}>
              {t('price')}:
            </Text>
            <Text style={[styles.price, {color: colors.success}]}>Free</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, {color: colors.textSecondary}]}>
            {t('size')}:
          </Text>
          <View style={styles.sizePicker}>
            {item.sizes.map(size => {
              const active = selectedSize[item.id] === size;
              return (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeOption,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary : colors.surface,
                    },
                  ]}
                  onPress={() =>
                    setSelectedSize({...selectedSize, [item.id]: size})
                  }>
                  <Text
                    style={[
                      styles.sizeText,
                      {color: active ? '#fff' : colors.text},
                    ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, {color: colors.textSecondary}]}>
            {t('qty')}:
          </Text>
          <View
            style={[
              styles.quantityContainer,
              {backgroundColor: colors.backgroundSecondary},
            ]}>
            <TouchableOpacity
              style={[styles.quantityButton, {backgroundColor: colors.surface}]}
              onPress={() => {
                const currentQty = qty[item.id] || 1;
                if (currentQty > 1) {
                  setQuantity({...qty, [item.id]: currentQty - 1});
                }
              }}>
              <Icon name="remove" size={16} color={colors.primary} />
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
              style={[styles.quantityButton, {backgroundColor: colors.surface}]}
              onPress={() => {
                const currentQty = qty[item.id] || 1;
                setQuantity({...qty, [item.id]: currentQty + 1});
              }}>
              <Icon name="add" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(item.id)}
          activeOpacity={0.85}>
          <LinearGradient
            colors={colors.primaryGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.addGradient}>
            <Icon name="add" size={18} color="#fff" />
            <Text style={styles.addButtonText}>{t('add_cart')}</Text>
          </LinearGradient>
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
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}>
        <LinearGradient
          colors={colors.primaryGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.cartGradient}>
          <View style={styles.cartButtonContent}>
            <Icon name="cart-outline" size={20} color="#fff" />
            <Text style={styles.cartButtonText}>
              {t('cart')} ({cart.length})
            </Text>
          </View>
          {cart.length > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          ) : null}
        </LinearGradient>
      </TouchableOpacity>

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View
            style={[styles.modalContent, {backgroundColor: colors.surface}]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: colors.text}]}>
                {t('cart')}
              </Text>
              <TouchableOpacity
                style={[
                  styles.closeIcon,
                  {backgroundColor: colors.backgroundSecondary},
                ]}
                onPress={() => setModalVisible(false)}>
                <Icon name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={cart}
              renderItem={renderCartItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.cartList}
              ListEmptyComponent={
                <Text
                  style={[styles.emptyCartText, {color: colors.textSecondary}]}>
                  {t('cart_empty')}
                </Text>
              }
            />

            {cart.length > 0 && (
              <View style={styles.checkboxContainer}>
                <CheckBox
                  tintColors={{true: colors.primary, false: colors.dark}}
                  value={isChecked}
                  onValueChange={newValue => setIsChecked(newValue)}
                />
                <Text style={[styles.checkboxLabel, {color: colors.text}]}>
                  {t('note')}
                </Text>
              </View>
            )}

            {isChecked && (
              <TextInput
                style={[
                  styles.noteInput,
                  {color: colors.text, borderColor: colors.border},
                ]}
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
                onPress={handleCheckout}
                activeOpacity={0.85}>
                <LinearGradient
                  colors={colors.primaryGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.checkoutGradient}>
                  <Text style={styles.checkoutButtonText}>{t('buy')}</Text>
                </LinearGradient>
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
    padding: 16,
  },
  itemContainer: {
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 0.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeText: {
    color: '#7C3AED',
    fontSize: 11,
    fontWeight: '700',
  },
  detailsContainer: {
    padding: 16,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
  },
  price: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: '800',
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '600',
  },
  sizePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeOption: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 4,
    minHeight: 44,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  quantityInput: {
    flex: 1,
    height: 36,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
    paddingVertical: 0,
    paddingHorizontal: 4,
    includeFontPadding: false,
  },
  addButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  addGradient: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
    gap: 8,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
    maxHeight: '80%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C7C7CC',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartList: {
    marginBottom: 12,
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 0.5,
    marginBottom: 8,
    padding: 10,
  },
  cartImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  cartDetails: {
    flex: 1,
    marginLeft: 10,
  },
  cartName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  cartInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cartText: {
    fontSize: 12,
  },
  cartTextBold: {
    fontSize: 13,
    fontWeight: '600',
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  noteInput: {
    height: 88,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 10,
    marginBottom: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  checkoutButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  checkoutGradient: {
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyCartText: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default SelectProductTab;
