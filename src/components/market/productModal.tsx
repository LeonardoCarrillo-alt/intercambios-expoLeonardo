import React, { FC, useMemo, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ThemeColors } from '../../theme/colors';
import { getUserDoc } from '../../services/userService';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';
import { storage, db } from '../../../app/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface Product {
  id: string;
  title: string;
  price?: number;
  image?: string;
  images?: any;
  description?: string;
  condition: 'Disponible' | 'No Disponible';
  category?: string;
  alias?: string | null;
  ownerId?: string | null;
}

interface ProductModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  TradeNow: (product: Product) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ProductModal: FC<ProductModalProps> = ({ visible, product, onClose, TradeNow }) => {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [ownerName, setOwnerName] = useState<string | null>(product?.alias ?? null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    if (!product) return;
    let mounted = true;
    (async () => {
      if (product.ownerId) {
        try {
          const user = await getUserDoc(product.ownerId);
          if (!mounted) return;
          const name = (user && (user.username || user.displayName)) ?? product.alias ?? 'Usuario';
          setOwnerName(name);
        } catch {
          if (mounted) setOwnerName(product.alias ?? 'Usuario');
        }
      } else {
        setOwnerName(product.alias ?? 'Usuario');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [product?.ownerId, product?.alias]);

  const extractCandidateFromImages = (imagesField: any): string | null => {
    if (!imagesField) return null;
    if (typeof imagesField === 'string') return imagesField;
    if (Array.isArray(imagesField)) {
      if (imagesField.length === 0) return null;
      const first = imagesField[0];
      if (typeof first === 'string') return first;
      if (first && typeof first === 'object') {
        return first.thumbnail ?? first.original ?? null;
      }
      return null;
    }
    if (typeof imagesField === 'object') {
      return imagesField.thumbnail ?? imagesField.original ?? null;
    }
    return null;
  };

  useEffect(() => {
    if (!product) {
      setImageUri(null);
      return;
    }
    let mounted = true;
    (async () => {
      setLoadingImage(true);
      try {
        let imgCandidate: string | null = null;
        if (product.image) imgCandidate = product.image;
        if (!imgCandidate) {
          const fromImages = extractCandidateFromImages(product.images);
          if (fromImages) imgCandidate = fromImages;
        }
        if (!imgCandidate && product.id) {
          try {
            const docRef = doc(db, 'products', product.id);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
              const data: any = snap.data();
              if (data.image) imgCandidate = data.image;
              if (!imgCandidate) {
                const fromImages = extractCandidateFromImages(data.images);
                if (fromImages) imgCandidate = fromImages;
              }
            }
          } catch (err) {
            console.warn('Error leyendo producto desde Firestore en modal:', err);
          }
        }
        if (!imgCandidate) {
          if (mounted) setImageUri(null);
          return;
        }
        if (imgCandidate.startsWith('http://') || imgCandidate.startsWith('https://')) {
          if (mounted) setImageUri(imgCandidate);
        } else {
          try {
            const url = await getDownloadURL(storageRef(storage, imgCandidate));
            if (mounted) setImageUri(url);
          } catch (err) {
            console.warn('getDownloadURL fallo en modal, fallback al valor original:', err);
            if (mounted) setImageUri(imgCandidate);
          }
        }
      } catch (err) {
        console.warn('Error resolviendo imagen en modal:', err);
        if (mounted) setImageUri(product.image ?? null);
      } finally {
        if (mounted) setLoadingImage(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [product?.id, product?.image, product?.images]);

  if (!product) return null;

  const isAvailable = product.condition === 'Disponible';

  const handleContact = () => {
    Alert.alert('Contactar vendedor', `¿Deseas contactar a @${ownerName ?? product.alias ?? 'usuario'}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Contactar', onPress: () => console.log('Contactar a:', ownerName ?? product.alias) },
    ]);
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    console.log(isFavorite ? 'Removido de favoritos' : 'Añadido a favoritos');
  };

  const handleReport = () => {
    Alert.alert('Reportar publicación', '¿Por qué deseas reportar esta publicación?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Contenido inapropiado', onPress: () => console.log('Reportado: Contenido inapropiado') },
      { text: 'Información falsa', onPress: () => console.log('Reportado: Información falsa') },
      { text: 'Estafa', onPress: () => console.log('Reportado: Estafa') },
    ]);
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.dragIndicator} />
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleFavorite} style={styles.iconButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.iconText}>{isFavorite ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces contentContainerStyle={styles.scrollContent}>
            <View style={styles.imageWrapper}>
              {loadingImage ? (
                <View style={styles.image}>
                  <ActivityIndicator />
                </View>
              ) : imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={[styles.image, { backgroundColor: '#f3f4f6' }]} />
              )}

              <View style={[styles.statusBadge, isAvailable ? styles.availableBadge : styles.unavailableBadge]}>
                <View style={[styles.statusDot, isAvailable ? styles.availableDot : styles.unavailableDot]} />
                <Text style={styles.statusBadgeText}>{product.condition}</Text>
              </View>

              {product.category && (
                <View style={styles.categoryBadgeModal}>
                  <Text style={styles.categoryBadgeText}>{product.category}</Text>
                </View>
              )}
            </View>

            <View style={styles.mainInfo}>
              <Text style={styles.title} numberOfLines={3}>
                {product.title}
              </Text>

              {product.price != null ? (
                <View style={styles.priceSection}>
                  <Text style={styles.priceLabel}>Precio</Text>
                  <Text style={styles.price}>Bs {product.price.toFixed(2)}</Text>
                </View>
              ) : (
                <View style={styles.exchangeSection}>
                  <Text style={styles.exchangeLabel}>Modalidad</Text>
                  <Text style={styles.exchangeText}>Solo Intercambio</Text>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>📝 Descripción</Text>
              <Text style={styles.text}>{product.description || 'Sin descripción disponible.'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>👤 Vendedor</Text>
              <View style={styles.sellerCard}>
                <View style={styles.sellerInfo}>
                  <View style={styles.sellerAvatar}>
                    <Text style={styles.sellerInitial}>{(ownerName || product.alias || 'U')[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.sellerDetails}>
                    <Text style={styles.sellerName}>@{ownerName || product.alias || 'Usuario no disponible'}</Text>
                    <Text style={styles.sellerMeta}>Miembro verificado</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                  <Text style={styles.contactButtonText}>Contactar</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>⚙️ Opciones</Text>
              <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionCard} onPress={handleFavorite}>
                  <View style={styles.actionIcon}>
                    <Text style={styles.actionEmoji}>{isFavorite ? '❤️' : '🤍'}</Text>
                  </View>
                  <Text style={styles.actionText}>{isFavorite ? 'En Favoritos' : 'Agregar a Favoritos'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Compartir', 'Funcionalidad de compartir próximamente')}>
                  <View style={styles.actionIcon}>
                    <Text style={styles.actionEmoji}>📤</Text>
                  </View>
                  <Text style={styles.actionText}>Compartir</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionCard, styles.reportCard]} onPress={handleReport}>
                  <View style={styles.actionIcon}>
                    <Text style={styles.actionEmoji}>⚠️</Text>
                  </View>
                  <Text style={[styles.actionText, styles.reportText]}>Reportar</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {isAvailable && (
            <View style={styles.footer}>
              <TouchableOpacity style={styles.tradeButton} onPress={() => TradeNow(product)} activeOpacity={0.8}>
                <Text style={styles.tradeButtonText}>🔄 Intercambiar Ahora</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors | any) => {
  const bg = String((colors as any).background ?? '').toLowerCase();
  const surface = String((colors as any).surface ?? '').toLowerCase();
  const isLight = bg === '#f8fafc' || surface === '#ffffff';

  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContainer: {
      backgroundColor: (colors as any).background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: SCREEN_HEIGHT * 0.92,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: ((colors as any).shadow as string) ?? '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 20,
        },
      }),
    },
    header: {
      paddingTop: 12,
      paddingBottom: 8,
      paddingHorizontal: 20,
      backgroundColor: (colors as any).background,
      borderBottomWidth: 1,
      borderBottomColor: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.1)',
    },
    dragIndicator: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: `${(colors as any).text}30`,
      marginBottom: 12,
    },
    headerActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 8,
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconText: {
      fontSize: 18,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeText: {
      fontSize: 20,
      color: `${(colors as any).text}80`,
      fontWeight: '600',
    },
    scrollContent: {
      paddingBottom: 20,
    },
    imageWrapper: {
      width: '100%',
      height: 320,
      backgroundColor: '#f3f4f6',
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    statusBadge: {
      position: 'absolute',
      top: 16,
      left: 16,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 6,
    },
    availableBadge: {
      backgroundColor: 'rgba(16, 185, 129, 0.95)',
    },
    unavailableBadge: {
      backgroundColor: 'rgba(239, 68, 68, 0.95)',
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    availableDot: { backgroundColor: '#fff' },
    unavailableDot: { backgroundColor: '#fff' },
    statusBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
    categoryBadgeModal: {
      position: 'absolute',
      top: 16,
      right: 16,
      backgroundColor: 'rgba(0,0,0,0.7)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    categoryBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
    mainInfo: { padding: 16 },
    title: { fontSize: 22, fontWeight: '800', color: (colors as any).text },
    priceSection: { marginTop: 8 },
    priceLabel: { fontSize: 12, fontWeight: '700', color: (colors as any).subtitle || `${(colors as any).text}80` },
    price: { fontSize: 24, fontWeight: '800', color: (colors as any).primary || '#10b981', marginTop: 4 },
    exchangeSection: { marginTop: 8 },
    exchangeLabel: { fontSize: 12, fontWeight: '700', color: (colors as any).subtitle || `${(colors as any).text}80` },
    exchangeText: { fontSize: 16, fontWeight: '700', color: (colors as any).primary || '#10b981', marginTop: 4 },
    divider: { height: 1, backgroundColor: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.06)', marginHorizontal: 16, marginVertical: 12 },
    section: { paddingHorizontal: 16, paddingVertical: 8 },
    sectionLabel: { fontSize: 14, fontWeight: '800', marginBottom: 8 },
    text: { fontSize: 14, color: (colors as any).text },
    sellerCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sellerInfo: { flexDirection: 'row', alignItems: 'center' },
    sellerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: (colors as any).primary || '#10b981', alignItems: 'center', justifyContent: 'center' },
    sellerInitial: { color: '#fff', fontSize: 18, fontWeight: '800' },
    sellerDetails: { marginLeft: 12 },
    sellerName: { fontSize: 16, fontWeight: '700' },
    sellerMeta: { fontSize: 12, color: (colors as any).subtitle || `${(colors as any).text}80` },
    contactButton: { backgroundColor: (colors as any).primary || '#10b981', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    contactButtonText: { color: '#fff', fontWeight: '700' },
    actionsGrid: { flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap' },
    actionCard: { minWidth: 110, padding: 12, borderRadius: 10, backgroundColor: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.03)', alignItems: 'center' },
    actionIcon: { marginBottom: 8 },
    actionEmoji: { fontSize: 20 },
    actionText: { fontSize: 13, fontWeight: '700' },
    reportCard: { borderColor: 'rgba(239,68,68,0.15)', borderWidth: 1 },
    reportText: { color: 'rgba(239,68,68,1)' },
    footer: { padding: 16, borderTopWidth: 1, borderTopColor: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.06)', backgroundColor: (colors as any).background },
    tradeButton: { backgroundColor: (colors as any).primary || '#10b981', padding: 14, borderRadius: 12, alignItems: 'center' },
    tradeButtonText: { color: '#fff', fontWeight: '800' },
  });
};

export default ProductModal;
