import React from 'react';
import { Stack } from 'expo-router';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { ThemeColors } from '../../../theme/colors';

import CategoryList from '../../../components/market/CategoryList';
import ProductList from '../../../components/market/ProductList';

const MarketScreen: React.FC = () => {
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Mercado' }} />

      <Text style={styles.sectionTitle}>Categorías</Text>
      <CategoryList />

      <Text style={styles.sectionTitle}>Productos</Text>
      <ProductList />
    </ScrollView>
  );
};

export default MarketScreen;


const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginVertical: 12,
    },
  });
