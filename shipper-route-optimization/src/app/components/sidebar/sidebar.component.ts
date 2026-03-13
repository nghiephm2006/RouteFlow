import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Point, OptimizedRoute } from '../../models/route.model';
import { RouteOptimizationService } from '../../services/route-optimization.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col bg-[#F8FAFC] shadow-xl w-full sm:w-[500px] md:w-[420px] border-r border-gray-200 z-[2000] overflow-hidden relative font-sans">
      <!-- Header Section -->
      <div class="px-6 py-5 bg-white relative shrink-0 border-b border-gray-100 flex flex-col gap-2 z-10 shadow-sm sticky top-0">
        <img src="/logo-beside.png" alt="RouteFlow Logo" class="h-auto w-auto object-contain" />
      </div>

      <!-- Main Form Content -->
      <form [formGroup]="routeForm" class="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3">
        <div formArrayName="points" class="flex flex-col gap-4">
          <div *ngFor="let p of points.controls; let i=index; let last=last" [formGroupName]="i" 
               class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative">
            
            <!-- Drag handle dots -> Left border accent -->
            <div class="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-30">
              <div class="w-1 h-1 bg-gray-500 rounded-full"></div>
              <div class="w-1 h-1 bg-gray-500 rounded-full"></div>
              <div class="w-1 h-1 bg-gray-500 rounded-full"></div>
              <div class="w-1 h-1 bg-gray-500 rounded-full"></div>
            </div>

            <!-- Card Header -->
            <div class="flex items-center justify-between mb-3 pl-4">
              <div class="flex items-center gap-2">
                <!-- Icon based on index -->
                <div class="text-[#1A365D]">
                  <svg *ngIf="i === 0" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  <svg *ngIf="i > 0" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <span class="text-[13px] font-bold text-[#1A365D] tracking-wide">
                  {{ i === 0 ? 'ĐIỂM BẮT ĐẦU' : 'ĐIỂM ĐẾN #' + i }}
                </span>
              </div>
              <button *ngIf="points.length > 2" type="button" (click)="removePoint(i)" 
                      class="text-gray-400 hover:text-red-500 transition-colors" title="Xóa điểm đến">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Card Body (Inputs) -->
            <div class="space-y-2 pl-4 border-l border-transparent transition-colors">
              <div>
                <label class="block text-[11px] text-gray-500 mb-1 pointer-events-none">Tên điểm</label>
                <input type="text" formControlName="name" placeholder="Vd: Kho Trung Tâm" 
                       class="w-full text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#F97316] focus:border-[#F97316] block px-3 py-1.5 bg-white transition-colors" />
              </div>
              <div class="relative">
                <label class="block text-[11px] text-gray-500 mb-1 pointer-events-none">Địa chỉ</label>
                <div class="relative">
                  <span class="absolute right-3 top-2 text-gray-400" [ngClass]="{'text-[#F97316]': p.value.lat}">
                    <svg *ngIf="p.value.lat" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#F97316]" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </span>
                  <input type="text" formControlName="address" placeholder="Nhập địa chỉ..." 
                         (focus)="showDropdown[p.value.id] = true" (blur)="onBlur(p.value.id)"
                         autocomplete="off"
                         class="w-full text-sm border border-gray-300 rounded-md pr-8 pl-3 py-1.5 focus:ring-1 focus:ring-[#F97316] focus:border-[#F97316] block bg-white transition-colors" />
                </div>
                
                <!-- Dropdown Suggestions -->
                <div *ngIf="showDropdown[p.value.id] && suggestions[p.value.id]?.length" 
                     class="absolute top-[52px] left-0 w-full z-50 bg-white border border-gray-200 rounded-md shadow-xl max-h-48 overflow-y-auto">
                  <div *ngFor="let s of suggestions[p.value.id]" 
                       (mousedown)="selectSuggestion(i, s, p.value.id)" 
                       class="p-2 border-b border-gray-100 hover:bg-[#F97316]/10 cursor-pointer transition-colors">
                    <p class="text-[13px] text-gray-800 line-clamp-2">{{ formatSuggestionName(s.display_name, p.value.address) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary section -->
        <div *ngIf="routeData" class="mt-2 bg-[#F1F5F9] border border-gray-200 rounded-xl p-4">
          <h3 class="font-semibold text-sm text-[#1A365D] mb-2">Tóm Tắt Lộ Trình Tối Ưu:</h3>
          <p class="text-[13px] text-gray-700 font-medium">Tổng Khoảng Cách: <span class="font-bold">~{{ routeData.totalDistance.toFixed(1) }} km</span></p>
          <p class="text-[13px] text-gray-700 font-medium">Tổng Thời Gian: <span class="font-bold">~{{ Math.round(routeData.totalDuration / 60) }} phút</span> (Dự kiến)</p>
          <p class="text-[13px] text-gray-700 font-medium mt-1">{{ points.length }} Điểm Đến Đã Chọn</p>
        </div>

        <button type="button" (click)="addPoint()" 
                class="mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-gray-300 bg-white text-sm font-medium text-[#1A365D] hover:border-[#1A365D]/40 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm Điểm Mới
        </button>
      </form>

      <!-- Footer Buttons -->
      <div class="p-4 bg-white border-t border-gray-200 shrink-0 flex gap-2 relative z-0">
        <!-- Reset Button Left -->
        <button type="button" (click)="resetForm()" [disabled]="isLoading" title="Tải lại"
                class="flex items-center justify-center w-11 h-11 text-[#1A365D] bg-white border border-gray-200 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 rounded-lg disabled:opacity-50 transition-all shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <!-- Submit Button in Gradient Dark Blue to Orange -->
        <button type="button" (click)="submit()" [disabled]="routeForm.invalid || isLoading" 
                class="flex-1 flex items-center justify-center gap-2 text-white bg-gradient-to-r from-[#1A365D] via-[#1A365D] to-[#F97316] focus:ring-2 focus:ring-[#F97316]/50 font-medium rounded-lg text-sm px-5 h-11 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all relative overflow-hidden text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span *ngIf="!isLoading">Tối ưu Lộ Trình</span>
          <span *ngIf="isLoading" class="flex gap-2 items-center">
            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang tải...
          </span>
        </button>
        
        <!-- Undo Button Right -->
        <button type="button" (click)="resetForm()" [disabled]="isLoading" title="Hoàn tác"
                class="flex items-center justify-center w-11 h-11 text-[#1A365D] bg-white border border-gray-200 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 rounded-lg disabled:opacity-50 transition-all shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
      </div>
    </div>
  `
})
export class SidebarComponent implements OnChanges {
  @Input() routeData: OptimizedRoute | null = null;
  @Input() routePoints: Point[] = [];
  private _userLocation: {lat: number, lng: number} | null = null;
  @Input() set userLocation(loc: {lat: number, lng: number} | null) {
    this._userLocation = loc;
    if (loc && this.points.length === 0) {
      this.addPointObject('Vị trí của bạn (Bắt đầu)', 'Vị trí hiện tại', loc.lat, loc.lng);
    }
  }
  @Output() calculate = new EventEmitter<Point[]>();
  @Output() pointSelected = new EventEmitter<Point>();
  isLoading = false;

  get Math() { return Math; }

  routeForm: FormGroup;
  
  suggestions: { [id: string]: any[] } = {};
  showDropdown: { [id: string]: boolean } = {};

  constructor(private fb: FormBuilder, private routeService: RouteOptimizationService) {
    this.routeForm = this.fb.group({
      points: this.fb.array([])
    });
    
    // Add default points for fresh load
    // Will be partially handled by @Input() userLocation if map ready early
    if (this.points.length === 0) {
      this.addPointObject('Kho Trung Tâm', 'Hồ Chí Minh');
    }
    this.addPointObject('Cửa Hàng A', 'Hồ Gươm, Hồ Chí Minh');
    this.addPointObject('Landmark 81', 'Landmark 81, Hồ Chí Minh');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['routePoints'] && changes['routePoints'].currentValue) {
      const points = changes['routePoints'].currentValue as Point[];
      if (points && points.length > 0) {
        this.loadPointsFromOrders(points);
      }
    }
  }

  private loadPointsFromOrders(points: Point[]) {
    // Clear existing form array
    while (this.points.length !== 0) {
      this.points.removeAt(0);
    }

    // Points passed from App already include User Location if available
    // No more hardcoded "Kho Tổng" here

    // Thêm các orders vào làm điểm đến/waypoints
    points.forEach(p => {
      this.addPointObject(p.name, p.address, p.lat, p.lng, p.id);
    });
  }

  // <... skipping unchanged lines for brevity ...>
  // Let's replace the getters, addPointObject, and selectSuggestion.

  get points(): FormArray {
    return this.routeForm.get('points') as FormArray;
  }

  addPointObject(name: string = '', address: string = '', lat: number | null = null, lng: number | null = null, forceId: string | null = null) {
    const id = forceId || Math.random().toString(36).substring(2, 9);
    const group = this.fb.group({
      id: [id],
      name: [name],
      address: [address, Validators.required],
      lat: [lat],
      lng: [lng]
    });

    // Handle address autocomplete
    group.get('address')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(val => {
        // Clear resolved lat/lng if user is typing manually
        if (group.get('lat')?.value) {
          group.patchValue({ lat: null, lng: null }, { emitEvent: false });
        }
        
        if (!val || typeof val !== 'string' || val.length < 3) {
          return of([]);
        }
        return this.routeService.searchLocation(val);
      })
    ).subscribe(results => {
      this.suggestions[id] = results;
      this.showDropdown[id] = true;
    });

    this.points.push(group);
  }

  addPoint() {
    this.addPointObject();
  }

  removePoint(index: number) {
    if (this.points.length > 2) {
      const id = this.points.at(index).value.id;
      delete this.suggestions[id];
      delete this.showDropdown[id];
      this.points.removeAt(index);
    }
  }

  selectSuggestion(index: number, suggestion: any, id: string) {
    const pointGroup = this.points.at(index) as FormGroup;
    
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);

    const formattedName = this.formatSuggestionName(suggestion.display_name, pointGroup.value.address);

    pointGroup.patchValue({
      address: formattedName,
      lat: lat,
      lng: lng
    }, { emitEvent: false });
    
    this.showDropdown[id] = false;

    // Emit event to center the map
    this.pointSelected.emit({
      id: id,
      name: pointGroup.value.name,
      address: formattedName,
      lat: lat,
      lng: lng
    });
  }

  formatSuggestionName(displayName: string, currentInput: string): string {
    if (!currentInput) return displayName;
    
    // Extract typical Vietnamese house number prefixes (e.g. 435A, 12/4, Số 10, Ngõ 12)
    const match = currentInput.match(/^(số\s+|ngõ\s+|hẻm\s+|kiệt\s+|ngách\s+|lô\s+|km\s+)?\d+[a-zA-Z]*(?:\/\d+[a-zA-Z]*)*\b/i);
    
    if (match) {
      const prefix = match[0].trim();
      // Only prepend if the OSM result doesn't already include it
      if (!displayName.toLowerCase().startsWith(prefix.toLowerCase())) {
         return `${prefix} ${displayName}`;
      }
    }
    return displayName;
  }

  onBlur(id: string) {
    // Delay hiding dropdown so mousedown on suggestion can register
    setTimeout(() => {
      this.showDropdown[id] = false;
    }, 200);
  }

  submit() {
    if (this.routeForm.valid) {
      this.calculate.emit(this.points.value);
    }
  }

  resetForm() {
    while (this.points.length !== 0) {
      const id = this.points.at(0).value.id;
      delete this.suggestions[id];
      delete this.showDropdown[id];
      this.points.removeAt(0);
    }
    // Add default empty points
    if (this._userLocation) {
      this.addPointObject('Vị trí của bạn (Bắt đầu)', 'Vị trí hiện tại', this._userLocation.lat, this._userLocation.lng);
    } else {
      this.addPointObject('', '');
    }
    this.addPointObject('', '');
    
    // Emitting an empty array tells the map and service to clear logic
    this.calculate.emit([]);
  }

  setLoading(state: boolean) {
    this.isLoading = state;
  }
}



