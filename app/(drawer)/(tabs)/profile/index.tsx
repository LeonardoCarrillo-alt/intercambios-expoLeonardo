import React, { useMemo } from "react";
import { Stack } from "expo-router";
import { View, Text, Button } from "react-native";
import { useThemeColors } from "../../../../src/hooks/useThemeColors";
import { ThemeColors } from "../../../../src/theme/colors";
import { useProfileStore } from "../../../../src/store/useProfileStore";
import { useRouter } from "expo-router";

const ProfileScreen: React.FC = () => {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isAdmin, displayName } = useProfileStore();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Perfil" }} />
      <Text style={styles.name}>Hola, {displayName}</Text>
      {isAdmin && (
        <Button
          title="Ir a Moderación"
          color={colors.primary}
          onPress={() => router.push("/(drawer)/moderation")}
        />
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  ({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    name: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 12 },
  } as const);

export default ProfileScreen;
