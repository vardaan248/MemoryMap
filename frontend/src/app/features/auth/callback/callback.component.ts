import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-wrap">
      <div class="callback-card" *ngIf="!error; else errorState">
        <div class="spinner-ring"></div>
        <p>Signing you in...</p>
      </div>
      <ng-template #errorState>
        <div class="callback-card callback-card--error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>Authentication failed. <a routerLink="/auth/login">Try again</a></p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .callback-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f8f7f4;
    }
    .callback-card {
      text-align: center;
      padding: 48px;
      p { font-size: 15px; color: #7a7a8a; margin-top: 16px; }
      a { color: #c8a97e; text-decoration: none; }
    }
    .callback-card--error svg { color: #e05a5a; }
    .spinner-ring {
      width: 40px;
      height: 40px;
      border: 3px solid #e8e6e1;
      border-top-color: #c8a97e;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class CallbackComponent implements OnInit {
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!accessToken || !refreshToken) {
      this.error = true;
      return;
    }

    // Clear tokens from URL immediately for security
    this.router.navigate([], { replaceUrl: true, queryParams: {} });

    this.authService.handleOAuthCallback(accessToken, refreshToken);
  }
}
