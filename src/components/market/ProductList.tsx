import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { ThemeColors } from "../../theme/colors";
import ProductModal from "./productModal";
import { ProductCard } from "./productCard";

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({ container: { flex: 1 } });

const ProductList: React.FC<{ products: any[] }> = ({ products }) => {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleProductPress = (product: any) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  const handleTradeNow = (product: any) => {
    handleCloseModal();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={{
              id: item.id,
              title: item.title,
              price: item.price ?? undefined,
              image: item.images?.thumb ?? item.images?.original ?? "",
              description: item.description ?? undefined,
              condition: item.condition === "Usado" ? "No Disponible" : "Disponible",
              category: item.category ?? undefined,
              alias: item.alias ?? "usuario",
              status: item.status ?? "approved",
            }}
            onPress={() => handleProductPress(item)}
          />
        )}
      />
      <ProductModal visible={modalVisible} product={selectedProduct} onClose={handleCloseModal} TradeNow={handleTradeNow} />
    </View>
  );
};

export default ProductList;
