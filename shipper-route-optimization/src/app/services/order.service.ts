import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  note: string;
  status: OrderStatus;
  createdAt: string;
}

export enum OrderStatus {
  Pending = 0,
  Routing = 1,
  Assigned = 2,
  Delivered = 3,
  Cancelled = 4
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  routingOrders: number;
  deliveredOrders: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/orders`;
  private readonly routesUrl = `${environment.apiBaseUrl}/api/routes`;

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getPendingOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/pending`);
  }

  getOrderStats(): Observable<OrderStats> {
    return this.http.get<OrderStats>(`${this.apiUrl}/stats`);
  }

  createOrder(order: Omit<Order, 'id' | 'orderCode' | 'status' | 'createdAt'>): Observable<string> {
    return this.http.post<string>(this.apiUrl, order);
  }

  updateOrder(id: string, order: Partial<Order>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, order);
  }

  updateOrderStatus(id: string, newStatus: OrderStatus): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { id, newStatus });
  }

  deleteOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteOrders(ids: string[]): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/batch`, { body: ids });
  }

  importExcel(file: File): Observable<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string }>(`${this.apiUrl}/import`, formData);
  }

  downloadTemplate(): void {
    window.open(`${this.apiUrl}/template`, '_blank');
  }

  getRouteOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.routesUrl}/orders`);
  }

  clusterOrders(orders: Order[], numberOfClusters: number): Observable<any[]> {
    return this.http.post<any[]>(`${this.routesUrl}/cluster`, { orders, numberOfClusters });
  }
}
