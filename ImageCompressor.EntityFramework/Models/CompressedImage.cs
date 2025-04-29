using System.ComponentModel.DataAnnotations;

namespace ImageCompressor.EntityFramework.Models;

public class CompressedImage
{
    [Key] public uint CompressedImageId { set; get; }
    public string ImagePath { get; set; } = string.Empty;
    public uint UserId { get; set; }
    public User User { set; get; } = null!;
}