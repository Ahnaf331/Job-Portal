using HireFlow.Domain.Entities;

namespace HireFlow.Domain.Interfaces;

public interface IJobRepository : IGenericRepository<Job>
{
    Task<IEnumerable<Job>> GetActiveJobsAsync();
    Task<IEnumerable<Job>> SearchJobsAsync(string? keyword, string? category, string? location, JobType? type);
    Task<IEnumerable<Job>> GetJobsByEmployerAsync(int employerId);
    Task<Job?> GetJobWithDetailsAsync(int jobId);
}
