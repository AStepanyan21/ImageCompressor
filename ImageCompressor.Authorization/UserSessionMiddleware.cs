using System.Security.Claims;
using ImageCompressor.Authorization.Data;
using ImageCompressor.Authorization.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace ImageCompressor.Authorization;

public class UserSessionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var sessionId = context.User.FindFirst("SessionId")?.Value;
            if (!string.IsNullOrEmpty(sessionId))
            {
                var cacheService = context.RequestServices.GetRequiredService<ICacheService>();

                var session = await cacheService.GetUserSessionAsync<UserSessionData>(sessionId);
                if (session != null)
                {
                    if (context.User.Identity is ClaimsIdentity identity)
                    {
                        identity.AddClaims([
                            new Claim(ClaimTypes.Name, session.Username),
                            new Claim("SessionId", sessionId),
                        ]);
                    }
                }
            }
        }
        await next(context);
    }
    
}