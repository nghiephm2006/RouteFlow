using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using RouteFlow.Application.Interfaces;

namespace RouteFlow.Infrastructure.Security
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid? UserId
        {
            get
            {
                var user = _httpContextAccessor.HttpContext?.User;
                var rawUserId = user?.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? user?.FindFirstValue("sub");

                return Guid.TryParse(rawUserId, out var parsed) ? parsed : null;
            }
        }
    }
}
