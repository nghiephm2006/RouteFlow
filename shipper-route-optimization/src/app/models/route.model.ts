export interface Point {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
}

export interface RouteLeg {
  distance: number; // in meters
  duration: number; // in seconds
  geometry?: any;   // GeoJSON LineString for this specific leg
}

export interface OptimizedRoute {
  optimizedPoints: Point[];
  totalDistance: number;
  totalDuration: number; // in seconds
  routeGeoJson?: any; // To hold the GeoJSON LineString returned by OSRM
  legs?: RouteLeg[];
}
