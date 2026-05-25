import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job, CreateJobRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class JobService {
  private apiUrl = 'http://localhost:5113/api/jobs';

  constructor(private http: HttpClient) {}

  getJobs(filters: { keyword?: string; category?: string; location?: string; type?: number } = {}): Observable<Job[]> {
    let params = new HttpParams();
    if (filters.keyword)  params = params.set('keyword',  filters.keyword);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.location) params = params.set('location', filters.location);
    if (filters.type != null) params = params.set('type', filters.type.toString());
    return this.http.get<Job[]>(this.apiUrl, { params });
  }

  getJobById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`);
  }

  getMyJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/my-jobs`);
  }

  createJob(dto: CreateJobRequest): Observable<Job> {
    return this.http.post<Job>(this.apiUrl, dto);
  }

  updateJob(id: number, dto: any): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/${id}`, dto);
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
