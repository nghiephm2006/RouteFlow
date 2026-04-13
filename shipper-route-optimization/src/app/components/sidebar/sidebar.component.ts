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
    <div class="h-full flex flex-col bg-[#F8FAFC] dark:bg-gray-900 shadow-xl w-full sm:w-[500px] md:w-[420px] border-r border-gray-200 dark:border-gray-800 z-[2000] overflow-hidden relative font-sans transition-colors duration-300">
      <!-- Header Section -->
      <div class="px-6 py-5 bg-white dark:bg-gray-800 relative shrink-0 border-b border-gray-100 dark:border-gray-700 flex flex-col gap-2 z-10 shadow-sm sticky top-0 transition-colors duration-300">
        <div class="flex items-center justify-between">
          <img src="/logo-beside.png" alt="RouteFlow Logo" class="h-auto w-auto object-contain dark:brightness-110" />
        </div>
      </div>

      <!-- Config Panel (Collapsible) -->
      <div *ngIf="showConfig" [formGroup]="configForm" 
           class="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 flex flex-col gap-4 animate-fade-in">
        <h4 class="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Cấu hình Lộ trình Thực tế</h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-[10px] text-blue-600 dark:text-blue-400">Hệ số kẹt xe</label>
              <button (click)="toggleRandom()" 
                      [class]="isRandom ? 'text-blue-600 font-bold' : 'text-gray-400'"
                      class="text-[10px] hover:underline flex items-center gap-0.5 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Ngẫu nhiên
              </button>
            </div>
            <input type="number" formControlName="trafficMultiplier" step="0.1" min="1.0"
                   class="w-full text-xs bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none" 
                   [ngClass]="{'opacity-50 pointer-events-none': isRandom}" />
          </div>
          <div>
            <label class="block text-[10px] text-blue-600 dark:text-blue-400 mb-1">Dừng/Điểm (Phút)</label>
            <input type="number" formControlName="serviceTime" min="0"
                   class="w-full text-xs bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <p class="text-[10px] text-blue-500 italic">Thời gian = (OSRM x Hệ số) + (Số điểm x Dừng/Điểm)</p>
      </div>

      <!-- Main Form Content -->
      <form [formGroup]="routeForm" class="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3 transition-colors">
        <div formArrayName="points" class="flex flex-col gap-4">
          <div *ngFor="let p of points.controls; let i=index; let last=last" [formGroupName]="i" 
               class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm relative transition-colors">
            
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
                <div class="text-[#1A365D] dark:text-blue-400">
                  <svg *ngIf="i === 0" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011-1v5m-4 0h4" /></svg>
                  <svg *ngIf="i > 0" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <span class="text-[13px] font-bold text-[#1A365D] dark:text-blue-300 tracking-wide">
                  {{ i === 0 ? 'ĐIỂM BẮT ĐẦU' : 'ĐIỂM ĐẾN #' + i }}
                </span>
              </div>
              <button *ngIf="points.length > 2" type="button" (click)="removePoint(i)" 
                      class="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Xóa điểm đến">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Card Body (Inputs) -->
            <div class="space-y-2 pl-4 border-l border-transparent transition-colors">
              <div>
                <label class="block text-[11px] text-gray-500 dark:text-gray-400 mb-1 pointer-events-none">Tên điểm</label>
                <input type="text" formControlName="name" placeholder="Vd: Kho Trung Tâm" 
                       class="w-full text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 dark:text-gray-100 rounded-md focus:ring-1 focus:ring-[#F97316] focus:border-[#F97316] block px-3 py-1.5 transition-colors" />
              </div>
              <div class="relative">
                <label class="block text-[11px] text-gray-500 dark:text-gray-400 mb-1 pointer-events-none">Địa chỉ</label>
                <div class="relative">
                  <span class="absolute right-3 top-2 text-gray-400" [ngClass]="{'text-[#F97316]': p.value.lat}">
                    <svg *ngIf="p.value.lat" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#F97316]" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </span>
                  <input type="text" formControlName="address" placeholder="Nhập địa chỉ..." 
                         (focus)="showDropdown[p.value.id] = true" (blur)="onBlur(p.value.id)"
                         autocomplete="off"
                         class="w-full text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 dark:text-gray-100 rounded-md pr-8 pl-3 py-1.5 focus:ring-1 focus:ring-[#F97316] focus:border-[#F97316] block transition-colors" />
                </div>
                
                <!-- Dropdown Suggestions -->
                <div *ngIf="showDropdown[p.value.id] && suggestions[p.value.id]?.length" 
                     class="absolute top-[52px] left-0 w-full z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl max-h-48 overflow-y-auto transition-colors">
                  <div *ngFor="let s of suggestions[p.value.id]" 
                       (mousedown)="selectSuggestion(i, s, p.value.id)" 
                       class="p-2 border-b border-gray-100 dark:border-gray-700 hover:bg-[#F97316]/10 dark:hover:bg-[#F97316]/20 cursor-pointer transition-colors text-left">
                    <p class="text-[13px] text-gray-800 dark:text-gray-200 line-clamp-2">{{ formatSuggestionName(s.display_name, p.value.address) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary section -->
        <div *ngIf="routeData" class="mt-2 bg-[#F1F5F9] dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-colors">
          <h3 class="font-semibold text-sm text-[#1A365D] dark:text-blue-300 mb-2">Tóm Tắt Lộ Trình Tối Ưu:</h3>
          <p class="text-[13px] text-gray-700 dark:text-gray-300 font-medium">Tổng Khoảng Cách: <span class="font-bold">~{{ routeData.totalDistance.toFixed(1) }} km</span></p>
          <p class="text-[13px] text-gray-700 dark:text-gray-300 font-medium">Tổng Thời Gian: <span class="font-bold">~{{ Math.round(routeData.totalDuration / 60) }} phút</span> (Dự kiến)</p>
          <p class="text-[13px] text-gray-700 dark:text-gray-300 font-medium mt-1">{{ points.length }} Điểm Đến Đã Chọn</p>
        </div>

        <button type="button" (click)="addPoint()" 
                class="mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-[#1A365D] dark:text-blue-300 hover:border-[#1A365D]/40 dark:hover:border-blue-500/50 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm Điểm Mới
        </button>
      </form>

      <!-- Footer Buttons -->
      <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shrink-0 flex gap-2 relative z-0 transition-colors">
        <!-- Reset Button Left -->
        <button type="button" (click)="resetForm()" [disabled]="isLoading" title="Tải lại"
                class="flex items-center justify-center w-11 h-11 text-[#1A365D] dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 rounded-lg disabled:opacity-50 transition-all shadow-sm">
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
                class="flex items-center justify-center w-11 h-11 text-[#1A365D] dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 rounded-lg disabled:opacity-50 transition-all shadow-sm">
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
  configForm: FormGroup;
  showConfig = false;
  isRandom = false;
  
  suggestions: { [id: string]: any[] } = {};
  showDropdown: { [id: string]: boolean } = {};

  constructor(private fb: FormBuilder, private routeService: RouteOptimizationService) {
    this.routeForm = this.fb.group({
      points: this.fb.array([])
    });

    this.configForm = this.fb.group({
      trafficMultiplier: [this.routeService.getTrafficMultiplier()],
      serviceTime: [this.routeService.getServiceTimePerStop()]
    });

    // Sync config with service
    this.configForm.valueChanges.subscribe(val => {
      this.routeService.setTrafficMultiplier(val.trafficMultiplier);
      this.routeService.setServiceTimePerStop(val.serviceTime);
    });
    
    // Add default points for fresh load
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
    if (changes['routeData'] && this.routeData && this.isRandom) {
      // Update UI to show the random multiplier that was actually used
      this.configForm.patchValue({ 
        trafficMultiplier: this.routeService.getTrafficMultiplier() 
      }, { emitEvent: false });
    }
  }

  private loadPointsFromOrders(points: Point[]) {
    while (this.points.length !== 0) {
      this.points.removeAt(0);
    }

    points.forEach(p => {
      this.addPointObject(p.name, p.address, p.lat, p.lng, p.id);
    });
  }

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

    group.get('address')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(val => {
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
    const match = currentInput.match(/^(số\s+|ngõ\s+|hẻm\s+|kiệt\s+|ngách\s+|lô\s+|km\s+)?\d+[a-zA-Z]*(?:\/\d+[a-zA-Z]*)*\b/i);
    
    if (match) {
      const prefix = match[0].trim();
      if (!displayName.toLowerCase().startsWith(prefix.toLowerCase())) {
         return `${prefix} ${displayName}`;
      }
    }
    return displayName;
  }

  onBlur(id: string) {
    setTimeout(() => {
      this.showDropdown[id] = false;
    }, 200);
  }

  toggleRandom() {
    this.isRandom = !this.isRandom;
    this.routeService.setIsTrafficRandom(this.isRandom);
    if (!this.isRandom) {
      this.configForm.patchValue({ trafficMultiplier: 1.7 });
    }
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
    if (this._userLocation) {
      this.addPointObject('Vị trí của bạn (Bắt đầu)', 'Vị trí hiện tại', this._userLocation.lat, this._userLocation.lng);
    } else {
      this.addPointObject('', '');
    }
    this.addPointObject('', '');
    this.calculate.emit([]);
  }

  setLoading(state: boolean) {
    this.isLoading = state;
  }
}
