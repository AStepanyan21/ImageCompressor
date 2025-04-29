using System.Security.Claims;
using ImageCompressor.Authorization.Data;
using ImageCompressor.Authorization.Options;
using ImageCompressor.EntityFramework.Models;
using Microsoft.Extensions.Options;

namespace ImageCompressor.Authorization.Services;

public interface IAuthService
{
    Task<ClaimsIdentity> GetUserClaimsIdentity(User user);
    Task Logout(string? sessionId);
}

public class AuthService(ICacheService cacheService) : IAuthService
{
    public async Task<ClaimsIdentity> GetUserClaimsIdentity(User user)
    {
        string sessionId = Guid.NewGuid().ToString();
        await SetUserDataInCache(user, sessionId);
        var claims = new List<Claim>
        {
            new Claim("SessionId", sessionId),
        };
        ClaimsIdentity claimsIdentity =
            new ClaimsIdentity(claims, "Token", ClaimsIdentity.DefaultNameClaimType,
                ClaimsIdentity.DefaultRoleClaimType);
        return claimsIdentity;
    }

    public async Task Logout(string? sessionId)
    {
        if (sessionId is not null)
        {
            await cacheService.RemoveUserSessionAsync(sessionId);
        }
    }

    private async Task SetUserDataInCache(User user, string sessionId)
    {
        await cacheService.SetUserSessionAsync(sessionId, new UserSessionData { Username = user.Username });
    }
}