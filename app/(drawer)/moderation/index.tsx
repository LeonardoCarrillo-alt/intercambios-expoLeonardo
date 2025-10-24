import React, { useEffect, useMemo, useState } from "react";
import { Stack } from "expo-router";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from "react-native";
import { useThemeColors } from "../../../src/hooks/useThemeColors";
import { ThemeColors } from "../../../src/theme/colors";
import { useAuth } from "../../context/AuthContext";
import { fetchPendingProducts, approveProduct, rejectProduct } from "../../../src/services/productService";

const ModerationScreen: React.FC = () => {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null); // nuevo estado

  const load = async () => {
    setLoading(true);
    try {
      const list = await fetchPendingProducts();
      setItems(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: string) => {
    if (!user) return;
    setActionLoadingId(id);
    setActionType("approve");
    try {
      await approveProduct(id, user.uid);
      setItems((s) => s.filter((i) => i.id !== id));
      Alert.alert("Éxito", "Aprobaste este producto con éxito");
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo aprobar el producto");
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!user) return;
    setActionLoadingId(id);
    setActionType("reject");
    try {
      await rejectProduct(id, user.uid);
      setItems((s) => s.filter((i) => i.id !== id));
      Alert.alert("Éxito", "Rechazaste este producto");
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo rechazar el producto");
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Moderación" }} />
      <Text style={styles.title}>Publicaciones pendientes</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.images?.thumb || item.images?.original ? (
                <Image
                  source={{ uri: item.images.thumb ?? item.images.original }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : null}
              <View style={styles.row}>
                <Text style={styles.label}>{item.title}</Text>
                <Text style={styles.meta}>{item.category}</Text>
              </View>
              <Text style={styles.meta}>@{item.alias ?? item.ownerId.slice(0, 6)}</Text>
              <Text numberOfLines={2} style={{ color: colors.text, marginTop: 6 }}>
                {item.description ?? "-"}
              </Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.btnApprove}
                  onPress={() => handleApprove(item.id)}
                  disabled={actionLoadingId === item.id && actionType === "approve"}
                >
                  {actionLoadingId === item.id && actionType === "approve" ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.btnText}>Aprobar</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnReject}
                  onPress={() => handleReject(item.id)}
                  disabled={actionLoadingId === item.id && actionType === "reject"}
                >
                  {actionLoadingId === item.id && actionType === "reject" ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.btnText}>Rechazar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  ({
    container: { flex: 1, backgroundColor: colors.background, padding: 12 },
    title: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 12 },
    card: { padding: 12, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 8 },
    label: { fontWeight: "700", color: colors.text },
    meta: { color: colors.subtitle },
    btnApprove: { padding: 8, backgroundColor: "#10b981", borderRadius: 10 },
    btnReject: { padding: 8, backgroundColor: "#ef4444", borderRadius: 10 },
    btnText: { color: "white", fontWeight: "800" },
    image: { width: "100%", height: 150, borderRadius: 12, marginBottom: 8 },
  } as const);

export default ModerationScreen;
