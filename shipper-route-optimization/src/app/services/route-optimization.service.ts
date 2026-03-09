import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Point, OptimizedRoute } from '../models/route.model';

@Injectable({
  providedIn: 'root'
})
export class RouteOptimizationService {
  constructor(private http: HttpClient) {}

  /**
   * 1. Geocodes all addresses using OpenStreetMap Nominatim.
   * 2. Calls OSRM Trip API to solve TSP and return optimized polyline.
   */
  optimizeRoute(points: Point[]): Observable<OptimizedRoute> {
    if (!points || points.length === 0) {
      return of({ optimizedPoints: [], totalDistance: 0, totalDuration: 0, routeGeoJson: null });
    }

    // Geocode points first
    return from(this.geocodeAllPoints(points)).pipe(
      switchMap(geocodedPoints => {
        if (geocodedPoints.length < 2) {
          return of({ optimizedPoints: geocodedPoints, totalDistance: 0, totalDuration: 0, routeGeoJson: null });
        }

        // Prepare coordinates string for OSRM: format "lng,lat;lng,lat;..."
        const coordString = geocodedPoints.map(p => `${p.lng},${p.lat}`).join(';');
        
        // OSRM Trip API endpoint
        const osrmUrl = `https://router.project-osrm.org/trip/v1/driving/${coordString}?source=first&roundtrip=false&overview=full&geometries=geojson`;

        return this.http.get<any>(osrmUrl).pipe(
          map(response => {
            if (response.code !== 'Ok' || !response.trips || response.trips.length === 0) {
              throw new Error('OSRM mapping failed');
            }

            const trip = response.trips[0];
            const waypoints = response.waypoints;
            
            // Reorder points based on OSRM waypoints output (which has waypoint_index)
            // waypoints array matches the order of the input coordinates.
            // waypoints[i].waypoint_index tells us where input point `i` ended up in the optimized route.
            const optimizedPoints: Point[] = new Array(geocodedPoints.length);
            waypoints.forEach((wp: any, index: number) => {
              optimizedPoints[wp.waypoint_index] = geocodedPoints[index];
            });

            return {
              optimizedPoints,
              totalDistance: trip.distance / 1000, // Convert meters to km
              totalDuration: trip.duration, // in seconds
              routeGeoJson: trip.geometry // The GeoJSON LineString
            };
          }),
          catchError(err => {
            console.error('Routing error:', err);
            // Fallback gracefully if OSRM fails
            return of({ 
              optimizedPoints: geocodedPoints, 
              totalDistance: 0, 
              totalDuration: 0,
              routeGeoJson: null 
            });
          })
        );
      })
    );
  }

  /**
   * Helper to geocode a list of points sequentially to avoid bombarding Nominatim
   */
  private async geocodeAllPoints(points: Point[]): Promise<Point[]> {
    const geocoded: Point[] = [];
    for (const point of points) {
      if (point.lat !== undefined && point.lng !== undefined && point.lat !== null && point.lng !== null) {
        geocoded.push(point);
      } else {
        const coords = await this.geocodeAddress(point.address || point.name);
        geocoded.push({
          ...point,
          lat: coords?.lat || 21.0285, // Default Hanoi
          lng: coords?.lng || 105.8048 // Default Hanoi
        });
        
        // Politeness delay for Nominatim (1 request per second is recommended)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return geocoded;
  }

  /**
   * Calls OpenStreetMap Nominatim
   */
  private geocodeAddress(address: string): Promise<{lat: number, lng: number} | null> {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    return this.http.get<any[]>(url).toPromise().then(res => {
      if (res && res.length > 0) {
        return {
          lat: parseFloat(res[0].lat),
          lng: parseFloat(res[0].lon)
        };
      }
      return null;
    }).catch(() => null);
  }

  /**
   * Public method to search locations for autocomplete dropdown
   */
  searchLocation(query: string): Observable<any[]> {
    if (!query || !query.trim()) return of([]);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
    return this.http.get<any[]>(url).pipe(
      catchError(() => of([]))
    );
  }
}


