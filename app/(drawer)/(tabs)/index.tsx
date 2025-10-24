import { useMemo, useEffect, useState } from "react";
import { Stack } from "expo-router";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import CategoryList from "../../../src/components/market/CategoryList";
import ProductList from "../../../src/components/market/ProductList";
import { useThemeColors } from "../../../src/hooks/useThemeColors";
import { ThemeColors } from "../../../src/theme/colors";
import { fetchApprovedProducts } from "../../../src/services/productService";

const MarketScreen: React.FC = () => {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await fetchApprovedProducts();
      setProducts(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filtra productos por categoría seleccionada
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: "Mercado" }} />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={[{ key: "categories" }, { key: "products" }]}
          renderItem={({ item }) => {
            if (item.key === "categories") {
              return (
                <View>
                  <Text style={styles.sectionTitle}>Categorías</Text>
                  <CategoryList
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                  />
                </View>
              );
            }
            return (
              <View>
                <Text style={styles.sectionTitle}>Productos</Text>
                <ProductList products={filteredProducts} />
              </View>
            );
          }}
          contentContainerStyle={styles.container}
        />
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  ({
    container: { padding: 16, backgroundColor: colors.background },
    sectionTitle: { fontSize: 22, fontWeight: "700", color: colors.text, marginVertical: 16 },
  } as const);

export default MarketScreen;
