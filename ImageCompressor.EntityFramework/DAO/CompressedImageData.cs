namespace ImageCompressor.EntityFramework.DAO;

public abstract class CompressedImageData
{
    public string ImagePath { get; set; } = string.Empty;
    public uint UserId { get; set; }
}