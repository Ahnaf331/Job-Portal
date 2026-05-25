import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application, CreateApplicationRequest, InterviewInviteRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private apiUrl = 'http://localhost:5113/api/applications';

  constructor(private http: HttpClient) {}

  apply(dto: CreateApplicationRequest): Observable<Application> {
    const form = new FormData();
    form.append('jobId', dto.jobId.toString());
    form.append('coverLetter', dto.coverLetter);
    if (dto.resume) {
      form.append('resume', dto.resume, dto.resume.name);
    }
    return this.http.post<Application>(this.apiUrl, form);
  }

  getMyApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/my-applications`);
  }

  getJobApplications(jobId: number): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/job/${jobId}`);
  }

  updateStatus(applicationId: number, status: string): Observable<Application> {
    return this.http.patch<Application>(`${this.apiUrl}/${applicationId}/status`, { status });
  }

  getShortlisted(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/shortlisted`);
  }

  sendInterviewInvite(applicationId: number, dto: InterviewInviteRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${applicationId}/interview-invite`, dto);
  }
}
