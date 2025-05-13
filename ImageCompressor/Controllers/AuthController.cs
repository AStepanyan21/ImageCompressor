using ImageCompressor.Authorization.Options;
using ImageCompressor.Authorization.Services;
using ImageCompressor.Models.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace ImageCompressor.Controllers;

[ApiController]
[Route($"api/auth")]
public class AuthController(IAuthService authService, IOptions<AuthOptions> options)
    : ControllerBase
{
    private readonly AuthOptions _authOptions = options.Value;


    [HttpPost("register")]
    public async Task<IActionResult> UserRegistration(
        [FromBody] UserRegisterRequestData requestData,
        CancellationToken ct)
    {
        var userData = await authService.Register(requestData, ct);
        Response.Cookies.Append(_authOptions.CookieKeyName, userData.Token, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddMinutes(_authOptions.Lifetime)
        });

        return Ok(new
        {
            userData.Username
        });
    }


    [HttpPost("login")]
    public async Task<IActionResult> UserLogin([FromBody] UserLoginRequestData requestData,
        CancellationToken ct)
    {
        var userData = await authService.Login(requestData, ct);
        Response.Cookies.Append(_authOptions.CookieKeyName, userData.Token, new CookieOptions
        {
            HttpOnly = _authOptions.HttpOnly,
            Secure = _authOptions.Secure,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddMinutes(_authOptions.Lifetime)
        });

        return Ok(new
        {
            userData.Username
        });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> UserLogout(CancellationToken ct)
    {
        await authService.Logout(HttpContext.User.FindFirst("SessionId")?.Value, ct);
        Response.Cookies.Delete(_authOptions.CookieKeyName);
        return Ok();
    }
}