import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MapComponent } from './components/map/map.component';
import { OrdersComponent } from './components/orders/orders.component';
import { RouteOptimizationService } from './services/route-optimization.service';
import { Point, OptimizedRoute } from './models/route.model';
import { Order } from './services/order.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SidebarComponent, MapComponent, OrdersComponent], // force LS refresh
  template: `
    <div class="h-screen w-screen flex flex-col bg-gray-50 font-sans overflow-hidden cursor-default text-gray-800">
      <!-- Main Top Navigation -->
      <div class="h-16 bg-[#1A365D] text-white shadow-xl z-30 flex items-center justify-between px-6 flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="bg-white p-1.5 rounded-lg shadow-sm">
            <img src="/navigation-logo.png" alt="RouteFlow Logo" class="h-8 object-contain">
          </div>
          <div class="hidden md:block">
            <h1 class="text-xl font-bold tracking-tight">Workspace</h1>
            <p class="text-xs text-blue-200">Delivery Route Optimizer</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex bg-[#0f2342] rounded-lg p-1 shadow-inner h-11 items-center space-x-1">
          <button (click)="activeTab = 'map'" 
                  [ngClass]="activeTab === 'map' ? 'bg-[#F97316] text-white shadow-md font-semibold' : 'text-gray-300 hover:text-white hover:bg-white/10'"
                  class="px-5 py-1.5 rounded-md text-sm transition-all duration-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Bản Đồ Giao Hàng
          </button>
          
          <button (click)="activeTab = 'orders'" 
                  [ngClass]="activeTab === 'orders' ? 'bg-[#F97316] text-white shadow-md font-semibold' : 'text-gray-300 hover:text-white hover:bg-white/10'"
                  class="px-5 py-1.5 rounded-md text-sm transition-all duration-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Quản Lý Đơn
          </button>
        </div>
      </div>

      <!-- Main Content Container -->
      <div class="flex-1 relative overflow-hidden flex w-full h-full">
        <!-- MAP TAB CONTENT -->
        <div *ngIf="activeTab === 'map'" class="absolute inset-0 flex flex-col md:flex-row w-full h-full animate-fadeIn z-10">
          <div class="w-full md:w-[420px] h-full flex-shrink-0 shadow-2xl z-20 overflow-y-auto">
            <app-sidebar [routeData]="routeData" [routePoints]="pointsFromOrders" #sidebar (calculate)="onCalculateRoute($event)" (pointSelected)="onPointSelected($event)"></app-sidebar>
          </div>
          <div class="flex-1 h-full z-10">
            <app-map [optimizedRoute]="routeData" [highlightPoint]="selectedPoint"></app-map>
          </div>
        </div>

        <!-- ORDERS TAB CONTENT -->
        <div *ngIf="activeTab === 'orders'" class="absolute inset-0 w-full h-full bg-gray-100 p-6 overflow-hidden animate-fadeIn z-20">
           <app-orders (routePendingOrders)="onRoutePendingOrders($event)"></app-orders>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class App {
  title = 'shipper-route-optimization';
  activeTab: 'map' | 'orders' = 'map';
  
  routeData: OptimizedRoute | null = null;
  selectedPoint: Point | null = null;
  pointsFromOrders: Point[] = [];

  @ViewChild('sidebar') sidebar!: SidebarComponent;
  
  constructor(
    private routeService: RouteOptimizationService,
    private cdr: ChangeDetectorRef
  ) {}

  onCalculateRoute(points: Point[]) {
    // Need to wait out ViewChild if we just switched tab
    setTimeout(() => {
      if (this.sidebar) {
        this.sidebar.setLoading(true);
      }
      this.routeService.optimizeRoute(points).subscribe({
        next: (result) => {
          this.routeData = result;
          if (this.sidebar) this.sidebar.setLoading(false);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Optimization failed", err);
          if (this.sidebar) this.sidebar.setLoading(false);
          this.cdr.detectChanges();
        }
      });
    });
  }

  onPointSelected(point: Point) {
    this.selectedPoint = point;
  }

  onRoutePendingOrders(orders: Order[]) {
    // Chuyển Orders thành Points để nạp vào Sidebar
    this.pointsFromOrders = orders.map((o, index) => ({
      id: o.id,
      name: `Đơn: ${o.orderCode} - ${o.customerName}`,
      address: o.address,
      lat: o.latitude,
      lng: o.longitude,
      isOrigin: false, // Will be set in Sidebar
      isDestination: false
    }));
    
    // Switch to map tab
    this.activeTab = 'map';
  }
}

