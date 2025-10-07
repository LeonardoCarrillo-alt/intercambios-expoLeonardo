import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ThemeColors } from '../../theme/colors';
import ProductCard from './productCard';
import ProductModal from './productModal';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  estado: 'Disponible' | 'No Disponible';
  category?: string;
  userName: string;
  career: string;
}

const products: Product[] = [
  { 
    id: '1', 
    name: 'Smartphone', 
    price: 500, 
    image: 'https://via.placeholder.com/150',
    description: 'Smartphone de última generación con pantalla AMOLED de 6.7 pulgadas, 128GB de almacenamiento y cámara triple de 108MP.',
    estado: 'Disponible',
    category: 'Electrónicos',
    userName: 'usuario123',
    career: 'Ingeniería en Sistemas'
  },
  { 
    id: '2', 
    name: 'Camiseta', 
    price: 20, 
    image: 'https://via.placeholder.com/150',
    description: 'Camiseta 100% algodón, disponible en múltiples colores y tallas. Material respirable y cómodo.',
    estado: 'Disponible',
    category: 'Ropa',
    userName: 'usuario456',
    career: 'Medicina'
  },
  { 
    id: '3', 
    name: 'Silla ergonómica', 
    price: 120, 
    image: 'https://via.placeholder.com/150',
    description: 'Silla ergonómica de oficina con soporte lumbar ajustable, reposabrazos y altura regulable.',
    estado: 'No Disponible',
    category: 'Muebles',
    userName: 'usuario789',
    career: 'Derecho'
  },
];

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
  });

const ProductList: React.FC = () => {
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };


  const handleTradeNow = (product: Product) => {
    console.log('Intercambiar ahora:', product.id);
    handleCloseModal();
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={handleProductPress}
          />
        ))}
      </ScrollView>

      <ProductModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={handleCloseModal}
        TradeNow={handleTradeNow}
      />
    </View>
  );
};

export default ProductList;