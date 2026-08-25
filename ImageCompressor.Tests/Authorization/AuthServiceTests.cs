using ImageCompressor.Authorization.Data;
using ImageCompressor.Authorization.Services;
using ImageCompressor.EntityFramework.DAO;
using ImageCompressor.EntityFramework.Models;
using ImageCompressor.EntityFramework.Repositories;
using ImageCompressor.Exceptions;
using ImageCompressor.Models.Request;
using ImageCompressor.Models.Response;
using Microsoft.Extensions.Logging;
using Moq;

namespace ImageCompressor.Tests.Authorization;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<ICacheService> _cacheServiceMock;
    private readonly Mock<IJwtTokenService> _jwtTokenServiceMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _cacheServiceMock = new Mock<ICacheService>();
        _jwtTokenServiceMock = new Mock<IJwtTokenService>();
        
        _authService = new AuthService(
            _cacheServiceMock.Object,
            _userRepositoryMock.Object,
            _jwtTokenServiceMock.Object);
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsTokenAndUsername()
    {
        // Arrange
        var request = new UserRegisterRequestData
        {
            Username = "testuser",
            Password = "password123",
            ConfirmPassword = "password123"
        };
        
        var createdUser = new User { UserId = 1, Username = "testuser", HashedPassword = "hashed" };
        _userRepositoryMock
            .Setup(r => r.CreateUser(It.IsAny<CreateUserData>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdUser);
        
        _jwtTokenServiceMock
            .Setup(j => j.CreateJwt(It.IsAny<IEnumerable<System.Security.Claims.Claim>>()))
            .Returns("jwt-token");

        // Act
        var result = await _authService.Register(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("testuser", result.Username);
        Assert.Equal("jwt-token", result.Token);
        _userRepositoryMock.Verify(r => r.CreateUser(It.IsAny<CreateUserData>(), It.IsAny<CancellationToken>()), Times.Once);
        _cacheServiceMock.Verify(c => c.SetUserSessionAsync(It.IsAny<string>(), It.IsAny<UserSessionData>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Register_PasswordsDoNotMatch_ThrowsException()
    {
        // Arrange
        var request = new UserRegisterRequestData
        {
            Username = "testuser",
            Password = "password123",
            ConfirmPassword = "differentpassword"
        };

        // Act & Assert
        await Assert.ThrowsAsync<BaseExceptions>(() => _authService.Register(request));
    }

    [Fact]
    public async Task Login_WithCorrectCredentials_ReturnsTokenAndUsername()
    {
        // Arrange
        var request = new UserLoginRequestData
        {
            Username = "testuser",
            Password = "password123"
        };
        
        var user = new User 
        { 
            UserId = 1, 
            Username = "testuser", 
            HashedPassword = Convert.ToBase64String(System.Security.Cryptography.SHA256.Create().ComputeHash(System.Text.Encoding.UTF8.GetBytes("password123")))
        };
        
        _userRepositoryMock
            .Setup(r => r.GetUserByUsername(request.Username, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        
        _jwtTokenServiceMock
            .Setup(j => j.CreateJwt(It.IsAny<IEnumerable<System.Security.Claims.Claim>>()))
            .Returns("jwt-token");

        // Act
        var result = await _authService.Login(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("testuser", result.Username);
        Assert.Equal("jwt-token", result.Token);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ThrowsException()
    {
        // Arrange
        var request = new UserLoginRequestData
        {
            Username = "testuser",
            Password = "wrongpassword"
        };
        
        var user = new User 
        { 
            UserId = 1, 
            Username = "testuser", 
            HashedPassword = Convert.ToBase64String(System.Security.Cryptography.SHA256.Create().ComputeHash(System.Text.Encoding.UTF8.GetBytes("password123")))
        };
        
        _userRepositoryMock
            .Setup(r => r.GetUserByUsername(request.Username, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Act & Assert
        await Assert.ThrowsAsync<BaseExceptions>(() => _authService.Login(request));
    }

    [Fact]
    public async Task Logout_WithValidSessionId_RemovesSession()
    {
        // Arrange
        var sessionId = "test-session-id";

        // Act
        await _authService.Logout(sessionId);

        // Assert
        _cacheServiceMock.Verify(c => c.RemoveUserSessionAsync(sessionId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Logout_WithNullSessionId_DoesNotCallCache()
    {
        // Act
        await _authService.Logout(null);

        // Assert
        _cacheServiceMock.Verify(c => c.RemoveUserSessionAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
