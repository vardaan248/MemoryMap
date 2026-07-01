import {
  Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { TripService, Entry, Photo } from '../../../core/services/trip.service';
import * as L from 'leaflet';

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

const MOODS = [
  { value: 'AMAZING', label: 'Amazing', emoji: '🤩' },
  { value: 'HAPPY', label: 'Happy', emoji: '😊' },
  { value: 'NEUTRAL', label: 'Neutral', emoji: '😐' },
  { value: 'TIRED', label: 'Tired', emoji: '😴' },
  { value: 'CHALLENGED', label: 'Tough day', emoji: '😤' },
];

const WEATHER = ['☀️ Sunny', '⛅ Cloudy', '🌧 Rainy', '⛈ Stormy', '❄️ Snowy', '🌫 Foggy', '🌈 Rainbow'];

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  country?: string;
}

interface NominatimSearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
}

interface NominatimReverseResult {
  display_name: string;
  address?: NominatimAddress;
}

interface LocationSuggestion {
  label: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
}

@Component({
  selector: 'app-entry-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './entry-editor.component.html',
  styleUrls: ['./entry-editor.component.scss'],
})
export class EntryEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorEl') editorEl!: ElementRef;
  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('miniMapEl') miniMapEl!: ElementRef;

  private miniMap!: L.Map;
  private miniMapMarker!: L.Marker;

  pickedLat: number | null = null;
  pickedLng: number | null = null;

  form: FormGroup;
  editor!: Editor;
  isEditing = false;
  tripId!: string;
  entryId: string | null = null;
  saving = false;
  error = '';

  selectedMood = '';
  selectedWeather = '';
  moods = MOODS;
  weatherOptions = WEATHER;

  photos: Photo[] = [];
  pendingFiles: File[] = [];
  pendingPreviews: { file: File; url: string; isCover: boolean }[] = [];
  uploadingPhotos = false;
  coverPhotoId: string | null = null;

  locationQuery = '';
  locationSuggestions: LocationSuggestion[] = [];
  searchingLocations = false;
  selectedLocationVerified = false;

  private locationSearchTimer: ReturnType<typeof setTimeout> | null = null;
  private locationSearchSub?: Subscription;
  private reverseGeocodeSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(120)]],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      locationName: [''],
      country: [''],
      city: [''],
    });
  }

  ngOnInit() {
    this.tripId = this.route.snapshot.paramMap.get('tripId') ?? this.route.snapshot.queryParamMap.get('tripId') ?? '';
    this.entryId = this.route.snapshot.paramMap.get('id');

    if (this.entryId) {
      this.isEditing = true;
      this.tripService.getEntry(this.tripId, this.entryId).subscribe({
        next: ({ entry }) => {
          this.form.patchValue({
            title: entry.title,
            date: entry.date.split('T')[0],
            locationName: entry.locationName ?? '',
            country: entry.country ?? '',
            city: entry.city ?? '',
          });
          this.locationQuery = entry.locationName ?? '';
          this.selectedMood = entry.mood ?? '';
          this.selectedWeather = entry.weather ?? '';
          this.photos = entry.photos;
          this.coverPhotoId = entry.photos.find((_, i) => i === 0)?.id ?? null;
          this.pickedLat = entry.latitude ?? null;
          this.pickedLng = entry.longitude ?? null;
          this.selectedLocationVerified = !!(entry.locationName && entry.city && entry.country && entry.latitude != null && entry.longitude != null);

          if (this.editor && entry.content) {
            this.editor.commands.setContent(entry.content);
          }
        },
      });
    }
  }

  ngAfterViewInit() {
    this.editor = new Editor({
      element: this.editorEl.nativeElement,
      extensions: [
        StarterKit,
        TaskList,
        TaskItem.configure({ nested: true }),
        Image.configure({ inline: false }),
        Placeholder.configure({ placeholder: 'Write about your day...' }),
      ],
      content: '',
      editorProps: {
        attributes: { class: 'tiptap-editor' },
      },
    });

    this.initMiniMap();
  }

  private initMiniMap() {
    if (!this.miniMapEl?.nativeElement) return;

    this.miniMap = L.map(this.miniMapEl.nativeElement, {
      center: [20, 0],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(this.miniMap);

    this.miniMap.on('click', (e: L.LeafletMouseEvent) => {
      this.pickedLat = parseFloat(e.latlng.lat.toFixed(6));
      this.pickedLng = parseFloat(e.latlng.lng.toFixed(6));
      this.updateMapMarker(this.pickedLat, this.pickedLng, this.miniMap.getZoom());
      this.reverseGeocode(this.pickedLat, this.pickedLng);
    });

    if (this.pickedLat != null && this.pickedLng != null) {
      this.updateMapMarker(this.pickedLat, this.pickedLng, 10);
    }
  }

  ngOnDestroy() {
    if (this.locationSearchTimer) clearTimeout(this.locationSearchTimer);
    this.locationSearchSub?.unsubscribe();
    this.reverseGeocodeSub?.unsubscribe();
    this.editor?.destroy();
    this.miniMap?.remove();
  }

  toggleBold() { this.editor.chain().focus().toggleBold().run(); }
  toggleItalic() { this.editor.chain().focus().toggleItalic().run(); }
  toggleBulletList() { this.editor.chain().focus().toggleBulletList().run(); }
  toggleTaskList() { this.editor.chain().focus().toggleTaskList().run(); }
  isActive(mark: string) { return this.editor?.isActive(mark) ?? false; }

  onLocationQueryInput(value: string) {
    this.locationQuery = value;
    this.form.patchValue({ locationName: value, city: '', country: '' });
    this.selectedLocationVerified = false;

    if (this.locationSearchTimer) clearTimeout(this.locationSearchTimer);

    const query = value.trim();
    if (query.length < 3) {
      this.locationSuggestions = [];
      this.searchingLocations = false;
      return;
    }

    this.locationSearchTimer = setTimeout(() => this.searchLocations(query), 300);
  }

  pickLocation(suggestion: LocationSuggestion) {
    this.locationQuery = suggestion.label;
    this.locationSuggestions = [];
    this.selectedLocationVerified = true;

    this.form.patchValue({
      locationName: suggestion.label,
      city: suggestion.city,
      country: suggestion.country,
    });

    this.pickedLat = suggestion.lat;
    this.pickedLng = suggestion.lng;
    this.updateMapMarker(suggestion.lat, suggestion.lng, 11);
  }

  clearLocationSuggestions() {
    setTimeout(() => {
      this.locationSuggestions = [];
    }, 150);
  }

  private searchLocations(query: string) {
    this.locationSearchSub?.unsubscribe();
    this.searchingLocations = true;

    const params = new HttpParams()
      .set('q', query)
      .set('format', 'jsonv2')
      .set('addressdetails', '1')
      .set('limit', '6');

    this.locationSearchSub = this.http
      .get<NominatimSearchResult[]>('https://nominatim.openstreetmap.org/search', { params })
      .subscribe({
        next: (results) => {
          this.locationSuggestions = results
            .map((item) => ({
              label: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              city: this.extractCity(item.address),
              country: item.address?.country ?? '',
            }))
            .filter((item) => !Number.isNaN(item.lat) && !Number.isNaN(item.lng));
          this.searchingLocations = false;
        },
        error: () => {
          this.locationSuggestions = [];
          this.searchingLocations = false;
        },
      });
  }

  private reverseGeocode(lat: number, lng: number) {
    this.reverseGeocodeSub?.unsubscribe();

    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lng.toString())
      .set('format', 'jsonv2')
      .set('addressdetails', '1');

    this.reverseGeocodeSub = this.http
      .get<NominatimReverseResult>('https://nominatim.openstreetmap.org/reverse', { params })
      .subscribe({
        next: (result) => {
          const locationName = result.display_name ?? this.locationQuery;
          const city = this.extractCity(result.address);
          const country = result.address?.country ?? '';

          this.locationQuery = locationName;
          this.form.patchValue({
            locationName,
            city,
            country,
          });
          this.selectedLocationVerified = !!(locationName && city && country);
        },
        error: () => {
          this.selectedLocationVerified = false;
        },
      });
  }

  private extractCity(address?: NominatimAddress): string {
    if (!address) return '';

    return address.city
      ?? address.town
      ?? address.village
      ?? address.municipality
      ?? address.county
      ?? address.state
      ?? '';
  }

  private updateMapMarker(lat: number, lng: number, zoom = 10) {
    const pinIcon = L.divIcon({
      className: '',
      html: '<div class="map-pin"><div class="map-pin__dot"></div></div>',
      iconSize: [28, 36],
      iconAnchor: [14, 36],
    });

    if (this.miniMapMarker) this.miniMapMarker.remove();
    this.miniMapMarker = L.marker([lat, lng], { icon: pinIcon }).addTo(this.miniMap);
    this.miniMap.setView([lat, lng], zoom);
  }

  openPhotoPicker() {
    this.photoInput.nativeElement.click();
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const newFiles = Array.from(input.files);
    newFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      this.pendingPreviews.push({
        file,
        url,
        isCover: this.pendingPreviews.length === 0 && this.photos.length === 0,
      });
    });
    this.pendingFiles.push(...newFiles);
    input.value = '';
  }

  setPendingCover(index: number) {
    this.pendingPreviews.forEach((p, i) => (p.isCover = i === index));
    this.coverPhotoId = null;
  }

  setExistingCover(photoId: string) {
    this.coverPhotoId = photoId;
    this.pendingPreviews.forEach((p) => (p.isCover = false));
  }

  removePending(index: number) {
    URL.revokeObjectURL(this.pendingPreviews[index].url);
    this.pendingPreviews.splice(index, 1);
    this.pendingFiles.splice(index, 1);
  }

  deleteExistingPhoto(photoId: string) {
    if (!this.entryId) return;
    this.tripService.deletePhoto(this.entryId, photoId).subscribe({
      next: () => {
        this.photos = this.photos.filter((p) => p.id !== photoId);
        if (this.coverPhotoId === photoId) this.coverPhotoId = this.photos[0]?.id ?? null;
      },
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const title = (this.form.value.title ?? '').trim();
    const date = this.form.value.date;
    const locationName = (this.form.value.locationName ?? '').trim();
    const city = (this.form.value.city ?? '').trim();
    const country = (this.form.value.country ?? '').trim();

    if (!title || !date) {
      this.form.markAllAsTouched();
      return;
    }

    if (
      locationName
      && (!this.selectedLocationVerified || this.pickedLat == null || this.pickedLng == null || !city || !country)
    ) {
      this.error = 'Choose a location from search or map so city, country, and coordinates are valid.';
      return;
    }

    this.saving = true;
    this.error = '';

    const payload = {
      ...this.form.value,
      title,
      date,
      locationName: locationName || undefined,
      city: city || undefined,
      country: country || undefined,
      content: this.editor.getJSON(),
      mood: this.selectedMood || undefined,
      weather: this.selectedWeather || undefined,
      latitude: this.pickedLat ?? undefined,
      longitude: this.pickedLng ?? undefined,
    };

    try {
      let savedEntry: Entry;

      if (this.isEditing && this.entryId) {
        const res = await this.tripService.updateEntry(this.tripId, this.entryId, payload).toPromise();
        savedEntry = res!.entry;
      } else {
        const res = await this.tripService.createEntry(this.tripId, payload).toPromise();
        savedEntry = res!.entry;
      }

      if (this.pendingFiles.length > 0) {
        this.uploadingPhotos = true;
        const res = await this.tripService.uploadPhotos(savedEntry.id, this.pendingFiles).toPromise();
        const uploadedPhotos = res!.photos;

        const coverPendingIdx = this.pendingPreviews.findIndex((p) => p.isCover);
        if (coverPendingIdx !== -1 && uploadedPhotos[coverPendingIdx]) {
          await this.tripService.setCoverPhoto(savedEntry.id, uploadedPhotos[coverPendingIdx].id).toPromise();
        }
      }

      if (this.coverPhotoId && this.entryId) {
        await this.tripService.setCoverPhoto(savedEntry.id, this.coverPhotoId).toPromise();
      }

      this.router.navigate(['/trips', this.tripId]);
    } catch (err: any) {
      this.error = err?.error?.error ?? 'Something went wrong.';
      this.saving = false;
      this.uploadingPhotos = false;
    }
  }
}
