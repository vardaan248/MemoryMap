import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AuthService } from './core/services/auth.service';
import { selectCurrentUser, selectIsAuthenticated } from './store/auth/auth.selectors';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-shell" [class.authenticated]="isAuthenticated$ | async">
      <!-- Sidebar (shown only when logged in) -->
      <aside class="sidebar" *ngIf="isAuthenticated$ | async">
        <div class="sidebar-logo">
          <span class="logo-icon">✦</span>
          <span class="logo-text">MemoryMap</span>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            <span>Home</span>
          </a>
          <a routerLink="/trips" routerLinkActive="active" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3-8.59A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006.29 6.29l1.52-1.52a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
            <span>Trips</span>
          </a>
          <a routerLink="/map" routerLinkActive="active" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8" y1="2" x2="8" y2="18"/>
              <line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
            <span>Map</span>
          </a>
          <a routerLink="/timeline" routerLinkActive="active" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <span>Timeline</span>
          </a>
        </nav>

        <div class="sidebar-footer" *ngIf="currentUser$ | async as user">
          <div class="user-avatar">
            <img *ngIf="user.avatarUrl" [src]="user.avatarUrl" [alt]="user.name" />
            <span *ngIf="!user.avatarUrl">{{ user.name[0] }}</span>
          </div>
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
            <button class="logout-btn" (click)="logout()">Sign out</button>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isAuthenticated$ = this.store.select(selectIsAuthenticated);
  currentUser$ = this.store.select(selectCurrentUser);

  constructor(private store: Store, private authService: AuthService) {}

  ngOnInit() {
    this.authService.initializeAuth();
  }

  logout() {
    this.authService.logout();
  }
}
