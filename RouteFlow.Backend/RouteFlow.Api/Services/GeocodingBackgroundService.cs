using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RouteFlow.Application.Interfaces;
using RouteFlow.Infrastructure.Persistence;

namespace RouteFlow.Api.Services
{
    public class GeocodingBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<GeocodingBackgroundService> _logger;

        public GeocodingBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<GeocodingBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Geocoding Background Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessOrdersAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing Geocoding work item.");
                }

                // Wait 10 seconds before polling again to avoid spamming the DB too frequently
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
        }

        private async Task ProcessOrdersAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var geocodingService = scope.ServiceProvider.GetRequiredService<IGeocodingService>();

            // Find orders that need geocoding (0.0 coordinates)
            var pendingOrders = await dbContext.Orders
                .Where(o => o.Latitude == 0 && o.Longitude == 0)
                .Take(5) // Process in small batches
                .ToListAsync(stoppingToken);

            if (!pendingOrders.Any()) return;

            foreach (var order in pendingOrders)
            {
                _logger.LogInformation($"Geocoding address for order {order.OrderCode}: {order.Address}");

                var result = await geocodingService.GeocodeAddressAsync(order.Address);

                if (result.HasValue)
                {
                    order.UpdateLocation(result.Value.Lat, result.Value.Lng);
                    _logger.LogInformation($"Geocoded {order.OrderCode} to {result.Value.Lat}, {result.Value.Lng}");
                }
                else
                {
                    // Mark as failed by using dummy coordinates like -1, -1 to prevent infinite retries
                    order.UpdateLocation(-1, -1);
                    _logger.LogWarning($"Failed to geocode {order.OrderCode}. Marking as -1, -1");
                }

                // Save incrementally
                await dbContext.SaveChangesAsync(stoppingToken);

                // Delay to respect OSM rate limits (1 request per second)
                await Task.Delay(1500, stoppingToken);
            }
        }
    }
}
