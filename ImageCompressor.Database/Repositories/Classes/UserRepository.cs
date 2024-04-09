using ImageCompressor.Database.DAO;
using ImageCompressor.Database.Models;
using ImageCompressor.Database.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ImageCompressor.Database.Repositories.Classes;

public class UserRepository(ImageCompressorApplicationContext context) : IUserRepository
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
        return await context.Users
            .FirstOrDefaultAsync(user => user.UserId == id);
    }

    public async Task<User> GetUserByUsername(string username)
    {
        return await context.Users
            .FirstOrDefaultAsync(user => user.Username == username);
    }
}