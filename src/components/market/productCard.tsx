import React, { useMemo, useState } from 'react';
import {
  Pressable,
  Text,
  Image,
  StyleSheet,
  View,
  Platform,
  TextInput,
  Button,
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
  status?: 'pending' | 'approved' | 'rejected' | 'sold';
}

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  isProfileCard?: boolean;
  onDelete?: () => void;
  onUpdate?: (data: Partial<Product>) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  isProfileCard = false,
  onDelete,
  onUpdate,
}) => {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isAvailable = product.condition === 'Disponible';
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(product.price?.toString() ?? '');

  const handleSave = () => {
    onUpdate?.({ title, price: Number(price) });
    setEditing(false);
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      android_ripple={{ color: `${(colors as any).primary}20` }}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        <View style={[styles.statusBadge, isAvailable ? styles.availableBadge : styles.unavailableBadge]}>
          <View style={[styles.statusDot, isAvailable ? styles.availableDot : styles.unavailableDot]} />
          <Text style={styles.statusText}>{isAvailable ? 'Disponible' : 'No disponible'}</Text>
        </View>
        {product.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        {editing ? (
          <>
            <Text style={styles.label}>Nombre:</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={[styles.title, { borderWidth: 1, padding: 4, borderRadius: 6 }]}
            />
            <Text style={styles.label}>Precio:</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={[styles.price, { borderWidth: 1, padding: 4, borderRadius: 6, fontSize: 16 }]}
            />
            <Button title="Guardar" onPress={handleSave} />
          </>
        ) : (
          <>
            <Text numberOfLines={2} style={styles.title}>
              {product.title}
            </Text>
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
              <View style={styles.sellerContainer}>
                <View style={styles.sellerAvatar}>
                  <Text style={styles.sellerInitial}>
                    {product.alias && product.alias[0] ? product.alias[0].toUpperCase() : 'U'}
                  </Text>
                </View>
                <Text numberOfLines={1} style={styles.sellerName}>
                  @{product.alias}
                </Text>
              </View>
            </View>
            {product.status && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '700' }}>Estado: {product.status}</Text>
              </View>
            )}
            {isProfileCard && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Button title="Editar" onPress={() => setEditing(true)} />
                <Button title="Borrar" color="red" onPress={onDelete} />
              </View>
            )}
          </>
        )}
      </View>
    </Pressable>
  );
};

const createStyles = (colors: ThemeColors | any) =>
  StyleSheet.create({
    container: {
      backgroundColor: (colors as any).surface || (colors as any).background,
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor:
        (colors as any).border ||
        ((String((colors as any).background) === '#f8fafc' ? '#e5e7eb' : 'rgba(255,255,255,0.1)')),
      ...Platform.select({
        ios: {
          shadowColor: ((colors as any).shadow as string) ?? '#000',
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
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    availableDot: { backgroundColor: '#fff' },
    unavailableDot: { backgroundColor: '#fff' },
    statusText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
    categoryBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    categoryText: { color: '#fff', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    body: { padding: 16, gap: 12 },
    label: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 4,
      color: (colors as any).text,
    },
    title: { fontSize: 18, fontWeight: '700', lineHeight: 24, color: (colors as any).text, marginBottom: 4 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 },
    priceContainer: { flex: 1 },
    priceLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: (colors as any).subtitle || `${(colors as any).text}80`,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    price: { fontSize: 22, fontWeight: '800', color: (colors as any).primary || '#10b981', letterSpacing: -0.5 },
    exchangeText: { fontSize: 16, fontWeight: '700', color: (colors as any).primary || '#10b981', paddingVertical: 4 },
    sellerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor:
        String((colors as any).background) === '#f8fafc' || String((colors as any).surface) === '#ffffff'
          ? '#f9fafb'
          : 'rgba(255,255,255,0.05)',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 20,
      maxWidth: '50%',
    },
    sellerAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: (colors as any).primary || '#10b981', alignItems: 'center', justifyContent: 'center' },
    sellerInitial: { color: '#fff', fontSize: 13, fontWeight: '700' },
    sellerName: { fontSize: 13, fontWeight: '600', color: (colors as any).text, flex: 1 },
  });

export default ProductCard;
