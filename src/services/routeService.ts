import { Route, POI } from '../types/map';
import { LocationService } from './locationService';

// Interface para abstraer el proveedor de rutas
export interface RouteProvider {
  getRoute(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): Promise<Route>;
}

// Implementación con Mapbox (ejemplo)
export class MapboxRouteProvider implements RouteProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getRoute(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): Promise<Route> {
    // Implementación con Mapbox API
    // Por ahora retornamos datos simulados
    const distance = LocationService.calculateDistance(
      origin.latitude, origin.longitude,
      destination.latitude, destination.longitude
    );

    return {
      distance: distance * 1000, // convertir a metros
      duration: distance * 15 * 60, // estimar tiempo (15 min por km)
      polyline: '',
      steps: [
        {
          instruction: `Dirígete hacia el punto de encuentro (${distance.toFixed(1)} km)`,
          distance: distance * 1000,
          duration: distance * 15 * 60
        }
      ]
    };
  }
}

// Factory para cambiar entre proveedores fácilmente
export class RouteServiceFactory {
  static createProvider(provider: 'mapbox' | 'google' | 'osrm'): RouteProvider {
    switch (provider) {
      case 'mapbox':
        return new MapboxRouteProvider('tu_mapbox_key');
      // case 'google':
      //   return new GoogleRouteProvider('tu_google_key');
      // case 'osrm':
      //   return new OSRMRouteProvider();
      default:
        return new MapboxRouteProvider('tu_mapbox_key');
    }
  }
}