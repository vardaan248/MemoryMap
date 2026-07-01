import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareService } from '../../../core/services/share.service';

@Component({
  selector: 'app-share-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="onClose()">
      <div class="modal" (click)="$event.stopPropagation()">

        <div class="modal-header">
          <h3>Share this trip</h3>
          <button class="close-btn" (click)="onClose()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Private warning -->
        <div class="private-notice" *ngIf="!isPublic">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <div>
            <p>This trip is private.</p>
            <small>Enable public sharing in the trip settings to share with others.</small>
          </div>
        </div>

        <!-- Share URL -->
        <div class="url-section" *ngIf="isPublic">
          <label class="section-label">Share link</label>
          <div class="url-row">
            <input type="text" [value]="shareUrl" readonly class="url-input"/>
            <button class="copy-btn" [class.copied]="copied" (click)="copy()">
              <svg *ngIf="!copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              <svg *ngIf="copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
        </div>

        <!-- Social share buttons -->
        <div class="social-section" *ngIf="isPublic">
          <label class="section-label">Share on</label>
          <div class="social-grid">
            <a [href]="whatsappUrl" target="_blank" rel="noopener" class="social-btn social-btn--whatsapp">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.49"/>
              </svg>
              WhatsApp
            </a>
            <a [href]="twitterUrl" target="_blank" rel="noopener" class="social-btn social-btn--twitter">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X / Twitter
            </a>
            <a [href]="facebookUrl" target="_blank" rel="noopener" class="social-btn social-btn--facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>
          </div>
        </div>

        <!-- QR Code -->
        <div class="qr-section" *ngIf="isPublic">
          <label class="section-label">QR code</label>
          <div class="qr-wrap">
            <img [src]="qrUrl" alt="QR Code" class="qr-img" width="140" height="140"/>
            <p class="qr-hint">Scan to open on any device</p>
          </div>
        </div>

        <!-- Close -->
        <button class="done-btn" (click)="onClose()">Done</button>

      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(15,15,25,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 20px;
      backdrop-filter: blur(2px);
    }
    .modal {
      background: #fff; border-radius: 18px; padding: 28px;
      width: 100%; max-width: 420px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.18);
      animation: popIn 0.2s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes popIn {
      from { opacity:0; transform: scale(0.94) translateY(10px); }
      to   { opacity:1; transform: scale(1) translateY(0); }
    }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 20px;
      h3 { font-family:'Playfair Display',Georgia,serif; font-size:20px; font-weight:700; color:#1a1a2e; margin:0; }
    }
    .close-btn {
      width:32px; height:32px; border-radius:8px; border:1px solid #e2e0db;
      background:#f8f7f4; color:#6a6a7a; cursor:pointer; display:flex;
      align-items:center; justify-content:center; transition:all 0.15s;
      &:hover { background:#f0ede6; color:#1a1a2e; }
    }
    .private-notice {
      display:flex; gap:12px; align-items:flex-start; padding:14px;
      background:#fdf6ec; border:1px solid #f0dfc0; border-radius:10px;
      margin-bottom:20px; color:#c8a97e;
      p { font-size:14px; font-weight:600; color:#1a1a2e; margin:0 0 3px; }
      small { font-size:12px; color:#8a8a9a; }
    }
    .section-label {
      display:block; font-size:11px; font-weight:600; text-transform:uppercase;
      letter-spacing:0.08em; color:#a0a0b0; margin-bottom:8px;
    }
    .url-section { margin-bottom:20px; }
    .url-row { display:flex; gap:8px; }
    .url-input {
      flex:1; padding:9px 12px; font-size:12px; color:#3a3a4a;
      background:#f8f7f4; border:1.5px solid #e2e0db; border-radius:9px;
      outline:none; font-family:monospace; min-width:0;
    }
    .copy-btn {
      display:inline-flex; align-items:center; gap:5px; padding:9px 14px;
      font-size:13px; font-weight:600; border:none; border-radius:9px;
      cursor:pointer; white-space:nowrap; transition:all 0.15s;
      background:#1a1a2e; color:#fff;
      &.copied { background:#10b981; }
      &:hover:not(.copied) { background:#2a2a3e; }
    }
    .social-section { margin-bottom:20px; }
    .social-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
    .social-btn {
      display:flex; align-items:center; justify-content:center; gap:6px;
      padding:10px 8px; border-radius:10px; font-size:12px; font-weight:600;
      text-decoration:none; transition:all 0.15s;
    }
    .social-btn--whatsapp { background:#d1fae5; color:#065f46; }
    .social-btn--whatsapp:hover { background:#a7f3d0; }
    .social-btn--twitter { background:#f1f5f9; color:#0f172a; }
    .social-btn--twitter:hover { background:#e2e8f0; }
    .social-btn--facebook { background:#dbeafe; color:#1e40af; }
    .social-btn--facebook:hover { background:#bfdbfe; }
    .qr-section { margin-bottom:20px; }
    .qr-wrap { display:flex; flex-direction:column; align-items:center; gap:8px; }
    .qr-img { border-radius:10px; border:1px solid #e8e4dc; }
    .qr-hint { font-size:12px; color:#a0a0b0; }
    .done-btn {
      width:100%; padding:11px; background:#f8f7f4; border:1px solid #e2e0db;
      border-radius:10px; font-size:14px; font-weight:600; color:#3a3a4a;
      cursor:pointer; transition:all 0.15s;
      &:hover { background:#f0ede6; border-color:#d0cdc6; }
    }
  `],
})
export class ShareModalComponent implements OnInit {
  @Input() slug = '';
  @Input() title = '';
  @Input() isPublic = false;
  @Output() closed = new EventEmitter<void>();

  shareUrl = '';
  twitterUrl = '';
  whatsappUrl = '';
  facebookUrl = '';
  qrUrl = '';
  copied = false;

  constructor(private shareService: ShareService) {}

  ngOnInit() {
    this.shareUrl = this.shareService.getShareUrl(this.slug);
    this.twitterUrl = this.shareService.twitterShareUrl(this.shareUrl, this.title);
    this.whatsappUrl = this.shareService.whatsappShareUrl(this.shareUrl, this.title);
    this.facebookUrl = this.shareService.facebookShareUrl(this.shareUrl);
    this.qrUrl = this.shareService.qrCodeUrl(this.shareUrl);
  }

  async copy() {
    const ok = await this.shareService.copyToClipboard(this.shareUrl);
    if (ok) {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2500);
    }
  }

  onClose() {
    this.closed.emit();
  }
}
