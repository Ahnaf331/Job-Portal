using HireFlow.Domain.Entities;

namespace HireFlow.Application.DTOs.Jobs;

public class CreateJobDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public JobType JobType { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class UpdateJobDto : CreateJobDto
{
    public bool IsActive { get; set; } = true;
}

public class JobListDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string JobType { get; set; } = string.Empty;
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public DateTime PostedAt { get; set; }
    public int ApplicationCount { get; set; }
}

public class JobDetailDto : JobListDto
{
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string EmployerName { get; set; } = string.Empty;
    public bool HasApplied { get; set; }
}
