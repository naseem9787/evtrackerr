/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// EV Station shared types
export type StationType = 'Fast' | 'Normal' | 'Slow';

export interface Station {
  id: string;
  name: string;
  type: StationType;
  ports: number;
  lat: number;
  lng: number;
  available: boolean;
}

export interface StationsResponse {
  stations: Station[];
}

export interface RouteRequest {
  destinationId: string;
  origin?: { lat: number; lng: number } | null;
}

export interface RouteResponse {
  path: string[];
  distanceKm: number;
}
