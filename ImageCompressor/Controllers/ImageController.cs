using ImageCompressor.Core.Services;
using ImageCompressor.Exceptions;
using ImageCompressor.Storage.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ImageCompressor.Controllers;

[ApiController]
[Route($"api/image")]
public class ImageController(IStorageService storageService, IImageCompressionService compressor) : ControllerBase
{
    [HttpPost("upload")]
    public async Task<IActionResult> UploadAndCompress(IFormFile? file)
    {
        if (file == null || file.Length == 0)
            throw new BaseExceptions("Empty file", 400);

        var url = await storageService.UploadFileAsync(file);
        await using var inputStream = file.OpenReadStream();
        var compressed = await compressor.CompressAsync(inputStream, quality: 75);

        var uniqueFileName = $"{Guid.NewGuid()}.jpg";

        var compressedImageUrl = await storageService.UploadAsync(compressed, uniqueFileName, "image/jpeg");

        return Ok(new
        {
            Url = url,
            CompressedImageUrl = compressedImageUrl
        });
    }
}