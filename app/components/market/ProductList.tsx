import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ThemeColors } from '../../theme/colors';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

const products: Product[] = [
  { id: '1', name: 'Smartphone', price: 500, image: 'https://via.placeholder.com/150' },
  { id: '2', name: 'Camiseta', price: 20, image: 'https://via.placeholder.com/150' },
  { id: '3', name: 'Silla ergonómica', price: 120, image: 'https://via.placeholder.com/150' },
];

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

const ProductList: React.FC = () => {
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View>
      {products.map((product) => (
        <View key={product.id} style={styles.productCard}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>${product.price}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default ProductList;
