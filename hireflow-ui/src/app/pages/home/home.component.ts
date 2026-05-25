import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { Job } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <!-- Hero -->
    <section class="hero">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="container hero-content">
        <div class="hero-badge fade-in">
          <span class="badge badge-primary">✨ 500+ Jobs Available</span>
        </div>
        <h1 class="fade-in delay-1">Find Your <span class="gradient-text">Dream Career</span><br>with HireFlow</h1>
        <p class="hero-subtitle fade-in delay-2">Connect with top employers. Discover opportunities that match your skills and ambitions.</p>

        <div class="search-box fade-in delay-3">
          <div class="search-field">
            <span class="material-icons-round">search</span>
            <input class="search-input" type="text" [(ngModel)]="searchKeyword" placeholder="Job title, keyword..." (keyup.enter)="search()">
          </div>
          <div class="search-divider"></div>
          <div class="search-field">
            <span class="material-icons-round">location_on</span>
            <input class="search-input" type="text" [(ngModel)]="searchLocation" placeholder="Location..." (keyup.enter)="search()">
          </div>
          <button class="btn btn-primary btn-lg search-btn" (click)="search()">
            <span class="material-icons-round">search</span> Search
          </button>
        </div>

        <div class="hero-tags fade-in delay-4">
          <span *ngFor="let cat of popularCategories; let i = index" class="hero-tag" (click)="searchByCategory(cat)">{{ cat }}</span>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-row">
          <div class="stat-item fade-in" *ngFor="let stat of stats; let i = index" [class]="'delay-' + (i+1)">
            <div class="stat-icon">{{ stat.icon }}</div>
            <div class="stat-number">{{ stat.number }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Jobs -->
    <section class="featured-section">
      <div class="container">
        <div class="section-header fade-in">
          <div>
            <h2>Latest <span class="gradient-text">Opportunities</span></h2>
            <p class="section-sub">Hand-picked jobs updated daily</p>
          </div>
          <a routerLink="/jobs" class="btn btn-outline">View All Jobs →</a>
        </div>

        <div class="jobs-preview" *ngIf="!loading">
          <div class="job-card card fade-in" *ngFor="let job of featuredJobs; let i = index"
               [class]="'delay-' + (i+1)"
               [routerLink]="['/jobs', job.id]">
            <div class="job-card-top">
              <div class="company-logo">{{ job.company[0] }}</div>
              <span class="badge" [class]="getJobTypeBadge(job.jobType)">{{ job.jobType }}</span>
            </div>
            <h3 class="job-title">{{ job.title }}</h3>
            <p class="job-company">{{ job.company }}</p>
            <div class="job-meta">
              <span><span class="material-icons-round">location_on</span> {{ job.location }}</span>
              <span *ngIf="job.salaryMin"><span class="material-icons-round">payments</span> \${{ job.salaryMin | number }}+</span>
            </div>
            <div class="job-footer">
              <span class="applicants"><span class="material-icons-round">group</span> {{ job.applicationCount }} applicants</span>
              <span class="posted-ago">{{ formatDate(job.postedAt) }}</span>
            </div>
          </div>
        </div>
        <div class="spinner" *ngIf="loading"></div>

        <div class="view-all-wrap" *ngIf="!loading">
          <a routerLink="/jobs" class="btn btn-primary btn-lg">Browse All Jobs →</a>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="categories-section">
      <div class="container">
        <div class="section-header fade-in">
          <div>
            <h2>Browse by <span class="gradient-text">Category</span></h2>
            <p class="section-sub">Find roles in your field of expertise</p>
          </div>
        </div>
        <div class="categories-grid fade-in delay-2">
          <div class="cat-card" *ngFor="let cat of allCategories" (click)="searchByCategory(cat)">
            <span class="cat-icon">{{ getCategoryIcon(cat) }}</span>
            <span class="cat-name">{{ cat }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card fade-in">
          <div class="cta-orb"></div>
          <div class="cta-content">
            <div class="cta-badge"><span class="badge badge-primary">For Employers</span></div>
            <h2>Ready to Hire the Best Talent?</h2>
            <p>Post your jobs and reach thousands of qualified candidates today.</p>
            <a routerLink="/auth/register" class="btn btn-primary btn-lg">Post a Job Free →</a>
          </div>
          <div class="cta-visual">💼</div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* ─ Hero ─ */
    .hero {
      position: relative;
      padding: 100px 0 90px;
      overflow: hidden;
      text-align: center;
      background: linear-gradient(170deg, #f0ebff 0%, #faf8ff 40%, #f9f8ff 100%);
    }
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(70px);
      pointer-events: none;
    }
    .orb-1 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%);
      top: -150px; left: -100px;
      animation: floatRotate 10s ease-in-out infinite;
    }
    .orb-2 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%);
      bottom: -100px; right: -80px;
      animation: floatRotate 13s ease-in-out infinite reverse;
    }
    .orb-3 {
      width: 300px; height: 300px;
      background: radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%);
      top: 50%; left: 50%; transform: translate(-50%, -50%);
      animation: float 8s ease-in-out infinite;
    }
    .hero-content { position: relative; max-width: 780px; margin: 0 auto; }
    .hero-badge { margin-bottom: 20px; }
    h1 {
      font-size: clamp(36px, 6vw, 64px);
      line-height: 1.1;
      margin-bottom: 20px;
      color: var(--text-primary);
      letter-spacing: -1px;
    }
    .hero-subtitle {
      font-size: 18px;
      color: var(--text-secondary);
      margin-bottom: 44px;
      max-width: 520px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.7;
    }

    /* Search box */
    .search-box {
      display: flex;
      align-items: center;
      background: #fff;
      border-radius: var(--radius-xl);
      border: 1.5px solid rgba(124,58,237,0.15);
      box-shadow: 0 8px 40px rgba(124,58,237,0.12), 0 2px 8px rgba(0,0,0,0.06);
      padding: 8px 8px 8px 0;
      margin-bottom: 28px;
      overflow: hidden;
      transition: var(--transition);
      &:focus-within {
        border-color: var(--primary);
        box-shadow: 0 8px 40px rgba(124,58,237,0.18), 0 0 0 3px rgba(124,58,237,0.08);
      }
    }
    .search-field {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      padding: 10px 16px;
      .material-icons-round { color: var(--primary-light); }
    }
    .search-input {
      background: none;
      border: none;
      outline: none;
      font-size: 15px;
      color: var(--text-primary);
      width: 100%;
      font-family: inherit;
      &::placeholder { color: var(--text-muted); }
    }
    .search-divider { width: 1px; height: 36px; background: rgba(124,58,237,0.1); flex-shrink: 0; }
    .search-btn { margin-left: 8px; flex-shrink: 0; border-radius: var(--radius-lg) !important; }

    .hero-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
    .hero-tag {
      padding: 7px 16px;
      background: rgba(255,255,255,0.8);
      border: 1.5px solid rgba(124,58,237,0.15);
      border-radius: 999px;
      font-size: 13px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: var(--transition-spring);
      font-weight: 500;
      &:hover {
        border-color: var(--primary);
        color: var(--primary);
        background: rgba(124,58,237,0.06);
        transform: translateY(-2px);
      }
    }

    /* ─ Stats ─ */
    .stats-section {
      padding: 60px 0;
      background: #fff;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 32px;
      text-align: center;
    }
    .stat-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .stat-icon { font-size: 32px; margin-bottom: 4px; }
    .stat-number {
      font-size: 36px;
      font-weight: 800;
      font-family: 'Space Grotesk', sans-serif;
      background: linear-gradient(135deg, var(--primary) 0%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .stat-label { font-size: 14px; color: var(--text-secondary); font-weight: 500; }

    /* ─ Featured ─ */
    .featured-section { padding: 96px 0 48px; }
    .section-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 44px;
    }
    .section-sub { font-size: 14px; color: var(--text-muted); margin-top: 6px; }
    .jobs-preview { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

    .job-card {
      padding: 24px;
      cursor: pointer;
      &:hover .job-title { color: var(--primary); }
      &:hover .company-logo { transform: scale(1.05); }
    }
    .job-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .company-logo {
      width: 46px; height: 46px;
      background: linear-gradient(135deg, var(--primary), #a855f7);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 20px;
      color: #fff;
      transition: var(--transition-spring);
    }
    .job-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 6px;
      transition: var(--transition);
      color: var(--text-primary);
    }
    .job-company { font-size: 14px; color: var(--text-secondary); margin-bottom: 14px; }
    .job-meta {
      display: flex;
      gap: 14px;
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 16px;
      flex-wrap: wrap;
      span { display: flex; align-items: center; gap: 4px; }
      .material-icons-round { font-size: 15px; color: var(--accent); }
    }
    .job-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--border);
      padding-top: 14px;
      font-size: 12px;
      color: var(--text-muted);
    }
    .applicants { display: flex; align-items: center; gap: 4px; .material-icons-round { font-size: 15px; } }
    .posted-ago { font-weight: 500; }

    .view-all-wrap { text-align: center; margin-top: 48px; }

    /* ─ Categories ─ */
    .categories-section { padding: 48px 0 96px; background: #fff; }
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
    }
    .cat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 22px 16px;
      background: var(--bg-base);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: var(--transition-spring);
      text-align: center;
      &:hover {
        border-color: var(--primary);
        background: rgba(124,58,237,0.05);
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
      }
    }
    .cat-icon { font-size: 28px; }
    .cat-name { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
    .cat-card:hover .cat-name { color: var(--primary); }

    /* ─ CTA ─ */
    .cta-section { padding: 0 0 96px; }
    .cta-card {
      position: relative;
      padding: 72px 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #f5f0ff 0%, #fdf4ff 50%, #f0f9ff 100%);
      border: 1.5px solid rgba(124,58,237,0.18);
      border-radius: 28px;
      overflow: hidden;
      box-shadow: var(--shadow-lg);
    }
    .cta-orb {
      position: absolute;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%);
      top: -200px; right: -100px;
      border-radius: 50%;
      pointer-events: none;
    }
    .cta-badge { margin-bottom: 16px; }
    .cta-content { position: relative; }
    .cta-content h2 { font-size: 32px; margin-bottom: 12px; color: var(--text-primary); }
    .cta-content p { color: var(--text-secondary); margin-bottom: 28px; font-size: 16px; }
    .cta-visual { font-size: 96px; opacity: 0.8; animation: float 5s ease-in-out infinite; }

    @media (max-width: 1024px) { .categories-grid { grid-template-columns: repeat(4, 1fr); } }
    @media (max-width: 900px) {
      .jobs-preview { grid-template-columns: repeat(2, 1fr); }
      .stats-row { grid-template-columns: repeat(2, 1fr); gap: 24px; }
      .cta-card { flex-direction: column; text-align: center; padding: 48px 32px; }
      .cta-visual { display: none; }
      .categories-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 640px) {
      .hero { padding: 72px 0 64px; }
      h1 { font-size: 36px; letter-spacing: -0.5px; }
      .hero-subtitle { font-size: 16px; }
      .search-box { flex-direction: column; padding: 12px; gap: 8px; border-radius: var(--radius-lg); }
      .search-divider { width: 100%; height: 1px; }
      .search-field { padding: 8px 12px; }
      .search-btn { width: 100%; justify-content: center; margin-left: 0; }
      .jobs-preview { grid-template-columns: 1fr; }
      .section-header { flex-direction: column; align-items: flex-start; gap: 16px; }
      .categories-grid { grid-template-columns: repeat(2, 1fr); }
      .cta-card { padding: 36px 24px; }
      .cta-content h2 { font-size: 24px; }
    }
  `]
})
export class HomeComponent implements OnInit {
  featuredJobs: Job[] = [];
  loading = true;
  searchKeyword = '';
  searchLocation = '';

  popularCategories = ['Technology', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Remote'];
  allCategories = ['Technology', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Sales', 'Engineering', 'Customer Support', 'Other'];

  stats = [
    { icon: '💼', number: '2,400+', label: 'Active Jobs' },
    { icon: '🏢', number: '850+', label: 'Companies' },
    { icon: '👥', number: '12K+', label: 'Candidates' },
    { icon: '✅', number: '94%', label: 'Success Rate' }
  ];

  constructor(private jobService: JobService, private router: Router) {}

  ngOnInit(): void {
    this.jobService.getJobs().subscribe({
      next: jobs => { this.featuredJobs = jobs.slice(0, 6); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  search(): void {
    this.router.navigate(['/jobs'], { queryParams: { keyword: this.searchKeyword, location: this.searchLocation } });
  }

  searchByCategory(category: string): void {
    this.router.navigate(['/jobs'], { queryParams: { category } });
  }

  getJobTypeBadge(type: string): string {
    const map: Record<string, string> = {
      'Remote': 'badge-accent', 'FullTime': 'badge-success', 'PartTime': 'badge-warning',
      'Internship': 'badge-primary', 'Contract': 'badge-muted'
    };
    return map[type] || 'badge-muted';
  }

  getCategoryIcon(cat: string): string {
    const icons: Record<string, string> = {
      'Technology': '💻', 'Design': '🎨', 'Marketing': '📣', 'Finance': '💰',
      'Healthcare': '🏥', 'Education': '📚', 'Sales': '📈', 'Engineering': '⚙️',
      'Customer Support': '🎧', 'Other': '🌐'
    };
    return icons[cat] || '💼';
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  }
}
