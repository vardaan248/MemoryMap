import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <header class="dash-header">
        <div class="dash-header__text">
          <h1>
            Good {{ greeting }},
            <span class="name" *ngIf="user$ | async as user">{{ user.name.split(' ')[0] }}</span>
          </h1>
          <p>Here's a snapshot of your journey so far.</p>
        </div>
        <a routerLink="/trips/new" class="btn-new-trip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New trip
        </a>
      </header>

      <!-- Stats row -->
      <div class="stats-row" *ngIf="user$ | async as user">
        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--trips">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.99 1.18 2 2 0 013 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.15a16 16 0 006.29 6.29l1.52-1.52a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          </div>
          <div class="stat-card__body">
            <span class="stat-value">{{ user.totalTrips ?? 0 }}</span>
            <span class="stat-label">Trips taken</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--countries">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
          </div>
          <div class="stat-card__body">
            <span class="stat-value">{{ user.totalCountries ?? 0 }}</span>
            <span class="stat-label">Countries</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--photos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <div class="stat-card__body">
            <span class="stat-value">{{ user.totalPhotos ?? 0 }}</span>
            <span class="stat-label">Photos</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon stat-card__icon--days">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div class="stat-card__body">
            <span class="stat-value">—</span>
            <span class="stat-label">Days abroad</span>
          </div>
        </div>
      </div>

      <!-- Content grid -->
      <div class="dash-grid">
        <!-- Recent Trips -->
        <section class="dash-section">
          <div class="section-header">
            <h2>Recent trips</h2>
            <a routerLink="/trips" class="section-link">View all</a>
          </div>

          <!-- Empty state -->
          <div class="empty-state">
            <div class="empty-state__illustration">
              <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="120">
                <rect x="10" y="20" width="100" height="50" rx="8" fill="#f0ede6" stroke="#e2ddd5" stroke-width="1.5"/>
                <rect x="20" y="30" width="35" height="30" rx="4" fill="#e8e4dc"/>
                <circle cx="37" cy="38" r="6" fill="#d4cec4"/>
                <polyline points="20,60 32,46 42,54 52,40 55,60" stroke="#b8b2a8" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="62" y="34" width="38" height="5" rx="2" fill="#e0dbd2"/>
                <rect x="62" y="44" width="28" height="4" rx="2" fill="#ede9e2"/>
                <rect x="62" y="53" width="32" height="4" rx="2" fill="#ede9e2"/>
              </svg>
            </div>
            <p class="empty-state__title">No trips yet</p>
            <p class="empty-state__sub">Start documenting your adventures.</p>
            <a routerLink="/trips/new" class="btn-start">Plan your first trip</a>
          </div>
        </section>

        <!-- Quick actions -->
        <section class="dash-section dash-section--narrow">
          <div class="section-header">
            <h2>Quick actions</h2>
          </div>
          <div class="quick-actions">
            <a routerLink="/trips/new" class="quick-action">
              <div class="qa-icon qa-icon--add">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <div>
                <span class="qa-title">New trip</span>
                <span class="qa-sub">Start a new journal</span>
              </div>
            </a>
            <a routerLink="/map" class="quick-action">
              <div class="qa-icon qa-icon--map">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
              </div>
              <div>
                <span class="qa-title">World map</span>
                <span class="qa-sub">See where you've been</span>
              </div>
            </a>
            <a routerLink="/timeline" class="quick-action">
              <div class="qa-icon qa-icon--timeline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </div>
              <div>
                <span class="qa-title">Timeline</span>
                <span class="qa-sub">Browse your memories</span>
              </div>
            </a>
          </div>
        </section>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  user$ = this.store.select(selectCurrentUser);
  greeting = 'morning';

  constructor(private store: Store) {}

  ngOnInit(): void {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'morning';
    else if (hour < 17) this.greeting = 'afternoon';
    else this.greeting = 'evening';
  }
}
