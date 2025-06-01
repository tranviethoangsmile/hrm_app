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
import Card from './common/Card';

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
      <View style={styles.productItemTextContainer}>
        <Text style={styles.productLabel}>{item.label}</Text>
        <Text style={styles.productValue}>{item.value}</Text>
      </View>
      <Icon
        name="chevron-right"
        size={SIZES.iconMd || 22}
        color={COLORS.primary}
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade">
      <View style={styles.modalOverlay}>
        <Card style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t('select.product.title', 'Select Product')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon
                name="close"
                size={SIZES.iconLg || 26}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <View style={{flexGrow: 1}}>
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={item => item.label}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.flatListContainer}
              ListEmptyComponent={
                <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>
                    {t('no.products.available', 'No products available')}
                  </Text>
                </View>
              }
            />
          </View>
        </Card>
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
    backgroundColor: COLORS.overlay || 'rgba(0,0,0,0.6)',
  },
  modalCard: {
    width: SIZES.width ? SIZES.width * 0.92 : '92%',
    maxHeight: SIZES.height ? SIZES.height * 0.85 : '85%',
    borderRadius: SIZES.radiusLg || 16,
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
    paddingBottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingLg || 24,
    paddingTop: SIZES.paddingLg || 22,
    paddingBottom: SIZES.paddingMd || 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor || '#E0E0E0',
    backgroundColor: COLORS.background,
  },
  modalTitle: {
    ...FONTS.h2,
    color: COLORS.text,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  closeButton: {
    padding: SIZES.baseSm || 6,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray3,
  },
  flatListContainer: {
    paddingHorizontal: SIZES.padding || 16,
    paddingVertical: SIZES.paddingSm || 10,
    gap: 8,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.paddingMd || 16,
    paddingHorizontal: SIZES.paddingMd || 16,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius || 12,
    marginBottom: 8,
    ...SHADOWS.light,
    borderWidth: 1,
    borderColor: COLORS.borderColorLighter || '#F0F0F0',
    elevation: 2,
  },
  productItemSelected: {
    backgroundColor: COLORS.primaryLight || '#e6f0fa',
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    elevation: 4,
  },
  productItemTextContainer: {
    flex: 1,
    marginRight: SIZES.paddingSm || 12,
  },
  productLabel: {
    ...FONTS.body1,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 2,
    fontSize: 16,
  },
  productValue: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  separator: {
    height: 6,
    backgroundColor: 'transparent',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.paddingLg || 24,
    minHeight: 150,
  },
  emptyListText: {
    ...FONTS.body1,
    color: COLORS.textPlaceholder || COLORS.textSecondary,
    textAlign: 'center',
  },
});
