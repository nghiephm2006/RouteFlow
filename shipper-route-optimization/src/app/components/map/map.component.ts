import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
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
  private routeLayer: L.Layer | null = null;
  private userLocationMarker: L.Marker | null = null;
  private currentHighlightPoint: Point | null = null;
  currentRoute: OptimizedRoute | null = null;

  @Output() userLocationReady = new EventEmitter<{lat: number, lng: number}>();
  @Output() statusUpdate = new EventEmitter<string>();

  @Input() set optimizedRoute(route: OptimizedRoute | null) {
    this.currentRoute = route;
    if (this.map && route) {
      this.drawRoute(route);
    }
  }

  @Input() set highlightPoint(point: Point | null) {
    this.currentHighlightPoint = point;
    if (this.map && point) {
      this.applyHighlight(point);
    }
  }

  @Input() set isVisible(visible: boolean) {
    if (visible && this.map) {
      // Leaflet needs this when a hidden container becomes visible
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    }
  }

  ngOnInit(): void {
    this.initMap();
    if (this.currentHighlightPoint) {
      this.applyHighlight(this.currentHighlightPoint);
    }
    this.requestUserLocation();
  }

  private applyHighlight(point: Point): void {
    if (!this.map || !point || !point.lat || !point.lng) return;
    
    this.map.flyTo([point.lat, point.lng], 16, { animate: true, duration: 1.5 });
    
    this.markersLayer.clearLayers();
    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
    }

    this.addInteractiveMarker(point, 0, true); // Blue preview
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Default center to Ho Chi Minh City (Lat: 10.762622, Lng: 106.660172)
    this.map = L.map('map', {
      center: [10.7626, 106.6601],
      zoom: 13,
      zoomControl: false
    });

    // Handle button clicks in popups
    this.map.on('popupopen', (e: any) => {
      const popup = e.popup;
      const container = popup.getElement();
      if (container) {
        const btn = container.querySelector('.finish-order-btn');
        if (btn) {
          const orderId = btn.getAttribute('data-order-id');
          L.DomEvent.on(btn, 'click', (ev) => {
            L.DomEvent.stopPropagation(ev);
            if (orderId && confirm('Bạn xác nhận đã giao thành công đơn hàng này?')) {
              this.statusUpdate.emit(orderId);
              this.map.closePopup();
            }
          });
        }
      }
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
          
          this.userLocationReady.emit({ lat, lng });

          if (this.map) {
            // Only fly to user location if there's no route OR highlighted point currently displayed
            if (!this.currentRoute && !this.currentHighlightPoint) {
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

    // New logic: Draw each leg as a separate interactive segment
    if (route.routeGeoJson && points.length > 1 && route.legs && route.legs.length > 0) {
      const coords = route.routeGeoJson.coordinates;
      const legCount = route.legs.length;
      
      this.routeLayer = L.featureGroup().addTo(this.map);
      const layerGroup = this.routeLayer as L.FeatureGroup;

      // Harmonious color palette
      const colors = [
        '#F97316', // Orange
        '#3B82F6', // Blue
        '#10B981', // Emerald
        '#8B5CF6', // Violet
        '#EC4899', // Pink
        '#06B6D4', // Cyan
        '#F59E0B', // Amber
        '#6366F1'  // Indigo
      ];

      const chunk = Math.floor(coords.length / legCount);

      for (let i = 0; i < legCount; i++) {
        const startIdx = i * chunk;
        const endIdx = (i === legCount - 1) ? coords.length : (i + 1) * chunk;
        const legCoords = coords.slice(startIdx, endIdx);
        const segmentColor = colors[i % colors.length];
        
        // Ensure the last coordinate of the previous leg is the start of the next
        if (i > 0 && legCoords.length > 0) {
          const prevLeg = (layerGroup.getLayers()[i-1] as L.Polyline);
          const prevCoords = prevLeg.getLatLngs() as L.LatLng[];
          const lastPoint = prevCoords[prevCoords.length - 1];
          legCoords.unshift([lastPoint.lng, lastPoint.lat]);
        }

        const segment = L.polyline(legCoords.map((c: any) => [c[1], c[0]]), {
          color: segmentColor,
          weight: 7,
          opacity: 0.8,
          lineJoin: 'round'
        });

        const startName = points[i]?.name || `Điểm ${i+1}`;
        const endName = points[i+1]?.name || `Điểm ${i+2}`;
        const distance = route.legs[i].distance.toFixed(1);
        const duration = Math.round(route.legs[i].duration / 60);
        const endOrderId = points[i+1]?.id;

        let popupContent = `
          <div class="p-1 font-sans min-w-[160px]">
            <div class="text-[12px] font-bold text-[#1A365D] border-b border-gray-100 pb-1 mb-1">
              Đoạn đường ${i + 1} ➔ ${i + 2}
            </div>
            <div class="text-[11px] text-gray-600">
              <span class="font-bold" style="color: ${segmentColor}">Quãng đường:</span> ${distance} km
            </div>
            <div class="text-[11px] text-gray-600 mb-2">
              <span class="font-bold" style="color: ${segmentColor}">Thời gian:</span> ${duration} phút
            </div>
        `;

        // If the target point is an order, show finish button
        if (endOrderId && endOrderId !== 'START_USER_LOC') {
          popupContent += `
            <button class="finish-order-btn w-full py-1.5 bg-[#10B981] text-white text-[11px] font-bold rounded shadow-sm hover:bg-[#059669] transition-colors flex items-center justify-center gap-1"
                    data-order-id="${endOrderId}">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
              GIAO THÀNH CÔNG
            </button>
          `;
        }

        popupContent += `
            <div class="mt-2 text-[10px] text-gray-400 italic leading-tight border-t border-gray-50 pt-1">
              Từ: ${startName}<br>Đến: ${endName}
            </div>
          </div>
        `;

        segment.bindPopup(popupContent);

        // Highlight segment on hover
        segment.on('mouseover', () => segment.setStyle({ weight: 10, opacity: 1 }));
        segment.on('mouseout', () => segment.setStyle({ weight: 7, opacity: 0.8 }));

        segment.addTo(layerGroup);
      }
    } else if (points.length > 1) {
      // Fallback to straight lines if OSRM failed or legs missing
      const latlngs: L.LatLngExpression[] = points.map(p => [p.lat!, p.lng!]);
      this.routeLayer = L.polyline(latlngs, {
        color: '#F97316', // Vibrant Orange
        weight: 6,
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
      // Start/Home icon - larger and different color
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`;
    } else {
      // Delivery points
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>`;
    }

    const markerColor = index === 0 ? '#F97316' : '#1A365D';
    const markerSize = index === 0 ? 'w-14 h-14' : 'w-12 h-12';
    const markerScale = index === 0 ? 'scale-125' : 'hover:scale-110';

    const htmlContent = `
      <div class="relative flex flex-col items-center justify-center transform transition-transform ${markerScale} -mt-10 mr-4">
        <!-- Number Badge -->
        <div class="absolute -top-3 -right-3 z-20 bg-white text-[#1A365D] text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-[#1A365D]">
          ${index + 1}
        </div>
        <!-- Marker Bubble -->
        <div class="${markerSize} bg-[${markerColor}] rounded-full flex items-center justify-center shadow-lg border-2 border-white relative z-10">
          ${iconSvg}
          <div class="absolute -bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-[${markerColor}]"></div>
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


