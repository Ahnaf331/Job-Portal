namespace HireFlow.Domain.Entities;

public enum UserRole { Candidate, Employer }

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Job> PostedJobs { get; set; } = new List<Job>();
    public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
}
