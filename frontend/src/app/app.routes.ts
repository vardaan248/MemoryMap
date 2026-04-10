import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'trips',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/trips/trips.routes').then((m) => m.tripsRoutes),
  },
  {
    path: 'map',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/map/map.component').then((m) => m.MapComponent),
  },
  {
    path: 'timeline',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/timeline/timeline.component').then(
        (m) => m.TimelineComponent
      ),
  },
  {
    path: 'share/:slug',
    loadComponent: () =>
      import('./features/share/share.component').then((m) => m.ShareComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
