using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RouteFlow.Application.Interfaces;
using RouteFlow.Domain.Interfaces;
using RouteFlow.Infrastructure.Persistence;
using RouteFlow.Infrastructure.Persistence.Repositories;
using RouteFlow.Infrastructure.Services;

namespace RouteFlow.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException("ConnectionStrings:DefaultConnection is required.");
            }

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(
                    connectionString,
                    b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

            services.AddScoped<IOrderRepository, OrderRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            services.AddTransient<IExcelImportService, ExcelImportService>();
            services.AddTransient<IExcelTemplateService, ExcelTemplateService>();
            services.AddTransient<IClusterService, ClusterService>();

            // Register Geocoding Service with HttpClient
            services.AddHttpClient<IGeocodingService, NominatimGeocodingService>();

            // Register Email Notification Service
            services.AddTransient<IEmailService, SmtpEmailService>();

            return services;
        }
    }
}
