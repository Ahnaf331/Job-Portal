import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, AsyncPipe],
  template: `
    <nav class="navbar">
      <div class="container nav-inner">
        <a routerLink="/" class="logo">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">HireFlow</span>
        </a>

        <div class="nav-links" [class.open]="menuOpen">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link" (click)="menuOpen=false">Home</a>
          <a routerLink="/jobs" routerLinkActive="active" class="nav-link" (click)="menuOpen=false">Browse Jobs</a>
          <a *ngIf="auth.isLoggedIn" routerLink="/dashboard" routerLinkActive="active" class="nav-link" (click)="menuOpen=false">Dashboard</a>

          <!-- Mobile auth actions -->
          <div class="mobile-actions" *ngIf="menuOpen">
            <ng-container *ngIf="auth.currentUser$ | async as user; else mobileGuest">
              <div class="user-pill">
                <span class="user-avatar">{{ user.fullName[0] }}</span>
                <span class="user-name">{{ user.fullName }}</span>
                <span class="badge" [class]="user.role === 'Employer' ? 'badge-accent' : 'badge-primary'">{{ user.role }}</span>
              </div>
              <button class="btn btn-ghost btn-sm" (click)="auth.logout(); menuOpen=false">
                <span class="material-icons-round">logout</span> Logout
              </button>
            </ng-container>
            <ng-template #mobileGuest>
              <a routerLink="/auth/login" class="btn btn-ghost btn-sm" (click)="menuOpen=false">Login</a>
              <a routerLink="/auth/register" class="btn btn-primary btn-sm" (click)="menuOpen=false">Get Started</a>
            </ng-template>
          </div>
        </div>

        <div class="nav-actions">
          <ng-container *ngIf="auth.currentUser$ | async as user; else guestLinks">
            <div class="user-pill">
              <span class="user-avatar">{{ user.fullName[0] }}</span>
              <span class="user-name">{{ user.fullName }}</span>
              <span class="badge" [class]="user.role === 'Employer' ? 'badge-accent' : 'badge-primary'">{{ user.role }}</span>
            </div>
            <button class="btn btn-ghost btn-sm" (click)="auth.logout()">
              <span class="material-icons-round">logout</span> Logout
            </button>
          </ng-container>

          <ng-template #guestLinks>
            <a routerLink="/auth/login" class="btn btn-ghost btn-sm">Login</a>
            <a routerLink="/auth/register" class="btn btn-primary btn-sm">Get Started</a>
          </ng-template>
        </div>

        <button class="hamburger" [class.open]="menuOpen" (click)="menuOpen = !menuOpen" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>

      <!-- Mobile overlay -->
      <div class="mobile-menu" [class.open]="menuOpen" (click)="menuOpen=false"></div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(124, 58, 237, 0.08);
      box-shadow: 0 1px 12px rgba(124, 58, 237, 0.06);
      height: 68px;
    }
    .nav-inner {
      display: flex;
      align-items: center;
      height: 100%;
      gap: 32px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      flex-shrink: 0;
    }
    .logo-icon { font-size: 22px; }
    .logo-text {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .nav-links {
      display: flex;
      gap: 2px;
      flex: 1;
    }
    .nav-link {
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
      transition: var(--transition);
      &:hover { color: var(--primary); background: rgba(124,58,237,0.06); }
      &.active { color: var(--primary); background: rgba(124,58,237,0.08); font-weight: 600; }
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .user-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 14px;
      background: rgba(124,58,237,0.06);
      border-radius: 999px;
      border: 1px solid rgba(124,58,237,0.12);
    }
    .user-avatar {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, var(--primary), #a855f7);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
    }
    .user-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }

    /* Hamburger */
    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 36px;
      height: 36px;
      padding: 6px;
      background: none;
      border: 1.5px solid var(--border);
      border-radius: 8px;
      cursor: pointer;
      flex-shrink: 0;
      transition: var(--transition);

      span {
        display: block;
        height: 2px;
        background: var(--text-secondary);
        border-radius: 2px;
        transition: var(--transition);
        transform-origin: center;
      }

      &.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
      &.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
      &.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    }

    .mobile-menu { display: none; }
    .mobile-actions { display: none; }

    @media (max-width: 768px) {
      .hamburger { display: flex; }

      .nav-actions { display: none; }

      .nav-links {
        display: none;
        position: fixed;
        top: 68px;
        left: 0;
        right: 0;
        background: #fff;
        flex-direction: column;
        padding: 16px;
        gap: 4px;
        border-bottom: 1px solid var(--border);
        box-shadow: var(--shadow-md);
        z-index: 999;
        animation: slideInFromTop 0.25s ease;

        &.open { display: flex; }
      }

      .nav-link { padding: 12px 16px; border-radius: 10px; font-size: 15px; }

      .mobile-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
        padding-top: 12px;
        border-top: 1px solid var(--border);

        .user-pill { justify-content: center; }
        .btn { justify-content: center; }
      }

      .mobile-menu {
        display: none;
        &.open {
          display: block;
          position: fixed;
          inset: 0;
          z-index: 998;
        }
      }
    }

    @keyframes slideInFromTop {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class NavbarComponent {
  menuOpen = false;
  constructor(public auth: AuthService) {}
}
