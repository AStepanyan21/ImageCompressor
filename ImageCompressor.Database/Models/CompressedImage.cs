using System.ComponentModel.DataAnnotations;

namespace ImageCompressor.Database.Models;

public class CompressedImage
{
    [Key] public uint CompressedImageId { set; get; }
    public string ImagePath { get; set; }
    public uint UserId { get; set; }
    public User User { set; get; }
}