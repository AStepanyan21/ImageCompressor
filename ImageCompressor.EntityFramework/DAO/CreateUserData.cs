namespace ImageCompressor.EntityFramework.DAO;

public class CreateUserData
{
    public string Username { set; get; } = string.Empty;
    public string HashedPassword { set; get; } = string.Empty;
}