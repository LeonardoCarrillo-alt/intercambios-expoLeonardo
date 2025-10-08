import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ThemeColors } from '../../theme/colors';
import { Product } from './productCard';
import { ScrollView } from 'react-native-gesture-handler';

interface ProductModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  TradeNow: (product: Product) => void;
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    modalSubtitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#666',
    },
    closeButton: {
      padding: 8,
      marginLeft: 16,
    },
    closeButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#666',
    },
    modalImage: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      marginBottom: 16,
    },
    modalPrice: {
      fontSize: 20,
      fontWeight: '700',
      color: '#3b82f6',
      marginBottom: 12,
    },
    modalCategory: {
      fontSize: 14,
      color: '#666',
      backgroundColor: '#f3f4f6',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginBottom: 12,
    },
    modalDescription: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
      marginBottom: 20,
    },
    modalUserInfo: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
      marginBottom: 20,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    tradeNowButton: {
      backgroundColor: '#10b981',
    },
    actionButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 16,
    },
  });

const ProductModal: React.FC<ProductModalProps> = ({
  visible,
  product,
  onClose,
  TradeNow,
}) => {
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  if (!product) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{product.title}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView>
                <Image source={{ uri: product.image }} style={styles.modalImage} />

                <Text style={styles.modalPrice}>${product.price}</Text>

                {product.category && (
                    <Text style={styles.modalCategory}>{product.category}</Text>
                )}

                <Text style={styles.modalDescription}>
                    {product.description || 'Descripción no disponible.'}
                </Text>
                <Text style={styles.modalDescription}>Estado:
                    {product.condition || 'Estado no disponible.'}
                </Text>
                <Text style={styles.modalSubtitle}> Información del publicador: </Text>
                <Text style={styles.modalUserInfo}> Nombre de usuario: 
                    {product.alias || 'Nombre de usuario no disponible.'}
                </Text>
                <Text style={styles.modalUserInfo}> Carrera: 
                    {product.price || 'Carrera no disponible.'}
                </Text>
              </ScrollView>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.tradeNowButton]}
                  onPress={() => TradeNow(product)}
                >
                  <Text style={styles.actionButtonText}>Intercambio</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ProductModal;