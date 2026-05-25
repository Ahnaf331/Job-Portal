using HireFlow.Domain.Entities;
using HireFlow.Domain.Interfaces;
using HireFlow.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HireFlow.Infrastructure.Repositories;

public class JobRepository : GenericRepository<Job>, IJobRepository
{
    public JobRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<Job>> GetActiveJobsAsync() =>
        await _dbSet.Where(j => j.IsActive)
                    .Include(j => j.Employer)
                    .Include(j => j.Applications)
                    .OrderByDescending(j => j.PostedAt)
                    .ToListAsync();

    public async Task<IEnumerable<Job>> SearchJobsAsync(string? keyword, string? category, string? location, JobType? type)
    {
        var query = _dbSet.Where(j => j.IsActive)
                          .Include(j => j.Employer)
                          .Include(j => j.Applications)
                          .AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(j => j.Title.Contains(keyword) || j.Description.Contains(keyword) || j.Company.Contains(keyword));

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(j => j.Category == category);

        if (!string.IsNullOrWhiteSpace(location))
            query = query.Where(j => j.Location.Contains(location));

        if (type.HasValue)
            query = query.Where(j => j.JobType == type.Value);

        return await query.OrderByDescending(j => j.PostedAt).ToListAsync();
    }

    public async Task<IEnumerable<Job>> GetJobsByEmployerAsync(int employerId) =>
        await _dbSet.Where(j => j.EmployerId == employerId)
                    .Include(j => j.Applications)
                    .OrderByDescending(j => j.PostedAt)
                    .ToListAsync();

    public async Task<Job?> GetJobWithDetailsAsync(int jobId) =>
        await _dbSet.Include(j => j.Employer)
                    .Include(j => j.Applications)
                    .ThenInclude(a => a.Candidate)
                    .FirstOrDefaultAsync(j => j.Id == jobId);
}
