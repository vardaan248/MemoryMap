import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { TripService, Trip } from '../../core/services/trip.service';
import { GeoService, GeoStats } from '../../core/services/geo.service';
import { TimelineService, TimelineEntry, TimelineStats } from '../../core/services/timeline.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  user$ = this.store.select(selectCurrentUser);
  recentTrips: Trip[] = [];
  allTrips: Trip[] = [];
  latestMemories: TimelineEntry[] = [];
  geoStats: GeoStats | null = null;
  timelineStats: TimelineStats | null = null;

  activeTrip: Trip | null = null;
  draftTrip: Trip | null = null;

  loading = true;
  greeting = 'morning';
  highlightedDestination = 'Japan';
  rotateHintIndex = 0;

  activeTab: 'overview' | 'plan' | 'explore' | 'insights' | 'journey' = 'overview';

  readonly tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'plan', label: 'Plan' },
    { value: 'explore', label: 'Explore' },
    { value: 'insights', label: 'Insights' },
    { value: 'journey', label: 'Journey Path' },
  ] as const;

  readonly journeySteps = [
    {
      title: 'Plan a Trip',
      description: 'Create a trip shell with dates and intent so everything stays organized.',
      cta: 'Start Planning',
      route: '/trips/new',
    },
    {
      title: 'Capture Memories',
      description: 'Write entries, pin locations, and add photos while moments are fresh.',
      cta: 'Add Entry',
      route: '/trips',
    },
    {
      title: 'Explore Your Map',
      description: 'Review visited places and spot patterns in where you travel most.',
      cta: 'Open Map',
      route: '/map',
    },
    {
      title: 'Share the Story',
      description: 'Turn your trip into a journal you can publish and send to friends.',
      cta: 'Open Trips',
      route: '/trips',
    },
  ];

  readonly explorerHints = [
    'Track places as memories, not just points on a map.',
    'Tiny daily entries become your best stories later.',
    'Your next trip gets better when your last one is documented.',
  ];

  readonly plannerModes = [
    { title: 'Weekend Reset', mood: 'Slow, local, and cozy' },
    { title: 'Adventure Sprint', mood: 'Outdoor and high-energy' },
    { title: 'Culture Dive', mood: 'Museums, food, and neighborhoods' },
    { title: 'Photo Route', mood: 'Golden-hour and scenic stops' },
  ];

  constructor(
    private store: Store,
    private tripService: TripService,
    private geoService: GeoService,
    private timelineService: TimelineService
  ) {}

  ngOnInit(): void {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'morning';
    else if (hour < 17) this.greeting = 'afternoon';
    else this.greeting = 'evening';

    this.loadDashboard();
    this.rotateHintIndex = Math.floor(Math.random() * this.explorerHints.length);
  }

  setTab(tab: 'overview' | 'plan' | 'explore' | 'insights' | 'journey') {
    this.activeTab = tab;
  }

  rotateHint() {
    this.rotateHintIndex = (this.rotateHintIndex + 1) % this.explorerHints.length;
  }

  surpriseDestination() {
    if (!this.recommendedDestinations.length) {
      this.highlightedDestination = 'Portugal';
      return;
    }

    const randomIdx = Math.floor(Math.random() * this.recommendedDestinations.length);
    this.highlightedDestination = this.recommendedDestinations[randomIdx];
  }

  get completionScore(): number {
    const checks = [
      this.allTrips.length > 0,
      this.latestMemories.length > 0,
      (this.geoStats?.pinnedEntries ?? 0) > 0,
      this.allTrips.some((t) => t.isPublic),
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  get completionRing(): string {
    const pct = this.completionScore;
    return `conic-gradient(#ffb347 ${pct}%, #f1e9da ${pct}% 100%)`;
  }

  get recommendedDestinations(): string[] {
    const visited = new Set(this.geoStats?.countriesList ?? []);
    const suggestions = ['Japan', 'Portugal', 'Vietnam', 'Morocco', 'Iceland', 'Peru'];
    return suggestions.filter((country) => !visited.has(country)).slice(0, 4);
  }

  get moodChampion(): string {
    if (!this.timelineStats?.moodCounts) return 'Happy';

    const entries = Object.entries(this.timelineStats.moodCounts);
    if (!entries.length) return 'Happy';

    const [winner] = entries.sort((a, b) => b[1] - a[1])[0];
    return winner.charAt(0) + winner.slice(1).toLowerCase();
  }

  get monthlyRhythm(): { month: string; count: number; height: number }[] {
    const base = this.timelineStats?.monthlyActivity ?? [];
    const lastSix = base.slice(-6);
    const max = Math.max(...lastSix.map((m) => m.count), 1);
    return lastSix.map((m) => ({
      month: m.month,
      count: m.count,
      height: Math.max(14, Math.round((m.count / max) * 60)),
    }));
  }

  get compassRoutes(): { title: string; route: string; meta: string }[] {
    return [
      {
        title: this.activeTrip ? `Continue ${this.activeTrip.title}` : 'Start your first journey',
        route: this.activeTrip ? `/trips/${this.activeTrip.id}` : '/trips/new',
        meta: this.activeTrip ? 'Resume where you paused' : 'Build a new trip shell',
      },
      {
        title: 'Open world map',
        route: '/map',
        meta: `${this.geoStats?.pinnedEntries ?? 0} memories pinned`,
      },
      {
        title: 'Review timeline',
        route: '/timeline',
        meta: `${this.timelineStats?.totalEntries ?? 0} captured moments`,
      },
    ];
  }

  get nextBestActions(): { title: string; description: string; route: string; cta: string }[] {
    const actions: { title: string; description: string; route: string; cta: string }[] = [];

    if (!this.allTrips.length) {
      actions.push({
        title: 'Create your first trip',
        description: 'Start with a destination and dates. You can refine details later.',
        route: '/trips/new',
        cta: 'Create trip',
      });
    }

    if (this.draftTrip) {
      actions.push({
        title: 'Finish your draft trip',
        description: `"${this.draftTrip.title}" is still in draft. Add entries to bring it alive.`,
        route: `/trips/${this.draftTrip.id}`,
        cta: 'Continue draft',
      });
    }

    if ((this.geoStats?.pinnedEntries ?? 0) === 0) {
      actions.push({
        title: 'Pin your first memory location',
        description: 'Map moments make your travel story much easier to revisit.',
        route: '/map',
        cta: 'Open map',
      });
    }

    if (!this.allTrips.some((t) => t.isPublic) && this.allTrips.length > 0) {
      actions.push({
        title: 'Share one trip publicly',
        description: 'Turn your best trip into a public journal link.',
        route: '/trips',
        cta: 'Manage sharing',
      });
    }

    if (!actions.length) {
      actions.push({
        title: 'Keep your streak going',
        description: 'Add a fresh memory to maintain travel momentum.',
        route: '/timeline',
        cta: 'Add memory',
      });
    }

    return actions.slice(0, 3);
  }

  private loadDashboard() {
    let pending = 4;
    const done = () => {
      pending -= 1;
      if (pending <= 0) this.loading = false;
    };

    this.tripService.getTrips({ limit: 8 }).subscribe({
      next: ({ trips }) => {
        this.allTrips = trips;
        this.recentTrips = trips.slice(0, 4);
        this.activeTrip = trips.find((t) => t.status === 'ACTIVE') ?? null;
        this.draftTrip = trips.find((t) => t.status === 'DRAFT') ?? null;
        done();
      },
      error: () => done(),
    });

    this.geoService.getStats().subscribe({
      next: ({ stats }) => {
        this.geoStats = stats;
        done();
      },
      error: () => done(),
    });

    this.timelineService.getStats().subscribe({
      next: ({ stats }) => {
        this.timelineStats = stats;
        done();
      },
      error: () => done(),
    });

    this.timelineService.getTimeline({ page: 1, limit: 3 }).subscribe({
      next: ({ entries }) => {
        this.latestMemories = entries;
        done();
      },
      error: () => done(),
    });
  }
}
