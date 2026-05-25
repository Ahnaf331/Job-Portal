using HireFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HireFlow.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User config
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Role).HasConversion<string>();
        });

        // Job config
        modelBuilder.Entity<Job>(entity =>
        {
            entity.Property(j => j.SalaryMin).HasPrecision(18, 2);
            entity.Property(j => j.SalaryMax).HasPrecision(18, 2);
            entity.Property(j => j.JobType).HasConversion<string>();
            entity.HasOne(j => j.Employer)
                  .WithMany(u => u.PostedJobs)
                  .HasForeignKey(j => j.EmployerId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Application config
        modelBuilder.Entity<JobApplication>(entity =>
        {
            entity.Property(a => a.Status).HasConversion<string>();
            entity.HasOne(a => a.Job)
                  .WithMany(j => j.Applications)
                  .HasForeignKey(a => a.JobId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(a => a.Candidate)
                  .WithMany(u => u.Applications)
                  .HasForeignKey(a => a.CandidateId)
                  .OnDelete(DeleteBehavior.Restrict);
            // Prevent duplicate applications
            entity.HasIndex(a => new { a.JobId, a.CandidateId }).IsUnique();
        });
    }
}
