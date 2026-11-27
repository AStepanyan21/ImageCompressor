namespace ImageCompressor.Storage.Interfaces;

public interface IStorageService
{
    Task UploadAsync(string key, byte[] data, string contentType, CancellationToken ct = default);

    /// <summary>Returns the stored object or <c>null</c> when it does not exist.</summary>
    Task<StoredObject?> DownloadAsync(string key, CancellationToken ct = default);
}

/// <param name="Content">Object content. The caller owns and must dispose the stream.</param>
public sealed record StoredObject(Stream Content, string ContentType, long ContentLength);
