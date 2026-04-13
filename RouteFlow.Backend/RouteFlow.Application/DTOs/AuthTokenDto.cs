using System;

namespace RouteFlow.Application.DTOs
{
    public class AuthTokenDto
    {
        public required string AccessToken { get; init; }
        public required DateTime ExpiresAtUtc { get; init; }
    }
}
