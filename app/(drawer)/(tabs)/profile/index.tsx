import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  Image, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from "../../../context/AuthContext";
import { auth } from '../../../config/firebase';
import { getUserByUid, updateUserPhoto } from '../../../../src/services/userService';
import { uploadToCloudinary } from '../../../../src/services/cloudinary';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from 'firebase/auth';
import { useThemeColors } from '../../../../src/hooks/useThemeColors';
import { ThemeColors } from '../../../../src/theme/colors';

const ProfileScreen = () => {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [email, setEmail] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { logout } = useAuth();
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoadingProfile(false);
      return;
    }
    setEmail(currentUser.email ?? null);

    const loadProfile = async () => {
      try {
        const userDoc = await getUserByUid(currentUser.uid);
        setPhotoUrl(userDoc?.photoUrl ?? currentUser.photoURL ?? undefined);
      } catch (error) {
        console.warn('No se pudo obtener el perfil del usuario', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.warn('No se pudo cerrar sesión', error);
            }
          }
        }
      ]
    );
  };

  const requestMediaPermission = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso requerido',
        'Necesitamos acceso a tus fotos para actualizar tu imagen de perfil.'
      );
      return false;
    }
    return true;
  }, []);

  const handlePickImage = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Sesión expirada', 'Vuelve a iniciar sesión para cambiar tu foto.');
      return;
    }

    const hasPermission = await requestMediaPermission();
    if (!hasPermission) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    if (!asset.uri) {
      Alert.alert('Error', 'No pudimos leer la imagen seleccionada.');
      return;
    }

    try {
      setUploading(true);
      const uploadResponse = await uploadToCloudinary(asset.uri, {
        fileName: asset.fileName ?? 'profile-photo.jpg',
        mimeType: asset.mimeType ?? 'image/jpeg'
      });

      const secureUrl = uploadResponse.secure_url;
      if (!secureUrl) {
        throw new Error('Cloudinary no devolvió una URL pública.');
      }

      await updateUserPhoto(currentUser.uid, secureUrl);
      await updateProfile(currentUser, { photoURL: secureUrl });
      setPhotoUrl(secureUrl);
      Alert.alert('Listo', 'Tu foto de perfil se actualizó correctamente.');
    } catch (error: any) {
      console.warn('Error subiendo imagen', error);
      Alert.alert('Error', error?.message ?? 'No se pudo subir tu foto.');
    } finally {
      setUploading(false);
    }
  }, [requestMediaPermission]);

  const initials = useMemo(() => {
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return '?';
  }, [email]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con gradiente */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Mi Perfil</Text>
            <Text style={styles.headerSubtitle}>Gestiona tu información personal</Text>
          </View>
        </View>

        {/* Card de perfil */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {loadingProfile ? (
                <ActivityIndicator color={colors.primary || '#1a1a2e'} size="large" />
              ) : photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{initials}</Text>
                </View>
              )}
              {!loadingProfile && (
                <Pressable 
                  style={styles.cameraButton}
                  onPress={handlePickImage}
                  disabled={uploading}
                >
                  <Text style={styles.cameraIcon}>📷</Text>
                </Pressable>
              )}
            </View>
            
            <View style={styles.userInfo}>
              {email && <Text style={styles.userEmail}>{email}</Text>}
              <Text style={styles.userLabel}>Cuenta Principal</Text>
            </View>
          </View>

          {/* Botón de cambiar foto */}
          <Pressable
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={handlePickImage}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Text style={styles.uploadIcon}>🖼️</Text>
                <Text style={styles.uploadLabel}>Cambiar Foto de Perfil</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Opciones */}
        <View style={styles.optionsContainer}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <Pressable style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconContainer, { backgroundColor: '#e3f2fd' }]}>
                <Text style={styles.optionIcon}>👤</Text>
              </View>
              <Text style={styles.optionText}>Editar Perfil</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>

          <Pressable style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconContainer, { backgroundColor: '#f3e5f5' }]}>
                <Text style={styles.optionIcon}>🔔</Text>
              </View>
              <Text style={styles.optionText}>Notificaciones</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>

          <Pressable style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconContainer, { backgroundColor: '#fff3e0' }]}>
                <Text style={styles.optionIcon}>🔒</Text>
              </View>
              <Text style={styles.optionText}>Privacidad y Seguridad</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>

          <Pressable style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <View style={[styles.optionIconContainer, { backgroundColor: '#e8f5e9' }]}>
                <Text style={styles.optionIcon}>❓</Text>
              </View>
              <Text style={styles.optionText}>Ayuda y Soporte</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </Pressable>
        </View>

        {/* Botón de cerrar sesión */}
        <View style={styles.logoutContainer}>
          <Pressable 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutLabel}>Cerrar Sesión</Text>
          </Pressable>
        </View>

        <Text style={styles.versionText}>Versión 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background || '#f8f9fa',
    },
    scrollContent: {
      paddingBottom: 40,
    },
    headerContainer: {
      backgroundColor: colors.primary || '#1a1a2e',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 80,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    headerContent: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: '800',
      color: '#ffffff',
      marginBottom: 6,
      letterSpacing: 0.5,
    },
    headerSubtitle: {
      fontSize: 14,
      color: '#e0e0e0',
      fontWeight: '400',
    },
    profileCard: {
      backgroundColor: colors.surface || '#ffffff',
      marginHorizontal: 20,
      marginTop: -60,
      borderRadius: 20,
      padding: 24,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: 20,
    },
    avatarWrapper: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 4,
      borderColor: colors.primary || '#1a1a2e',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: colors.background || '#f8f9fa',
      position: 'relative',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarPlaceholder: {
      flex: 1,
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary || '#1a1a2e',
    },
    avatarInitial: {
      fontSize: 48,
      fontWeight: '700',
      color: '#ffffff',
    },
    cameraButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary || '#1a1a2e',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: colors.surface || '#ffffff',
    },
    cameraIcon: {
      fontSize: 18,
    },
    userInfo: {
      alignItems: 'center',
      marginTop: 16,
    },
    userEmail: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text || '#000',
      marginBottom: 4,
    },
    userLabel: {
      fontSize: 13,
      color: colors.textSecondary || '#6c757d',
      fontWeight: '500',
    },
    uploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      backgroundColor: colors.primary || '#1a1a2e',
      gap: 8,
    },
    uploadButtonDisabled: {
      opacity: 0.6,
    },
    uploadIcon: {
      fontSize: 18,
    },
    uploadLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: '#ffffff',
      letterSpacing: 0.3,
    },
    optionsContainer: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text || '#000',
      marginBottom: 12,
      marginLeft: 4,
      letterSpacing: 0.3,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface || '#ffffff',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 10,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    optionIconContainer: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionIcon: {
      fontSize: 20,
    },
    optionText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text || '#000',
    },
    optionArrow: {
      fontSize: 28,
      color: colors.textSecondary || '#6c757d',
      fontWeight: '300',
    },
    logoutContainer: {
      paddingHorizontal: 20,
      marginTop: 20,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      backgroundColor: '#dc3545',
      gap: 10,
      ...Platform.select({
        ios: {
          shadowColor: '#dc3545',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    logoutIcon: {
      fontSize: 20,
    },
    logoutLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: '#ffffff',
      letterSpacing: 0.3,
    },
    versionText: {
      textAlign: 'center',
      fontSize: 12,
      color: colors.textSecondary || '#6c757d',
      marginTop: 24,
      fontWeight: '500',
    },
  });