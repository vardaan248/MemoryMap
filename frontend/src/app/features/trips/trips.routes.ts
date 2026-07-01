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
  {
    path: ':tripId/entries/new',
    loadComponent: () => import('./trip-detail/entry-editor.component').then(m => m.EntryEditorComponent),
  },
  {
    path: ':tripId/entries/:id/edit',
    loadComponent: () => import('./trip-detail/entry-editor.component').then(m => m.EntryEditorComponent),
  },
];
