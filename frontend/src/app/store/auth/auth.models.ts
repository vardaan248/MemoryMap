// ── Models ────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  isPublic?: boolean;
  totalTrips?: number;
  totalCountries?: number;
  totalPhotos?: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}
