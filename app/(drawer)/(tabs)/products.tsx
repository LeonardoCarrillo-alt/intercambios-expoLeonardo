import React from 'react';
import { Stack } from 'expo-router';
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
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    copy: {
      textAlign: 'center',
      color: colors.subtitle,
    },
  });

const ProductsScreen = () => {
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Productos' }} />
      <Text style={styles.title}>Listado de productos</Text>
      <Text style={styles.copy}>Aquí aparecerán los productos disponibles.</Text>
    </View>
  );
};

export default ProductsScreen;
