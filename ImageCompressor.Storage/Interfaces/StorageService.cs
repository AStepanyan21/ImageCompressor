using Microsoft.AspNetCore.Http;

namespace ImageCompressor.Storage.Interfaces;

public interface IStorageService
{
    Task<string> UploadFileAsync(IFormFile file);

}