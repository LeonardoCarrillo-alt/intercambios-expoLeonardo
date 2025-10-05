import React from 'react';
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useThemeColors';
import type { ThemeColors } from '../../theme/colors';

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      padding: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    subtitle: {
      textAlign: 'center',
      color: colors.subtitle,
      marginBottom: 24,
    },
    link: {
      color: colors.primary,
      fontWeight: '600',
      fontSize: 16,
      marginBottom: 12,
    },
  });

export default function DashboardScreen() {
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Inicio' }} />
      <Text style={styles.title}>Bienvenido a Routes App</Text>
      <Text style={styles.subtitle}>Esta es la ruta raíz registrada por Expo Router.</Text>
      <Link href="/profile" style={styles.link}>
        Ir al perfil →
      </Link>
      <Link href="/dashboard" style={styles.link}>
        Ir al Dashboard →
      </Link>
    </View>
  );
}
