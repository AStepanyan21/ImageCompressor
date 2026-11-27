using System.ComponentModel.DataAnnotations;

namespace ImageCompressor.EntityFramework.Models;

public class CompressedImage
{
    [Key] public uint CompressedImageId { set; get; }

    /// <summary>Object key in S3 storage.</summary>
    public string StorageKey { get; set; } = string.Empty;

    public string OriginalFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long OriginalSize { get; set; }
    public long CompressedSize { get; set; }
    public int Quality { get; set; }
    public DateTime CreatedAt { get; set; }

    public uint UserId { get; set; }
    public User User { set; get; } = null!;
}
