using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ImageCompressor.Authorization.Data;
using ImageCompressor.EntityFramework.DAO;
using ImageCompressor.EntityFramework.Models;
using ImageCompressor.EntityFramework.Repositories;
using ImageCompressor.Exceptions;
using ImageCompressor.Models.Request;
using ImageCompressor.Models.Response;

namespace ImageCompressor.Authorization.Services;

public interface IAuthService
{
    Task Logout(string? sessionId, CancellationToken ct = default);
    Task<UserLoginResponseData> Login(UserLoginRequestData requestData, CancellationToken ct = default);
    Task<UserLoginResponseData> Register(UserRegisterRequestData requestData, CancellationToken ct = default);
}

internal class AuthService(
    ICacheService cacheService,
    IUserRepository userRepository,
    IJwtTokenService jwtTokenService) : IAuthService
{
    public async Task Logout(string? sessionId, CancellationToken ct = default)
    {
        if (sessionId is not null)
        {
            await cacheService.RemoveUserSessionAsync(sessionId, ct);
        }
    }

    public async Task<UserLoginResponseData> Login(UserLoginRequestData requestData, CancellationToken ct = default)
    {
        var username = requestData.Username.Trim();

        User user;
        try
        {
            user = await userRepository.GetUserByUsername(username, ct);
        }
        catch (BaseExceptions ex) when (ex.StatusCode == 404)
        {
            // Same answer for unknown user and wrong password, so usernames cannot be enumerated.
            throw InvalidCredentials();
        }

        if (!VerifyPassword(requestData.Password, user))
            throw InvalidCredentials();

        var claims = await GetUserClaimsIdentity(user, ct);
        var jwt = jwtTokenService.CreateJwt(claims.Claims);
        return new UserLoginResponseData()
        {
            Token = jwt,
            Username = user.Username
        };
    }

    public async Task<UserLoginResponseData> Register(UserRegisterRequestData requestData,
        CancellationToken ct = default)
    {
        var username = requestData.Username.Trim();
        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(requestData.Password))
        {
            throw new BaseExceptions("Username and password are required");
        }

        if (requestData.Password != requestData.ConfirmPassword)
        {
            throw new BaseExceptions("Passwords do not match");
        }

        var user = await userRepository.CreateUser(new CreateUserData()
        {
            Username = username,
            HashedPassword = HashPassword(requestData.Password)
        }, ct);
        var claims = await GetUserClaimsIdentity(user, ct);
        var jwt = jwtTokenService.CreateJwt(claims.Claims);
        return new UserLoginResponseData()
        {
            Token = jwt,
            Username = user.Username
        };
    }

    private static BaseExceptions InvalidCredentials() => new("Invalid username or password", 401);

    private async Task SetUserDataInCache(User user, string sessionId, CancellationToken ct = default)
    {
        await cacheService.SetUserSessionAsync(sessionId, new UserSessionData
        {
            UserId = user.UserId,
            Username = user.Username
        }, ct);
    }

    private async Task<ClaimsIdentity> GetUserClaimsIdentity(User user, CancellationToken ct = default)
    {
        string sessionId = Guid.NewGuid().ToString();
        await SetUserDataInCache(user, sessionId, ct);
        var claims = new List<Claim>
        {
            new Claim("SessionId", sessionId),
        };
        ClaimsIdentity claimsIdentity =
            new ClaimsIdentity(claims, "Token", ClaimsIdentity.DefaultNameClaimType,
                ClaimsIdentity.DefaultRoleClaimType);
        return claimsIdentity;
    }

    private bool VerifyPassword(string password, User user)
    {
        return HashPassword(password) == user.HashedPassword;
    }

    private string HashPassword(string password)
    {
        using SHA256 sha256 = SHA256.Create();
        byte[] passwordBytes = Encoding.UTF8.GetBytes(password);
        byte[] hashBytes = sha256.ComputeHash(passwordBytes);
        string hashedPassword = Convert.ToBase64String(hashBytes);
        return hashedPassword;
    }
}
