import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {FONTS} from '../config/theme';
import {useTheme} from '../hooks/useTheme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const DailyModal = ({visible, onClose, products, onProductSelected}) => {
  const {t} = useTranslation();
  const {colors} = useTheme();
  const [selectedLabel, setSelectedLabel] = React.useState(null);

  const handleProductClick = product => {
    setSelectedLabel(product.label);
    onProductSelected(product);
    onClose();
  };

  const renderProductItem = ({item}) => {
    const isSelected = selectedLabel === item.label;
    return (
      <TouchableOpacity
        style={[
          styles.productItem,
          isSelected && styles.productItemSelected,
          {
            backgroundColor: isSelected ? colors.primaryLight : colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
          },
        ]}
        activeOpacity={0.85}
        onPress={() => handleProductClick(item)}>
        <View
          style={[
            styles.productIcon,
            {backgroundColor: colors.primary + '15'},
          ]}>
          <Icon name="package-variant" size={18} color={colors.primary} />
        </View>
        <Text style={[styles.productLabel, {color: colors.text}]}>
          {item.label}
        </Text>
        <View
          style={[
            styles.cycleTimeChip,
            {backgroundColor: colors.primary + '12'},
          ]}>
          <Icon name="timer-outline" size={12} color={colors.primary} />
          <Text style={[styles.cycleTimeText, {color: colors.primary}]}>
            {item.value}
          </Text>
        </View>
        {isSelected && (
          <Icon name="check-circle" size={20} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, {backgroundColor: colors.surface}]}>
          <LinearGradient
            colors={colors.primaryGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t('select.product.title', 'Chọn sản phẩm')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={item => item.label}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContainer}
            ListEmptyComponent={
              <View style={styles.emptyListContainer}>
                <Icon
                  name="package-variant-closed"
                  size={40}
                  color={colors.textTertiary}
                />
                <Text
                  style={[styles.emptyListText, {color: colors.textSecondary}]}>
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
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalCard: {
    width: '88%',
    maxHeight: '70%',
    borderRadius: 20,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  modalTitle: {
    ...FONTS.h3,
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  flatListContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1.5,
  },
  productItemSelected: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  productLabel: {
    ...FONTS.body2,
    fontWeight: '600',
    fontSize: 15,
    flex: 1,
  },
  cycleTimeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  cycleTimeText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 140,
  },
  emptyListText: {
    ...FONTS.body2,
    textAlign: 'center',
    marginTop: 8,
  },
});
