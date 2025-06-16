import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {COLORS, SIZES, FONTS, SHADOWS} from '../config/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DailyModal = ({visible, onClose, products, onProductSelected}) => {
  const {t} = useTranslation();
  const [selectedLabel, setSelectedLabel] = React.useState(null);

  const handleProductClick = product => {
    setSelectedLabel(product.label);
    onProductSelected(product);
    onClose();
  };

  const renderProductItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.productItem,
        selectedLabel === item.label && styles.productItemSelected,
      ]}
      activeOpacity={0.85}
      onPress={() => handleProductClick(item)}>
      <Text style={styles.productLabel}>{item.label}</Text>
      <Text style={styles.productValue}>{item.value}</Text>
      {selectedLabel === item.label && (
        <Icon
          name="check-circle"
          size={20}
          color={COLORS.primary}
          style={{marginLeft: 8}}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t('select.product.title', 'Chọn sản phẩm')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={item => item.label}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContainer}
            ListEmptyComponent={
              <View style={styles.emptyListContainer}>
                <Text style={styles.emptyListText}>
                  {t('no.products.available', 'Không có sản phẩm')}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

export default DailyModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  modalCard: {
    width: '88%',
    maxHeight: '70%',
    borderRadius: 18,
    backgroundColor: '#fff',
    paddingBottom: 10,
    ...SHADOWS.medium,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f7fafd',
  },
  modalTitle: {
    ...FONTS.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  flatListContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  productItemSelected: {
    backgroundColor: '#e6f0fa',
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    elevation: 2,
  },
  productLabel: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 15,
  },
  productValue: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    fontSize: 13,
    marginLeft: 10,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 120,
  },
  emptyListText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
