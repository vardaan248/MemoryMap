import { createAction, props } from '@ngrx/store';
import { User, LoginPayload, RegisterPayload } from './auth.models';

export const authInitialized = createAction(
  '[Auth] Initialized',
  props<{ user: User | null }>()
);

// Login
export const login = createAction('[Auth] Login', props<{ payload: LoginPayload }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ user: User }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

// Register
export const register = createAction('[Auth] Register', props<{ payload: RegisterPayload }>());
export const registerSuccess = createAction('[Auth] Register Success', props<{ user: User }>());
export const registerFailure = createAction('[Auth] Register Failure', props<{ error: string }>());

// User
export const loadUserSuccess = createAction('[Auth] Load User Success', props<{ user: User }>());

// Logout
export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');
