using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ImageCompressor.Authorization.Options;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ImageCompressor.Authorization.Services;

public interface IJwtTokenService
{
    JwtSecurityToken CreateJwt(IEnumerable<Claim> claims);
}

public class JwtTokenService(IOptions<AuthOptions> options) : IJwtTokenService
{
    private readonly AuthOptions _authOptions = options.Value;

    public JwtSecurityToken CreateJwt(IEnumerable<Claim> claims)
    {
        var now = DateTime.UtcNow;
        var jwt = new JwtSecurityToken(
            notBefore: now,
            claims: claims,
            expires: now.Add(TimeSpan.FromMinutes(_authOptions.Lifetime)),
            signingCredentials: new SigningCredentials(_authOptions.SigningKey.GetSymmetricSecurityKey(),
                SecurityAlgorithms.HmacSha256));
        return jwt;
    }
}