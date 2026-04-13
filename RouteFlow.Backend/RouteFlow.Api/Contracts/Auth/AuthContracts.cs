using System;
using System.Collections.Generic;

namespace RouteFlow.Api.Contracts.Auth
{
    public record LoginRequest(string Email, string Password);

    public record BootstrapAdminRequest(
        string Email,
        string Password,
        string FullName,
        string UserName);

    public class AuthUserResponse
    {
        public required Guid Id { get; init; }
        public required string Email { get; init; }
        public required string UserName { get; init; }
        public required string FullName { get; init; }
        public required IReadOnlyList<string> Roles { get; init; }
    }

    public class AuthResponse
    {
        public required string AccessToken { get; init; }
        public required DateTime ExpiresAtUtc { get; init; }
        public required AuthUserResponse User { get; init; }
    }

    public class BootstrapStatusResponse
    {
        public required bool CanBootstrapAdmin { get; init; }
    }
}
