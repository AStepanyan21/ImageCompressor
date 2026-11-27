namespace ImageCompressor.Models.Response;

public record CompressedImageResponseData
{
    public required uint Id { init; get; }
    public required string OriginalFileName { init; get; }
    public required string ContentType { init; get; }
    public required long OriginalSize { init; get; }
    public required long CompressedSize { init; get; }
    public required int Quality { init; get; }
    public required DateTime CreatedAt { init; get; }

    /// <summary>Relative URL to view the compressed image inline.</summary>
    public required string Url { init; get; }

    /// <summary>Relative URL to download the compressed image as an attachment.</summary>
    public required string DownloadUrl { init; get; }
}
