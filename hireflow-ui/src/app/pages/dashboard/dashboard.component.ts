import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { JobService } from '../../core/services/job.service';
import { ApplicationService } from '../../core/services/application.service';
import { Job, Application, CreateJobRequest, InterviewInviteRequest, JOB_CATEGORIES, JOB_TYPES, APPLICATION_STATUSES } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="container">

        <!-- Header -->
        <div class="dash-header fade-in">
          <div>
            <h1>Welcome, <span class="gradient-text">{{ auth.currentUser?.fullName }}</span></h1>
            <p class="role-desc">{{ auth.isEmployer ? 'Manage your postings, review applicants and schedule interviews.' : 'Track your applications and discover new opportunities.' }}</p>
          </div>
          <button *ngIf="auth.isEmployer" class="btn btn-primary" (click)="showPostForm = !showPostForm">
            <span class="material-icons-round">{{ showPostForm ? 'close' : 'add' }}</span>
            {{ showPostForm ? 'Cancel' : 'Post New Job' }}
          </button>
        </div>

        <!-- Post Job Form -->
        <div class="post-form card fade-in" *ngIf="auth.isEmployer && showPostForm">
          <h2>Post a New Job</h2>
          <div class="divider"></div>
          <div class="alert alert-error" *ngIf="postError">{{ postError }}</div>
          <div class="form-row">
            <div class="form-group">
              <label>Job Title *</label>
              <input class="form-control" [(ngModel)]="newJob.title" placeholder="e.g. Senior Frontend Developer">
            </div>
            <div class="form-group">
              <label>Company *</label>
              <input class="form-control" [(ngModel)]="newJob.company" placeholder="Company name">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Location *</label>
              <input class="form-control" [(ngModel)]="newJob.location" placeholder="City or Remote">
            </div>
            <div class="form-group">
              <label>Category *</label>
              <select class="form-control" [(ngModel)]="newJob.category">
                <option value="">Select category</option>
                <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Job Type</label>
              <select class="form-control" [(ngModel)]="newJob.jobType">
                <option *ngFor="let t of jobTypes" [ngValue]="t.value">{{ t.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Min Salary ($)</label>
              <input class="form-control" type="number" [(ngModel)]="newJob.salaryMin" placeholder="e.g. 50000">
            </div>
            <div class="form-group">
              <label>Max Salary ($)</label>
              <input class="form-control" type="number" [(ngModel)]="newJob.salaryMax" placeholder="e.g. 90000">
            </div>
          </div>
          <div class="form-group">
            <label>Description *</label>
            <textarea class="form-control" [(ngModel)]="newJob.description" rows="6" placeholder="Describe the role, requirements, benefits..."></textarea>
          </div>
          <div class="form-actions">
            <button class="btn btn-ghost" (click)="showPostForm = false">Cancel</button>
            <button class="btn btn-primary" (click)="postJob()" [disabled]="posting">
              <span class="material-icons-round">rocket_launch</span>
              {{ posting ? 'Publishing...' : 'Publish Job' }}
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-row fade-in delay-1">
          <div class="stat-card card" *ngFor="let s of getStats()">
            <div class="stat-icon">{{ s.icon }}</div>
            <div class="stat-value">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>

        <!-- ═══════════════ EMPLOYER VIEW ═══════════════ -->
        <ng-container *ngIf="auth.isEmployer">

          <!-- Tab bar -->
          <div class="tab-bar fade-in">
            <button class="tab-btn" [class.active]="activeTab === 'jobs'" (click)="switchTab('jobs')">
              <span class="material-icons-round">work</span> My Jobs
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'shortlisted'" (click)="switchTab('shortlisted')">
              <span class="material-icons-round">star</span> Shortlisted
              <span class="tab-badge" *ngIf="shortlisted.length > 0">{{ shortlisted.length }}</span>
            </button>
          </div>

          <!-- ── Tab: My Jobs ── -->
          <ng-container *ngIf="activeTab === 'jobs'">
            <div class="spinner" *ngIf="loadingJobs"></div>

            <div class="jobs-table card fade-in delay-2" *ngIf="!loadingJobs && myJobs.length > 0">
              <div class="table-row table-head">
                <span>Job Title</span>
                <span>Location</span>
                <span>Type</span>
                <span>Applicants</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              <div class="table-row" *ngFor="let job of myJobs" [class.selected-row]="selectedJob?.id === job.id">
                <span class="job-title-cell" [routerLink]="['/jobs', job.id]">{{ job.title }}</span>
                <span class="table-cell">{{ job.location }}</span>
                <span><span class="badge badge-sm" [class]="getJobTypeBadge(job.jobType)">{{ job.jobType }}</span></span>
                <span class="table-cell">{{ job.applicationCount }} applied</span>
                <span><span class="badge" [class]="job.isActive ? 'badge-success' : 'badge-muted'">{{ job.isActive ? 'Active' : 'Closed' }}</span></span>
                <span class="row-actions">
                  <button class="btn btn-ghost btn-sm" [class.active-btn]="selectedJob?.id === job.id"
                          (click)="viewApplicants(job)" title="View applicants">
                    <span class="material-icons-round">group</span>
                  </button>
                  <button class="btn btn-danger btn-sm" (click)="deleteJob(job.id)" title="Delete job">
                    <span class="material-icons-round">delete</span>
                  </button>
                </span>
              </div>
            </div>

            <div class="empty-state" *ngIf="!loadingJobs && myJobs.length === 0">
              <span class="material-icons-round">work_off</span>
              <h3>No jobs posted yet</h3>
              <p>Click "Post New Job" to get started</p>
            </div>

            <!-- Applicants Panel (always rendered when job selected) -->
            <div class="applicants-panel card" #applicantsPanel *ngIf="selectedJob">
              <div class="panel-header">
                <div class="panel-title-group">
                  <span class="material-icons-round panel-icon">group</span>
                  <div>
                    <h3>Applicants</h3>
                    <p class="panel-subtitle">{{ selectedJob.title }}</p>
                  </div>
                </div>
                <button class="btn btn-ghost btn-sm" (click)="selectedJob = null" title="Close">
                  <span class="material-icons-round">close</span>
                </button>
              </div>

              <div class="panel-body">
                <div class="spinner" *ngIf="loadingApplicants"></div>

                <div *ngIf="!loadingApplicants && applicants.length === 0" class="no-applicants">
                  <span class="material-icons-round">inbox</span>
                  <p>No applicants yet for this position.</p>
                </div>

                <div class="applicant-row" *ngFor="let app of applicants">
                  <div class="applicant-info">
                    <div class="avatar-wrap">
                      <div class="avatar">{{ (app.candidateName || '?')[0].toUpperCase() }}</div>
                    </div>
                    <div class="applicant-meta">
                      <div class="applicant-name">{{ app.candidateName }}</div>
                      <div class="applicant-email">{{ app.candidateEmail }}</div>
                      <div class="cover-preview">{{ app.coverLetter | slice:0:120 }}{{ app.coverLetter.length > 120 ? '...' : '' }}</div>
                      <div class="app-meta-row">
                        <span class="applied-date"><span class="material-icons-round">schedule</span> {{ app.appliedAt | date:'mediumDate' }}</span>
                        <a *ngIf="app.resumeFilePath" [href]="getResumeUrl(app.resumeFilePath)" target="_blank" class="resume-chip">
                          <span class="material-icons-round">description</span> Resume
                        </a>
                      </div>
                    </div>
                  </div>
                  <div class="applicant-actions">
                    <select class="form-control status-select" [(ngModel)]="app.status" (change)="updateStatus(app)">
                      <option *ngFor="let s of appStatuses" [value]="s">{{ s }}</option>
                    </select>
                    <button class="btn btn-primary btn-sm" (click)="openDrawer(app)">
                      <span class="material-icons-round">person</span> Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>

          <!-- ── Tab: Shortlisted ── -->
          <ng-container *ngIf="activeTab === 'shortlisted'">
            <div class="spinner" *ngIf="loadingShortlisted"></div>
            <div *ngIf="!loadingShortlisted && shortlisted.length === 0" class="empty-state">
              <span class="material-icons-round">star_border</span>
              <h3>No shortlisted candidates</h3>
              <p>Set an applicant's status to "Shortlisted" to see them here</p>
            </div>
            <div class="shortlist-grid" *ngIf="!loadingShortlisted && shortlisted.length > 0">
              <div class="shortlist-card card fade-in" *ngFor="let app of shortlisted; let i = index"
                   [style.animation-delay]="(i * 60) + 'ms'">
                <div class="sc-top">
                  <div class="avatar">{{ (app.candidateName || '?')[0].toUpperCase() }}</div>
                  <div>
                    <div class="sc-name">{{ app.candidateName }}</div>
                    <div class="sc-email">{{ app.candidateEmail }}</div>
                  </div>
                </div>
                <div class="sc-job">
                  <span class="material-icons-round">work_outline</span> {{ app.jobTitle }}
                </div>
                <p class="sc-cover">{{ app.coverLetter | slice:0:120 }}{{ app.coverLetter.length > 120 ? '...' : '' }}</p>
                <div class="sc-footer">
                  <a *ngIf="app.resumeFilePath" [href]="getResumeUrl(app.resumeFilePath)" target="_blank" class="resume-link">
                    <span class="material-icons-round">description</span> Resume
                  </a>
                  <span *ngIf="!app.resumeFilePath" class="no-resume">No resume</span>
                  <div class="sc-btns">
                    <button class="btn btn-ghost btn-sm" (click)="openDrawer(app)">
                      <span class="material-icons-round">person</span>
                    </button>
                    <button class="btn btn-primary btn-sm" (click)="openInviteForm(app)">
                      <span class="material-icons-round">mail</span> Invite
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>
        </ng-container>

        <!-- ═══════════════ CANDIDATE VIEW ═══════════════ -->
        <ng-container *ngIf="auth.isCandidate">
          <h2 class="section-title fade-in">My Applications</h2>
          <div class="spinner" *ngIf="loadingApps"></div>

          <div class="app-grid" *ngIf="!loadingApps && myApplications.length > 0">
            <div class="app-card card fade-in" *ngFor="let app of myApplications; let i = index"
                 [style.animation-delay]="(i * 60) + 'ms'">
              <div class="app-card-top">
                <div class="company-logo">{{ (app.company || '?')[0].toUpperCase() }}</div>
                <span class="badge" [class]="getStatusBadge(app.status)">{{ app.status }}</span>
              </div>
              <h3 class="app-job-title">{{ app.jobTitle }}</h3>
              <p class="app-company">{{ app.company }}</p>
              <p class="cover-preview">{{ app.coverLetter | slice:0:100 }}...</p>
              <div class="app-date">
                <span class="material-icons-round">calendar_today</span>
                Applied {{ app.appliedAt | date:'mediumDate' }}
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="!loadingApps && myApplications.length === 0">
            <span class="material-icons-round">inbox</span>
            <h3>No applications yet</h3>
            <p>Browse jobs and start applying!</p>
            <a routerLink="/jobs" class="btn btn-primary" style="margin-top:16px">Browse Jobs</a>
          </div>
        </ng-container>

      </div><!-- /container -->
    </div><!-- /page -->

    <!-- ═══ Applicant Profile Drawer (always in DOM, toggled via CSS) ═══ -->
    <div class="drawer-backdrop" [class.visible]="drawerOpen" (click)="closeDrawer()"></div>
    <div class="drawer-panel" [class.open]="drawerOpen">
      <div class="drawer-header">
        <h3>Applicant Profile</h3>
        <button class="btn btn-ghost btn-sm" (click)="closeDrawer()">
          <span class="material-icons-round">close</span>
        </button>
      </div>

      <ng-container *ngIf="drawerApp">
        <div class="drawer-body">
          <div class="drawer-hero">
            <div class="drawer-avatar">{{ (drawerApp.candidateName || '?')[0].toUpperCase() }}</div>
            <div class="drawer-hero-info">
              <div class="drawer-name">{{ drawerApp.candidateName }}</div>
              <a [href]="'mailto:' + drawerApp.candidateEmail" class="drawer-email">
                <span class="material-icons-round">mail_outline</span> {{ drawerApp.candidateEmail }}
              </a>
            </div>
          </div>

          <div class="drawer-chips">
            <span class="badge" [class]="getStatusBadge(drawerApp.status)">{{ drawerApp.status }}</span>
            <span class="chip-muted"><span class="material-icons-round">schedule</span> Applied {{ drawerApp.appliedAt | date:'mediumDate' }}</span>
          </div>

          <div class="drawer-section">
            <div class="dsec-label"><span class="material-icons-round">work_outline</span> Applied For</div>
            <div class="dsec-value fw">{{ drawerApp.jobTitle }}</div>
            <div class="dsec-value">{{ drawerApp.company }}</div>
          </div>

          <div class="drawer-section">
            <div class="dsec-label"><span class="material-icons-round">notes</span> Cover Letter</div>
            <div class="cover-box">{{ drawerApp.coverLetter }}</div>
          </div>

          <div class="drawer-section">
            <div class="dsec-label"><span class="material-icons-round">attach_file</span> Resume / CV</div>
            <a *ngIf="drawerApp.resumeFilePath" [href]="getResumeUrl(drawerApp.resumeFilePath)" target="_blank" class="resume-download-btn">
              <span class="material-icons-round">download</span>
              {{ drawerApp.resumeFileName || 'Download Resume' }}
            </a>
            <p *ngIf="!drawerApp.resumeFilePath" class="no-resume">No resume attached</p>
          </div>

          <div class="drawer-section">
            <div class="dsec-label"><span class="material-icons-round">tune</span> Update Status</div>
            <select class="form-control" [(ngModel)]="drawerApp.status" (change)="updateStatus(drawerApp)">
              <option *ngFor="let s of appStatuses" [value]="s">{{ s }}</option>
            </select>
          </div>

          <button class="btn btn-primary invite-full-btn" (click)="openInviteForm(drawerApp)">
            <span class="material-icons-round">send</span> Send Interview Invitation
          </button>
        </div>
      </ng-container>
    </div>

    <!-- ═══ Interview Invite Modal (always in DOM, toggled via CSS) ═══ -->
    <div class="modal-backdrop" [class.visible]="inviteModalOpen" (click)="closeInviteModal()"></div>
    <div class="modal-box" [class.open]="inviteModalOpen">
      <div class="modal-header">
        <div>
          <h3>Send Interview Invitation</h3>
          <p class="modal-sub" *ngIf="inviteApp">To: <strong>{{ inviteApp.candidateName }}</strong> &lt;{{ inviteApp.candidateEmail }}&gt;</p>
        </div>
        <button class="btn btn-ghost btn-sm" (click)="closeInviteModal()">
          <span class="material-icons-round">close</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="alert alert-error" *ngIf="inviteError">{{ inviteError }}</div>
        <div class="alert alert-success" *ngIf="inviteSuccess">{{ inviteSuccess }}</div>
        <div class="form-row">
          <div class="form-group">
            <label>Interview Date *</label>
            <input class="form-control" type="date" [(ngModel)]="invite.interviewDate">
          </div>
          <div class="form-group">
            <label>Interview Time *</label>
            <input class="form-control" type="time" [(ngModel)]="invite.interviewTime">
          </div>
        </div>
        <div class="form-group">
          <label>Location / Office Address</label>
          <input class="form-control" [(ngModel)]="invite.location" placeholder="e.g. 123 Main St Floor 4, or Virtual">
        </div>
        <div class="form-group">
          <label>Video Call Link (optional)</label>
          <input class="form-control" [(ngModel)]="invite.meetingLink" placeholder="https://meet.google.com/...">
        </div>
        <div class="form-group">
          <label>Additional Message (optional)</label>
          <textarea class="form-control" [(ngModel)]="invite.additionalMessage" rows="4"
            placeholder="Bring your portfolio, prepare for technical assessment..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" (click)="closeInviteModal()" [disabled]="sendingInvite">Cancel</button>
        <button class="btn btn-primary" (click)="sendInvite()" [disabled]="sendingInvite">
          <span class="material-icons-round" *ngIf="!sendingInvite">send</span>
          <span class="btn-spinner" *ngIf="sendingInvite"></span>
          {{ sendingInvite ? 'Sending...' : 'Send Invitation' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 48px 0 96px; }
    .dash-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 36px; gap: 20px; flex-wrap: wrap; }
    h1 { font-size: 32px; margin-bottom: 6px; }
    .role-desc { color: var(--text-secondary); font-size: 15px; }

    .post-form { padding: 32px; margin-bottom: 32px; h2 { font-size: 20px; margin-bottom: 0; } }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0 20px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }

    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .stat-card {
      padding: 22px 20px; text-align: center; transition: var(--transition-spring);
      &:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
    }
    .stat-icon { font-size: 30px; margin-bottom: 10px; }
    .stat-value {
      font-size: 30px; font-weight: 800; font-family: 'Space Grotesk', sans-serif;
      background: linear-gradient(135deg, var(--primary), #a855f7);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .stat-label { font-size: 13px; color: var(--text-secondary); margin-top: 4px; font-weight: 500; }

    /* Tab bar */
    .tab-bar {
      display: flex; gap: 4px; margin-bottom: 24px;
      background: var(--bg-base); border-radius: var(--radius-md);
      padding: 4px; width: fit-content; border: 1px solid var(--border);
    }
    .tab-btn {
      display: flex; align-items: center; gap: 7px; padding: 9px 20px;
      border-radius: calc(var(--radius-md) - 2px); border: none; background: transparent;
      cursor: pointer; font-size: 14px; font-weight: 500; color: var(--text-secondary);
      transition: var(--transition); position: relative;
      .material-icons-round { font-size: 18px; }
      &.active { background: #fff; color: var(--primary); box-shadow: 0 1px 6px rgba(0,0,0,0.08); }
      &:hover:not(.active) { color: var(--text-primary); }
    }
    .tab-badge {
      background: var(--primary); color: #fff; font-size: 10px; font-weight: 700;
      border-radius: 999px; padding: 1px 6px; min-width: 18px; text-align: center;
    }

    /* Jobs table */
    .jobs-table { overflow: hidden; margin-bottom: 0; }
    .table-row {
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 110px;
      gap: 16px; padding: 14px 24px; align-items: center;
      border-bottom: 1px solid var(--border); font-size: 14px; transition: var(--transition);
      &:last-child { border-bottom: none; }
      &:not(.table-head):hover { background: rgba(124,58,237,0.02); }
    }
    .selected-row { background: rgba(124,58,237,0.04) !important; }
    .table-head {
      background: rgba(124,58,237,0.04); font-size: 12px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.6px; color: var(--text-muted);
    }
    .job-title-cell { color: var(--primary); cursor: pointer; font-weight: 600; &:hover { text-decoration: underline; } }
    .table-cell { color: var(--text-secondary); }
    .row-actions { display: flex; gap: 6px; }
    .active-btn { color: var(--primary); background: rgba(124,58,237,0.08) !important; }

    /* Applicants panel */
    .applicants-panel {
      margin-top: 20px; overflow: hidden;
      border: 2px solid rgba(124,58,237,0.12);
      animation: slideDown 0.3s ease;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 24px; border-bottom: 1px solid var(--border);
      background: rgba(124,58,237,0.03);
    }
    .panel-title-group { display: flex; align-items: center; gap: 12px; }
    .panel-icon { color: var(--primary); font-size: 22px; }
    .panel-header h3 { margin: 0; font-size: 16px; }
    .panel-subtitle { font-size: 13px; color: var(--text-muted); margin: 0; }
    .panel-body { padding: 0; }

    .no-applicants {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 48px 20px; color: var(--text-muted);
      .material-icons-round { font-size: 40px; color: var(--border); }
      p { font-size: 14px; margin: 0; }
    }

    .applicant-row {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 18px 24px; border-bottom: 1px solid var(--border); gap: 20px;
      transition: background 0.15s;
      &:last-child { border-bottom: none; }
      &:hover { background: rgba(124,58,237,0.02); }
    }
    .applicant-info { display: flex; gap: 14px; flex: 1; min-width: 0; }
    .avatar-wrap { flex-shrink: 0; }
    .avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), #a855f7);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; color: #fff; font-size: 17px;
    }
    .applicant-meta { min-width: 0; flex: 1; }
    .applicant-name { font-weight: 700; font-size: 15px; margin-bottom: 2px; }
    .applicant-email { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
    .cover-preview {
      font-size: 13px; color: var(--text-secondary); line-height: 1.5;
      margin-bottom: 10px; overflow: hidden;
    }
    .app-meta-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .applied-date {
      display: flex; align-items: center; gap: 4px;
      font-size: 12px; color: var(--text-muted);
      .material-icons-round { font-size: 14px; }
    }
    .resume-chip {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; font-weight: 600; color: var(--primary);
      border: 1px solid rgba(124,58,237,0.25); border-radius: 6px; padding: 3px 8px;
      transition: var(--transition); text-decoration: none;
      &:hover { background: rgba(124,58,237,0.07); }
      .material-icons-round { font-size: 13px; }
    }
    .applicant-actions { display: flex; flex-direction: column; gap: 10px; align-items: flex-end; flex-shrink: 0; }
    .status-select { width: 150px; padding: 7px 10px; font-size: 13px; }

    /* Shortlist grid */
    .shortlist-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .shortlist-card { padding: 22px; }
    .sc-top { display: flex; gap: 14px; align-items: center; margin-bottom: 14px; }
    .sc-name { font-weight: 700; font-size: 15px; }
    .sc-email { font-size: 12px; color: var(--text-muted); }
    .sc-job {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; color: var(--primary); font-weight: 600; margin-bottom: 10px;
      .material-icons-round { font-size: 15px; }
    }
    .sc-cover { font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px; }
    .sc-footer {
      display: flex; align-items: center; justify-content: space-between;
      padding-top: 14px; border-top: 1px solid var(--border); gap: 8px;
    }
    .sc-btns { display: flex; gap: 6px; }
    .resume-link {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; font-weight: 600; color: var(--primary);
      border: 1px solid rgba(124,58,237,0.25); border-radius: 6px; padding: 4px 10px;
      transition: var(--transition); text-decoration: none;
      &:hover { background: rgba(124,58,237,0.07); }
      .material-icons-round { font-size: 14px; }
    }
    .no-resume { font-size: 12px; color: var(--text-muted); font-style: italic; }

    /* Candidate apps */
    .section-title { font-size: 22px; margin-bottom: 20px; }
    .app-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .app-card { padding: 22px; }
    .app-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .company-logo {
      width: 44px; height: 44px; border-radius: 11px;
      background: linear-gradient(135deg, var(--primary), #a855f7);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 18px; color: #fff;
    }
    .app-job-title { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
    .app-company { font-size: 13px; color: var(--text-secondary); margin-bottom: 10px; }
    .app-date {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--text-muted);
      border-top: 1px solid var(--border); padding-top: 12px;
      .material-icons-round { font-size: 14px; color: var(--accent); }
    }

    /* ── Drawer (slide-in panel from right) ── */
    .drawer-backdrop {
      position: fixed; inset: 0; background: rgba(15,10,40,0.4);
      opacity: 0; visibility: hidden;
      transition: opacity 0.25s ease, visibility 0.25s ease; z-index: 900;
      &.visible { opacity: 1; visibility: visible; }
    }
    .drawer-panel {
      position: fixed; top: 0; right: 0; width: 460px; max-width: 100vw;
      height: 100vh; background: #fff;
      box-shadow: -8px 0 48px rgba(124,58,237,0.14);
      transform: translateX(100%);
      transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1); z-index: 901;
      display: flex; flex-direction: column; overflow: hidden;
      &.open { transform: translateX(0); }
    }
    .drawer-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; border-bottom: 1px solid var(--border);
      h3 { margin: 0; font-size: 18px; }
    }
    .drawer-body { flex: 1; overflow-y: auto; padding: 24px; }
    .drawer-hero { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .drawer-avatar {
      width: 64px; height: 64px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), #a855f7);
      display: flex; align-items: center; justify-content: center;
      font-size: 26px; font-weight: 800; color: #fff; flex-shrink: 0;
    }
    .drawer-hero-info { min-width: 0; }
    .drawer-name { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
    .drawer-email {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 13px; color: var(--primary); text-decoration: none;
      &:hover { text-decoration: underline; }
      .material-icons-round { font-size: 15px; }
    }
    .drawer-chips { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
    .chip-muted {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: var(--text-muted);
      .material-icons-round { font-size: 14px; }
    }
    .drawer-section { margin-bottom: 22px; }
    .dsec-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px;
      color: var(--text-muted); margin-bottom: 10px;
      .material-icons-round { font-size: 14px; color: var(--primary); }
    }
    .dsec-value { font-size: 14px; color: var(--text-secondary); margin-bottom: 2px; }
    .fw { font-weight: 700; color: var(--text-primary); font-size: 15px; }
    .cover-box {
      font-size: 14px; color: var(--text-secondary); line-height: 1.7;
      background: var(--bg-base); border: 1px solid var(--border);
      border-radius: var(--radius-md); padding: 14px 16px; white-space: pre-line;
      max-height: 200px; overflow-y: auto;
    }
    .resume-download-btn {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(124,58,237,0.06); border: 1.5px solid rgba(124,58,237,0.2);
      color: var(--primary); border-radius: var(--radius-md); padding: 10px 16px;
      font-size: 13px; font-weight: 600; text-decoration: none; transition: var(--transition);
      .material-icons-round { font-size: 18px; }
      &:hover { background: rgba(124,58,237,0.12); }
    }
    .invite-full-btn {
      width: 100%; justify-content: center; padding: 13px; margin-top: 8px;
      .material-icons-round { font-size: 18px; }
    }

    /* ── Modal ── */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(15,10,40,0.5);
      opacity: 0; visibility: hidden;
      transition: opacity 0.2s ease, visibility 0.2s ease; z-index: 910;
      &.visible { opacity: 1; visibility: visible; }
    }
    .modal-box {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -46%) scale(0.95);
      width: 560px; max-width: calc(100vw - 32px);
      max-height: calc(100vh - 64px);
      background: #fff; border-radius: 20px;
      box-shadow: 0 24px 64px rgba(124,58,237,0.18);
      display: flex; flex-direction: column; overflow: hidden;
      opacity: 0; visibility: hidden;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); z-index: 911;
      &.open { opacity: 1; visibility: visible; transform: translate(-50%, -50%) scale(1); }
    }
    .modal-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 24px 24px 0;
      h3 { margin: 0 0 4px; font-size: 18px; }
    }
    .modal-sub { font-size: 13px; color: var(--text-muted); margin: 0; }
    .modal-body { padding: 20px 24px; overflow-y: auto; flex: 1; }
    .modal-footer {
      display: flex; gap: 12px; justify-content: flex-end;
      padding: 16px 24px; border-top: 1px solid var(--border);
    }
    .btn-spinner {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff; border-radius: 50%;
      animation: spin 0.7s linear infinite; flex-shrink: 0;
    }

    /* Empty state */
    .empty-state {
      text-align: center; padding: 60px 20px;
      .material-icons-round { font-size: 48px; color: var(--border); display: block; margin: 0 auto 16px; }
      h3 { font-size: 18px; margin-bottom: 8px; }
      p { color: var(--text-muted); font-size: 14px; }
    }

    @media (max-width: 1024px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .shortlist-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 900px) {
      .app-grid { grid-template-columns: repeat(2, 1fr); }
      .jobs-table { overflow-x: auto; }
      .drawer-panel { width: 100vw; }
    }
    @media (max-width: 640px) {
      .dash-header { flex-direction: column; }
      .app-grid, .stats-row { grid-template-columns: repeat(2, 1fr); }
      .shortlist-grid { grid-template-columns: 1fr; }
      .table-row { grid-template-columns: 1fr 1fr; }
      .table-head { display: none; }
      .applicant-row { flex-direction: column; }
      .applicant-actions { flex-direction: row; align-items: center; }
    }
    @media (max-width: 400px) {
      .app-grid, .stats-row { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  @ViewChild('applicantsPanel') applicantsPanelRef?: ElementRef;

  myJobs: Job[] = [];
  myApplications: Application[] = [];
  applicants: Application[] = [];
  shortlisted: Application[] = [];
  selectedJob: Job | null = null;
  showPostForm = false;
  loadingJobs = false;
  loadingApps = false;
  loadingApplicants = false;
  loadingShortlisted = false;
  posting = false;
  postError = '';
  activeTab: 'jobs' | 'shortlisted' = 'jobs';

  drawerOpen = false;
  drawerApp: Application | null = null;

  inviteModalOpen = false;
  inviteApp: Application | null = null;
  sendingInvite = false;
  inviteError = '';
  inviteSuccess = '';
  invite: InterviewInviteRequest = { interviewDate: '', interviewTime: '', location: '' };

  categories = JOB_CATEGORIES;
  jobTypes = JOB_TYPES;
  appStatuses = APPLICATION_STATUSES;
  newJob: CreateJobRequest = { title: '', description: '', company: '', location: '', category: '', jobType: 0 };

  constructor(
    public auth: AuthService,
    private jobService: JobService,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    if (this.auth.isEmployer) {
      this.loadingJobs = true;
      this.jobService.getMyJobs().subscribe({
        next: j => { this.myJobs = j; this.loadingJobs = false; },
        error: () => this.loadingJobs = false
      });
    } else {
      this.loadingApps = true;
      this.applicationService.getMyApplications().subscribe({
        next: a => { this.myApplications = a; this.loadingApps = false; },
        error: () => this.loadingApps = false
      });
    }
  }

  switchTab(tab: 'jobs' | 'shortlisted'): void {
    this.activeTab = tab;
    if (tab === 'shortlisted' && this.shortlisted.length === 0 && !this.loadingShortlisted) {
      this.loadingShortlisted = true;
      this.applicationService.getShortlisted().subscribe({
        next: s => { this.shortlisted = s; this.loadingShortlisted = false; },
        error: () => this.loadingShortlisted = false
      });
    }
  }

  postJob(): void {
    if (!this.newJob.title || !this.newJob.company || !this.newJob.location || !this.newJob.category || !this.newJob.description) {
      this.postError = 'Please fill in all required fields.';
      return;
    }
    this.posting = true;
    this.postError = '';
    this.jobService.createJob(this.newJob).subscribe({
      next: job => {
        this.myJobs.unshift(job);
        this.posting = false;
        this.showPostForm = false;
        this.newJob = { title: '', description: '', company: '', location: '', category: '', jobType: 0 };
      },
      error: err => {
        this.posting = false;
        this.postError = err?.error?.message || 'Failed to post job.';
      }
    });
  }

  viewApplicants(job: Job): void {
    if (this.selectedJob?.id === job.id) {
      this.selectedJob = null;
      return;
    }
    this.selectedJob = job;
    this.applicants = [];
    this.loadingApplicants = true;
    this.applicationService.getJobApplications(job.id).subscribe({
      next: a => {
        this.applicants = a;
        this.loadingApplicants = false;
        // Scroll the panel into view after data loads
        setTimeout(() => {
          this.applicantsPanelRef?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      },
      error: () => this.loadingApplicants = false
    });
  }

  deleteJob(id: number): void {
    if (!confirm('Delete this job posting?')) return;
    this.jobService.deleteJob(id).subscribe({ next: () => this.myJobs = this.myJobs.filter(j => j.id !== id) });
  }

  updateStatus(app: Application): void {
    this.applicationService.updateStatus(app.id, app.status).subscribe({
      next: updated => {
        if (updated.status === 'Shortlisted') {
          if (!this.shortlisted.find(s => s.id === updated.id)) {
            this.shortlisted = [updated, ...this.shortlisted];
          }
        } else {
          this.shortlisted = this.shortlisted.filter(s => s.id !== updated.id);
        }
      }
    });
  }

  openDrawer(app: Application): void {
    this.drawerApp = app;
    this.drawerOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    document.body.style.overflow = '';
  }

  openInviteForm(app: Application): void {
    this.inviteApp = app;
    this.inviteError = '';
    this.inviteSuccess = '';
    this.invite = { interviewDate: '', interviewTime: '', location: '' };
    this.inviteModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeInviteModal(): void {
    if (this.sendingInvite) return;
    this.inviteModalOpen = false;
    if (!this.drawerOpen) document.body.style.overflow = '';
  }

  sendInvite(): void {
    if (!this.invite.interviewDate) { this.inviteError = 'Please select an interview date.'; return; }
    if (!this.invite.interviewTime) { this.inviteError = 'Please enter the interview time.'; return; }
    if (!this.invite.location && !this.invite.meetingLink) { this.inviteError = 'Please enter a location or meeting link.'; return; }
    this.sendingInvite = true;
    this.inviteError = '';
    this.applicationService.sendInterviewInvite(this.inviteApp!.id, this.invite).subscribe({
      next: res => {
        this.sendingInvite = false;
        this.inviteSuccess = res.message || 'Invitation sent successfully!';
      },
      error: err => {
        this.sendingInvite = false;
        this.inviteError = err?.error?.message || 'Failed to send. Please check email configuration.';
      }
    });
  }

  getResumeUrl(path: string): string {
    return `http://localhost:5113${path}`;
  }

  getStats() {
    if (this.auth.isEmployer) {
      return [
        { icon: '📋', value: this.myJobs.length, label: 'Jobs Posted' },
        { icon: '📥', value: this.myJobs.reduce((s, j) => s + j.applicationCount, 0), label: 'Total Applications' },
        { icon: '✅', value: this.myJobs.filter(j => j.isActive).length, label: 'Active Jobs' },
        { icon: '⭐', value: this.shortlisted.length, label: 'Shortlisted' }
      ];
    }
    return [
      { icon: '📄', value: this.myApplications.length, label: 'Applications' },
      { icon: '🔍', value: this.myApplications.filter(a => a.status === 'Reviewed').length, label: 'Under Review' },
      { icon: '⭐', value: this.myApplications.filter(a => a.status === 'Shortlisted').length, label: 'Shortlisted' },
      { icon: '✅', value: this.myApplications.filter(a => a.status === 'Accepted').length, label: 'Accepted' }
    ];
  }

  getJobTypeBadge(type: string): string {
    const map: Record<string, string> = {
      'Remote': 'badge-accent', 'FullTime': 'badge-success',
      'PartTime': 'badge-warning', 'Internship': 'badge-primary', 'Contract': 'badge-muted'
    };
    return map[type] || 'badge-muted';
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'badge-muted', 'Reviewed': 'badge-warning',
      'Shortlisted': 'badge-primary', 'Rejected': 'badge-danger', 'Accepted': 'badge-success'
    };
    return map[status] || 'badge-muted';
  }
}
