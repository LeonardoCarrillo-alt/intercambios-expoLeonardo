import React, { useMemo, useState } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import { ThemeColors } from "../../theme/colors";
import ProductModal from "./productModal";
import { ProductCard } from "./productCard";
import { useMarketStore } from "../../store/useMarketStore";

const ProductList: React.FC<{ products: any[] }> = ({ products }) => {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { selectedCategory, searchQuery } = useMarketStore();

  const filteredProducts = useMemo(() => {
    return (products || []).filter((p: any) => {
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      const q = (searchQuery || "").trim().toLowerCase();
      const matchesText =
        q === "" ||
        (p.title && p.title.toString().toLowerCase().includes(q)) ||
        (p.description && p.description.toString().toLowerCase().includes(q)) ||
        (p.brand && p.brand.toString().toLowerCase().includes(q));
      return matchesCategory && matchesText;
    });
  }, [products, selectedCategory, searchQuery]);

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
    console.log("Intercambiar ahora:", product?.id);
    handleCloseModal();
  };

  if (!products) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const productData = {
            ...item,
            image: item.image ?? item.images?.thumb ?? item.images?.original ?? "",
            condition: item.condition === "Usado" ? "No Disponible" : "Disponible",
            alias: item.alias ?? "usuario",
            status: item.status ?? "approved",
          };

          return <ProductCard product={productData} onPress={() => handleProductPress(item)} />;
        }}
      />

      <ProductModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={handleCloseModal}
        TradeNow={handleTradeNow}
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { backgroundColor: colors.background },
  });

export default ProductList;
