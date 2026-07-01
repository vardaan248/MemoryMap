import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Trip {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  slug: string;
  isPublic: boolean;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  startDate?: string;
  endDate?: string;
  countries: string[];
  cities: string[];
  entryCount: number;
  photoCount: number;
  totalDays: number;
  tags: { tag: { id: string; name: string } }[];
  entries?: Entry[];
  createdAt: string;
  updatedAt: string;
}

export interface Entry {
  id: string;
  tripId: string;
  title: string;
  content: any;
  date: string;
  mood?: 'AMAZING' | 'HAPPY' | 'NEUTRAL' | 'TIRED' | 'CHALLENGED';
  weather?: string;
  locationName?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  order: number;
  photos: Photo[];
}

export interface Photo {
  id: string;
  entryId: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  width?: number;
  height?: number;
  order: number;
}

export interface CreateTripPayload {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

export interface CreateEntryPayload {
  title: string;
  content?: any;
  date: string;
  mood?: string;
  weather?: string;
  locationName?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

@Injectable({ providedIn: 'root' })
export class TripService {
  private api = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // ── Trips ──────────────────────────────────────────
  getTrips(params?: { status?: string; page?: number; limit?: number }): Observable<{ trips: Trip[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<{ trips: Trip[]; pagination: any }>(`${this.api}/trips`, { params: httpParams });
  }

  getTrip(id: string): Observable<{ trip: Trip }> {
    return this.http.get<{ trip: Trip }>(`${this.api}/trips/${id}`);
  }

  getTripBySlug(slug: string): Observable<{ trip: Trip }> {
    return this.http.get<{ trip: Trip }>(`${this.api}/trips/share/${slug}`);
  }

  createTrip(payload: CreateTripPayload): Observable<{ trip: Trip }> {
    return this.http.post<{ trip: Trip }>(`${this.api}/trips`, payload);
  }

  updateTrip(id: string, payload: Partial<Trip & { tags: string[] }>): Observable<{ trip: Trip }> {
    return this.http.patch<{ trip: Trip }>(`${this.api}/trips/${id}`, payload);
  }

  deleteTrip(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.api}/trips/${id}`);
  }

  // ── Entries ────────────────────────────────────────
  getEntries(tripId: string): Observable<{ entries: Entry[] }> {
    return this.http.get<{ entries: Entry[] }>(`${this.api}/trips/${tripId}/entries`);
  }

  getEntry(tripId: string, entryId: string): Observable<{ entry: Entry }> {
    return this.http.get<{ entry: Entry }>(`${this.api}/trips/${tripId}/entries/${entryId}`);
  }

  createEntry(tripId: string, payload: CreateEntryPayload): Observable<{ entry: Entry }> {
    return this.http.post<{ entry: Entry }>(`${this.api}/trips/${tripId}/entries`, payload);
  }

  updateEntry(tripId: string, entryId: string, payload: Partial<CreateEntryPayload & { content: any }>): Observable<{ entry: Entry }> {
    return this.http.patch<{ entry: Entry }>(`${this.api}/trips/${tripId}/entries/${entryId}`, payload);
  }

  deleteEntry(tripId: string, entryId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.api}/trips/${tripId}/entries/${entryId}`);
  }

  // ── Photos ─────────────────────────────────────────
  uploadPhotos(entryId: string, files: File[]): Observable<{ photos: Photo[] }> {
    const form = new FormData();
    files.forEach((f) => form.append('photos', f));
    return this.http.post<{ photos: Photo[] }>(`${this.api}/entries/${entryId}/photos`, form);
  }

  setCoverPhoto(entryId: string, photoId: string): Observable<any> {
    return this.http.patch(`${this.api}/entries/${entryId}/photos/${photoId}/cover`, {});
  }

  deletePhoto(entryId: string, photoId: string): Observable<any> {
    return this.http.delete(`${this.api}/entries/${entryId}/photos/${photoId}`);
  }

  reorderPhotos(entryId: string, photoIds: string[]): Observable<any> {
    return this.http.patch(`${this.api}/entries/${entryId}/photos/reorder`, { photoIds });
  }
}
