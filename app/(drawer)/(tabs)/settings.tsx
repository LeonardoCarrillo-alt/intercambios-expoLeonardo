import React from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useThemeColors';
import { useThemeStore } from '../../store/useThemeStore';
import type { ThemeColors } from '../../theme/colors';

const SettingsScreen = () => {
  const { theme, colors } = useThemeColors();
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Configuración' }} />
      <Text style={styles.title}>Configuraciones</Text>
      <View style={styles.preferenceRow}>
        <Text style={styles.preferenceLabel}>Modo oscuro</Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
          thumbColor={theme === 'dark' ? colors.switchThumb : '#f4f4f5'}
        />
      </View>
      <Text style={styles.helperText}>
        Activa el modo oscuro para reducir el brillo y descansar la vista.
      </Text>
    </View>
  );
};


const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    preferenceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      marginBottom: 12,
    },
    preferenceLabel: {
      fontSize: 18,
      color: colors.text,
      fontWeight: '500',
    },
    helperText: {
      fontSize: 14,
      color: colors.subtitle,
      lineHeight: 20,
    },
  });

  export default SettingsScreen;
