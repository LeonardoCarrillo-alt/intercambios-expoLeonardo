import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useThemeColors } from '../../hooks/useThemeColors';
import { LocationService } from '../../services/locationService';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  meetingPoint?: string;
}

interface LocationPickerProps {
  value?: Location | null;
  onChange: (location: Location | null) => void;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const { colors } = useThemeColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(value || null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(value || null);
  const [meetingPoint, setMeetingPoint] = useState(value?.meetingPoint || '');
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: -17.3895,
    longitude: -66.1568,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useEffect(() => {
    if (value) {
      setCurrentLocation(value);
      setSelectedLocation(value);
      setMeetingPoint(value.meetingPoint || '');
    }
  }, [value]);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const hasPermission = await LocationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permiso denegado', 'Necesitas permitir el acceso a la ubicación para usar esta función');
        return;
      }

      const location = await LocationService.getCurrentLocation();
      if (location) {
        const address = await LocationService.getAddressFromCoords(
          location.coords.latitude,
          location.coords.longitude
        );

        const newLocation: Location = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: address,
          meetingPoint: meetingPoint || 'Punto de encuentro'
        };

        setCurrentLocation(newLocation);
        setSelectedLocation(newLocation);
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación actual');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    const newLocation: Location = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      address: 'Ubicación seleccionada en el mapa',
      meetingPoint: meetingPoint || 'Punto de encuentro'
    };
    setSelectedLocation(newLocation);
  };

  const handleConfirm = async () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Por favor selecciona una ubicación');
      return;
    }

    // Obtener dirección real si es una nueva selección
    let finalLocation = { ...selectedLocation };
    if (!finalLocation.address || finalLocation.address === 'Ubicación seleccionada en el mapa') {
      try {
        const address = await LocationService.getAddressFromCoords(
          finalLocation.latitude,
          finalLocation.longitude
        );
        finalLocation.address = address;
      } catch (error) {
        console.error('Error getting address:', error);
      }
    }

    finalLocation.meetingPoint = meetingPoint || 'Punto de encuentro';
    
    setCurrentLocation(finalLocation);
    onChange(finalLocation);
    setModalVisible(false);
  };

  const handleRemoveLocation = () => {
    setCurrentLocation(null);
    setSelectedLocation(null);
    setMeetingPoint('');
    onChange(null);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Ubicación del producto</Text>
      
      {currentLocation ? (
        <View style={[styles.locationCard, { backgroundColor: colors.surface }]}>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={20} color="#10b981" />
            <View style={styles.locationDetails}>
              <Text style={[styles.address, { color: colors.text }]}>
                {currentLocation.address}
              </Text>
              {currentLocation.meetingPoint && (
                <Text style={[styles.meetingPoint, { color: colors.muted }]}>
                  📍 {currentLocation.meetingPoint}
                </Text>
              )}
              <Text style={[styles.coordinates, { color: colors.muted }]}>
                {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
              </Text>
            </View>
          </View>
          <View style={styles.locationActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="pencil" size={16} color="white" />
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
              onPress={handleRemoveLocation}
            >
              <Ionicons name="trash" size={16} color="white" />
              <Text style={styles.actionButtonText}>Quitar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <Text style={[styles.addButtonText, { color: colors.primary }]}>
            Agregar ubicación
          </Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.hint, { color: colors.muted }]}>
        La ubicación ayuda a otros usuarios a encontrar tu producto
      </Text>

      {/* Modal para seleccionar ubicación */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Seleccionar ubicación
            </Text>
            <TouchableOpacity 
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={region}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {selectedLocation && (
                <Marker
                  coordinate={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  }}
                  title="Ubicación del producto"
                  pinColor="#10b981"
                />
              )}
            </MapView>
          </View>

          <View style={styles.modalContent}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Punto de encuentro específico
            </Text>
            <TextInput
              value={meetingPoint}
              onChangeText={setMeetingPoint}
              placeholder="Ej: Entrada principal, Fuente de la plaza..."
              placeholderTextColor={colors.muted}
              style={[styles.textInput, { 
                backgroundColor: colors.surface, 
                color: colors.text,
                borderColor: colors.border 
              }]}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#6b7280' }]}
                onPress={getCurrentLocation}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="locate" size={18} color="white" />
                    <Text style={styles.modalButtonText}>Mi ubicación</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#10b981' }]}
                onPress={handleConfirm}
                disabled={!selectedLocation}
              >
                <Ionicons name="checkmark" size={18} color="white" />
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  locationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationDetails: {
    flex: 1,
    marginLeft: 12,
  },
  address: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  meetingPoint: {
    fontSize: 13,
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  locationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  hint: {
    fontSize: 12,
    marginTop: 6,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  modalContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  inputLabel: {
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});