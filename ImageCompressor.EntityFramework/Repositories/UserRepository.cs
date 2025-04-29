using ImageCompressor.EntityFramework.DAO;
using ImageCompressor.EntityFramework.Models;
using Microsoft.EntityFrameworkCore;

namespace ImageCompressor.EntityFramework.Repositories;

public interface IUserRepository
{
    Task<User> CreateUser(CreateUserData createUserData);
    Task<User> GetUserById(uint id);
    Task<User> GetUserByUsername(string username);
}

public class UserRepository(ApplicationContext context) : IUserRepository
{
    public async Task<User> CreateUser(CreateUserData createUserData)
    {
        User user = new User()
        {
            Username = createUserData.Username,
            HashedPassword = createUserData.HashedPassword
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user;
    }

    public async Task<User> GetUserById(uint id)
    {
        var user = await context.Users
            .FirstOrDefaultAsync(user => user.UserId == id);

        if (user == null)
        {
            throw new Exception("User not found");
        }

        return user;
    }

    public async Task<User> GetUserByUsername(string username)
    {
        var user = await context.Users
            .FirstOrDefaultAsync(user => user.Username == username);
        if (user == null)
        {
            throw new Exception("User not found");
        }

        return user;
    }
}