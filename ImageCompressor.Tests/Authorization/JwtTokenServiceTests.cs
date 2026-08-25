using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ImageCompressor.Authorization.Options;
using ImageCompressor.Authorization.Services;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ImageCompressor.Tests.Authorization;

public class JwtTokenServiceTests
{
    private readonly AuthOptions _authOptions = new()
    {
        Lifetime = 60,
        SigningKey = "test-secret-key-minimum-32-characters-long"
    };

    private JwtTokenService CreateService() => new(Options.Create(_authOptions));

    [Fact]
    public void CreateJwt_WithValidClaims_ReturnsValidToken()
    {
        // Arrange
        var service = CreateService();
        var claims = new List<Claim>
        {
            new("SessionId", "test-session-id"),
            new(ClaimTypes.Name, "testuser")
        };

        // Act
        var token = service.CreateJwt(claims);

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);
    }

    [Fact]
    public void CreateJwt_TokenContainsCorrectClaims()
    {
        // Arrange
        var service = CreateService();
        var sessionId = "test-session-id-123";
        var claims = new List<Claim>
        {
            new("SessionId", sessionId)
        };

        // Act
        var token = service.CreateJwt(claims);
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        // Assert
        Assert.Equal(sessionId, jwtToken.Claims.First(c => c.Type == "SessionId").Value);
    }

    [Fact]
    public void CreateJwt_TokenHasCorrectExpiration()
    {
        // Arrange
        var lifetime = 60;
        var options = new AuthOptions
        {
            Lifetime = lifetime,
            SigningKey = "test-secret-key-minimum-32-characters-long"
        };
        var serviceWithLifetime = new JwtTokenService(Options.Create(options));
        var claims = new List<Claim> { new("SessionId", "test") };

        // Act
        var token = serviceWithLifetime.CreateJwt(claims);
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        // Assert
        var expectedExpiry = DateTime.UtcNow.AddMinutes(lifetime);
        Assert.True(Math.Abs((expectedExpiry - jwtToken.ValidTo).TotalSeconds) < 5);
    }

    [Fact]
    public void CreateJwt_EmptyClaims_ReturnsValidToken()
    {
        // Arrange
        var service = CreateService();

        // Act
        var token = service.CreateJwt(Enumerable.Empty<Claim>());

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);
    }
}
