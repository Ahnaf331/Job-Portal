import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../core/services/job.service';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/services/auth.service';
import { Job } from '../../core/models';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="container">
        <div class="spinner" *ngIf="loading"></div>

        <ng-container *ngIf="!loading && job">
          <a routerLink="/jobs" class="back-link fade-in">
            <span class="material-icons-round">arrow_back</span> Back to Jobs
          </a>

          <div class="detail-layout">
            <div class="detail-main">
              <div class="detail-header card fade-in">
                <div class="company-logo">{{ job.company[0] }}</div>
                <div class="header-info">
                  <h1>{{ job.title }}</h1>
                  <p class="company-name">{{ job.company }}</p>
                  <div class="header-meta">
                    <span class="meta-item"><span class="material-icons-round">location_on</span> {{ job.location }}</span>
                    <span class="meta-item"><span class="material-icons-round">folder</span> {{ job.category }}</span>
                    <span class="meta-item"><span class="material-icons-round">schedule</span> {{ formatDate(job.postedAt) }}</span>
                    <span class="badge" [class]="getJobTypeBadge(job.jobType)">{{ job.jobType }}</span>
                  </div>
                </div>
              </div>

              <div class="description-card card fade-in delay-1">
                <h2>Job Description</h2>
                <div class="description">{{ job.description }}</div>
              </div>
            </div>

            <div class="detail-sidebar">
              <div class="sidebar-card card fade-in delay-2" *ngIf="job.salaryMin">
                <h3><span class="material-icons-round">payments</span> Salary Range</h3>
                <div class="salary">\${{ job.salaryMin | number }}<span *ngIf="job.salaryMax"> – \${{ job.salaryMax | number }}</span></div>
                <span class="salary-period">per year</span>
              </div>

              <div class="sidebar-card card fade-in delay-3">
                <h3>Job Details</h3>
                <div class="info-rows">
                  <div class="info-row"><span>Posted By</span><strong>{{ job.employerName }}</strong></div>
                  <div class="info-row"><span>Applicants</span><strong>{{ job.applicationCount }}</strong></div>
                  <div class="info-row" *ngIf="job.expiresAt">
                    <span>Deadline</span><strong>{{ job.expiresAt | date:'mediumDate' }}</strong>
                  </div>
                </div>
              </div>

              <div class="sidebar-card card apply-card fade-in delay-4" *ngIf="auth.isCandidate || !auth.isLoggedIn">
                <ng-container *ngIf="auth.isLoggedIn; else loginToApply">
                  <div *ngIf="job.hasApplied" class="applied-banner">
                    <span class="material-icons-round">check_circle</span> You've Applied!
                  </div>
                  <ng-container *ngIf="!job.hasApplied">
                    <h3>Apply for this Role</h3>
                    <div class="alert alert-error" *ngIf="applyError">{{ applyError }}</div>
                    <div class="alert alert-success" *ngIf="applySuccess">{{ applySuccess }}</div>

                    <div class="form-group">
                      <label>Cover Letter *</label>
                      <textarea class="form-control" [(ngModel)]="coverLetter" rows="4" placeholder="Tell them why you're the perfect fit..."></textarea>
                    </div>

                    <div class="form-group">
                      <label>CV / Resume *</label>
                      <div class="file-drop" [class.has-file]="resumeFile" (click)="fileInput.click()" (dragover)="$event.preventDefault()" (drop)="onFileDrop($event)">
                        <input #fileInput type="file" accept=".pdf,.doc,.docx" (change)="onFileChange($event)" hidden>
                        <ng-container *ngIf="!resumeFile">
                          <span class="material-icons-round file-icon">upload_file</span>
                          <p class="file-hint">Click to upload or drag & drop</p>
                          <p class="file-types">PDF, DOC, DOCX — max 5 MB</p>
                        </ng-container>
                        <ng-container *ngIf="resumeFile">
                          <span class="material-icons-round file-icon-ok">task</span>
                          <p class="file-name">{{ resumeFile.name }}</p>
                          <p class="file-size">{{ formatBytes(resumeFile.size) }}</p>
                          <button class="remove-file" (click)="removeFile($event)">✕ Remove</button>
                        </ng-container>
                      </div>
                    </div>

                    <button class="btn btn-primary apply-btn" (click)="applyNow()" [disabled]="applying">
                      <span class="material-icons-round" *ngIf="!applying">send</span>
                      <span class="btn-spinner" *ngIf="applying"></span>
                      {{ applying ? 'Submitting...' : 'Apply Now' }}
                    </button>
                  </ng-container>
                </ng-container>
                <ng-template #loginToApply>
                  <div class="login-prompt">
                    <span class="lock-icon">🔒</span>
                    <p>Login or register to apply for this job.</p>
                    <a routerLink="/auth/register" class="btn btn-primary apply-btn">Sign Up to Apply</a>
                  </div>
                </ng-template>
              </div>
            </div>
          </div>
        </ng-container>

        <div class="empty-state" *ngIf="!loading && !job">
          <span class="material-icons-round">error_outline</span>
          <h3>Job Not Found</h3>
          <a routerLink="/jobs" class="btn btn-primary" style="margin-top:16px">Browse All Jobs</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 40px 0 96px; }
    .back-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: var(--text-secondary); font-size: 14px; font-weight: 500;
      margin-bottom: 28px; transition: var(--transition);
      padding: 8px 14px;
      border-radius: var(--radius-md);
      border: 1.5px solid var(--border);
      background: #fff;
      &:hover { color: var(--primary); border-color: rgba(124,58,237,0.3); transform: translateX(-2px); }
    }
    .detail-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }

    .detail-header {
      padding: 28px;
      display: flex;
      gap: 20px;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .company-logo {
      width: 68px; height: 68px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--primary), #a855f7);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 28px;
      color: #fff;
    }
    h1 { font-size: 26px; margin-bottom: 6px; }
    .company-name { color: var(--text-secondary); font-size: 16px; margin-bottom: 14px; }
    .header-meta { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    .meta-item {
      display: flex; align-items: center; gap: 5px;
      font-size: 13px; color: var(--text-muted);
      background: var(--bg-base);
      padding: 5px 10px;
      border-radius: 999px;
      border: 1px solid var(--border);
      .material-icons-round { font-size: 15px; color: var(--accent); }
    }

    .description-card { padding: 28px; h2 { margin-bottom: 16px; font-size: 20px; } }
    .description { color: var(--text-secondary); line-height: 1.8; white-space: pre-line; }

    .sidebar-card {
      padding: 22px;
      margin-bottom: 16px;
      h3 {
        font-size: 15px;
        margin-bottom: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--text-primary);
        .material-icons-round { color: var(--primary); font-size: 18px; }
      }
    }
    .salary { font-size: 28px; font-weight: 800; color: var(--success); font-family: 'Space Grotesk', sans-serif; }
    .salary-period { font-size: 13px; color: var(--text-muted); margin-top: 4px; display: block; }
    .info-rows { display: flex; flex-direction: column; gap: 10px; }
    .info-row {
      display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary);
      padding: 8px 0;
      border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
      strong { color: var(--text-primary); font-weight: 600; }
    }

    .apply-card h3 { margin-bottom: 16px; }
    .apply-btn { width: 100%; justify-content: center; padding: 13px; }
    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      flex-shrink: 0;
    }

    .applied-banner {
      text-align: center;
      padding: 20px;
      border-radius: var(--radius-md);
      background: rgba(5,150,105,0.08);
      border: 1.5px solid rgba(5,150,105,0.2);
      color: var(--success);
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 15px;
    }

    /* File upload drop zone */
    .file-drop {
      border: 2px dashed rgba(124,58,237,0.25);
      border-radius: var(--radius-md);
      padding: 24px 16px;
      text-align: center;
      cursor: pointer;
      transition: var(--transition);
      background: var(--bg-base);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      &:hover, &:focus-within {
        border-color: var(--primary);
        background: rgba(124,58,237,0.04);
      }
      &.has-file {
        border-color: var(--success);
        border-style: solid;
        background: rgba(5,150,105,0.04);
      }
    }
    .file-icon { font-size: 36px; color: var(--primary-light); }
    .file-icon-ok { font-size: 36px; color: var(--success); }
    .file-hint { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0; }
    .file-types { font-size: 12px; color: var(--text-muted); margin: 0; }
    .file-name { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0; word-break: break-all; }
    .file-size { font-size: 12px; color: var(--success); margin: 0; }
    .remove-file {
      margin-top: 4px;
      background: none;
      border: 1px solid rgba(220,38,38,0.3);
      color: var(--danger);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 12px;
      cursor: pointer;
      transition: var(--transition);
      &:hover { background: rgba(220,38,38,0.08); }
    }

    .login-prompt {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .lock-icon { font-size: 32px; }
    .login-prompt p { color: var(--text-secondary); font-size: 14px; }

    @media (max-width: 900px) {
      .detail-layout { grid-template-columns: 1fr; }
      .detail-sidebar { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .sidebar-card { margin-bottom: 0; }
    }
    @media (max-width: 600px) {
      .detail-sidebar { grid-template-columns: 1fr; }
      .detail-header { flex-direction: column; }
      h1 { font-size: 22px; }
    }
  `]
})
export class JobDetailComponent implements OnInit {
  job: Job | null = null;
  loading = true;
  coverLetter = '';
  resumeFile: File | null = null;
  applying = false;
  applyError = '';
  applySuccess = '';

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private applicationService: ApplicationService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.jobService.getJobById(id).subscribe({
      next: job => { this.job = job; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.setFile(input.files[0]);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.setFile(file);
  }

  private setFile(file: File): void {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type) && !/\.(pdf|doc|docx)$/i.test(file.name)) {
      this.applyError = 'Only PDF, DOC, and DOCX files are allowed.';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.applyError = 'File must be under 5 MB.';
      return;
    }
    this.applyError = '';
    this.resumeFile = file;
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.resumeFile = null;
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  applyNow(): void {
    if (!this.coverLetter.trim()) { this.applyError = 'Please write a cover letter.'; return; }
    if (!this.resumeFile) { this.applyError = 'Please attach your CV/Resume.'; return; }
    this.applying = true;
    this.applyError = '';
    this.applicationService.apply({ jobId: this.job!.id, coverLetter: this.coverLetter, resume: this.resumeFile }).subscribe({
      next: () => {
        this.applying = false;
        this.applySuccess = 'Application submitted successfully!';
        if (this.job) this.job.hasApplied = true;
      },
      error: err => {
        this.applying = false;
        this.applyError = err?.error?.message || 'Failed to apply. Please try again.';
      }
    });
  }

  getJobTypeBadge(type: string): string {
    const map: Record<string, string> = {
      'Remote': 'badge-accent', 'FullTime': 'badge-success',
      'PartTime': 'badge-warning', 'Internship': 'badge-primary', 'Contract': 'badge-muted'
    };
    return map[type] || 'badge-muted';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
