import React from 'react';
import { TouchableOpacity, Text, Image, View, StyleSheet } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ThemeColors } from '../../theme/colors';
import { Product } from './ProductList';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    productCard: {
      backgroundColor: 'yellow',
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    productImage: {
      width: 80,
      height: 80,
      borderRadius: 10,
      marginRight: 12,
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    productPrice: {
      fontSize: 14,
      color: colors.subtitle,
      marginTop: 4,
    },
  });

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: product.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>${product.price}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;