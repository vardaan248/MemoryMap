import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TimelineEntry {
  id: string;
  title: string;
  date: string;
  mood?: string;
  weather?: string;
  locationName?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  content: any;
  photos: { id: string; url: string; thumbnailUrl: string }[];
  trip: { id: string; title: string; coverImage?: string };
}

export interface MoodCount {
  AMAZING: number;
  HAPPY: number;
  NEUTRAL: number;
  TIRED: number;
  CHALLENGED: number;
  [key: string]: number;
}

export interface TimelineStats {
  totalTrips: number;
  totalCountries: number;
  totalCities: number;
  totalPhotos: number;
  totalDays: number;
  totalEntries: number;
  moodCounts: MoodCount;
  topCountries: { country: string; count: number }[];
  monthlyActivity: { month: string; count: number }[];
  longestTrip: {
    id: string; title: string; totalDays: number;
    countries: string[]; coverImage?: string;
  } | null;
}

@Injectable({ providedIn: 'root' })
export class TimelineService {
  private api = `${environment.apiUrl}/timeline`;

  constructor(private http: HttpClient) {}

  getTimeline(params?: {
    year?: number; mood?: string; page?: number; limit?: number;
  }): Observable<{ entries: TimelineEntry[]; pagination: any }> {
    let p = new HttpParams();
    if (params?.year)  p = p.set('year',  params.year.toString());
    if (params?.mood)  p = p.set('mood',  params.mood);
    if (params?.page)  p = p.set('page',  params.page.toString());
    if (params?.limit) p = p.set('limit', params.limit.toString());
    return this.http.get<{ entries: TimelineEntry[]; pagination: any }>(this.api, { params: p });
  }

  getYears(): Observable<{ years: number[] }> {
    return this.http.get<{ years: number[] }>(`${this.api}/years`);
  }

  getStats(): Observable<{ stats: TimelineStats }> {
    return this.http.get<{ stats: TimelineStats }>(`${this.api}/stats`);
  }
}
