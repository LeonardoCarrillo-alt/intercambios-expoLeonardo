import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { getProductById } from '../../src/services/productService';
import { Product } from '../../src/types/product';
import { getUserDoc } from '../../src/services/userService';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
//proyecto
export default function ProductDetailScreen() {
  const { colors } = useThemeColors();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { startChat } = useChat();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const productData = await getProductById(id as string);
      if (productData) {
        setProduct(productData);
        
        // Cargar información del vendedor
        if (productData.ownerId) {
          const sellerData = await getUserDoc(productData.ownerId);
          setSeller(sellerData);
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'No se pudo cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSeller = async () => {
    if (!user) {
      Alert.alert('Iniciar sesión', 'Debes iniciar sesión para contactar al vendedor', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Iniciar sesión',
          onPress: () => router.push('/login'),
        },
      ]);
      return;
    }

    if (product?.ownerId === user.uid) {
      Alert.alert('Acción no permitida', 'No puedes contactarte contigo mismo');
      return;
    }

    setContacting(true);
    try {
      await startChat(
        product!.ownerId!,
        seller?.username || seller?.displayName || 'Vendedor',
        seller?.email || '',
        product!.id,
        product!.title
      );
      
      Alert.alert('Chat iniciado', 'Ahora puedes chatear con el vendedor', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'No se pudo iniciar el chat');
    } finally {
      setContacting(false);
    }
  };

  const handleViewOnMap = () => {
    if (!product?.location) {
      Alert.alert('Ubicación no disponible', 'Este producto no tiene ubicación registrada');
      return;
    }

    router.push({
      pathname: '/routes',
      params: {
        productId: product.id,
        productTitle: product.title,
        destinationLat: product.location.latitude.toString(),
        destinationLng: product.location.longitude.toString(),
        meetingPoint: product.location.meetingPoint || 'Punto de encuentro'
      }
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Cargando producto...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Producto no encontrado</Text>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isAvailable = product.condition === 'Disponible';
  const isOwner = user?.uid === product.ownerId;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header con botón de volver */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Detalles del Producto</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Imagen del producto */}
        <View style={styles.imageContainer}>
          {product.images?.original ? (
            <Image 
              source={{ uri: product.images.original }} 
              style={styles.productImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImage, { backgroundColor: colors.surface }]} />
          )}
          
          {/* Badges */}
          <View style={[styles.statusBadge, isAvailable ? styles.availableBadge : styles.unavailableBadge]}>
            <Text style={styles.statusBadgeText}>
              {isAvailable ? 'Disponible' : 'No Disponible'}
            </Text>
          </View>
          
          {product.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{product.category}</Text>
            </View>
          )}
        </View>

        {/* Información principal */}
        <View style={styles.content}>
          <Text style={[styles.productTitle, { color: colors.text }]}>{product.title}</Text>
          
          {product.price != null ? (
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Precio</Text>
              <Text style={[styles.price, { color: colors.primary }]}>Bs {product.price.toFixed(2)}</Text>
            </View>
          ) : (
            <View style={styles.exchangeSection}>
              <Text style={styles.exchangeLabel}>Modalidad</Text>
              <Text style={[styles.exchangeText, { color: colors.primary }]}>Solo Intercambio</Text>
            </View>
          )}

          {/* Información adicional */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="cube-outline" size={20} color={colors.muted} />
              <Text style={[styles.detailLabel, { color: colors.muted }]}>Condición:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{product.condition}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="business-outline" size={20} color={colors.muted} />
              <Text style={[styles.detailLabel, { color: colors.muted }]}>Carrera:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{product.career || 'No especificada'}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="pricetag-outline" size={20} color={colors.muted} />
              <Text style={[styles.detailLabel, { color: colors.muted }]}>Tipo:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{product.type || 'No especificado'}</Text>
            </View>
          </View>

          {/* Descripción */}
          {product.description && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Descripción</Text>
              <Text style={[styles.description, { color: colors.text }]}>{product.description}</Text>
            </View>
          )}

          {/* Ubicación */}
          {product.location && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Ubicación</Text>
              <View style={[styles.locationCard, { backgroundColor: colors.surface }]}>
                <Ionicons name="location" size={20} color={colors.primary} />
                <View style={styles.locationInfo}>
                  <Text style={[styles.locationAddress, { color: colors.text }]}>
                    {product.location.address || 'Ubicación disponible'}
                  </Text>
                  {product.location.meetingPoint && (
                    <Text style={[styles.meetingPoint, { color: colors.muted }]}>
                      📍 {product.location.meetingPoint}
                    </Text>
                  )}
                </View>
                <TouchableOpacity 
                  style={[styles.mapButton, { backgroundColor: colors.primary }]}
                  onPress={handleViewOnMap}
                >
                  <Text style={styles.mapButtonText}>Ver en mapa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Información del vendedor */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Vendedor</Text>
            <View style={[styles.sellerCard, { backgroundColor: colors.surface }]}>
              <View style={styles.sellerInfo}>
                <View style={[styles.sellerAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.sellerInitial}>
                    {seller?.username?.[0]?.toUpperCase() || seller?.displayName?.[0]?.toUpperCase() || 'V'}
                  </Text>
                </View>
                <View style={styles.sellerDetails}>
                  <Text style={[styles.sellerName, { color: colors.text }]}>
                    @{seller?.username || seller?.displayName || 'Vendedor'}
                  </Text>
                  <Text style={[styles.sellerMeta, { color: colors.muted }]}>
                    Miembro verificado
                  </Text>
                </View>
              </View>
              
              {!isOwner && isAvailable && (
                <TouchableOpacity 
                  style={[styles.contactButton, { backgroundColor: colors.primary }]}
                  onPress={handleContactSeller}
                  disabled={contacting}
                >
                  {contacting ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Ionicons name="chatbubble-outline" size={18} color="white" />
                      <Text style={styles.contactButtonText}>Contactar</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  availableBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
  },
  unavailableBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
  },
  statusBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  priceSection: {
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  exchangeSection: {
    marginBottom: 20,
  },
  exchangeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  exchangeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailsGrid: {
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 'auto',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  meetingPoint: {
    fontSize: 13,
  },
  mapButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mapButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  sellerCard: {
    padding: 16,
    borderRadius: 12,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sellerInitial: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sellerMeta: {
    fontSize: 14,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  contactButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});