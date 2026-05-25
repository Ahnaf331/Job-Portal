using HireFlow.Application.DTOs.Applications;

namespace HireFlow.Application.Interfaces;

public interface IApplicationService
{
    Task<ApplicationDto> ApplyAsync(CreateApplicationDto dto, int candidateId);
    Task<IEnumerable<ApplicationDto>> GetCandidateApplicationsAsync(int candidateId);
    Task<IEnumerable<ApplicationDto>> GetJobApplicationsAsync(int jobId, int employerId);
    Task<ApplicationDto?> UpdateStatusAsync(int applicationId, UpdateApplicationStatusDto dto, int employerId);
    Task<IEnumerable<ApplicationDto>> GetShortlistedAsync(int employerId);
    Task SendInterviewInviteAsync(int applicationId, InterviewInviteDto dto, int employerId);
}
