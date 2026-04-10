import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.models';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectCurrentUser = createSelector(selectAuthState, (s) => s.user);
export const selectIsAuthenticated = createSelector(selectAuthState, (s) => !!s.user);
export const selectAuthLoading = createSelector(selectAuthState, (s) => s.loading);
export const selectAuthError = createSelector(selectAuthState, (s) => s.error);
export const selectAuthInitialized = createSelector(selectAuthState, (s) => s.initialized);
