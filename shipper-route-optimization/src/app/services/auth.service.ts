import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AuthUser {
  id: string;
  email: string;
  userName: string;
  fullName: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  expiresAtUtc: string;
  user: AuthUser;
}

export interface BootstrapAdminRequest {
  email: string;
  password: string;
  fullName: string;
  userName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/auth`;
  private readonly storageKey = 'routeflow.auth';

  readonly session = signal<AuthResponse | null>(null);
  readonly canBootstrapAdmin = signal(false);

  constructor(private http: HttpClient) {
    this.restoreSession();
    this.refreshBootstrapStatus().subscribe();
  }

  isAuthenticated(): boolean {
    const current = this.session();
    if (!current) {
      return false;
    }

    return new Date(current.expiresAtUtc).getTime() > Date.now();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => this.setSession(response))
    );
  }

  bootstrapAdmin(request: BootstrapAdminRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/bootstrap-admin`, request).pipe(
      tap(response => {
        this.setSession(response);
        this.canBootstrapAdmin.set(false);
      })
    );
  }

  refreshBootstrapStatus(): Observable<boolean> {
    return this.http.get<{ canBootstrapAdmin: boolean }>(`${this.apiUrl}/bootstrap-status`).pipe(
      map(response => response.canBootstrapAdmin),
      tap(canBootstrap => this.canBootstrapAdmin.set(canBootstrap)),
      catchError(() => {
        this.canBootstrapAdmin.set(false);
        return of(false);
      })
    );
  }

  loadProfile(): Observable<AuthUser | null> {
    if (!this.isAuthenticated()) {
      this.clearSession();
      return of(null);
    }

    return this.http.get<AuthUser>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        const current = this.session();
        if (!current) {
          return;
        }

        this.setSession({
          ...current,
          user
        });
      }),
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    );
  }

  logout(): void {
    this.clearSession();
  }

  getAccessToken(): string | null {
    return this.session()?.accessToken ?? null;
  }

  private restoreSession(): void {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return;
    }

    try {
      const session = JSON.parse(raw) as AuthResponse;
      this.session.set(session);
      if (!this.isAuthenticated()) {
        this.clearSession();
        return;
      }

      this.loadProfile().subscribe();
    } catch {
      this.clearSession();
    }
  }

  private setSession(session: AuthResponse): void {
    this.session.set(session);
    localStorage.setItem(this.storageKey, JSON.stringify(session));
  }

  private clearSession(): void {
    this.session.set(null);
    localStorage.removeItem(this.storageKey);
  }
}
