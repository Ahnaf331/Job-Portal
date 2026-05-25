using System.Security.Claims;
using HireFlow.Application.DTOs.Jobs;
using HireFlow.Application.Interfaces;
using HireFlow.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HireFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly IJobService _jobService;

    public JobsController(IJobService jobService)
    {
        _jobService = jobService;
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim) : null;
    }

    /// <summary>Search and list all active jobs (public)</summary>
    [HttpGet]
    public async Task<IActionResult> GetJobs(
        [FromQuery] string? keyword,
        [FromQuery] string? category,
        [FromQuery] string? location,
        [FromQuery] JobType? type)
    {
        var jobs = await _jobService.GetAllJobsAsync(keyword, category, location, type);
        return Ok(jobs);
    }

    /// <summary>Get a single job with full details (public)</summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetJob(int id)
    {
        var userId = GetCurrentUserId();
        var job = await _jobService.GetJobByIdAsync(id, userId);
        return job == null ? NotFound() : Ok(job);
    }

    /// <summary>Get jobs posted by the logged-in employer</summary>
    [HttpGet("my-jobs")]
    [Authorize(Roles = "Employer")]
    public async Task<IActionResult> GetMyJobs()
    {
        var employerId = GetCurrentUserId()!.Value;
        var jobs = await _jobService.GetEmployerJobsAsync(employerId);
        return Ok(jobs);
    }

    /// <summary>Post a new job (Employer only)</summary>
    [HttpPost]
    [Authorize(Roles = "Employer")]
    public async Task<IActionResult> CreateJob([FromBody] CreateJobDto dto)
    {
        var employerId = GetCurrentUserId()!.Value;
        var job = await _jobService.CreateJobAsync(dto, employerId);
        return CreatedAtAction(nameof(GetJob), new { id = job.Id }, job);
    }

    /// <summary>Update a job (Employer only — must own the job)</summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Employer")]
    public async Task<IActionResult> UpdateJob(int id, [FromBody] UpdateJobDto dto)
    {
        var employerId = GetCurrentUserId()!.Value;
        var job = await _jobService.UpdateJobAsync(id, dto, employerId);
        return job == null ? NotFound() : Ok(job);
    }

    /// <summary>Delete a job (Employer only — must own the job)</summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Employer")]
    public async Task<IActionResult> DeleteJob(int id)
    {
        var employerId = GetCurrentUserId()!.Value;
        var result = await _jobService.DeleteJobAsync(id, employerId);
        return result ? NoContent() : NotFound();
    }
}
