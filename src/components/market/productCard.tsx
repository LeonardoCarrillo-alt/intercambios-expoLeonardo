import React, { useMemo } from 'react';
import {
  Pressable,
  Text,
  Image,
  StyleSheet,
  View,
  Platform,
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

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isAvailable = product.condition === 'Disponible';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      android_ripple={{ color: colors.primary + '20' }}
    >
      {/* Contenedor de imagen con overlay de estado */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Badge de estado */}
        <View style={[
          styles.statusBadge,
          isAvailable ? styles.availableBadge : styles.unavailableBadge
        ]}>
          <View style={[
            styles.statusDot,
            isAvailable ? styles.availableDot : styles.unavailableDot
          ]} />
          <Text style={styles.statusText}>
            {isAvailable ? 'Disponible' : 'No disponible'}
          </Text>
        </View>

        {/* Badge de categoría */}
        {product.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        )}
      </View>

      {/* Contenido principal */}
      <View style={styles.body}>
        {/* Título */}
        <Text numberOfLines={2} style={styles.title}>
          {product.title}
        </Text>

        {/* Precio y vendedor */}
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            {product.price != null ? (
              <>
                <Text style={styles.priceLabel}>Precio</Text>
                <Text style={styles.price}>Bs {product.price.toFixed(2)}</Text>
              </>
            ) : (
              <Text style={styles.exchangeText}>Intercambio</Text>
            )}
          </View>

          {/* Vendedor */}
          <View style={styles.sellerContainer}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerInitial}>
                {product.alias[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
            <Text numberOfLines={1} style={styles.sellerName}>
              @{product.alias}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface || colors.background,
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border || (colors.background === '#FFFFFF' ? '#e5e7eb' : 'rgba(255,255,255,0.1)'),
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow || '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    pressed: {
      opacity: 0.95,
      transform: [{ scale: 0.98 }],
    },
    imageContainer: {
      width: '100%',
      height: 200,
      position: 'relative',
      backgroundColor: '#f3f4f6',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    statusBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
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
    statusText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    categoryBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    categoryText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    body: {
      padding: 16,
      gap: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      lineHeight: 24,
      color: colors.text,
      marginBottom: 4,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: 12,
    },
    priceContainer: {
      flex: 1,
    },
    priceLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.subtitle || colors.text + '80',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    price: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.primary || '#10b981',
      letterSpacing: -0.5,
    },
    exchangeText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary || '#10b981',
      paddingVertical: 4,
    },
    sellerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.background === '#FFFFFF' ? '#f9fafb' : 'rgba(255,255,255,0.05)',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 20,
      maxWidth: '50%',
    },
    sellerAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary || '#10b981',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sellerInitial: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
    },
    sellerName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
  });