namespace ImageCompressor.EntityFramework.DAO;

public class CompressedImageData
{
    public string StorageKey { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long OriginalSize { get; set; }
    public long CompressedSize { get; set; }
    public int Quality { get; set; }
    public uint UserId { get; set; }
}
