using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RouteFlow.Api.Contracts.Auth;
using RouteFlow.Application.Common.Security;
using RouteFlow.Application.Interfaces;
using RouteFlow.Infrastructure.Identity;

namespace RouteFlow.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IJwtTokenService _jwtTokenService;

        public AuthController(
            UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager,
            IJwtTokenService jwtTokenService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtTokenService = jwtTokenService;
        }

        [AllowAnonymous]
        [HttpGet("bootstrap-status")]
        public async Task<ActionResult<BootstrapStatusResponse>> GetBootstrapStatus()
        {
            var hasUsers = await _userManager.Users.AnyAsync();
            return Ok(new BootstrapStatusResponse
            {
                CanBootstrapAdmin = !hasUsers
            });
        }

        [AllowAnonymous]
        [HttpPost("bootstrap-admin")]
        public async Task<ActionResult<AuthResponse>> BootstrapAdmin([FromBody] BootstrapAdminRequest request)
        {
            if (await _userManager.Users.AnyAsync())
            {
                return Conflict(new { message = "Bootstrap admin is only available before the first user exists." });
            }

            var userName = string.IsNullOrWhiteSpace(request.UserName)
                ? request.Email
                : request.UserName.Trim();

            var user = new AppUser
            {
                Id = Guid.NewGuid(),
                Email = request.Email.Trim(),
                UserName = userName,
                FullName = request.FullName.Trim(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                EmailConfirmed = true
            };

            var createResult = await _userManager.CreateAsync(user, request.Password);
            if (!createResult.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Bootstrap admin creation failed.",
                    errors = createResult.Errors.GroupBy(x => x.Code).ToDictionary(g => g.Key, g => g.Select(e => e.Description).ToArray())
                });
            }

            await _userManager.AddToRolesAsync(user, [ApplicationRoles.Admin, ApplicationRoles.Dispatcher]);

            return Ok(await BuildAuthResponseAsync(user));
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            var normalizedEmail = request.Email.Trim();
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == normalizedEmail);
            if (user == null || !user.IsActive)
            {
                return Unauthorized(new { message = "Invalid credentials." });
            }

            var signInResult = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
            if (!signInResult.Succeeded)
            {
                return Unauthorized(new { message = "Invalid credentials." });
            }

            return Ok(await BuildAuthResponseAsync(user));
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<AuthUserResponse>> Me()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(ClaimTypes.Name)
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(ClaimTypes.Sid)
                ?? User.FindFirstValue(ClaimTypes.PrimarySid)
                ?? User.FindFirstValue("sub");

            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                return Unauthorized();
            }

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new AuthUserResponse
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                UserName = user.UserName ?? string.Empty,
                FullName = user.FullName,
                Roles = roles.ToList()
            });
        }

        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            return NoContent();
        }

        private async Task<AuthResponse> BuildAuthResponseAsync(AppUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var token = _jwtTokenService.CreateToken(
                user.Id,
                user.Email ?? string.Empty,
                user.UserName ?? string.Empty,
                user.FullName,
                roles);

            return new AuthResponse
            {
                AccessToken = token.AccessToken,
                ExpiresAtUtc = token.ExpiresAtUtc,
                User = new AuthUserResponse
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    UserName = user.UserName ?? string.Empty,
                    FullName = user.FullName,
                    Roles = roles.ToList()
                }
            };
        }
    }
}
