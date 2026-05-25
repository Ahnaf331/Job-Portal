using HireFlow.Domain.Entities;

namespace HireFlow.Domain.Interfaces;

public interface IJobApplicationRepository : IGenericRepository<JobApplication>
{
    Task<IEnumerable<JobApplication>> GetApplicationsByJobAsync(int jobId);
    Task<IEnumerable<JobApplication>> GetApplicationsByCandidateAsync(int candidateId);
    Task<JobApplication?> GetApplicationWithDetailsAsync(int applicationId);
    Task<bool> HasAppliedAsync(int jobId, int candidateId);
    Task<IEnumerable<JobApplication>> GetShortlistedByEmployerAsync(int employerId);
}
