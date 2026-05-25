namespace HireFlow.Domain.Entities;

public enum ApplicationStatus { Pending, Reviewed, Shortlisted, Rejected, Accepted }

public class JobApplication
{
    public int Id { get; set; }
    public string CoverLetter { get; set; } = string.Empty;
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

    public string? ResumeFileName { get; set; }
    public string? ResumeFilePath { get; set; }

    public int JobId { get; set; }
    public Job Job { get; set; } = null!;

    public int CandidateId { get; set; }
    public User Candidate { get; set; } = null!;
}
