using HireFlow.Application.DTOs.Applications;
using HireFlow.Application.Interfaces;
using HireFlow.Domain.Entities;
using HireFlow.Domain.Interfaces;

namespace HireFlow.Application.Services;

public class ApplicationService : IApplicationService
{
    private readonly IJobApplicationRepository _appRepo;
    private readonly IJobRepository _jobRepo;
    private readonly IEmailService _emailService;

    public ApplicationService(IJobApplicationRepository appRepo, IJobRepository jobRepo, IEmailService emailService)
    {
        _appRepo = appRepo;
        _jobRepo = jobRepo;
        _emailService = emailService;
    }

    public async Task<ApplicationDto> ApplyAsync(CreateApplicationDto dto, int candidateId)
    {
        if (await _appRepo.HasAppliedAsync(dto.JobId, candidateId))
            throw new InvalidOperationException("You have already applied to this job.");

        var job = await _jobRepo.GetByIdAsync(dto.JobId)
            ?? throw new KeyNotFoundException("Job not found.");

        var application = new JobApplication
        {
            JobId = dto.JobId,
            CandidateId = candidateId,
            CoverLetter = dto.CoverLetter,
            ResumeFileName = dto.ResumeFileName,
            ResumeFilePath = dto.ResumeFilePath
        };

        await _appRepo.AddAsync(application);
        await _appRepo.SaveChangesAsync();

        return new ApplicationDto
        {
            Id = application.Id,
            CoverLetter = application.CoverLetter,
            Status = application.Status.ToString(),
            AppliedAt = application.AppliedAt,
            JobId = job.Id,
            JobTitle = job.Title,
            Company = job.Company,
            CandidateId = candidateId
        };
    }

    public async Task<IEnumerable<ApplicationDto>> GetCandidateApplicationsAsync(int candidateId)
    {
        var apps = await _appRepo.GetApplicationsByCandidateAsync(candidateId);
        return apps.Select(MapToDto);
    }

    public async Task<IEnumerable<ApplicationDto>> GetJobApplicationsAsync(int jobId, int employerId)
    {
        var job = await _jobRepo.GetByIdAsync(jobId);
        if (job == null || job.EmployerId != employerId)
            throw new UnauthorizedAccessException("Access denied.");

        var apps = await _appRepo.GetApplicationsByJobAsync(jobId);
        return apps.Select(MapToDto);
    }

    public async Task<ApplicationDto?> UpdateStatusAsync(int applicationId, UpdateApplicationStatusDto dto, int employerId)
    {
        var app = await _appRepo.GetApplicationWithDetailsAsync(applicationId);
        if (app == null) return null;

        if (app.Job.EmployerId != employerId)
            throw new UnauthorizedAccessException("Access denied.");

        if (Enum.TryParse<ApplicationStatus>(dto.Status, true, out var status))
            app.Status = status;

        _appRepo.Update(app);
        await _appRepo.SaveChangesAsync();
        return MapToDto(app);
    }

    public async Task<IEnumerable<ApplicationDto>> GetShortlistedAsync(int employerId)
    {
        var apps = await _appRepo.GetShortlistedByEmployerAsync(employerId);
        return apps.Select(MapToDto);
    }

    public async Task SendInterviewInviteAsync(int applicationId, InterviewInviteDto dto, int employerId)
    {
        var app = await _appRepo.GetApplicationWithDetailsAsync(applicationId)
            ?? throw new KeyNotFoundException("Application not found.");

        if (app.Job.EmployerId != employerId)
            throw new UnauthorizedAccessException("Access denied.");

        await _emailService.SendInterviewInviteAsync(
            app.Candidate.Email,
            app.Candidate.FullName,
            app.Job.Title,
            app.Job.Company,
            dto.InterviewDate,
            dto.InterviewTime,
            dto.Location,
            dto.MeetingLink,
            dto.AdditionalMessage);
    }

    private static ApplicationDto MapToDto(JobApplication app) => new()
    {
        Id = app.Id,
        CoverLetter = app.CoverLetter,
        Status = app.Status.ToString(),
        AppliedAt = app.AppliedAt,
        ResumeFileName = app.ResumeFileName,
        ResumeFilePath = app.ResumeFilePath,
        JobId = app.JobId,
        JobTitle = app.Job?.Title ?? "",
        Company = app.Job?.Company ?? "",
        CandidateId = app.CandidateId,
        CandidateName = app.Candidate?.FullName ?? "",
        CandidateEmail = app.Candidate?.Email ?? ""
    };
}
