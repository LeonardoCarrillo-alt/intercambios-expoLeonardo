import { Pressable, Text, Image } from 'react-native';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

export interface Product {
  id: string;
  title: string;
  price?: number;
  image: string;
  description?: string;
  condition: 'Disponible' | 'No Disponible';
  category?: string;
  alias: string;
}

export const ProductCard: React.FC<{ product: Product; onPress?: () => void }> = ({
  product,
  onPress,
}) => {
  const { colors } = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        cardStyles.container,
        {
          opacity: pressed ? 0.9 : 1,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Image
        source={{ uri: product.image }}
        style={cardStyles.image}
        resizeMode="cover"
      />
      <View style={cardStyles.body}>
        <Text numberOfLines={1} style={[cardStyles.title, { color: colors.text }]}>
          {product.title}
        </Text>
        <Text numberOfLines={1} style={[cardStyles.meta, { color: colors.subtitle }]}>
          {product.category} • {product.condition}
        </Text>
        <View style={cardStyles.row}>
          <Text style={[cardStyles.price, { color: colors.primary }]}>
            {product.price != null ? `$ ${product.price.toFixed(2)}` : 'Intercambio'}
          </Text>
          <Text style={[cardStyles.alias, { color: colors.muted }]}>
            @{product.alias}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const cardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  image: {
    width: 120,
    height: 90,
  },
  body: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
  },
  alias: {
    fontSize: 12,
  },
});
