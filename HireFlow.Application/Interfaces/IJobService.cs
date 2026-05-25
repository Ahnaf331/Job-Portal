using HireFlow.Application.DTOs.Jobs;
using HireFlow.Domain.Entities;

namespace HireFlow.Application.Interfaces;

public interface IJobService
{
    Task<IEnumerable<JobListDto>> GetAllJobsAsync(string? keyword = null, string? category = null, string? location = null, JobType? type = null);
    Task<JobDetailDto?> GetJobByIdAsync(int id, int? currentUserId = null);
    Task<IEnumerable<JobListDto>> GetEmployerJobsAsync(int employerId);
    Task<JobListDto> CreateJobAsync(CreateJobDto dto, int employerId);
    Task<JobListDto?> UpdateJobAsync(int id, UpdateJobDto dto, int employerId);
    Task<bool> DeleteJobAsync(int id, int employerId);
}
