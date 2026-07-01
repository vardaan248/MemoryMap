import {
  Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { GeoService, MapPin, GeoStats } from '../../core/services/geo.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapEl') mapEl!: ElementRef;

  private map!: L.Map;
  private markers: L.Marker[] = [];

  pins: MapPin[] = [];
  stats: GeoStats | null = null;
  loading = true;
  sidebarOpen = true;
  selectedPin: MapPin | null = null;

  moodEmojis: Record<string, string> = {
    AMAZING: '🤩',
    HAPPY: '😊',
    NEUTRAL: '😐',
    TIRED: '😴',
    CHALLENGED: '😤',
  };

  constructor(private geoService: GeoService) {}

  ngOnInit() {
    Promise.all([
      this.geoService.getPins().toPromise(),
      this.geoService.getStats().toPromise(),
    ]).then(([pinsRes, statsRes]) => {
      this.pins = pinsRes?.pins ?? [];
      this.stats = statsRes?.stats ?? null;
      this.loading = false;
      if (this.map) this.addPins();
    }).catch(() => { this.loading = false; });
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  private initMap() {
    this.map = L.map(this.mapEl.nativeElement, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    if (!this.loading && this.pins.length) this.addPins();
  }

  private addPins() {
    this.markers.forEach(m => m.remove());
    this.markers = [];

    const pinIcon = L.divIcon({
      className: '',
      html: '<div class="map-pin"><div class="map-pin__dot"></div></div>',
      iconSize: [28, 36],
      iconAnchor: [14, 36],
      popupAnchor: [0, -38],
    });

    this.pins.forEach((pin) => {
      const marker = L.marker([pin.latitude, pin.longitude], { icon: pinIcon })
        .addTo(this.map)
        .on('click', () => { this.selectedPin = pin; });
      this.markers.push(marker);
    });

    if (this.pins.length === 1) {
      this.map.setView([this.pins[0].latitude, this.pins[0].longitude], 8);
    } else if (this.pins.length > 1) {
      const group = L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.15));
    }
  }

  flyToPin(pin: MapPin) {
    this.selectedPin = pin;
    this.map.flyTo([pin.latitude, pin.longitude], 10, { duration: 1.2 });
  }

  closePopup() {
    this.selectedPin = null;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    setTimeout(() => this.map.invalidateSize(), 320);
  }

  getLocation(pin: any): string {
    return pin.locationName ||
      [pin.city, pin.country].filter(v => !!v).join(', ');
  }
}
