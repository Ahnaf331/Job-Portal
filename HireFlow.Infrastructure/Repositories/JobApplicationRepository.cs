using HireFlow.Domain.Entities;
using HireFlow.Domain.Interfaces;
using HireFlow.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HireFlow.Infrastructure.Repositories;

public class JobApplicationRepository : GenericRepository<JobApplication>, IJobApplicationRepository
{
    public JobApplicationRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<JobApplication>> GetApplicationsByJobAsync(int jobId) =>
        await _dbSet.Where(a => a.JobId == jobId)
                    .Include(a => a.Candidate)
                    .Include(a => a.Job)
                    .OrderByDescending(a => a.AppliedAt)
                    .ToListAsync();

    public async Task<IEnumerable<JobApplication>> GetApplicationsByCandidateAsync(int candidateId) =>
        await _dbSet.Where(a => a.CandidateId == candidateId)
                    .Include(a => a.Job)
                    .ThenInclude(j => j.Employer)
                    .OrderByDescending(a => a.AppliedAt)
                    .ToListAsync();

    public async Task<JobApplication?> GetApplicationWithDetailsAsync(int applicationId) =>
        await _dbSet.Include(a => a.Job)
                    .Include(a => a.Candidate)
                    .FirstOrDefaultAsync(a => a.Id == applicationId);

    public async Task<bool> HasAppliedAsync(int jobId, int candidateId) =>
        await _dbSet.AnyAsync(a => a.JobId == jobId && a.CandidateId == candidateId);

    public async Task<IEnumerable<JobApplication>> GetShortlistedByEmployerAsync(int employerId) =>
        await _dbSet.Where(a => a.Job.EmployerId == employerId && a.Status == ApplicationStatus.Shortlisted)
                    .Include(a => a.Candidate)
                    .Include(a => a.Job)
                    .OrderByDescending(a => a.AppliedAt)
                    .ToListAsync();
}
