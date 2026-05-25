namespace HireFlow.Application.DTOs.Applications;

public class CreateApplicationDto
{
    public int JobId { get; set; }
    public string CoverLetter { get; set; } = string.Empty;
    public string? ResumeFileName { get; set; }
    public string? ResumeFilePath { get; set; }
}

public class ApplicationDto
{
    public int Id { get; set; }
    public string CoverLetter { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; }

    public string? ResumeFileName { get; set; }
    public string? ResumeFilePath { get; set; }

    // Job info
    public int JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;

    // Candidate info
    public int CandidateId { get; set; }
    public string CandidateName { get; set; } = string.Empty;
    public string CandidateEmail { get; set; } = string.Empty;
}

public class UpdateApplicationStatusDto
{
    public string Status { get; set; } = string.Empty;
}

public class InterviewInviteDto
{
    public DateTime InterviewDate { get; set; }
    public string InterviewTime { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string? MeetingLink { get; set; }
    public string? AdditionalMessage { get; set; }
}
