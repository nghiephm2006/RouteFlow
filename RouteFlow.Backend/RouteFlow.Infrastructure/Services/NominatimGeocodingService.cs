using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using RouteFlow.Application.Interfaces;

namespace RouteFlow.Infrastructure.Services
{
    public class NominatimGeocodingService : IGeocodingService
    {
        private readonly HttpClient _httpClient;

        public NominatimGeocodingService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            // Nominatim requires a User-Agent
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "RouteFlowApp/1.0 (Contact: routeflow@example.com)");
        }

        public async Task<(double Lat, double Lng)?> GeocodeAddressAsync(string address)
        {
            try
            {
                var encodedAddress = Uri.EscapeDataString(address);
                var url = $"https://nominatim.openstreetmap.org/search?format=json&q={encodedAddress}";
                
                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                    return null;

                var jsonString = await response.Content.ReadAsStringAsync();
                var results = JsonSerializer.Deserialize<JsonElement>(jsonString);

                if (results.ValueKind == JsonValueKind.Array && results.GetArrayLength() > 0)
                {
                    var firstResult = results[0];
                    if (double.TryParse(firstResult.GetProperty("lat").GetString(), out var lat) &&
                        double.TryParse(firstResult.GetProperty("lon").GetString(), out var lng))
                    {
                        return (lat, lng);
                    }
                }
            }
            catch (Exception ex)
            {
                // In a production app, we would log this
                Console.WriteLine($"Geocoding Error: {ex.Message}");
            }

            return null;
        }
    }
}
