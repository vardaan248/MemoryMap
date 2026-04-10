import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, tap, catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import * as AuthActions from '../../store/auth/auth.actions';
import { User, AuthResponse, LoginPayload, RegisterPayload } from '../../store/auth/auth.models';

const TOKEN_KEY = 'wl_access';
const REFRESH_KEY = 'wl_refresh';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private store: Store
  ) {}

  // ── Token helpers (in-memory preferred, localStorage as persistence) ──
  private _accessToken: string | null = null;

  getAccessToken(): string | null {
    return this._accessToken ?? localStorage.getItem(TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this._accessToken = accessToken;
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }

  clearTokens(): void {
    this._accessToken = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  // ── Initialize auth state on app boot ────────────────
  initializeAuth(): void {
    const token = this.getAccessToken();
    if (!token) {
      this.store.dispatch(AuthActions.authInitialized({ user: null }));
      return;
    }
    this.fetchCurrentUser().subscribe({
      next: (user) => this.store.dispatch(AuthActions.authInitialized({ user })),
      error: () => {
        this.clearTokens();
        this.store.dispatch(AuthActions.authInitialized({ user: null }));
      },
    });
  }

  // ── Handle Google OAuth callback (token params in URL) ─
  handleOAuthCallback(accessToken: string, refreshToken: string): void {
    this.setTokens(accessToken, refreshToken);
    this.fetchCurrentUser().subscribe({
      next: (user) => {
        this.store.dispatch(AuthActions.loginSuccess({ user }));
        this.router.navigate(['/dashboard']);
      },
      error: () => this.router.navigate(['/auth/login']),
    });
  }

  // ── Auth endpoints ────────────────────────────────────
  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap((res) => this.setTokens(res.accessToken, res.refreshToken))
    );
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((res) => this.setTokens(res.accessToken, res.refreshToken))
    );
  }

  refreshAccessToken(): Observable<{ accessToken: string; refreshToken: string }> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<{ accessToken: string; refreshToken: string }>(`${this.apiUrl}/refresh`, {
        refreshToken,
      })
      .pipe(
        tap((res) => this.setTokens(res.accessToken, res.refreshToken)),
        catchError((err) => {
          this.logout();
          return throwError(() => err);
        })
      );
  }

  fetchCurrentUser(): Observable<User> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/me`).pipe(
      tap(({ user }) =>
        this.store.dispatch(AuthActions.loadUserSuccess({ user }))
      ),
      // unwrap to just the user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (source) => new Observable<User>((obs) =>
        source.subscribe({
          next: ({ user }) => obs.next(user),
          error: (e) => obs.error(e),
          complete: () => obs.complete(),
        })
      )
    );
  }

  redirectToGoogle(): void {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    // Fire and forget
    this.http
      .post(`${this.apiUrl}/logout`, { refreshToken })
      .subscribe({ error: () => {} });

    this.clearTokens();
    this.store.dispatch(AuthActions.logoutSuccess());
    this.router.navigate(['/auth/login']);
  }
}
