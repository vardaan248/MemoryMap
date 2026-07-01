import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ShareService } from '../../core/services/share.service';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent implements OnInit {
  trip: any = null;
  loading = true;
  notFound = false;
  copied = false;

  moodEmojis: Record<string, string> = {
    AMAZING: '\uD83E\uDD29',
    HAPPY: '\uD83D\uDE0A',
    NEUTRAL: '\uD83D\uDE10',
    TIRED: '\uD83D\uDE34',
    CHALLENGED: '\uD83D\uDE24',
  };

  constructor(
    private route: ActivatedRoute,
    private shareService: ShareService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;

    this.shareService.getPublicTrip(slug).subscribe({
      next: ({ trip }) => {
        this.trip = trip;
        this.loading = false;
        this.setMetaTags(trip, slug);
      },
      error: () => {
        this.loading = false;
        this.notFound = true;
      },
    });
  }

  private setMetaTags(trip: any, slug: string) {
    const title = trip.title + ' — WanderLog';
    const desc = trip.description || trip.countries?.join(', ') || 'A travel journal';
    const image = trip.coverImage || trip.entries?.[0]?.photos?.[0]?.url || '';
    const url = this.shareService.getShareUrl(slug);

    this.titleService.setTitle(title);

    const metas = [
      { name: 'description', content: desc },
      { property: 'og:title', content: title },
      { property: 'og:description', content: desc },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: 'article' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: desc },
      { name: 'twitter:image', content: image },
    ];

    metas.forEach((m) => {
      if ('property' in m && m.property) {
        this.metaService.updateTag({ property: m.property, content: m.content });
      } else if ('name' in m && m.name) {
        this.metaService.updateTag({ name: m.name, content: m.content });
      }
    });
  }

  get totalDuration(): string {
    if (!this.trip?.startDate || !this.trip?.endDate) return '';
    const days = Math.ceil(
      (new Date(this.trip.endDate).getTime() - new Date(this.trip.startDate).getTime())
      / (1000 * 60 * 60 * 24)
    );
    return days + ' day' + (days !== 1 ? 's' : '');
  }

  async copyLink() {
    const url = this.shareService.getShareUrl(this.trip.slug);
    await this.shareService.copyToClipboard(url);
    this.copied = true;
    setTimeout(() => (this.copied = false), 2500);
  }

  locationDisplay(entry: any): string {
    const parts = [entry.city, entry.country].filter((v: any) => !!v);
    return entry.locationName || parts.join(', ');
  }
}
