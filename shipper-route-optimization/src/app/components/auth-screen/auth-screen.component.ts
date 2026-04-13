import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-screen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div class="w-full max-w-5xl grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section class="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 shadow-2xl">
          <p class="text-xs uppercase tracking-[0.35em] text-cyan-300/80">RouteFlow</p>
          <h1 class="mt-6 text-4xl font-black leading-tight text-white">Secure dispatcher workspace</h1>
          <p class="mt-4 max-w-xl text-sm leading-7 text-slate-300">
            Login is now required before accessing orders, clustering and delivery execution. Bootstrap the first admin once,
            then use the same account to manage dispatcher and shipper access.
          </p>

          <div class="mt-8 grid gap-4 sm:grid-cols-3">
            <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">API</p>
              <p class="mt-2 text-sm text-white">JWT protected</p>
            </div>
            <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Bootstrap</p>
              <p class="mt-2 text-sm text-white">First admin only</p>
            </div>
            <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Workspace</p>
              <p class="mt-2 text-sm text-white">Dispatcher-first flow</p>
            </div>
          </div>
        </section>

        <section class="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl">
          <div class="flex gap-2 rounded-2xl bg-slate-950/80 p-1">
            <button
              type="button"
              (click)="mode = 'login'"
              class="flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition"
              [ngClass]="mode === 'login' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'">
              Login
            </button>
            <button
              type="button"
              (click)="mode = 'bootstrap'"
              class="flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition"
              [disabled]="!canBootstrapAdmin"
              [ngClass]="mode === 'bootstrap' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-40'">
              First admin
            </button>
          </div>

          <div *ngIf="errorMessage" class="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {{ errorMessage }}
          </div>

          <form *ngIf="mode === 'login'" class="mt-6 space-y-4" (ngSubmit)="submitLogin()">
            <label class="block">
              <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Email</span>
              <input [(ngModel)]="loginEmail" name="loginEmail" type="email" required
                class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-cyan-400" />
            </label>
            <label class="block">
              <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Password</span>
              <input [(ngModel)]="loginPassword" name="loginPassword" type="password" required
                class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-cyan-400" />
            </label>
            <button type="submit"
              [disabled]="loading"
              class="w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">
              {{ loading ? 'Signing in...' : 'Login' }}
            </button>
          </form>

          <form *ngIf="mode === 'bootstrap'" class="mt-6 space-y-4" (ngSubmit)="submitBootstrap()">
            <div *ngIf="!canBootstrapAdmin" class="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Bootstrap admin is no longer available because at least one user already exists.
            </div>
            <label class="block">
              <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Full name</span>
              <input [(ngModel)]="bootstrapFullName" name="bootstrapFullName" required
                class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-cyan-400" />
            </label>
            <label class="block">
              <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Username</span>
              <input [(ngModel)]="bootstrapUserName" name="bootstrapUserName" required
                class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-cyan-400" />
            </label>
            <label class="block">
              <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Email</span>
              <input [(ngModel)]="bootstrapEmail" name="bootstrapEmail" type="email" required
                class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-cyan-400" />
            </label>
            <label class="block">
              <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Password</span>
              <input [(ngModel)]="bootstrapPassword" name="bootstrapPassword" type="password" required
                class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-cyan-400" />
            </label>
            <button type="submit"
              [disabled]="loading || !canBootstrapAdmin"
              class="w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">
              {{ loading ? 'Creating admin...' : 'Create first admin' }}
            </button>
          </form>
        </section>
      </div>
    </div>
  `
})
export class AuthScreenComponent {
  @Input() canBootstrapAdmin = false;
  @Output() authenticated = new EventEmitter<void>();

  mode: 'login' | 'bootstrap' = 'login';
  loading = false;
  errorMessage = '';

  loginEmail = '';
  loginPassword = '';

  bootstrapFullName = '';
  bootstrapUserName = 'admin';
  bootstrapEmail = '';
  bootstrapPassword = '';

  constructor(private authService: AuthService) {}

  submitLogin(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginEmail, this.loginPassword).subscribe({
      next: () => {
        this.loading = false;
        this.authenticated.emit();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message ?? 'Login failed.';
      }
    });
  }

  submitBootstrap(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.bootstrapAdmin({
      email: this.bootstrapEmail,
      password: this.bootstrapPassword,
      fullName: this.bootstrapFullName,
      userName: this.bootstrapUserName
    }).subscribe({
      next: () => {
        this.loading = false;
        this.authenticated.emit();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message ?? 'Bootstrap admin failed.';
      }
    });
  }
}
