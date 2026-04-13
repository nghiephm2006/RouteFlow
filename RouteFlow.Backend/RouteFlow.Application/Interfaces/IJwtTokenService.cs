using System;
using System.Collections.Generic;
using RouteFlow.Application.DTOs;

namespace RouteFlow.Application.Interfaces
{
    public interface IJwtTokenService
    {
        AuthTokenDto CreateToken(
            Guid userId,
            string email,
            string userName,
            string fullName,
            IEnumerable<string> roles);
    }
}
