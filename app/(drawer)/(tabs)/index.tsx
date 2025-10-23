import {useMemo} from 'react';
import { Stack } from 'expo-router';
import { Text, StyleSheet, FlatList, View } from 'react-native';
import CategoryList from '../../../src/components/market/CategoryList';
import ProductList from '../../../src/components/market/ProductList';
import { useThemeColors } from '../../../src/hooks/useThemeColors';
import { ThemeColors } from '../../../src/theme/colors';

const MarketScreen: React.FC = () => {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <Stack.Screen options={{ title: 'Mercado' }} />
      <FlatList
        data={[{ key: 'categories' }, { key: 'products' }]}
        renderItem={({ item }) => {
          if (item.key === 'categories') {
            return (
              <View>
                <Text style={styles.sectionTitle}>Categorías</Text>
                <CategoryList />
              </View>
            );
          }
          return (
            <View>
              <Text style={styles.sectionTitle}>Productos</Text>
              <ProductList />
            </View>
          );
        }}
        contentContainerStyle={styles.container}
      />
    </>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      padding: 16,
    },
    sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginVertical: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase', // da sensación de encabezado
  }
  });

export default MarketScreen;
