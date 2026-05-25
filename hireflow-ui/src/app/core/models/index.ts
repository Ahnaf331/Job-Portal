export interface User {
  userId: number;
  fullName: string;
  email: string;
  role: 'Candidate' | 'Employer';
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  category: string;
  jobType: string;
  salaryMin?: number;
  salaryMax?: number;
  postedAt: string;
  applicationCount: number;
  description?: string;
  isActive?: boolean;
  expiresAt?: string;
  employerName?: string;
  hasApplied?: boolean;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  company: string;
  location: string;
  category: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: number;
  expiresAt?: string;
}

export interface Application {
  id: number;
  coverLetter: string;
  status: string;
  appliedAt: string;
  resumeFileName?: string;
  resumeFilePath?: string;
  jobId: number;
  jobTitle: string;
  company: string;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
}

export interface CreateApplicationRequest {
  jobId: number;
  coverLetter: string;
  resume?: File;
}

export interface InterviewInviteRequest {
  interviewDate: string;
  interviewTime: string;
  location: string;
  meetingLink?: string;
  additionalMessage?: string;
}

export const JOB_CATEGORIES = [
  'Technology', 'Design', 'Marketing', 'Finance', 'Healthcare',
  'Education', 'Sales', 'Engineering', 'Customer Support', 'Other'
];

export const JOB_TYPES = [
  { value: 0, label: 'Full Time' },
  { value: 1, label: 'Part Time' },
  { value: 2, label: 'Remote' },
  { value: 3, label: 'Internship' },
  { value: 4, label: 'Contract' }
];

export const APPLICATION_STATUSES = ['Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Accepted'];
