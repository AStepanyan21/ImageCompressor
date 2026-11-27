namespace ImageCompressor.Core.Services;

public interface IImageCompressionService
{
    /// <summary>
    /// Compresses an image while keeping its original format.
    /// </summary>
    /// <param name="inputStream">Source image stream.</param>
    /// <param name="quality">Compression quality from <see cref="CompressionQuality.Min"/> to <see cref="CompressionQuality.Max"/>.</param>
    /// <param name="ct">Cancellation token.</param>
    Task<CompressionResult> CompressAsync(
        Stream inputStream,
        int quality = CompressionQuality.Default,
        CancellationToken ct = default);
}

public static class CompressionQuality
{
    public const int Min = 1;
    public const int Max = 100;
    public const int Default = 75;
}

/// <param name="Data">Resulting bytes. Never larger than the original file.</param>
/// <param name="ContentType">MIME type of the original (and resulting) format.</param>
/// <param name="FileExtension">File extension with a leading dot, e.g. ".png".</param>
/// <param name="OriginalSize">Size of the uploaded file in bytes.</param>
public sealed record CompressionResult(byte[] Data, string ContentType, string FileExtension, long OriginalSize);
