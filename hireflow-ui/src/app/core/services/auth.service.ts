import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, LoginRequest, RegisterRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5113/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get currentUser(): User | null { return this.currentUserSubject.value; }
  get isLoggedIn(): boolean { return !!this.currentUser; }
  get isEmployer(): boolean { return this.currentUser?.role === 'Employer'; }
  get isCandidate(): boolean { return this.currentUser?.role === 'Candidate'; }
  get token(): string | null { return this.currentUser?.token ?? null; }

  login(dto: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, dto).pipe(
      tap(user => this.setUser(user))
    );
  }

  register(dto: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, dto).pipe(
      tap(user => this.setUser(user))
    );
  }

  logout(): void {
    localStorage.removeItem('hireflow_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  private setUser(user: User): void {
    localStorage.setItem('hireflow_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem('hireflow_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
