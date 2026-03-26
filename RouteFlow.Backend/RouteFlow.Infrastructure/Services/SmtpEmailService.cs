using System;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using RouteFlow.Application.Interfaces;

namespace RouteFlow.Infrastructure.Services
{
    public class SmtpSettings
    {
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; }
        public bool EnableSsl { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FromName { get; set; } = string.Empty;
        public string FromEmail { get; set; } = string.Empty;
    }

    public class SmtpEmailService : IEmailService
    {
        private readonly SmtpSettings _settings;
        private readonly ILogger<SmtpEmailService> _logger;

        public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
        {
            _settings = configuration.GetSection("SmtpSettings").Get<SmtpSettings>() ?? new SmtpSettings();
            _logger = logger;
        }

        public async Task SendOrderStatusChangedAsync(
            string toEmail,
            string toName,
            string orderCode,
            string newStatusName)
        {
            // Skip sending if no email is configured
            if (string.IsNullOrWhiteSpace(toEmail)) return;
            if (!IsConfigured())
            {
                _logger.LogWarning(
                    "Skipping email for order {OrderCode} because SMTP settings are incomplete.",
                    orderCode);
                return;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = $"[RouteFlow] Cập nhật trạng thái đơn hàng {orderCode}";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <div style='background: #1A365D; padding: 20px; border-radius: 8px 8px 0 0;'>
                            <h2 style='color: white; margin: 0;'>🚚 RouteFlow - Cập nhật đơn hàng</h2>
                        </div>
                        <div style='background: #f9f9f9; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;'>
                            <p style='font-size: 16px;'>Xin chào <strong>{toName}</strong>,</p>
                            <p>Đơn hàng của bạn đã được cập nhật trạng thái mới:</p>
                            <div style='background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin: 16px 0;'>
                                <p style='margin: 4px 0;'><strong>Mã đơn:</strong> {orderCode}</p>
                                <p style='margin: 4px 0;'><strong>Trạng thái mới:</strong>
                                    <span style='background: #F97316; color: white; padding: 2px 10px; border-radius: 20px; font-size: 13px;'>{newStatusName}</span>
                                </p>
                            </div>
                            <p style='color: #888; font-size: 13px;'>Email này được gửi tự động từ hệ thống RouteFlow. Vui lòng không trả lời.</p>
                        </div>
                    </div>"
            };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(_settings.Host, _settings.Port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_settings.Username, _settings.Password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }

        private bool IsConfigured()
        {
            return !string.IsNullOrWhiteSpace(_settings.Host)
                && _settings.Port > 0
                && !string.IsNullOrWhiteSpace(_settings.Username)
                && !string.IsNullOrWhiteSpace(_settings.Password)
                && !string.IsNullOrWhiteSpace(_settings.FromEmail);
        }
    }
}
