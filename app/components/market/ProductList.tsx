import { useState,useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ThemeColors } from '../../theme/colors';
import ProductModal from './productModal';
import {ProductCard ,Product}from './productCard';
import { useMarketStore } from '../../store/useMarketStore';

const image = 'data:image/webp;base64,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';

const products: Product[] = [
  {
    id: '1',
    title: 'Smartphone',
    price: 500,
    image: image,
    description: 'Smartphone de última generación con 128GB de almacenamiento',
    condition: 'Disponible',
    category: 'Electrónica',
    alias: 'usuario123',
  },
  {
    id: '2',
    title: 'Camiseta',
    price: 20,
    image: image,
    description: 'Camiseta 100% algodón color azul talla M',
    condition: 'Disponible',
    category: 'Ropa',
    alias: 'usuario456',
  },
  {
    id: '3',
    title: 'Laptop Gaming',
    price: 1200,
    image: image,
    description: 'Laptop para gaming con RTX 3060 y 16GB RAM',
    condition: 'Disponible',
    category: 'Electrónica',
    alias: 'gamer_pro',
  },
  {
    id: '4',
    title: 'Zapatos Deportivos',
    price: 80,
    image: image,
    description: 'Zapatos running talla 42, color negro',
    condition: 'Disponible',
    category: 'Ropa',
    alias: 'deportista_22',
  },
  {
    id: '5',
    title: 'Libro de Programación',
    price: 35,
    image: image,
    description: 'Aprende JavaScript desde cero - Edición 2024',
    condition: 'Disponible',
    category: 'Libros',
    alias: 'book_lover',
  },
  {
    id: '6',
    title: 'Auriculares Inalámbricos',
    price: 150,
    image: image,
    description: 'Auriculares noise cancelling, batería 30h',
    condition: 'Disponible',
    category: 'Electrónica',
    alias: 'tech_geek',
  },
  {
    id: '7',
    title: 'Mesa de Oficina',
    price: 200,
    image: image,
    description: 'Mesa de madera 120x60cm, color natural',
    condition: 'Disponible',
    category: 'Hogar',
    alias: 'home_design',
  },
  {
    id: '8',
    title: 'Bicicleta Mountain Bike',
    price: 450,
    image: image,
    description: 'Bicicleta montaña 21 velocidades, suspensión delantera',
    condition: 'Disponible',
    category: 'Deportes',
    alias: 'ciclista_urbano',
  },
  {
    id: '9',
    title: 'Cámara DSLR',
    price: 800,
    image: image,
    description: 'Cámara réflex 24MP con lente 18-55mm',
    condition: 'Disponible',
    category: 'Electrónica',
    alias: 'fotografo_amateur',
  },
  {
    id: '10',
    title: 'Juego de Sartenes',
    price: 75,
    image: image,
    description: 'Set de 3 sartenes antiadherentes',
    condition: 'Disponible',
    category: 'Hogar',
    alias: 'chef_casero',
  },
  {
    id: '11',
    title: 'Balón de Fútbol',
    price: 25,
    image: image,
    description: 'Balón oficial tamaño 5, material PVC',
    condition: 'Disponible',
    category: 'Deportes',
    alias: 'futbol_fan',
  },
  {
    id: '12',
    title: 'Reloj Inteligente',
    price: 180,
    image: image,
    description: 'Smartwatch con monitor de ritmo cardíaco y GPS',
    condition: 'Disponible',
    category: 'Electrónica',
    alias: 'tecnologia_plus',
  },
  {
    id: '13',
    title: 'Mochila Impermeable',
    price: 45,
    image: image,
    description: 'Mochila 25L, ideal para senderismo y viajes',
    condition: 'Disponible',
    category: 'Accesorios',
    alias: 'aventurero_x',
  },
  {
    id: '14',
    title: 'Juego de Mesa',
    price: 30,
    image: image,
    description: 'Juego de cartas estratégico para 2-6 jugadores',
    condition: 'Disponible',
    category: 'Entretenimiento',
    alias: 'game_night',
  },
  {
    id: '15',
    title: 'Plantas de Interior',
    price: 15,
    image: image,
    description: 'Set de 3 plantas de interior fáciles de cuidar',
    condition: 'Disponible',
    category: 'Jardín',
    alias: 'green_thumb',
  },
  {
  id: '16',
  title: 'Maceteros de Cerámica',
  price: 35,
  image: image,
  description: 'Set de 3 maceteros de cerámica de diferentes tamaños',
  condition: 'Disponible',
  category: 'Jardín',
  alias: 'plant_lover',
},
{
  id: '17',
  title: 'Kit de Herramientas Jardinería',
  price: 45,
  image: image,
  description: 'Incluye pala, rastrillo, trasplantador y guantes',
  condition: 'Disponible',
  category: 'Jardín',
  alias: 'garden_tools',
},
{
  id: '18',
  title: 'Fertilizante Orgánico',
  price: 12,
  image: image,
  description: 'Fertilizante natural para plantas de interior, 1kg',
  condition: 'Disponible',
  category: 'Jardín',
  alias: 'organic_gardener',
},
{
  id: '19',
  title: 'Rosa en Maceta',
  price: 28,
  image: image,
  description: 'Rosa roja en maceta lista para trasplantar',
  condition: 'Disponible',
  category: 'Jardín',
  alias: 'flower_power',
},
{
  id: '20',
  title: 'Suculentas Variadas',
  price: 22,
  image: image,
  description: 'Colección de 5 suculentas diferentes en macetas pequeñas',
  condition: 'Disponible',
  category: 'Jardín',
  alias: 'succulent_fan',
  }
];

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
  });


const ProductList: React.FC = () => {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { selectedCategory } = useMarketStore();

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

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
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handleProductPress(item)}
          />
        )}
      />


      <ProductModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => setModalVisible(false)}
        TradeNow={handleTradeNow}
      />
    </View>
  );
};

export default ProductList;
