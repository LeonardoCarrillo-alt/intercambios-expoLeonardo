import React, { useMemo, useState } from "react";
import { Stack } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { useThemeColors } from "../../../../src/hooks/useThemeColors";
import type { ThemeColors } from "../../../../src/theme/colors";
import { useAuth } from "../../../context/AuthContext";
import { uploadToCloudinary } from "../../../../src/services/cloudinary";
import { createProduct } from "../../../../src/services/productService";

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    headerTitle: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 12 },
    label: { color: colors.text, fontWeight: "700", marginTop: 12, marginBottom: 6 },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 10,
      color: colors.text,
    },
    row: { flexDirection: "row", alignItems: "center", gap: 8 },
    smallInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 10,
      borderRadius: 10,
      color: colors.text,
    },
    button: { marginTop: 18, backgroundColor: "#10b981", padding: 14, borderRadius: 12, alignItems: "center" },
    buttonText: { color: "white", fontWeight: "800", fontSize: 16 },
    imagePreview: { width: "100%", height: 220, borderRadius: 12, marginTop: 8, backgroundColor: "#f3f4f6" },
    pickButton: {
      marginTop: 8,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: "#10b981",
      padding: 10,
      borderRadius: 10,
      alignItems: "center",
    },
    errorText: { color: "#ef4444", marginTop: 8 },
    hint: { color: colors.subtitle, marginTop: 6 },
  });

const categories = ["Electrónica", "Ropa", "Libros", "Hogar", "Deportes", "Otros"];

const PublishScreen: React.FC = () => {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [type, setType] = useState<"Venta" | "Intercambio">("Venta");
  const [condition, setCondition] = useState<"Nuevo" | "Como nuevo" | "Usado">("Usado");
  const [career, setCareer] = useState("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!res.granted) return Alert.alert("Permiso denegado", "No se pudo acceder a la galería");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const res = await ImagePicker.requestCameraPermissionsAsync();
    if (!res.granted) return Alert.alert("Permiso denegado", "No se pudo acceder a la cámara");
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true });
    if (!result.canceled && result.assets && result.assets.length > 0) setImageUri(result.assets[0].uri);
  };

  const validate = () => {
    if (!imageUri) return setError("Imagen obligatoria"), false;
    if (!title.trim()) return setError("Título obligatorio"), false;
    if (!category.trim()) return setError("Selecciona una categoría"), false;
    if (!career.trim()) return setError("Indica la carrera"), false;
    if (type === "Venta" && !price.trim()) return setError("Precio obligatorio para venta"), false;
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validate()) return;
    if (!user) return Alert.alert("No autenticado", "Inicia sesión para publicar");
    setLoading(true);
    try {
      const uploadRes = await uploadToCloudinary(imageUri!, { width: 400 });
      const payload = {
        title: title.trim(),
        category: category.trim(),
        type,
        condition,
        career: career.trim(),
        price: type === "Venta" ? (isNaN(Number(price)) ? 0 : Number(price)) : null,
        description: description.trim() || null,
        images: { original: uploadRes.secure_url, thumb: uploadRes.thumb_url || uploadRes.secure_url },
      };
      await createProduct(payload, user.uid);
      setTitle("");
      setCategory(categories[0]);
      setType("Venta");
      setCondition("Usado");
      setCareer("");
      setPrice("");
      setDescription("");
      setImageUri(null);
      Alert.alert("Éxito", "Espera hasta que un administrador decida si aprobar tu publicación");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Error al publicar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Publicar" }} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.headerTitle}>Nueva publicación</Text>

          <Text style={styles.label}>Imagen / Cover</Text>
          {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
              <Text style={{ color: "#10b981", fontWeight: "700" }}>Elegir imagen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickButton} onPress={takePhoto}>
              <Text style={{ color: "#10b981", fontWeight: "700" }}>Tomar foto</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Título</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Ej: Libro de programación" placeholderTextColor={colors.subtitle} style={styles.input} />

          <Text style={styles.label}>Categoría</Text>
          <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
            <Picker selectedValue={category} onValueChange={(itemValue: string) => setCategory(itemValue)} style={{ color: colors.text }}>
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Tipo</Text>
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => setType("Venta")}
              style={[styles.smallInput, { backgroundColor: type === "Venta" ? "#10b981" : undefined }]}
            >
              <Text style={{ color: type === "Venta" ? "white" : colors.text }}>Venta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setType("Intercambio")}
              style={[styles.smallInput, { backgroundColor: type === "Intercambio" ? "#10b981" : undefined }]}
            >
              <Text style={{ color: type === "Intercambio" ? "white" : colors.text }}>Intercambio</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Estado</Text>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => setCondition("Nuevo")} style={[styles.smallInput, { backgroundColor: condition === "Nuevo" ? "#10b981" : undefined }]}>
              <Text style={{ color: condition === "Nuevo" ? "white" : colors.text }}>Nuevo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCondition("Como nuevo")} style={[styles.smallInput, { backgroundColor: condition === "Como nuevo" ? "#10b981" : undefined }]}>
              <Text style={{ color: condition === "Como nuevo" ? "white" : colors.text }}>Como nuevo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCondition("Usado")} style={[styles.smallInput, { backgroundColor: condition === "Usado" ? "#10b981" : undefined }]}>
              <Text style={{ color: condition === "Usado" ? "white" : colors.text }}>Usado</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Carrera</Text>
          <TextInput value={career} onChangeText={setCareer} placeholder="Sistemas, Industrial..." placeholderTextColor={colors.subtitle} style={styles.input} />

          {type === "Venta" && (
            <>
              <Text style={styles.label}>Precio</Text>
              <TextInput value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="numeric" placeholderTextColor={colors.subtitle} style={styles.input} />
            </>
          )}

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Detalles adicionales..."
            placeholderTextColor={colors.subtitle}
            style={[styles.input, { height: 120, textAlignVertical: "top" }]}
            multiline
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Publicar (pendiente)</Text>}
          </TouchableOpacity>

          <Text style={styles.hint}>
            Tu publicación quedará en estado "pending" hasta que un administrador la apruebe.
          </Text>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PublishScreen;
