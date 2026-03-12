using System.Threading.Tasks;

namespace RouteFlow.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendOrderStatusChangedAsync(
            string toEmail,
            string toName,
            string orderCode,
            string newStatusName);
    }
}
