import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { OptimizedRoute, Point } from '../../models/route.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full rounded-l-2xl overflow-hidden shadow-inner bg-gray-100">
      <div id="map" class="w-full h-full z-0"></div>
      
      <!-- Status Overlay -->
      <div *ngIf="currentRoute" class="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-full shadow-md border border-gray-100 flex items-center gap-2">
        <span class="text-sm font-semibold text-gray-700">Trạng Thái Lộ Trình:</span>
        <span class="text-sm font-bold text-teal-600">Đã Tối Ưu</span>
      </div>
    
      <!-- Distance Overlay -->
      <div *ngIf="currentRoute && currentRoute.optimizedPoints.length > 0" 
           class="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-gray-200 flex items-center gap-3 animate-fade-in-down">
        <div class="bg-indigo-100 p-2 rounded-full text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Tổng Chiều Dài Lộ Trình</p>
          <p class="text-lg font-bold text-gray-800">{{ currentRoute.totalDistance.toFixed(2) }} km</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class MapComponent implements OnInit, OnDestroy {
  private map!: L.Map;
  private markersLayer: L.LayerGroup = L.layerGroup();
  private routeLayer: L.GeoJSON | L.Polyline | null = null;
  private userLocationMarker: L.Marker | null = null;
  currentRoute: OptimizedRoute | null = null;

  // No longer using an array of colors since we use SVG icons

  @Input() set optimizedRoute(route: OptimizedRoute | null) {
    this.currentRoute = route;
    if (this.map && route) {
      this.drawRoute(route);
    }
  }

  // Called when user selects a dropdown suggestion
  @Input() set highlightPoint(point: Point | null) {
    if (this.map && point && point.lat && point.lng) {
      this.map.flyTo([point.lat, point.lng], 16, { animate: true, duration: 1 });
      
      // Optionally place a temporary marker or just trust the new pin
      // We will place a "Preview" marker that doesn't mess with the route
      this.markersLayer.clearLayers();
      if (this.routeLayer) {
        this.map.removeLayer(this.routeLayer);
      }

      this.addInteractiveMarker(point, 0, true); // Blue preview
    }
  }

  ngOnInit(): void {
    this.initMap();
    this.requestUserLocation();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Default center to Ho Chi Minh City (Lat: 10.762622, Lng: 106.660172)
    this.map = L.map('map', {
      center: [10.762622, 106.660172],
      zoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
  }

  private requestUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          if (this.map) {
            // Only fly to user location if there's no route currently displayed
            if (!this.currentRoute) {
              this.map.setView([lat, lng], 14, { animate: true });
            }
            
            // Add a pulsing blue dot for the user's location
            if (this.userLocationMarker) {
              this.map.removeLayer(this.userLocationMarker);
            }
            
            const userIcon = L.divIcon({
              html: `
                <div class="relative flex items-center justify-center w-full h-full">
                  <span class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-blue-400"></span>
                  <span class="relative inline-flex w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md"></span>
                </div>
              `,
              className: 'bg-transparent border-0',
              iconSize: [24, 24],
              iconAnchor: [12, 12],
              popupAnchor: [0, -12]
            });
            
            this.userLocationMarker = L.marker([lat, lng], { icon: userIcon })
              .bindPopup('<span class="font-bold text-[#1A365D] text-[13px]">📍 Vị trí hiện tại của bạn</span>')
              .addTo(this.map);
          }
        },
        (error) => {
          console.log('Geolocation error or denied:', error.message);
          // Fails silently, stays in default Ho Chi Minh City
        },
        { timeout: 10000 }
      );
    }
  }

  private drawRoute(route: OptimizedRoute): void {
    this.markersLayer.clearLayers();
    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
      this.routeLayer = null;
    }

    const points = route.optimizedPoints;
    if (!points || points.length === 0) return;

    if (route.routeGeoJson && points.length > 1) {
       // Draw the actual path from OSRM
       this.routeLayer = L.geoJSON(route.routeGeoJson, {
         style: {
           color: '#F97316', // Orange
           weight: 5,
           opacity: 0.9
         }
       }).addTo(this.map);
    } else if (points.length > 1) {
       // Fallback to straight lines if OSRM failed but we have points
       const latlngs: L.LatLngExpression[] = points.map(p => [p.lat!, p.lng!]);
       this.routeLayer = L.polyline(latlngs, {
         color: '#F97316', // Orange
         weight: 5,
         opacity: 0.9,
         dashArray: '10, 10'
       }).addTo(this.map);
    }

    const boundsLatLngs: L.LatLng[] = [];

    // Draw markers with sequence numbers
    points.forEach((point, index) => {
      
      const label = (index + 1).toString();

      if (point.lat && point.lng) {
        boundsLatLngs.push(L.latLng(point.lat, point.lng));
        this.addInteractiveMarker(point, index, false);
      }
    });

    // Fit bounds to show all markers or the route
    if (this.routeLayer && ('getBounds' in this.routeLayer)) {
      this.map.fitBounds((this.routeLayer as L.GeoJSON).getBounds(), { padding: [50, 50] });
    } else if (boundsLatLngs.length > 0) {
      this.map.fitBounds(L.latLngBounds(boundsLatLngs), { padding: [50, 50] });
    }
  }

  private addInteractiveMarker(point: Point, index: number, isPreview: boolean) {
    let iconSvg = '';
    
    // Choose icon based on index
    if (index === 0) {
      // Warehouse icon
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>`;
    } else if (index === 1) {
      // Store icon
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`;
    } else {
      // Building icon
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>`;
    }

    const htmlContent = `
      <div class="relative flex flex-col items-center justify-center transform transition-transform hover:scale-110 -mt-10 mr-4">
        <!-- Marker Bubble -->
        <div class="w-12 h-12 bg-[#1A365D] rounded-full flex items-center justify-center shadow-lg border-2 border-white relative z-10">
          ${iconSvg}
          <div class="absolute -bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-[#1A365D]"></div>
        </div>
        <!-- Label beneath marker -->
        <div class="mt-2 text-[#1A365D] font-bold text-sm bg-white/80 rounded px-1 min-w-max text-center drop-shadow-sm whitespace-nowrap">
          ${point.name || "Điểm " + (index + 1)}
        </div>
      </div>
    `;

    const icon = L.divIcon({
      html: htmlContent,
      className: 'custom-div-icon border-0 bg-transparent',
      iconSize: [48, 64],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48]
    });

    const popupContent = isPreview 
        ? `<b>✨ Vị trí đã chọn</b><br>${point.address}`
        : `<b>${point.name || 'Điểm'}</b><br>${point.address}<br>Thứ tự: ${index + 1}`;

    L.marker([point.lat!, point.lng!], { icon })
      .bindPopup(popupContent)
      .addTo(this.markersLayer);
  }
}


