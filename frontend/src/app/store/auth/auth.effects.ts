import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { switchMap, map, catchError, of, tap } from 'rxjs';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../core/services/auth.service';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ payload }) =>
        this.authService.login(payload).pipe(
          map((res) => AuthActions.loginSuccess({ user: res.user })),
          catchError((err) =>
            of(AuthActions.loginFailure({
              error: err.error?.error ?? 'Login failed. Please try again.',
            }))
          )
        )
      )
    )
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ payload }) =>
        this.authService.register(payload).pipe(
          map((res) => AuthActions.registerSuccess({ user: res.user })),
          catchError((err) =>
            of(AuthActions.registerFailure({
              error: err.error?.error ?? 'Registration failed. Please try again.',
            }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
        tap(() => this.router.navigate(['/dashboard']))
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => this.authService.logout())
      ),
    { dispatch: false }
  );
}
