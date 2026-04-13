using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using RouteFlow.Application.DTOs;
using RouteFlow.Application.Interfaces;

namespace RouteFlow.Infrastructure.Security
{
    public class JwtTokenService : IJwtTokenService
    {
        private readonly IConfiguration _configuration;

        public JwtTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public AuthTokenDto CreateToken(
            Guid userId,
            string email,
            string userName,
            string fullName,
            IEnumerable<string> roles)
        {
            var issuer = _configuration["Auth:Jwt:Issuer"] ?? "RouteFlow";
            var audience = _configuration["Auth:Jwt:Audience"] ?? "RouteFlowClient";
            var signingKey = _configuration["Auth:Jwt:SigningKey"]
                ?? "RouteFlow__ReplaceThisSigningKeyInProduction__1234567890";
            var accessTokenMinutes = _configuration.GetValue("Auth:Jwt:AccessTokenMinutes", 480);

            var expiresAtUtc = DateTime.UtcNow.AddMinutes(accessTokenMinutes);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new(ClaimTypes.NameIdentifier, userId.ToString()),
                new(ClaimTypes.Name, userName),
                new(JwtRegisteredClaimNames.Email, email),
                new(JwtRegisteredClaimNames.UniqueName, userName),
                new("full_name", fullName),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expiresAtUtc,
                signingCredentials: credentials);

            return new AuthTokenDto
            {
                AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
                ExpiresAtUtc = expiresAtUtc
            };
        }
    }
}
