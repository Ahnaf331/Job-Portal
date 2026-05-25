using HireFlow.Application.DTOs.Jobs;
using HireFlow.Application.Interfaces;
using HireFlow.Domain.Entities;
using HireFlow.Domain.Interfaces;

namespace HireFlow.Application.Services;

public class JobService : IJobService
{
    private readonly IJobRepository _jobRepo;

    public JobService(IJobRepository jobRepo)
    {
        _jobRepo = jobRepo;
    }

    public async Task<IEnumerable<JobListDto>> GetAllJobsAsync(string? keyword = null, string? category = null, string? location = null, JobType? type = null)
    {
        var jobs = await _jobRepo.SearchJobsAsync(keyword, category, location, type);
        return jobs.Select(MapToListDto);
    }

    public async Task<JobDetailDto?> GetJobByIdAsync(int id, int? currentUserId = null)
    {
        var job = await _jobRepo.GetJobWithDetailsAsync(id);
        if (job == null) return null;

        var dto = new JobDetailDto
        {
            Id = job.Id,
            Title = job.Title,
            Description = job.Description,
            Company = job.Company,
            Location = job.Location,
            Category = job.Category,
            JobType = job.JobType.ToString(),
            SalaryMin = job.SalaryMin,
            SalaryMax = job.SalaryMax,
            PostedAt = job.PostedAt,
            IsActive = job.IsActive,
            ExpiresAt = job.ExpiresAt,
            EmployerName = job.Employer?.FullName ?? "",
            ApplicationCount = job.Applications.Count,
            HasApplied = currentUserId.HasValue && job.Applications.Any(a => a.CandidateId == currentUserId)
        };
        return dto;
    }

    public async Task<IEnumerable<JobListDto>> GetEmployerJobsAsync(int employerId)
    {
        var jobs = await _jobRepo.GetJobsByEmployerAsync(employerId);
        return jobs.Select(MapToListDto);
    }

    public async Task<JobListDto> CreateJobAsync(CreateJobDto dto, int employerId)
    {
        var job = new Job
        {
            Title = dto.Title,
            Description = dto.Description,
            Company = dto.Company,
            Location = dto.Location,
            Category = dto.Category,
            SalaryMin = dto.SalaryMin,
            SalaryMax = dto.SalaryMax,
            JobType = dto.JobType,
            ExpiresAt = dto.ExpiresAt,
            EmployerId = employerId
        };

        await _jobRepo.AddAsync(job);
        await _jobRepo.SaveChangesAsync();
        return MapToListDto(job);
    }

    public async Task<JobListDto?> UpdateJobAsync(int id, UpdateJobDto dto, int employerId)
    {
        var job = await _jobRepo.GetByIdAsync(id);
        if (job == null || job.EmployerId != employerId) return null;

        job.Title = dto.Title;
        job.Description = dto.Description;
        job.Company = dto.Company;
        job.Location = dto.Location;
        job.Category = dto.Category;
        job.SalaryMin = dto.SalaryMin;
        job.SalaryMax = dto.SalaryMax;
        job.JobType = dto.JobType;
        job.ExpiresAt = dto.ExpiresAt;
        job.IsActive = dto.IsActive;

        _jobRepo.Update(job);
        await _jobRepo.SaveChangesAsync();
        return MapToListDto(job);
    }

    public async Task<bool> DeleteJobAsync(int id, int employerId)
    {
        var job = await _jobRepo.GetByIdAsync(id);
        if (job == null || job.EmployerId != employerId) return false;

        _jobRepo.Remove(job);
        await _jobRepo.SaveChangesAsync();
        return true;
    }

    private static JobListDto MapToListDto(Job job) => new()
    {
        Id = job.Id,
        Title = job.Title,
        Company = job.Company,
        Location = job.Location,
        Category = job.Category,
        JobType = job.JobType.ToString(),
        SalaryMin = job.SalaryMin,
        SalaryMax = job.SalaryMax,
        PostedAt = job.PostedAt,
        ApplicationCount = job.Applications?.Count ?? 0
    };
}
