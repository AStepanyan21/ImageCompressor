using ImageCompressor.Database.DAO;
using ImageCompressor.Database.Models;

namespace ImageCompressor.Database.Repositories.Interfaces;

public interface IUserRepository
{
    Task<User> CreateUser(CreateUserData createUserData );
    Task<User> GetUserById(uint id);
    Task<User> GetUserByUsername(string username);
}