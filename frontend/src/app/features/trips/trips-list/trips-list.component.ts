import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TripService, Trip } from '../../../core/services/trip.service';

@Component({
  selector: 'app-trips-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="trips-page">
      <div class="page-header">
        <div>
          <h1>My Trips</h1>
          <p>{{ trips.length }} {{ trips.length === 1 ? 'journey' : 'journeys' }} documented</p>
        </div>
        <a routerLink="/trips/new" class="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New trip
        </a>
      </div>

      <div class="filter-tabs">
        <button *ngFor="let f of filters" class="tab" [class.active]="activeFilter === f.value" (click)="setFilter(f.value)">
          {{ f.label }}
        </button>
      </div>

      <div class="loading-grid" *ngIf="loading">
        <div class="skeleton-card" *ngFor="let i of [1,2,3,4,5,6]"></div>
      </div>

      <div class="empty-state" *ngIf="!loading && trips.length === 0">
        <div class="empty-icon">&#x2708;</div>
        <h3>No trips yet</h3>
        <p>Start documenting your first adventure.</p>
        <a routerLink="/trips/new" class="btn-primary">Plan a trip</a>
      </div>

      <div class="trips-grid" *ngIf="!loading && trips.length > 0">
        <a class="trip-card" *ngFor="let trip of trips" [routerLink]="['/trips', trip.id]">
          <div class="trip-cover" [style.backgroundImage]="trip.coverImage ? 'url(' + trip.coverImage + ')' : 'none'">
            <div class="trip-cover-placeholder" *ngIf="!trip.coverImage">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="32" height="32"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/></svg>
            </div>
            <div class="trip-status-badge" [attr.data-status]="trip.status.toLowerCase()">{{ trip.status }}</div>
          </div>
          <div class="trip-card-body">
            <h3 class="trip-title">{{ trip.title }}</h3>
            <div class="trip-meta" *ngIf="trip.startDate">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {{ trip.startDate | date:"MMM d, y" }}
              <span *ngIf="trip.endDate"> — {{ trip.endDate | date:"MMM d, y" }}</span>
            </div>
            <div class="trip-meta" *ngIf="trip.countries.length">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><circle cx="12" cy="12" r="10"/></svg>
              {{ trip.countries.join(", ") }}
            </div>
            <div class="trip-tags" *ngIf="trip.tags?.length">
              <span class="tag" *ngFor="let t of trip.tags.slice(0,3)">{{ t.tag.name }}</span>
            </div>
            <div class="trip-stats">
              <span>{{ trip.entryCount }} {{ trip.entryCount === 1 ? "entry" : "entries" }}</span>
              <span class="dot">·</span>
              <span>{{ trip.photoCount }} photos</span>
            </div>
          </div>
        </a>
      </div>
    </div>
  `,
  styleUrls: ["./trips-list.component.scss"],
})
export class TripsListComponent implements OnInit {
  trips: Trip[] = [];
  loading = true;
  activeFilter = "";

  filters = [
    { label: "All", value: "" },
    { label: "Active", value: "ACTIVE" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Draft", value: "DRAFT" },
    { label: "Archived", value: "ARCHIVED" },
  ];

  constructor(private tripService: TripService) {}

  ngOnInit() { this.loadTrips(); }

  setFilter(value: string) {
    this.activeFilter = value;
    this.loadTrips();
  }

  loadTrips() {
    this.loading = true;
    const params = this.activeFilter ? { status: this.activeFilter } : {};
    this.tripService.getTrips(params).subscribe({
      next: ({ trips }) => { this.trips = trips; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
