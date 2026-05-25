import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../core/services/job.service';
import { Job, JOB_CATEGORIES, JOB_TYPES } from '../../core/models';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="container">
        <div class="page-header fade-in">
          <div>
            <h1>Browse <span class="gradient-text">Jobs</span></h1>
            <p class="page-subtitle">{{ loading ? 'Loading...' : jobs.length + ' opportunities found' }}</p>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters-bar fade-in delay-1">
          <div class="filter-field">
            <span class="material-icons-round">search</span>
            <input class="filter-input" type="text" [(ngModel)]="filters.keyword" placeholder="Keyword..." (input)="applyFilters()">
          </div>
          <div class="filter-sep"></div>
          <div class="filter-field">
            <span class="material-icons-round">category</span>
            <select class="filter-input" [(ngModel)]="filters.category" (change)="applyFilters()">
              <option value="">All Categories</option>
              <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="filter-sep"></div>
          <div class="filter-field">
            <span class="material-icons-round">location_on</span>
            <input class="filter-input" type="text" [(ngModel)]="filters.location" placeholder="Location..." (input)="applyFilters()">
          </div>
          <div class="filter-sep"></div>
          <div class="filter-field">
            <span class="material-icons-round">work</span>
            <select class="filter-input" [(ngModel)]="filters.type" (change)="applyFilters()">
              <option [ngValue]="null">All Types</option>
              <option *ngFor="let t of jobTypes" [ngValue]="t.value">{{ t.label }}</option>
            </select>
          </div>
          <button class="btn btn-ghost btn-sm reset-btn" (click)="resetFilters()">
            <span class="material-icons-round">refresh</span> Reset
          </button>
        </div>

        <!-- Jobs Grid -->
        <div class="jobs-grid" *ngIf="!loading">
          <div class="job-card card fade-in" *ngFor="let job of jobs; let i = index"
               [class]="i < 6 ? 'delay-' + (i+1) : ''"
               [routerLink]="['/jobs', job.id]">
            <div class="job-card-top">
              <div class="company-logo">{{ job.company[0] }}</div>
              <span class="badge" [class]="getJobTypeBadge(job.jobType)">{{ job.jobType }}</span>
            </div>
            <h3 class="job-title">{{ job.title }}</h3>
            <p class="job-company">{{ job.company }}</p>
            <div class="job-details">
              <span class="detail"><span class="material-icons-round">location_on</span> {{ job.location }}</span>
              <span class="detail"><span class="material-icons-round">folder</span> {{ job.category }}</span>
              <span class="detail" *ngIf="job.salaryMin">
                <span class="material-icons-round">payments</span> \${{ job.salaryMin | number }}<span *ngIf="job.salaryMax"> – \${{ job.salaryMax | number }}</span>
              </span>
            </div>
            <div class="job-footer">
              <span class="app-count"><span class="material-icons-round">group</span> {{ job.applicationCount }} applicants</span>
              <span class="view-btn">View →</span>
            </div>
          </div>
        </div>

        <div class="spinner" *ngIf="loading"></div>

        <div class="empty-state" *ngIf="!loading && jobs.length === 0">
          <span class="material-icons-round">search_off</span>
          <h3>No jobs found</h3>
          <p>Try adjusting your filters or search terms</p>
          <button class="btn btn-outline" style="margin-top:16px" (click)="resetFilters()">Reset Filters</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 48px 0 96px; }
    .page-header { margin-bottom: 28px; }
    h1 { font-size: clamp(28px, 5vw, 42px); margin-bottom: 6px; }
    .page-subtitle { color: var(--text-secondary); font-size: 15px; }

    .filters-bar {
      display: flex;
      align-items: center;
      background: #fff;
      border: 1.5px solid rgba(124,58,237,0.12);
      border-radius: var(--radius-xl);
      padding: 10px 16px;
      margin-bottom: 36px;
      gap: 0;
      box-shadow: var(--shadow-sm);
      flex-wrap: wrap;
      transition: var(--transition);
      &:focus-within {
        border-color: rgba(124,58,237,0.3);
        box-shadow: var(--shadow-md);
      }
    }
    .filter-field {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 130px;
      padding: 6px 12px;
      .material-icons-round { color: var(--accent); font-size: 18px; flex-shrink: 0; }
    }
    .filter-input {
      background: none;
      border: none;
      outline: none;
      font-size: 14px;
      color: var(--text-primary);
      font-family: inherit;
      width: 100%;
      &::placeholder { color: var(--text-muted); }
      option { background: #fff; color: var(--text-primary); }
    }
    .filter-sep { width: 1px; height: 28px; background: rgba(124,58,237,0.1); flex-shrink: 0; margin: 0 4px; }
    .reset-btn { flex-shrink: 0; margin-left: 8px; color: var(--text-muted); }

    .jobs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

    .job-card {
      padding: 22px;
      cursor: pointer;
      &:hover .job-title { color: var(--primary); }
      &:hover .view-btn { color: var(--primary-dark); transform: translateX(3px); }
      &:hover .company-logo { transform: scale(1.06); }
    }
    .job-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .company-logo {
      width: 44px; height: 44px;
      background: linear-gradient(135deg, var(--primary), #a855f7);
      border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 18px;
      color: #fff;
      transition: var(--transition-spring);
    }
    .job-title { font-size: 16px; font-weight: 600; margin-bottom: 4px; transition: var(--transition); color: var(--text-primary); }
    .job-company { font-size: 13px; color: var(--text-secondary); margin-bottom: 14px; }
    .job-details { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .detail {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; color: var(--text-muted);
      .material-icons-round { font-size: 15px; color: var(--accent); }
    }
    .job-footer {
      display: flex; align-items: center; justify-content: space-between;
      border-top: 1px solid var(--border); padding-top: 12px;
      font-size: 12px; color: var(--text-muted);
    }
    .app-count { display: flex; align-items: center; gap: 4px; .material-icons-round { font-size: 14px; } }
    .view-btn { color: var(--primary); font-weight: 700; font-size: 13px; transition: var(--transition); }

    @media (max-width: 900px) { .jobs-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) {
      .jobs-grid { grid-template-columns: 1fr; }
      .filters-bar { border-radius: var(--radius-lg); padding: 12px; flex-direction: column; align-items: stretch; }
      .filter-field { padding: 8px 4px; min-width: 0; }
      .filter-sep { width: 100%; height: 1px; margin: 4px 0; }
      .reset-btn { margin-left: 0; margin-top: 4px; }
    }
  `]
})
export class JobsComponent implements OnInit {
  jobs: Job[] = [];
  loading = true;
  categories = JOB_CATEGORIES;
  jobTypes = JOB_TYPES;
  filters = { keyword: '', category: '', location: '', type: null as number | null };

  private debounceTimer: any;

  constructor(private jobService: JobService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.filters.keyword = params['keyword'] || '';
      this.filters.category = params['category'] || '';
      this.filters.location = params['location'] || '';
      this.loadJobs();
    });
  }

  loadJobs(): void {
    this.loading = true;
    const f = this.filters;
    this.jobService.getJobs({
      keyword: f.keyword || undefined,
      category: f.category || undefined,
      location: f.location || undefined,
      type: f.type ?? undefined
    }).subscribe({
      next: jobs => { this.jobs = jobs; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.loadJobs(), 400);
  }

  resetFilters(): void {
    this.filters = { keyword: '', category: '', location: '', type: null };
    this.loadJobs();
  }

  getJobTypeBadge(type: string): string {
    const map: Record<string, string> = {
      'Remote': 'badge-accent', 'FullTime': 'badge-success',
      'PartTime': 'badge-warning', 'Internship': 'badge-primary', 'Contract': 'badge-muted'
    };
    return map[type] || 'badge-muted';
  }
}
