import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, View, Platform, Alert, Text, Modal } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Search } from '../../src/components/Search';
import { SearchBar } from '../../src/components/SearchBar';
import { useLocation } from '../../src/hooks/useLocation';
import { useMapCamera } from '../../src/hooks/useMapCamera';
import { GoToLocationFab } from '../../src/components/goToLocationFab';
import { Filters } from '../../src/components/Filters';
import { CATEGORIES, CategoryFilter } from '../../src/data/categories';
import { CATEGORY_COLORS } from '../../src/data/colors';
import { useVendorStore } from '../../src/store/vendorStore';
import { Vendor } from '../../src/types';
import { VendorBottomSheet } from '../../src/components/VendorBottomSheet';

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const { location, setLocation, loading } = useLocation();
  const { centerOn } = useMapCamera(mapRef);

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState<CategoryFilter[]>(() =>
    CATEGORIES.map((category) => ({ ...category }))
  );
  const vendors = useVendorStore((state) => state.vendors);
  const hasCenteredToUser = useRef(false);
  const feriaFallbackRegion = useMemo<Region>(
    () => ({
      latitude: -16.5059,
      longitude: -68.1636,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    }),
    []
  );

  const activeCategories = useMemo(
    () => categories.filter((category) => category.active).map((category) => category.name),
    [categories]
  );

  const filteredVendors = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();
    return vendors.filter((vendor) => {
      const matchesCategory =
        activeCategories.length === 0 || activeCategories.includes(vendor.category);
      if (!matchesCategory) return false;

      if (!normalizedSearch) return true;

      const searchableText = `${vendor.name} ${vendor.description ?? ''} ${vendor.category}`.toLowerCase();
      return searchableText.includes(normalizedSearch);
    });
  }, [searchText, activeCategories, vendors]);

  const handleToggleCategory = (categoryName: CategoryFilter['name']) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.name === categoryName ? { ...category, active: !category.active } : category
      )
    );
  };

  const userRegion = useMemo<Region | null>(() => {
    if (!location) return null;
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }, [location]);

  useEffect(() => {
    if (userRegion && !hasCenteredToUser.current) {
      centerOn(userRegion.latitude, userRegion.longitude, false);
      hasCenteredToUser.current = true;
    }
  }, [userRegion, centerOn]);

  const goToMyLocation = useCallback(async () => {
    try {
      setJumping(true);
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const req = await Location.requestForegroundPermissionsAsync();
        if (req.status !== 'granted') {
          Alert.alert('Sin permisos', 'No puedo acceder a tu ubicación.');
          setJumping(false);
          return;
        }
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(pos.coords);
      centerOn(pos.coords.latitude, pos.coords.longitude, true);
    } catch (e) {
      Alert.alert('Error', 'No se pudo obtener tu ubicación.');
    } finally {
      setJumping(false);
    }
  }, [centerOn]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  const selectVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowModal(true);
  };

  const closeVendorModal = () => {
    setShowModal(false);
    setSelectedVendor(null);
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          showsUserLocation
          showsMyLocationButton={Platform.OS === 'android'}
          initialRegion={userRegion ?? feriaFallbackRegion}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Estás aquí"
            />
          )}
          {filteredVendors.map((vendor) => (
            <Marker
              key={vendor.id}
              coordinate={{ latitude: vendor.lat, longitude: vendor.lng }}
              title={vendor.name}
              description={vendor.description}
              pinColor={CATEGORY_COLORS[vendor.category]}
              onPress={() => { selectVendor(vendor) }}
            />
          ))}
        </MapView>
        <Search>
          <View style={styles.searchHeader}>
            <Text style={styles.title}>Feria 16 de Julio</Text>
            <Text style={styles.subtitle}>Explora los puestos y filtra por lo que necesitas.</Text>
          </View>
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            onClear={() => setSearchText('')}
            placeholder="Buscar por nombre o categoría"
            style={styles.searchBar}
          />
          <View style={styles.filtersWrapper}>
            <Filters categories={categories} onToggle={handleToggleCategory} />
          </View>
          <View style={styles.resultsRow}>
            <View style={styles.resultsDot} />
            <Text style={styles.resultsText}>
              {filteredVendors.length}{' '}
              {filteredVendors.length === 1 ? 'puesto disponible' : 'puestos disponibles'}
            </Text>
          </View>
          {filteredVendors.length === 0 && (
            <Text style={styles.emptyState}>
              No encontramos resultados. Ajusta tu búsqueda o prueba con otra categoría.
            </Text>
          )}
        </Search>
        <Modal
          animationType="fade"
          transparent
          visible={showModal}
          onRequestClose={closeVendorModal}
        >
          <VendorBottomSheet vendor={selectedVendor} visible={showModal} onClose={closeVendorModal} />
        </Modal>
        <GoToLocationFab goToMyLocation={goToMyLocation} jumping={jumping} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparente' },
  container: { flex: 1 },
  map: { flex: 1 },
  searchHeader: {
    marginBottom: 12
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#475569'
  },
  searchBar: {
    marginBottom: 12
  },
  filtersWrapper: {
    marginBottom: 12
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  resultsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0ea5e9',
    marginRight: 8
  },
  resultsText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500'
  },
  emptyState: {
    marginTop: 10,
    fontSize: 12,
    color: '#94a3b8'
  },
});
