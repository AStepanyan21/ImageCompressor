using System.Security.Claims;
using ImageCompressor.Authorization.Options;
using ImageCompressor.Authorization.Services;
using ImageCompressor.Exceptions;
using ImageCompressor.Models.Request;
using ImageCompressor.Models.Response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace ImageCompressor.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService, IOptions<AuthOptions> options)
    : ControllerBase
{
    private readonly AuthOptions _authOptions = options.Value;

    [HttpPost("register")]
    public async Task<ActionResult<CurrentUserResponseData>> UserRegistration(
        [FromBody] UserRegisterRequestData requestData,
        CancellationToken ct)
    {
        var userData = await authService.Register(requestData, ct);
        AppendAuthCookie(userData.Token);

        return Ok(new CurrentUserResponseData { Username = userData.Username });
    }

    [HttpPost("login")]
    public async Task<ActionResult<CurrentUserResponseData>> UserLogin(
        [FromBody] UserLoginRequestData requestData,
        CancellationToken ct)
    {
        var userData = await authService.Login(requestData, ct);
        AppendAuthCookie(userData.Token);

        return Ok(new CurrentUserResponseData { Username = userData.Username });
    }

    [HttpGet("me")]
    [Authorize]
    public ActionResult<CurrentUserResponseData> GetCurrentUser()
    {
        // Name claim is added by UserSessionMiddleware only when the Redis session is still alive.
        var username = User.FindFirst(ClaimTypes.Name)?.Value
                       ?? throw new BaseExceptions("Session expired", 401);

        return Ok(new CurrentUserResponseData { Username = username });
    }

    // Not [Authorize]: an expired session must still be able to clear its cookie.
    [HttpPost("logout")]
    public async Task<IActionResult> UserLogout(CancellationToken ct)
    {
        await authService.Logout(User.FindFirst("SessionId")?.Value, ct);
        Response.Cookies.Delete(_authOptions.CookieKeyName, CreateCookieOptions());
        return Ok();
    }

    private void AppendAuthCookie(string token)
    {
        var cookieOptions = CreateCookieOptions();
        cookieOptions.Expires = DateTimeOffset.UtcNow.AddMinutes(_authOptions.Lifetime);
        Response.Cookies.Append(_authOptions.CookieKeyName, token, cookieOptions);
    }

    private CookieOptions CreateCookieOptions() => new()
    {
        HttpOnly = _authOptions.HttpOnly,
        Secure = _authOptions.Secure,
        SameSite = SameSiteMode.Strict,
        Path = "/"
    };
}
