using ImageCompressor.EntityFramework.DAO;
using ImageCompressor.EntityFramework.Models;
using ImageCompressor.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ImageCompressor.EntityFramework.Repositories;

public interface IUserRepository
{
    Task<User> CreateUser(CreateUserData createUserData, CancellationToken ct = default);
    Task<User> GetUserById(uint id, CancellationToken ct = default);
    Task<User> GetUserByUsername(string username, CancellationToken ct = default);
}

internal class UserRepository(
    ApplicationContext context,
    ILogger<UserRepository> logger) : IUserRepository
{
    public async Task<User> CreateUser(CreateUserData createUserData, CancellationToken ct = default)
    {
        try
        {
            User user = new User()
            {
                Username = createUserData.Username,
                HashedPassword = createUserData.HashedPassword
            };
            context.Users.Add(user);
            await context.SaveChangesAsync(ct);
            return user;
        }
        catch (DbUpdateException e)
        {
            // Unique index on Username is the only expected constraint violation here.
            logger.LogInformation(e, "Failed to create user {Username}", createUserData.Username);
            throw new BaseExceptions("Username is already taken", 409);
        }
    }

    public async Task<User> GetUserById(uint id, CancellationToken ct = default)
    {
        var user = await context.Users
            .FirstOrDefaultAsync(user => user.UserId == id, ct);

        if (user == null)
        {
            throw new BaseExceptions("User not found", 404);
        }

        return user;
    }

    public async Task<User> GetUserByUsername(string username, CancellationToken ct = default)
    {
        var user = await context.Users
            .FirstOrDefaultAsync(user => user.Username == username, ct);
        if (user == null)
        {
            throw new BaseExceptions("User not found", 404);
        }

        return user;
    }
}