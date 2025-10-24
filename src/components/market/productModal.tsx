import React, { FC, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ThemeColors } from '../../theme/colors';

export interface Product {
  id: string;
  title: string;
  price?: number;
  image: string;
  description?: string;
  condition: 'Disponible' | 'No Disponible';
  category?: string;
  alias: string;
}

interface ProductModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  TradeNow: (product: Product) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ProductModal: FC<ProductModalProps> = ({
  visible,
  product,
  onClose,
  TradeNow,
}) => {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) return null;

  const isAvailable = product.condition === 'Disponible';

  const handleContact = () => {
    Alert.alert(
      'Contactar vendedor',
      `¿Deseas contactar a @${product.alias}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Contactar', 
          onPress: () => {
            // Aquí integrarías con tu sistema de mensajería
            console.log('Contactar a:', product.alias);
          }
        }
      ]
    );
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Aquí integrarías con tu sistema de favoritos
    console.log(isFavorite ? 'Removido de favoritos' : 'Añadido a favoritos');
  };

  const handleReport = () => {
    Alert.alert(
      'Reportar publicación',
      '¿Por qué deseas reportar esta publicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Contenido inapropiado', onPress: () => console.log('Reportado: Contenido inapropiado') },
        { text: 'Información falsa', onPress: () => console.log('Reportado: Información falsa') },
        { text: 'Estafa', onPress: () => console.log('Reportado: Estafa') },
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          {/* Header fijo */}
          <View style={styles.header}>
            <View style={styles.dragIndicator} />
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={handleFavorite}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.iconText}>{isFavorite ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={onClose} 
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contenido scrolleable */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={true}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Imagen del producto */}
            <View style={styles.imageWrapper}>
              <Image 
                source={{ uri: product.image }} 
                style={styles.image}
                resizeMode="cover"
              />
              
              {/* Badge de estado sobre la imagen */}
              <View style={[
                styles.statusBadge,
                isAvailable ? styles.availableBadge : styles.unavailableBadge
              ]}>
                <View style={[
                  styles.statusDot,
                  isAvailable ? styles.availableDot : styles.unavailableDot
                ]} />
                <Text style={styles.statusBadgeText}>
                  {product.condition}
                </Text>
              </View>

              {/* Badge de categoría */}
              {product.category && (
                <View style={styles.categoryBadgeModal}>
                  <Text style={styles.categoryBadgeText}>{product.category}</Text>
                </View>
              )}
            </View>

            {/* Información principal */}
            <View style={styles.mainInfo}>
              <Text style={styles.title} numberOfLines={3}>
                {product.title}
              </Text>
              
              {product.price != null ? (
                <View style={styles.priceSection}>
                  <Text style={styles.priceLabel}>Precio</Text>
                  <Text style={styles.price}>Bs {product.price.toFixed(2)}</Text>
                </View>
              ) : (
                <View style={styles.exchangeSection}>
                  <Text style={styles.exchangeLabel}>Modalidad</Text>
                  <Text style={styles.exchangeText}>Solo Intercambio</Text>
                </View>
              )}
            </View>

            {/* Separador */}
            <View style={styles.divider} />

            {/* Descripción */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>📝 Descripción</Text>
              <Text style={styles.text}>
                {product.description || 'Sin descripción disponible.'}
              </Text>
            </View>

            {/* Separador */}
            <View style={styles.divider} />

            {/* Vendedor */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>👤 Vendedor</Text>
              <View style={styles.sellerCard}>
                <View style={styles.sellerInfo}>
                  <View style={styles.sellerAvatar}>
                    <Text style={styles.sellerInitial}>
                      {(product.alias || 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.sellerDetails}>
                    <Text style={styles.sellerName}>
                      @{product.alias || 'Usuario no disponible'}
                    </Text>
                    <Text style={styles.sellerMeta}>Miembro verificado</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={handleContact}
                >
                  <Text style={styles.contactButtonText}>Contactar</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Separador */}
            <View style={styles.divider} />

            {/* Acciones secundarias */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>⚙️ Opciones</Text>
              <View style={styles.actionsGrid}>
                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={handleFavorite}
                >
                  <View style={styles.actionIcon}>
                    <Text style={styles.actionEmoji}>{isFavorite ? '❤️' : '🤍'}</Text>
                  </View>
                  <Text style={styles.actionText}>
                    {isFavorite ? 'En Favoritos' : 'Agregar a Favoritos'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => {
                    // Compartir funcionalidad
                    Alert.alert('Compartir', 'Funcionalidad de compartir próximamente');
                  }}
                >
                  <View style={styles.actionIcon}>
                    <Text style={styles.actionEmoji}>📤</Text>
                  </View>
                  <Text style={styles.actionText}>Compartir</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionCard, styles.reportCard]}
                  onPress={handleReport}
                >
                  <View style={styles.actionIcon}>
                    <Text style={styles.actionEmoji}>⚠️</Text>
                  </View>
                  <Text style={[styles.actionText, styles.reportText]}>Reportar</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Espaciado inferior para el botón */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Botón fijo en la parte inferior */}
          {isAvailable && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.tradeButton}
                onPress={() => TradeNow(product)}
                activeOpacity={0.8}
              >
                <Text style={styles.tradeButtonText}>🔄 Intercambiar Ahora</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContainer: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: SCREEN_HEIGHT * 0.92,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 20,
        },
      }),
    },
    header: {
      paddingTop: 12,
      paddingBottom: 8,
      paddingHorizontal: 20,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: true ? '#f3f4f6' : 'rgba(255,255,255,0.1)',
    },
    dragIndicator: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.text + '30',
      marginBottom: 12,
    },
    headerActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 8,
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: true ? '#f3f4f6' : 'rgba(255,255,255,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconText: {
      fontSize: 18,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: true ? '#f3f4f6' : 'rgba(255,255,255,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeText: {
      fontSize: 20,
      color: colors.text + '80',
      fontWeight: '600',
    },
    scrollContent: {
      paddingBottom: 20,
    },
    imageWrapper: {
      width: '100%',
      height: 320,
      backgroundColor: '#f3f4f6',
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    statusBadge: {
      position: 'absolute',
      top: 16,
      left: 16,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 6,
    },
    availableBadge: {
      backgroundColor: 'rgba(16, 185, 129, 0.95)',
    },
    unavailableBadge: {
      backgroundColor: 'rgba(239, 68, 68, 0.95)',
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    availableDot: {
      backgroundColor: '#fff',
    },
    unavailableDot: {
      backgroundColor: '#fff',
    },
    statusBadgeText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    categoryBadgeModal: {
      position: 'absolute',
      top: 16,
      right: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    categoryBadgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    mainInfo: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 8,
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 16,
      lineHeight: 34,
    },
    priceSection: {
      backgroundColor: true ? '#ecfdf5' : 'rgba(16, 185, 129, 0.15)',
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#10b981',
    },
    priceLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text + 'AA',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    price: {
      fontSize: 32,
      fontWeight: '900',
      color: '#10b981',
      letterSpacing: -1,
    },
    exchangeSection: {
      backgroundColor: true ? '#eff6ff' : 'rgba(59, 130, 246, 0.15)',
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#3b82f6',
    },
    exchangeLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text + 'AA',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    exchangeText: {
      fontSize: 20,
      fontWeight: '800',
      color: '#3b82f6',
    },
    divider: {
      height: 1,
      backgroundColor: true ? '#e5e7eb' : 'rgba(255,255,255,0.1)',
      marginVertical: 20,
      marginHorizontal: 20,
    },
    section: {
      paddingHorizontal: 20,
      marginBottom: 8,
    },
    sectionLabel: {
      fontWeight: '700',
      fontSize: 18,
      marginBottom: 12,
      color: colors.text,
      letterSpacing: 0.2,
    },
    text: {
      fontSize: 16,
      lineHeight: 26,
      color: colors.text + 'DD',
    },
    sellerCard: {
      backgroundColor: true ? '#f9fafb' : 'rgba(255,255,255,0.05)',
      padding: 16,
      borderRadius: 12,
      gap: 12,
    },
    sellerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sellerAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#10b981',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    sellerInitial: {
      color: 'white',
      fontSize: 22,
      fontWeight: '700',
    },
    sellerDetails: {
      flex: 1,
    },
    sellerName: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    sellerMeta: {
      fontSize: 13,
      color: colors.text + '80',
      fontWeight: '500',
    },
    contactButton: {
      backgroundColor: '#10b981',
      borderRadius: 10,
      padding: 14,
      alignItems: 'center',
    },
    contactButtonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 15,
    },
    actionsGrid: {
      flexDirection: 'row',
      gap: 12,
      flexWrap: 'wrap',
    },
    actionCard: {
      flex: 1,
      minWidth: 100,
      backgroundColor: true ? '#f9fafb' : 'rgba(255,255,255,0.05)',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: true ? '#e5e7eb' : 'rgba(255,255,255,0.1)',
    },
    reportCard: {
      borderColor: '#fecaca',
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: true ? '#fff' : 'rgba(255,255,255,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionEmoji: {
      fontSize: 24,
    },
    actionText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    reportText: {
      color: '#ef4444',
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: Platform.OS === 'ios' ? 28 : 20,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: true ? '#f3f4f6' : 'rgba(255,255,255,0.1)',
    },
    tradeButton: {
      backgroundColor: '#10b981',
      borderRadius: 12,
      padding: 18,
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#10b981',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    tradeButtonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 17,
      letterSpacing: 0.3,
    },
  });

export default ProductModal;