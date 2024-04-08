using System.ComponentModel.DataAnnotations;

namespace ImageCompressor.Database.Models;

public class User
{
    [Key] public uint UserId { set; get; }
    public string Username { set; get; } = string.Empty;
    public string HashedPassword { set; get; } = string.Empty;
    public IEnumerable<CompressedImage> CompressedImages { set; get; }
}