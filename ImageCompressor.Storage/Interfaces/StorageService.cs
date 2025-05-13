using Microsoft.AspNetCore.Http;

namespace ImageCompressor.Storage.Interfaces;

public interface IStorageService
{
    Task<string> UploadFileAsync(IFormFile? file, CancellationToken ct = default);

    Task<object> UploadAsync(byte[] compressed, string uniqueFileName, string imageJpeg);
}