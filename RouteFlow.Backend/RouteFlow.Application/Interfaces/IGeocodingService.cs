using System.Threading.Tasks;

namespace RouteFlow.Application.Interfaces
{
    public interface IGeocodingService
    {
        Task<(double Lat, double Lng)?> GeocodeAddressAsync(string address);
    }
}
