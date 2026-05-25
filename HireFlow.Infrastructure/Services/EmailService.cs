using System.Net;
using System.Net.Mail;
using HireFlow.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace HireFlow.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendInterviewInviteAsync(
        string toEmail,
        string candidateName,
        string jobTitle,
        string company,
        DateTime interviewDate,
        string interviewTime,
        string location,
        string? meetingLink,
        string? additionalMessage)
    {
        var smtpHost = _config["Email:SmtpHost"];
        if (string.IsNullOrEmpty(smtpHost))
        {
            _logger.LogWarning("Email:SmtpHost not configured. Interview invite skipped for {Email}.", toEmail);
            return;
        }

        var dateStr = interviewDate.ToString("dddd, MMMM d, yyyy");
        var locationHtml = !string.IsNullOrEmpty(meetingLink)
            ? $"<a href='{meetingLink}' style='color:#7c3aed;'>{meetingLink}</a>"
            : System.Net.WebUtility.HtmlEncode(location);

        var extraNote = string.IsNullOrEmpty(additionalMessage) ? "" :
            $"<p style='margin:16px 0;'><strong>Additional Information:</strong><br/>{System.Net.WebUtility.HtmlEncode(additionalMessage)}</p>";

        var body = $@"<!DOCTYPE html>
<html><body style='margin:0;padding:0;font-family:Arial,sans-serif;background:#f9f8ff;'>
<div style='max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,0.1);'>
  <div style='background:linear-gradient(135deg,#7c3aed,#a855f7);padding:32px 24px;text-align:center;'>
    <h1 style='color:#fff;margin:0;font-size:26px;font-weight:800;'>Interview Invitation</h1>
    <p style='color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:15px;'>{System.Net.WebUtility.HtmlEncode(company)}</p>
  </div>
  <div style='padding:32px 28px;'>
    <p style='font-size:15px;margin:0 0 16px;'>Dear <strong>{System.Net.WebUtility.HtmlEncode(candidateName)}</strong>,</p>
    <p style='color:#374151;line-height:1.6;margin:0 0 20px;'>
      We are pleased to invite you for an interview for the position of
      <strong>{System.Net.WebUtility.HtmlEncode(jobTitle)}</strong> at
      <strong>{System.Net.WebUtility.HtmlEncode(company)}</strong>.
    </p>
    <div style='background:#f9f8ff;border:1.5px solid #e9e4ff;border-radius:10px;padding:20px 24px;margin:0 0 20px;'>
      <h3 style='margin:0 0 14px;color:#7c3aed;font-size:16px;'>Interview Details</h3>
      <table style='width:100%;border-collapse:collapse;font-size:14px;'>
        <tr><td style='padding:6px 0;color:#6b7280;width:120px;'>Date</td><td style='color:#111827;font-weight:600;'>{dateStr}</td></tr>
        <tr><td style='padding:6px 0;color:#6b7280;'>Time</td><td style='color:#111827;font-weight:600;'>{System.Net.WebUtility.HtmlEncode(interviewTime)}</td></tr>
        <tr><td style='padding:6px 0;color:#6b7280;'>Location</td><td style='color:#111827;font-weight:600;'>{locationHtml}</td></tr>
      </table>
    </div>
    {extraNote}
    <p style='color:#374151;line-height:1.6;'>Please confirm your attendance by replying to this email. We look forward to speaking with you!</p>
    <p style='color:#6b7280;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;'>
      This message was sent via <strong>HireFlow</strong>. If you believe this was sent in error, please disregard.
    </p>
  </div>
</div>
</body></html>";

        using var message = new MailMessage
        {
            From = new MailAddress(
                _config["Email:FromAddress"] ?? "noreply@hireflow.com",
                _config["Email:FromName"] ?? "HireFlow"),
            Subject = $"Interview Invitation - {jobTitle} at {company}",
            Body = body,
            IsBodyHtml = true
        };
        message.To.Add(toEmail);

        using var smtp = new SmtpClient(_config["Email:SmtpHost"])
        {
            Port = int.TryParse(_config["Email:Port"], out var port) ? port : 587,
            Credentials = new NetworkCredential(_config["Email:Username"], _config["Email:Password"]),
            EnableSsl = !string.Equals(_config["Email:EnableSsl"], "false", StringComparison.OrdinalIgnoreCase)
        };

        await smtp.SendMailAsync(message);
        _logger.LogInformation("Interview invite sent to {Email} for {Job}.", toEmail, jobTitle);
    }
}
