import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TripService, Trip, Entry } from '../../../core/services/trip.service';
import { ShareModalComponent } from '../../../shared/components/share-modal/share-modal.component';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ShareModalComponent],
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.scss'],
})
export class TripDetailComponent implements OnInit {
  trip: Trip | null = null;
  loading = true;
  deletingEntryId: string | null = null;
  showDeleteConfirm = false;
  showShareModal = false;
  error = '';

  moodEmojis: Record<string, string> = {
    AMAZING: '🤩', HAPPY: '😊', NEUTRAL: '😐', TIRED: '😴', CHALLENGED: '😤',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.tripService.getTrip(id).subscribe({
      next: ({ trip }) => { this.trip = trip; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Trip not found.'; },
    });
  }

  get tripId() { return this.trip?.id ?? ''; }

  get totalDuration(): string {
    if (!this.trip?.startDate || !this.trip?.endDate) return '';
    const days = Math.ceil(
      (new Date(this.trip.endDate).getTime() - new Date(this.trip.startDate).getTime())
      / (1000 * 60 * 60 * 24)
    );
    return days + ' day' + (days !== 1 ? 's' : '');
  }

  get shareUrl(): string {
    return window.location.origin + '/share/' + this.trip?.slug;
  }

  copyShareLink() {
    navigator.clipboard.writeText(this.shareUrl);
  }

  confirmDeleteEntry(entryId: string) {
    this.deletingEntryId = entryId;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.deletingEntryId = null;
    this.showDeleteConfirm = false;
  }

  deleteEntry() {
    if (!this.deletingEntryId || !this.trip) return;
    this.tripService.deleteEntry(this.tripId, this.deletingEntryId).subscribe({
      next: () => {
        this.trip!.entries = this.trip!.entries?.filter(e => e.id !== this.deletingEntryId);
        this.cancelDelete();
      },
    });
  }

  deleteTrip() {
    if (!this.trip) return;
    this.tripService.deleteTrip(this.tripId).subscribe({
      next: () => this.router.navigate(['/trips']),
    });
  }

  togglePublic() {
    if (!this.trip) return;
    this.tripService.updateTrip(this.tripId, { isPublic: !this.trip.isPublic }).subscribe({
      next: ({ trip }) => { this.trip!.isPublic = trip.isPublic; },
    });
  }

  getLocation(entry: any): string {
    return entry.locationName ||
      [entry.city, entry.country].filter(v => !!v).join(', ');
  }
}
