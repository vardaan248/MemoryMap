import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../core/services/auth.service';
import { selectAuthLoading, selectAuthError } from '../../../store/auth/auth.selectors';
import * as AuthActions from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-form-wrap">
      <div class="form-header">
        <h2>Start your journal</h2>
        <p>Create a free account and begin exploring</p>
      </div>

      <button class="btn-google" type="button" (click)="registerWithGoogle()">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div class="divider"><span>or create with email</span></div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
        <div class="field" [class.field--error]="isInvalid('name')">
          <label for="name">Full name</label>
          <input id="name" type="text" formControlName="name" placeholder="Jane Smith" autocomplete="name"/>
          <span class="field-error" *ngIf="isInvalid('name')">Name is required.</span>
        </div>

        <div class="field" [class.field--error]="isInvalid('email')">
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email" placeholder="you@example.com" autocomplete="email"/>
          <span class="field-error" *ngIf="isInvalid('email')">Enter a valid email address.</span>
        </div>

        <div class="field" [class.field--error]="isInvalid('password')">
          <label for="password">Password</label>
          <div class="input-wrap">
            <input
              id="password"
              [type]="showPw ? 'text' : 'password'"
              formControlName="password"
              placeholder="Min. 8 characters"
              autocomplete="new-password"
            />
            <button type="button" class="toggle-pw" (click)="showPw = !showPw">
              <svg *ngIf="!showPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg *ngIf="showPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </div>
          <!-- Password strength -->
          <div class="pw-strength" *ngIf="form.get('password')?.value">
            <div class="pw-bar">
              <div class="pw-bar-fill" [style.width.%]="pwStrength * 25" [attr.data-level]="pwStrength"></div>
            </div>
            <span class="pw-label">{{ pwLabels[pwStrength] }}</span>
          </div>
          <span class="field-error" *ngIf="isInvalid('password')">
            Min. 8 characters with an uppercase letter and number.
          </span>
        </div>

        <div class="api-error" *ngIf="error$ | async as err">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ err }}
        </div>

        <button type="submit" class="btn-primary" [class.loading]="loading$ | async" [disabled]="loading$ | async">
          <span *ngIf="!(loading$ | async)">Create account</span>
          <span *ngIf="loading$ | async" class="spinner"></span>
        </button>

        <p class="terms">
          By creating an account you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
        </p>
      </form>

      <p class="form-footer">
        Already have an account? <a routerLink="/auth/login">Sign in</a>
      </p>
    </div>
  `,
  styleUrls: ['../auth-forms.scss'],
})
export class RegisterComponent {
  form: FormGroup;
  showPw = false;
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);
  pwLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  constructor(private fb: FormBuilder, private store: Store, private authService: AuthService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
    });
  }

  passwordValidator(c: AbstractControl) {
    const v = c.value ?? '';
    if (!/[A-Z]/.test(v) || !/[0-9]/.test(v)) return { weak: true };
    return null;
  }

  get pwStrength(): number {
    const v = this.form.get('password')?.value ?? '';
    if (v.length === 0) return 0;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    return score;
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.store.dispatch(AuthActions.register({ payload: this.form.value }));
  }

  registerWithGoogle(): void {
    this.authService.redirectToGoogle();
  }
}
