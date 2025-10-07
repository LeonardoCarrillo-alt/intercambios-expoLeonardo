import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ThemeColors } from '../../theme/colors';

interface Category {
  id: string;
  name: string;
}

const categories: Category[] = [
  { id: '1', name: 'Electrónica' },
  { id: '2', name: 'Ropa' },
  { id: '3', name: 'Libros' },
  { id: '4', name: 'Hogar' },
  { id: '5', name: 'Deportes' },
];

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    categoriesContainer: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    categoryCard: {
      backgroundColor: 'yellow',
      padding: 12,
      borderRadius: 12,
      marginRight: 10,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    categoryText: {
      color: colors.text,
      fontWeight: '600',
    },
  });

const CategoryList: React.FC = () => {
  const { colors } = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesContainer}
    >
      {categories.map((cat) => (
        <TouchableOpacity key={cat.id} style={styles.categoryCard}>
          <Text style={styles.categoryText}>{cat.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default CategoryList;
