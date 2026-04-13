using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RouteFlow.Application.Common.Security;
using RouteFlow.Application.Interfaces;
using RouteFlow.Domain.Interfaces;
using RouteFlow.Infrastructure.Identity;
using RouteFlow.Infrastructure.Persistence;
using RouteFlow.Infrastructure.Persistence.Repositories;
using RouteFlow.Infrastructure.Security;
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
                options.UseNpgsql(
                    connectionString,
                    b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

            services.AddIdentityCore<AppUser>(options =>
                {
                    options.User.RequireUniqueEmail = true;
                    options.Password.RequireDigit = true;
                    options.Password.RequireLowercase = true;
                    options.Password.RequireUppercase = true;
                    options.Password.RequiredLength = 8;
                    options.Password.RequireNonAlphanumeric = false;
                })
                .AddRoles<IdentityRole<Guid>>()
                .AddEntityFrameworkStores<AppDbContext>()
                .AddSignInManager()
                .AddDefaultTokenProviders();

            services.AddScoped<IOrderRepository, OrderRepository>();
            services.AddScoped<IOrderStatusHistoryRepository, OrderStatusHistoryRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IJwtTokenService, JwtTokenService>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();

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
