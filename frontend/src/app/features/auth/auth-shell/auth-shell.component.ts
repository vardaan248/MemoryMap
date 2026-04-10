import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-shell">
      <!-- Left panel: brand + illustration -->
      <div class="auth-panel auth-panel--brand">
        <div class="brand-content">
          <div class="brand-logo">
            <span class="logo-star">✦</span>
            <span class="logo-name">MemoryMap</span>
          </div>
          <div class="brand-headline">
            <h1>Every journey<br>deserves a story.</h1>
            <p>Log your travels, pin your memories, and share the world you've explored.</p>
          </div>
          <!-- Decorative world dots map -->
          <div class="world-dots" aria-hidden="true">
            <svg viewBox="0 0 520 280" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Scattered dots representing world map -->
              <g opacity="0.5">
                <!-- North America -->
                <circle cx="80" cy="80" r="2" fill="#c8a97e"/><circle cx="95" cy="72" r="1.5" fill="#c8a97e"/>
                <circle cx="110" cy="68" r="2" fill="#c8a97e"/><circle cx="120" cy="75" r="1.5" fill="#c8a97e"/>
                <circle cx="100" cy="88" r="2" fill="#c8a97e"/><circle cx="115" cy="90" r="1.5" fill="#c8a97e"/>
                <circle cx="90" cy="100" r="2" fill="#c8a97e"/><circle cx="105" cy="100" r="1.5" fill="#c8a97e"/>
                <circle cx="85" cy="110" r="1.5" fill="#c8a97e"/><circle cx="95" cy="115" r="1.5" fill="#c8a97e"/>
                <!-- South America -->
                <circle cx="115" cy="140" r="2" fill="#c8a97e"/><circle cx="125" cy="148" r="1.5" fill="#c8a97e"/>
                <circle cx="120" cy="160" r="2" fill="#c8a97e"/><circle cx="115" cy="172" r="1.5" fill="#c8a97e"/>
                <circle cx="120" cy="185" r="2" fill="#c8a97e"/>
                <!-- Europe -->
                <circle cx="225" cy="62" r="2" fill="#c8a97e"/><circle cx="238" cy="58" r="1.5" fill="#c8a97e"/>
                <circle cx="248" cy="62" r="2" fill="#c8a97e"/><circle cx="255" cy="68" r="1.5" fill="#c8a97e"/>
                <circle cx="235" cy="70" r="2" fill="#c8a97e"/><circle cx="245" cy="75" r="1.5" fill="#c8a97e"/>
                <circle cx="230" cy="78" r="1.5" fill="#c8a97e"/>
                <!-- Africa -->
                <circle cx="238" cy="100" r="2" fill="#c8a97e"/><circle cx="248" cy="108" r="2" fill="#c8a97e"/>
                <circle cx="242" cy="120" r="2" fill="#c8a97e"/><circle cx="248" cy="132" r="1.5" fill="#c8a97e"/>
                <circle cx="242" cy="145" r="2" fill="#c8a97e"/><circle cx="248" cy="158" r="1.5" fill="#c8a97e"/>
                <circle cx="240" cy="168" r="1.5" fill="#c8a97e"/>
                <!-- Asia -->
                <circle cx="290" cy="55" r="2" fill="#c8a97e"/><circle cx="308" cy="50" r="1.5" fill="#c8a97e"/>
                <circle cx="325" cy="52" r="2" fill="#c8a97e"/><circle cx="342" cy="55" r="2" fill="#c8a97e"/>
                <circle cx="355" cy="60" r="1.5" fill="#c8a97e"/><circle cx="368" cy="58" r="2" fill="#c8a97e"/>
                <circle cx="300" cy="68" r="2" fill="#c8a97e"/><circle cx="318" cy="65" r="2" fill="#c8a97e"/>
                <circle cx="335" cy="68" r="1.5" fill="#c8a97e"/><circle cx="350" cy="72" r="2" fill="#c8a97e"/>
                <circle cx="362" cy="70" r="1.5" fill="#c8a97e"/><circle cx="375" cy="65" r="2" fill="#c8a97e"/>
                <circle cx="388" cy="68" r="1.5" fill="#c8a97e"/><circle cx="310" cy="80" r="2" fill="#c8a97e"/>
                <circle cx="325" cy="82" r="1.5" fill="#c8a97e"/><circle cx="340" cy="85" r="2" fill="#c8a97e"/>
                <circle cx="355" cy="88" r="2" fill="#c8a97e"/><circle cx="370" cy="85" r="1.5" fill="#c8a97e"/>
                <circle cx="382" cy="80" r="2" fill="#c8a97e"/><circle cx="395" cy="75" r="1.5" fill="#c8a97e"/>
                <!-- India -->
                <circle cx="318" cy="100" r="2" fill="#c8a97e"/><circle cx="328" cy="108" r="1.5" fill="#c8a97e"/>
                <circle cx="322" cy="118" r="2" fill="#c8a97e"/>
                <!-- Southeast Asia -->
                <circle cx="368" cy="105" r="2" fill="#c8a97e"/><circle cx="380" cy="110" r="1.5" fill="#c8a97e"/>
                <circle cx="390" cy="118" r="2" fill="#c8a97e"/><circle cx="400" cy="125" r="1.5" fill="#c8a97e"/>
                <!-- Australia -->
                <circle cx="395" cy="175" r="2" fill="#c8a97e"/><circle cx="410" cy="168" r="1.5" fill="#c8a97e"/>
                <circle cx="420" cy="178" r="2" fill="#c8a97e"/><circle cx="408" cy="185" r="1.5" fill="#c8a97e"/>
                <circle cx="418" cy="192" r="2" fill="#c8a97e"/>
              </g>
              <!-- Glowing highlight dots for featured locations -->
              <circle cx="245" cy="68" r="4" fill="#c8a97e" opacity="0.9"/>
              <circle cx="245" cy="68" r="7" fill="#c8a97e" opacity="0.2"/>
              <circle cx="355" cy="62" r="4" fill="#c8a97e" opacity="0.9"/>
              <circle cx="355" cy="62" r="7" fill="#c8a97e" opacity="0.2"/>
              <circle cx="100" cy="85" r="4" fill="#c8a97e" opacity="0.9"/>
              <circle cx="100" cy="85" r="7" fill="#c8a97e" opacity="0.2"/>
              <circle cx="415" cy="180" r="4" fill="#c8a97e" opacity="0.9"/>
              <circle cx="415" cy="180" r="7" fill="#c8a97e" opacity="0.2"/>
            </svg>
          </div>
          <!-- Floating stats -->
          <div class="brand-stats">
            <div class="stat">
              <span class="stat-value">195</span>
              <span class="stat-label">Countries</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">∞</span>
              <span class="stat-label">Memories</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">1</span>
              <span class="stat-label">You</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right panel: auth forms -->
      <div class="auth-panel auth-panel--form">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .auth-shell {
      display: flex;
      min-height: 100vh;
      background: #f8f7f4;
    }

    /* ── Left Brand Panel ── */
    .auth-panel--brand {
      flex: 1;
      background: #0f0f1a;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        bottom: -120px;
        right: -120px;
        width: 380px;
        height: 380px;
        background: radial-gradient(circle, rgba(200,169,126,0.12) 0%, transparent 70%);
        pointer-events: none;
      }
    }

    .brand-content {
      max-width: 500px;
      width: 100%;
      position: relative;
      z-index: 1;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 52px;
    }

    .logo-star {
      font-size: 22px;
      color: #c8a97e;
    }

    .logo-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.02em;
    }

    .brand-headline {
      margin-bottom: 40px;

      h1 {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: clamp(32px, 3.5vw, 46px);
        font-weight: 700;
        color: #fff;
        line-height: 1.15;
        margin: 0 0 16px;
        letter-spacing: -0.01em;
      }

      p {
        font-size: 15px;
        color: rgba(255,255,255,0.5);
        line-height: 1.7;
        margin: 0;
        max-width: 340px;
      }
    }

    .world-dots {
      width: 100%;
      margin-bottom: 36px;
      opacity: 0.9;

      svg { width: 100%; height: auto; }
    }

    .brand-stats {
      display: flex;
      align-items: center;
      gap: 0;
      padding: 20px 24px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }

    .stat {
      flex: 1;
      text-align: center;

      .stat-value {
        display: block;
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 26px;
        font-weight: 700;
        color: #c8a97e;
        line-height: 1;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 11px;
        color: rgba(255,255,255,0.35);
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }
    }

    .stat-divider {
      width: 1px;
      height: 36px;
      background: rgba(255,255,255,0.1);
    }

    /* ── Right Form Panel ── */
    .auth-panel--form {
      width: 480px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 40px;
      background: #f8f7f4;
    }

    /* ── Mobile ── */
    @media (max-width: 900px) {
      .auth-panel--brand { display: none; }
      .auth-panel--form {
        width: 100%;
        padding: 40px 24px;
      }
    }
  `],
})
export class AuthShellComponent {}
