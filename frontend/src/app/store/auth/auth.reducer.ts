import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { AuthState } from './auth.models';

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  initialized: false,
};

export const authReducer = createReducer(
  initialState,

  on(AuthActions.authInitialized, (state, { user }) => ({
    ...state,
    user,
    initialized: true,
    loading: false,
  })),

  on(AuthActions.login, AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, AuthActions.registerSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null,
  })),

  on(AuthActions.loginFailure, AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(AuthActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    user,
  })),

  on(AuthActions.logoutSuccess, () => ({
    ...initialState,
    initialized: true,
  }))
);
