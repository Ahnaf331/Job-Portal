import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="bg-orb bg-orb-1"></div>
        <div class="bg-orb bg-orb-2"></div>
      </div>

      <div class="auth-card scale-in">
        <div class="auth-logo">
          <span>⚡</span>
          <span class="logo-text">HireFlow</span>
        </div>
        <h2>Welcome Back</h2>
        <p class="auth-subtitle">Sign in to your account to continue</p>

        <div class="alert alert-error" *ngIf="error">{{ error }}</div>

        <div class="form-group">
          <label>Email</label>
          <input class="form-control" type="email" [(ngModel)]="form.email" placeholder="you@example.com" (keyup.enter)="login()">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input class="form-control" type="password" [(ngModel)]="form.password" placeholder="••••••••" (keyup.enter)="login()">
        </div>

        <button class="btn btn-primary submit-btn" (click)="login()" [disabled]="loading">
          <span class="material-icons-round" *ngIf="!loading">login</span>
          <span class="btn-spinner" *ngIf="loading"></span>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>

        <p class="auth-switch">Don't have an account? <a routerLink="/auth/register">Create one →</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 68px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      position: relative;
      background: linear-gradient(160deg, #f0ebff 0%, #faf8ff 50%, #f0f4ff 100%);
      overflow: hidden;
    }
    .auth-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
    .bg-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
    }
    .bg-orb-1 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(124,58,237,0.16) 0%, transparent 70%);
      top: -200px; right: -100px;
      animation: floatRotate 12s ease-in-out infinite;
    }
    .bg-orb-2 {
      width: 350px; height: 350px;
      background: radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%);
      bottom: -100px; left: -80px;
      animation: floatRotate 14s ease-in-out infinite reverse;
    }
    .auth-card {
      position: relative;
      width: 100%;
      max-width: 440px;
      background: #fff;
      border-radius: 24px;
      padding: 44px;
      box-shadow: 0 20px 60px rgba(124,58,237,0.14), 0 4px 16px rgba(0,0,0,0.06);
      border: 1px solid rgba(124,58,237,0.1);
    }
    .auth-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 700;
      font-family: 'Space Grotesk', sans-serif;
      margin-bottom: 28px;
    }
    .logo-text {
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    h2 { font-size: 26px; margin-bottom: 6px; color: var(--text-primary); }
    .auth-subtitle { color: var(--text-secondary); margin-bottom: 28px; font-size: 14px; }

    .submit-btn {
      width: 100%;
      justify-content: center;
      padding: 14px;
      font-size: 15px;
      border-radius: var(--radius-md);
      margin-top: 4px;
    }
    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      flex-shrink: 0;
    }
    .auth-switch {
      text-align: center;
      margin-top: 22px;
      font-size: 14px;
      color: var(--text-secondary);
      a { color: var(--primary); font-weight: 600; &:hover { text-decoration: underline; } }
    }

    @media (max-width: 480px) {
      .auth-card { padding: 32px 24px; }
    }
  `]
})
export class LoginComponent {
  form = { email: '', password: '' };
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  login(): void {
    if (!this.form.email || !this.form.password) { this.error = 'Please fill in all fields.'; return; }
    this.loading = true;
    this.error = '';
    this.auth.login(this.form).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => { this.loading = false; this.error = err?.error?.message || 'Invalid credentials.'; }
    });
  }
}
