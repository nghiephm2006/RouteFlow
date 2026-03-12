import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService, Order, OrderStatus, OrderStats } from '../../services/order.service';
import { RouteOptimizationService } from '../../services/route-optimization.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  stats: OrderStats | null = null;
  loading: boolean = false;
  uploading: boolean = false;
  showAddForm: boolean = false;
  orderForm: FormGroup;
  editingOrderId: string | null = null;
  showStatusEdit: { [id: string]: boolean } = {};
  
  suggestions: any[] = [];
  showDropdown: boolean = false;
  
  isRefreshing: boolean = false;

  @Output() routePendingOrders = new EventEmitter<Order[]>();
  @Output() forwardToMap = new EventEmitter<Order>();

  constructor(
    private orderService: OrderService, 
    private routeService: RouteOptimizationService,
    private cdr: ChangeDetectorRef, 
    private fb: FormBuilder
  ) {
    this.orderForm = this.fb.group({
      customerName: ['', Validators.required],
      phone: [''],
      email: [''],
      address: ['', Validators.required],
      latitude: [null],
      longitude: [null],
      note: ['']
    });

    // Handle address autocomplete
    this.orderForm.get('address')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(val => {
        // Clear resolved lat/lng if user is typing manually
        if (this.orderForm.get('latitude')?.value) {
          this.orderForm.patchValue({ latitude: null, longitude: null }, { emitEvent: false });
        }
        
        if (!val || typeof val !== 'string' || val.length < 3) {
          return of([]);
        }
        return this.routeService.searchLocation(val);
      })
    ).subscribe(results => {
      this.suggestions = results;
      this.showDropdown = true;
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    this.loadOrders();
    this.loadStats();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.orderForm.reset();
      this.editingOrderId = null;
    }
  }

  editOrder(order: Order): void {
    this.showAddForm = true;
    this.editingOrderId = order.id;
    this.orderForm.patchValue({
      customerName: order.customerName,
      phone: order.phone || '',
      email: order.email || '',
      address: order.address,
      latitude: order.latitude !== 0 ? order.latitude : null,
      longitude: order.longitude !== 0 ? order.longitude : null,
      note: order.note
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleStatusEdit(id: string): void {
    Object.keys(this.showStatusEdit).forEach(k => { this.showStatusEdit[k] = false; });
    this.showStatusEdit[id] = true;
    // Auto-focus after *ngIf renders the <select>
    setTimeout(() => {
      const sel = document.getElementById(`status-select-${id}`) as HTMLSelectElement;
      if (sel) sel.focus();
    }, 0);
  }

  onStatusBlur(id: string): void {
    // Small delay so (change) fires before blur closes the select
    setTimeout(() => { this.showStatusEdit[id] = false; }, 150);
  }

  updateOrderStatus(order: Order, newStatus: OrderStatus): void {
    this.showStatusEdit[order.id] = false;
    if (order.status === newStatus) return; // no change

    const statusName = this.getStatusName(newStatus);
    const confirmed = confirm(
      `Xác nhận thay đổi trạng thái đơn "${order.orderCode}" sang:\n👉 ${statusName}`
    );
    if (!confirmed) return;

    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        this.loadOrders();
        this.loadStats();
      },
      error: (err) => {
        console.error('Error updating status', err);
        alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.');
      }
    });
  }

  forwardOrderToMap(order: Order): void {
    this.forwardToMap.emit(order);
  }

  submitOrder(): void {
    if (this.orderForm.valid) {
      const hasCoords = !!this.orderForm.get('latitude')?.value;
      const isEditing = !!this.editingOrderId;

      // Skip lat/lng check when editing an order that already has coordinates
      if (!hasCoords && !isEditing) {
        alert('Vui lòng chọn một địa chỉ cụ thể từ danh sách gợi ý để có toạ độ chính xác.');
        return;
      }

      this.loading = true;
      const payload = this.orderForm.value;

      if (this.editingOrderId) {
        const updatePayload = { ...payload, id: this.editingOrderId };

        this.orderService.updateOrder(this.editingOrderId, updatePayload).subscribe({
          next: () => {
            this.toggleAddForm();
            this.loadOrders();
            this.loadStats();
          },
          error: (err) => {
            console.error('Error updating order', err);
            alert('Có lỗi xảy ra khi cập nhật đơn hàng.');
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      } else {
        // Create
        this.orderService.createOrder(payload).subscribe({
          next: () => {
            alert('Thêm đơn hàng thành công!');
            this.toggleAddForm();
            this.loadOrders();
            this.loadStats();
          },
          error: (err) => {
            console.error('Error creating order', err);
            alert('Có lỗi xảy ra khi tạo đơn hàng mới.');
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  selectAddressSuggestion(suggestion: any): void {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    
    // Format suggestion name logically
    let formattedName = suggestion.display_name;
    const currentInput = this.orderForm.get('address')?.value;
    if (currentInput) {
      const match = currentInput.match(/^(số\s+|ngõ\s+|hẻm\s+|kiệt\s+|ngách\s+|lô\s+|km\s+)?\d+[a-zA-Z]*(?:\/\d+[a-zA-Z]*)*\b/i);
      if (match) {
         const prefix = match[0].trim();
         if (!formattedName.toLowerCase().startsWith(prefix.toLowerCase())) {
            formattedName = `${prefix} ${formattedName}`;
         }
      }
    }

    this.orderForm.patchValue({
      address: formattedName,
      latitude: lat,
      longitude: lng
    }, { emitEvent: false });
    
    this.showDropdown = false;
  }

  onAddressBlur(): void {
    setTimeout(() => {
      this.showDropdown = false;
      this.cdr.detectChanges();
    }, 200);
  }

  refreshOrders(): void {
    if (this.isRefreshing) return;
    
    this.isRefreshing = true;
    this.cdr.detectChanges();
    
    this.loadOrders();
    this.loadStats();
    
    // Auto unlock after 2 seconds to prevent spam
    setTimeout(() => {
      this.isRefreshing = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  loadOrders(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading orders', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadStats(): void {
    this.orderService.getOrderStats().subscribe(stats => {
      this.stats = stats;
      this.cdr.detectChanges();
    });
  }

  deleteOrder(id: string): void {
    if (confirm('Bạn có chắc xoá đơn hàng này?')) {
      this.orderService.deleteOrder(id).subscribe(() => {
        this.loadOrders();
        this.loadStats();
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploading = true;
      this.cdr.detectChanges();
      this.orderService.importExcel(file).subscribe({
        next: (res) => {
          alert('Import dữ liệu thành công!');
          this.uploading = false;
          this.loadOrders();
          this.loadStats();
        },
        error: (err) => {
          alert('Có lỗi xảy ra khi import.');
          console.error(err);
          this.uploading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  downloadTemplate(): void {
    this.orderService.downloadTemplate();
  }

  triggerRouting(): void {
    const pendingOrders = this.orders.filter(o => o.status === OrderStatus.Pending);
    if (pendingOrders.length === 0) {
      alert('Không có đơn hàng nào ở trạng thái Pending để tối ưu.');
      return;
    }
    this.routePendingOrders.emit(pendingOrders);
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending: return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.Routing: return 'bg-blue-100 text-blue-800';
      case OrderStatus.Assigned: return 'bg-orange-100 text-orange-800';
      case OrderStatus.Delivered: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusName(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending: return 'Chờ xử lý';
      case OrderStatus.Routing: return 'Đang xếp tuyến';
      case OrderStatus.Assigned: return 'Đã giao tài xế';
      case OrderStatus.Delivered: return 'Đã giao hàng';
      default: return 'Không xác định';
    }
  }
}
