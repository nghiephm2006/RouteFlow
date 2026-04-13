import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MapComponent } from './components/map/map.component';
import { OrdersComponent } from './components/orders/orders.component';
import { RouteOptimizationService } from './services/route-optimization.service';
import { Point, OptimizedRoute } from './models/route.model';
import { Order, OrderService, OrderStatus } from './services/order.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SidebarComponent, MapComponent, OrdersComponent], // force LS refresh
  template: `
    <div class="h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden cursor-default text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <!-- Main Top Navigation -->
      <div class="h-16 bg-[#1A365D] dark:bg-[#0f172a] text-white shadow-xl z-30 flex items-center justify-between px-6 flex-shrink-0 transition-colors duration-300">
        <div class="flex items-center gap-3">
          <div class="bg-white p-1.5 rounded-lg shadow-sm">
            <img src="/navigation-logo.png" alt="RouteFlow Logo" class="h-8 object-contain">
          </div>
          <div class="hidden md:block">
            <h1 class="text-xl font-bold tracking-tight">Workspace</h1>
            <p class="text-xs text-blue-200">Delivery Route Optimizer</p>
          </div>
        </div>

        <!-- Navigation Tabs & Theme Toggle -->
        <div class="flex items-center gap-6">
          <div class="flex bg-[#0f2342] dark:bg-[#1e293b] rounded-lg p-1 shadow-inner h-11 items-center space-x-1 transition-colors duration-300">
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

          <div class="flex items-center gap-2">
            <!-- Config Toggle Button -->
            <button (click)="toggleSidebarConfig()" 
                    class="p-2 rounded-full bg-[#0f2342] dark:bg-[#1e293b] text-white hover:bg-[#1a365d] transition-colors duration-300 shadow-md flex items-center justify-center border border-blue-400/20"
                    title="Cấu hình hệ số kẹt xe">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-300 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <!-- Theme Toggle Button -->
            <button (click)="themeService.toggleTheme()" 
                    class="p-2 rounded-full bg-[#0f2342] dark:bg-[#1e293b] text-white hover:bg-[#1a365d] transition-colors duration-300 shadow-md flex items-center justify-center border border-blue-400/20"
                    [title]="themeService.isDarkMode() ? 'Chuyển sang Chế độ sáng' : 'Chuyển sang Chế độ tối'">
              <svg *ngIf="!themeService.isDarkMode()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <svg *ngIf="themeService.isDarkMode()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content Container -->
      <div class="flex-1 relative overflow-hidden flex w-full h-full">
        <!-- MAP TAB CONTENT -->
        <div [class.hidden]="activeTab !== 'map'" class="absolute inset-0 flex flex-col md:flex-row w-full h-full animate-fadeIn z-10">
          <div class="w-full md:w-[420px] h-full flex-shrink-0 shadow-2xl z-20 overflow-y-auto">
            <app-sidebar [userLocation]="currentUserLocation" [routeData]="routeData" [routePoints]="pointsFromOrders" #sidebar (calculate)="onCalculateRoute($event)" (pointSelected)="onPointSelected($event)"></app-sidebar>
          </div>
          <div class="flex-1 h-full z-10">
            <app-map [isVisible]="activeTab === 'map'" [optimizedRoute]="routeData" [highlightPoint]="selectedPoint" (userLocationReady)="onUserLocationReady($event)" (statusUpdate)="onStatusUpdateFromMap($event)"></app-map>
          </div>
        </div>

        <!-- ORDERS TAB CONTENT -->
        <div [class.hidden]="activeTab !== 'orders'" class="absolute inset-0 w-full h-full bg-gray-100 dark:bg-gray-800 p-6 overflow-hidden animate-fadeIn z-20 transition-colors duration-300">
           <app-orders (routePendingOrders)="onRoutePendingOrders($event)" (forwardToMap)="onForwardToMap($event)"></app-orders>
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
  currentUserLocation: { lat: number, lng: number } | null = null;

  @ViewChild('sidebar') sidebar!: SidebarComponent;
  
  constructor(
    private routeService: RouteOptimizationService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    public themeService: ThemeService
  ) {}

  onUserLocationReady(location: { lat: number, lng: number }) {
    this.currentUserLocation = location;
  }

  toggleSidebarConfig() {
    if (this.activeTab !== 'map') {
      this.activeTab = 'map';
      setTimeout(() => {
        if (this.sidebar) {
          this.sidebar.showConfig = !this.sidebar.showConfig;
        }
      }, 0);
    } else {
      if (this.sidebar) {
        this.sidebar.showConfig = !this.sidebar.showConfig;
      }
    }
  }

  onStatusUpdateFromMap(orderId: string) {
    this.orderService.updateOrderStatus(orderId, OrderStatus.Delivered).subscribe({
      next: () => {
        // Remove the delivered order from the active route
        this.pointsFromOrders = this.pointsFromOrders.filter(p => p.id !== orderId);
        
        // Re-calculate route with remaining points
        this.onCalculateRoute(this.pointsFromOrders);
      },
      error: (err: any) => {
        console.error('Failed to update status:', err);
        alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.');
      }
    });
  }

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
        error: (err: any) => {
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
    const orderPoints = orders.map((o, index) => ({
      id: o.id,
      name: `Đơn: ${o.orderCode} - ${o.customerName}`,
      address: o.address,
      lat: o.latitude,
      lng: o.longitude,
      isOrigin: false,
      isDestination: false
    }));

    // Prepend user location as point 1 if available
    if (this.currentUserLocation) {
      this.pointsFromOrders = [
        {
          id: 'START_USER_LOC',
          name: 'Vị trí của bạn (Bắt đầu)',
          address: 'Vị trí hiện tại',
          lat: this.currentUserLocation.lat,
          lng: this.currentUserLocation.lng,
          isOrigin: true,
          isDestination: false
        },
        ...orderPoints
      ];
    } else {
      this.pointsFromOrders = orderPoints;
    }
    
    // Switch to map tab
    this.activeTab = 'map';
  }

  onForwardToMap(order: Order) {
    // Switch to Map tab and highlight the order's location
    this.activeTab = 'map';
    this.selectedPoint = {
      id: order.id,
      name: `${order.orderCode} - ${order.customerName}`,
      address: order.address,
      lat: order.latitude,
      lng: order.longitude
    };
  }
}

