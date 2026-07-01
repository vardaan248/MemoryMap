import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OgMeta {
  title: string;
  description: string;
  image: string | null;
  url: string;
  author: string;
}

@Injectable({ providedIn: 'root' })
export class ShareService {
  private api = `${environment.apiUrl}/share`;

  constructor(private http: HttpClient) {}

  getPublicTrip(slug: string): Observable<{ trip: any }> {
    return this.http.get<{ trip: any }>(`${this.api}/${slug}`);
  }

  getOgMeta(slug: string): Observable<{ meta: OgMeta }> {
    return this.http.get<{ meta: OgMeta }>(`${this.api}/${slug}/og-meta`);
  }

  // ── URL helpers ───────────────────────────────────────
  getShareUrl(slug: string): string {
    return `${window.location.origin}/share/${slug}`;
  }

  // ── Clipboard ─────────────────────────────────────────
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      const success = document.execCommand('copy');
      document.body.removeChild(el);
      return success;
    }
  }

  // ── Social share URLs ─────────────────────────────────
  twitterShareUrl(url: string, title: string): string {
    const text = encodeURIComponent(`Check out my travel journal: ${title}`);
    return `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
  }

  whatsappShareUrl(url: string, title: string): string {
    const text = encodeURIComponent(`${title} — ${url}`);
    return `https://wa.me/?text=${text}`;
  }

  facebookShareUrl(url: string): string {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  }

  // ── QR Code URL (using free QR API) ──────────────────
  qrCodeUrl(url: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  }
}
