using System.ComponentModel.DataAnnotations;

namespace ImageCompressor.EntityFramework.Models;

public class User
{
    [Key] public uint UserId { set; get; }
    public string Username { set; get; } = string.Empty;
    public string HashedPassword { set; get; } = string.Empty;
    public List<CompressedImage> CompressedImages { set; get; } = new();
}