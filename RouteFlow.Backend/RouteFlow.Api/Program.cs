using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;
using RouteFlow.Api.Middlewares;
using RouteFlow.Api.Services;
using RouteFlow.Application;
using RouteFlow.Infrastructure.Persistence;
using RouteFlow.Infrastructure;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHealthChecks();

// Register Background Worker for Geocoding
builder.Services.AddHostedService<GeocodingBackgroundService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

ExcelPackage.License.SetNonCommercialPersonal("RouteFlow");


// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendClient",
        policy =>
        {
            var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                ?? Array.Empty<string>();

            if (origins.Length == 0)
            {
                origins = new[]
                {
                    "http://localhost:4200",
                    "https://localhost:4200",
                    "http://localhost:8080"
                };
            }

            policy.WithOrigins(origins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder.Build();
ApplyDatabaseMigrations(app);

// Configure the HTTP request pipeline.
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment() || app.Configuration.GetValue("Features:EnableSwagger", false))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("FrontendClient");

app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.MapGet("/", context => {
    context.Response.Redirect(app.Configuration.GetValue("Features:EnableSwagger", app.Environment.IsDevelopment())
        ? "/swagger/index.html"
        : "/health");
    return Task.CompletedTask;
});

app.Run();

static void ApplyDatabaseMigrations(WebApplication app)
{
    var shouldMigrate = app.Configuration.GetValue("Database:ApplyMigrationsOnStartup", true);
    if (!shouldMigrate)
    {
        return;
    }

    using var scope = app.Services.CreateScope();
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
        .CreateLogger("DatabaseMigration");
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    logger.LogInformation("Applying database migrations on startup.");
    dbContext.Database.Migrate();
}
