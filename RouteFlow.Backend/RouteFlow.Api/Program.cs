using Microsoft.AspNetCore.Builder;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using OfficeOpenXml;
using RouteFlow.Api.Middlewares;
using RouteFlow.Api.Services;
using RouteFlow.Application;
using RouteFlow.Application.Common.Security;
using RouteFlow.Infrastructure.Persistence;
using RouteFlow.Infrastructure;
using Microsoft.EntityFrameworkCore;
using RouteFlow.Infrastructure.Identity;

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
builder.Services.AddHttpContextAccessor();

var jwtIssuer = builder.Configuration["Auth:Jwt:Issuer"] ?? "RouteFlow";
var jwtAudience = builder.Configuration["Auth:Jwt:Audience"] ?? "RouteFlowClient";
var jwtSigningKey = builder.Configuration["Auth:Jwt:SigningKey"]
    ?? "RouteFlow__ReplaceThisSigningKeyInProduction__1234567890";
var jwtKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = jwtKey,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();

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
await EnsureIdentitySetupAsync(app);

// Configure the HTTP request pipeline.
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment() || app.Configuration.GetValue("Features:EnableSwagger", false))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("FrontendClient");

app.UseAuthentication();
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

    var migrations = dbContext.Database.GetMigrations().ToList();
    if (migrations.Count == 0)
    {
        logger.LogInformation("No EF migrations were found. Falling back to EnsureCreated for bootstrap environments.");
        dbContext.Database.EnsureCreated();
        return;
    }

    logger.LogInformation("Applying database migrations on startup.");
    dbContext.Database.Migrate();
}

static async Task EnsureIdentitySetupAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
    var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

    foreach (var role in ApplicationRoles.All)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole<Guid>(role));
        }
    }

    var email = configuration["Auth:BootstrapAdmin:Email"];
    var password = configuration["Auth:BootstrapAdmin:Password"];
    var fullName = configuration["Auth:BootstrapAdmin:FullName"] ?? "RouteFlow Admin";
    var userName = configuration["Auth:BootstrapAdmin:UserName"] ?? "admin";

    if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
    {
        return;
    }

    var existingUser = await userManager.FindByEmailAsync(email.Trim());
    if (existingUser != null)
    {
        return;
    }

    var user = new AppUser
    {
        Id = Guid.NewGuid(),
        Email = email.Trim(),
        UserName = userName.Trim(),
        FullName = fullName.Trim(),
        IsActive = true,
        CreatedAt = DateTime.UtcNow,
        EmailConfirmed = true
    };

    var result = await userManager.CreateAsync(user, password);
    if (!result.Succeeded)
    {
        return;
    }

    await userManager.AddToRolesAsync(user, [ApplicationRoles.Admin, ApplicationRoles.Dispatcher]);
}
