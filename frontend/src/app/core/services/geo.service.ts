import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MapPin {
  id: string;
  title: string;
  date: string;
  mood?: string;
  locationName?: string;
  city?: string;
  country?: string;
  latitude: number;
  longitude: number;
  photos: { thumbnailUrl: string }[];
  trip: { id: string; title: string; slug: string };
}

export interface GeoStats {
  totalTrips: number;
  totalCountries: number;
  totalCities: number;
  totalDays: number;
  totalPhotos: number;
  completedTrips: number;
  pinnedEntries: number;
  countriesList: string[];
  citiesList: string[];
}

@Injectable({ providedIn: 'root' })
export class GeoService {
  private api = `${environment.apiUrl}/geo`;

  constructor(private http: HttpClient) {}

  getPins(): Observable<{ pins: MapPin[] }> {
    return this.http.get<{ pins: MapPin[] }>(`${this.api}/pins`);
  }

  getCountries(): Observable<{ countries: string[] }> {
    return this.http.get<{ countries: string[] }>(`${this.api}/countries`);
  }

  getStats(): Observable<{ stats: GeoStats }> {
    return this.http.get<{ stats: GeoStats }>(`${this.api}/stats`);
  }
}
