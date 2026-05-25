namespace HireFlow.Application.Interfaces;

public interface IEmailService
{
    Task SendInterviewInviteAsync(
        string toEmail,
        string candidateName,
        string jobTitle,
        string company,
        DateTime interviewDate,
        string interviewTime,
        string location,
        string? meetingLink,
        string? additionalMessage);
}
