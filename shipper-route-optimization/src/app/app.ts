import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MapComponent } from './components/map/map.component';
import { RouteOptimizationService } from './services/route-optimization.service';
import { Point, OptimizedRoute } from './models/route.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SidebarComponent, MapComponent],
  template: `
    <div class="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-gray-50 font-sans">
      <!-- Sidebar Area -->
      <div class="w-full md:w-[420px] h-[50vh] md:h-screen flex-shrink-0 z-20 shadow-2xl relative">
        <app-sidebar [routeData]="routeData" #sidebar (calculate)="onCalculateRoute($event)" (pointSelected)="onPointSelected($event)"></app-sidebar>
      </div>
      
      <!-- Map Area -->
      <div class="flex-1 h-[50vh] md:h-screen relative z-10">
        <app-map [optimizedRoute]="routeData" [highlightPoint]="selectedPoint"></app-map>
      </div>
    </div>
  `
})
export class App {
  title = 'shipper-route-optimization';
  routeData: OptimizedRoute | null = null;
  selectedPoint: Point | null = null;
  @ViewChild('sidebar') sidebar!: SidebarComponent;
  
  constructor(
    private routeService: RouteOptimizationService,
    private cdr: ChangeDetectorRef
  ) {}

  onCalculateRoute(points: Point[]) {
    this.sidebar.setLoading(true);
    this.routeService.optimizeRoute(points).subscribe({
      next: (result) => {
        this.routeData = result;
        this.sidebar.setLoading(false);
        this.cdr.detectChanges(); // Force update
      },
      error: (err) => {
        console.error("Optimization failed", err);
        this.sidebar.setLoading(false);
        this.cdr.detectChanges(); // Force update
      }
    });
  }

  onPointSelected(point: Point) {
    this.selectedPoint = point;
  }
}

