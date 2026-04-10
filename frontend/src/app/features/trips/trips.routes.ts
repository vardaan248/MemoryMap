import { Routes } from '@angular/router';

export const tripsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./trips-list/trips-list.component').then(m => m.TripsListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./trip-editor/trip-editor.component').then(m => m.TripEditorComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./trip-detail/trip-detail.component').then(m => m.TripDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./trip-editor/trip-editor.component').then(m => m.TripEditorComponent),
  },
];
