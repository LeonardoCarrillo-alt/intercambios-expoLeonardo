import React, { useEffect, useMemo, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { View, Text, FlatList, ActivityIndicator, Button } from "react-native";
import { useThemeColors } from "../../../../src/hooks/useThemeColors";
import { ThemeColors } from "../../../../src/theme/colors";
import { useAuth } from "../../../context/AuthContext";
import { fetchProductsByOwner } from "../../../../src/services/productService";
import { ProductCard } from "../../../../src/components/market/productCard";
import { useProfileStore } from "../../../../src/store/useProfileStore";

const ProfileScreen: React.FC = () => {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();
  const { isAdmin } = useProfileStore();
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await fetchProductsByOwner(user.uid);
      setItems(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Perfil" }} />

      {isAdmin && (
        <Button
          title="Ir a Moderación"
          color={colors.primary}
          onPress={() => router.push("/(drawer)/moderation")}
        />
      )}

      <Text style={styles.title}>Tus Publicaciones</Text>
      {loading ? (
        <ActivityIndicator />
      ) : items.length === 0 ? (
        <Text style={styles.empty}>No tienes publicaciones aún.</Text>
      ) : (
        <FlatList
          data={items}
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
                status: item.status ?? "pending",
              }}
            />
          )}
        />
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  ({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 12 },
    empty: { marginTop: 40, textAlign: "center", color: colors.subtitle },
  } as const);

export default ProfileScreen;
