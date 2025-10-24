import React, { useEffect, useMemo, useState } from "react";
import { Stack } from "expo-router";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useThemeColors } from "../../../../src/hooks/useThemeColors";
import { ThemeColors } from "../../../../src/theme/colors";
import { useAuth } from "../../../context/AuthContext";
import { fetchProductsByOwner, deleteProduct, updateProduct } from "../../../../src/services/productService";
import ProductList from "../../../../src/components/market/ProductList";

const MyPostsScreen: React.FC = () => {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await fetchProductsByOwner(user.uid);
      setProducts(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user]);

  const handleDelete = (id: string) => {
    Alert.alert("Confirmar", "¿Deseas eliminar esta publicación?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteProduct(id);
          setProducts((prev) => prev.filter((p) => p.id !== id));
        },
      },
    ]);
  };

  const handleUpdate = async (id: string, data: any) => {
    await updateProduct(id, data);
    loadProducts();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Mis Productos" }} />
      {loading ? (
        <ActivityIndicator />
      ) : products.length === 0 ? (
        <Text style={styles.empty}>No tienes productos publicados aún.</Text>
      ) : (
        <ProductList
          products={products}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  ({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    empty: { marginTop: 40, textAlign: "center", color: colors.subtitle },
  } as const);

export default MyPostsScreen;
