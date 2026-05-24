using System.Security.Claims;
using ImageCompressor.Exceptions;

namespace ImageCompressor.Helpers;

public static class ClaimsPrincipalHelper
{
    public static uint GetCurrentUserId(this ClaimsPrincipal user)
    {
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!uint.TryParse(userIdClaim, out var userId) || userId == 0)
            throw new BaseExceptions("User session is invalid", 401);

        return userId;
    }
}
