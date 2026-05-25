using System.Security.Claims;
using HireFlow.Application.DTOs.Applications;
using HireFlow.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace HireFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationService _applicationService;
    private readonly ILogger<ApplicationsController> _logger;
    private static readonly string[] AllowedExtensions = [".pdf", ".doc", ".docx"];
    private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

    public ApplicationsController(IApplicationService applicationService, ILogger<ApplicationsController> logger)
    {
        _applicationService = applicationService;
        _logger = logger;
    }

    private int GetCurrentUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Apply to a job with optional resume upload (Candidate only)</summary>
    [HttpPost]
    [Authorize(Roles = "Candidate")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Apply([FromForm] int jobId, [FromForm] string coverLetter, IFormFile? resume)
    {
        string? resumeFileName = null;
        string? resumeFilePath = null;

        if (resume != null)
        {
            if (resume.Length == 0)
                return BadRequest(new { message = "Resume file is empty." });

            if (resume.Length > MaxFileSize)
                return BadRequest(new { message = "Resume file must be under 5 MB." });

            var ext = Path.GetExtension(resume.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(ext))
                return BadRequest(new { message = "Only PDF, DOC, and DOCX files are allowed." });

            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "resumes");
            Directory.CreateDirectory(uploadsDir);

            var uniqueName = $"{Guid.NewGuid()}{ext}";
            var fullPath = Path.Combine(uploadsDir, uniqueName);

            await using var stream = new FileStream(fullPath, FileMode.Create);
            await resume.CopyToAsync(stream);

            resumeFileName = resume.FileName;
            resumeFilePath = $"/resumes/{uniqueName}";
        }

        try
        {
            var dto = new CreateApplicationDto
            {
                JobId = jobId,
                CoverLetter = coverLetter,
                ResumeFileName = resumeFileName,
                ResumeFilePath = resumeFilePath
            };

            var result = await _applicationService.ApplyAsync(dto, GetCurrentUserId());
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>Get my applications (Candidate only)</summary>
    [HttpGet("my-applications")]
    [Authorize(Roles = "Candidate")]
    public async Task<IActionResult> GetMyApplications()
    {
        var apps = await _applicationService.GetCandidateApplicationsAsync(GetCurrentUserId());
        return Ok(apps);
    }

    /// <summary>Get applicants for a job (Employer only)</summary>
    [HttpGet("job/{jobId}")]
    [Authorize(Roles = "Employer")]
    public async Task<IActionResult> GetJobApplications(int jobId)
    {
        try
        {
            var apps = await _applicationService.GetJobApplicationsAsync(jobId, GetCurrentUserId());
            return Ok(apps);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    /// <summary>Update application status (Employer only)</summary>
    [HttpPatch("{applicationId}/status")]
    [Authorize(Roles = "Employer")]
    public async Task<IActionResult> UpdateStatus(int applicationId, [FromBody] UpdateApplicationStatusDto dto)
    {
        try
        {
            var result = await _applicationService.UpdateStatusAsync(applicationId, dto, GetCurrentUserId());
            return result == null ? NotFound() : Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    /// <summary>Get all shortlisted candidates across employer's jobs</summary>
    [HttpGet("shortlisted")]
    [Authorize(Roles = "Employer")]
    public async Task<IActionResult> GetShortlisted()
    {
        var apps = await _applicationService.GetShortlistedAsync(GetCurrentUserId());
        return Ok(apps);
    }

    /// <summary>Send interview invitation email to an applicant (Employer only)</summary>
    [HttpPost("{applicationId}/interview-invite")]
    [Authorize(Roles = "Employer")]
    public async Task<IActionResult> SendInterviewInvite(int applicationId, [FromBody] InterviewInviteDto dto)
    {
        try
        {
            await _applicationService.SendInterviewInviteAsync(applicationId, dto, GetCurrentUserId());
            return Ok(new { message = "Interview invitation sent successfully." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send interview invite for application {Id}.", applicationId);
            return StatusCode(500, new { message = "Failed to send email. Please check server email configuration." });
        }
    }
}
