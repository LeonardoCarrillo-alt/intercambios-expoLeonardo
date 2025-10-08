import {useMemo} from 'react';
import { Stack } from 'expo-router';
import { Text, StyleSheet, FlatList, View } from 'react-native';
import CategoryList from '../../components/market/CategoryList';
import ProductList from '../../components/market/ProductList';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ThemeColors } from '../../theme/colors';

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
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginVertical: 12,
    },
  });

export default MarketScreen;
