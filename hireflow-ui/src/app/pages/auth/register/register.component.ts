import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
        <h2>Create Account</h2>
        <p class="auth-subtitle">Join thousands of professionals on HireFlow</p>

        <div class="alert alert-error" *ngIf="error">{{ error }}</div>

        <div class="role-toggle">
          <button class="role-btn" [class.active]="form.role === 'Candidate'" (click)="form.role = 'Candidate'">
            <span class="role-icon">🧑‍💼</span>
            <span>Candidate</span>
          </button>
          <button class="role-btn" [class.active]="form.role === 'Employer'" (click)="form.role = 'Employer'">
            <span class="role-icon">🏢</span>
            <span>Employer</span>
          </button>
        </div>

        <div class="form-group">
          <label>Full Name</label>
          <input class="form-control" [(ngModel)]="form.fullName" placeholder="John Doe">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input class="form-control" type="email" [(ngModel)]="form.email" placeholder="you@example.com">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input class="form-control" type="password" [(ngModel)]="form.password" placeholder="Min. 6 characters" (keyup.enter)="register()">
        </div>

        <button class="btn btn-primary submit-btn" (click)="register()" [disabled]="loading">
          <span class="material-icons-round" *ngIf="!loading">person_add</span>
          <span class="btn-spinner" *ngIf="loading"></span>
          {{ loading ? 'Creating Account...' : 'Get Started' }}
        </button>

        <p class="auth-switch">Already have an account? <a routerLink="/auth/login">Sign in →</a></p>
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
      top: -200px; left: -100px;
      animation: floatRotate 12s ease-in-out infinite;
    }
    .bg-orb-2 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%);
      bottom: -150px; right: -100px;
      animation: floatRotate 15s ease-in-out infinite reverse;
    }
    .auth-card {
      position: relative;
      width: 100%;
      max-width: 460px;
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

    .role-toggle {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 28px;
    }
    .role-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 14px 12px;
      border: 1.5px solid rgba(124,58,237,0.12);
      border-radius: var(--radius-md);
      background: var(--bg-base);
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition-spring);
      font-family: inherit;

      &.active {
        border-color: var(--primary);
        background: rgba(124,58,237,0.07);
        color: var(--primary);
        box-shadow: 0 4px 16px rgba(124,58,237,0.12);
      }
      &:hover:not(.active) {
        border-color: rgba(124,58,237,0.3);
        background: rgba(124,58,237,0.03);
        transform: translateY(-1px);
      }
    }
    .role-icon { font-size: 24px; }

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
export class RegisterComponent {
  form = { fullName: '', email: '', password: '', role: 'Candidate' };
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  register(): void {
    if (!this.form.fullName || !this.form.email || !this.form.password) {
      this.error = 'Please fill in all fields.';
      return;
    }
    if (this.form.password.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.register(this.form).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => { this.loading = false; this.error = err?.error?.message || 'Registration failed. Make sure the API is running.'; }
    });
  }
}
