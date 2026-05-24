using ImageCompressor.Core.Services;
using ImageCompressor.EntityFramework.DAO;
using ImageCompressor.EntityFramework.Repositories;
using ImageCompressor.Exceptions;
using ImageCompressor.Helpers;
using ImageCompressor.Storage.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ImageCompressor.Controllers;

[ApiController]
[Route($"api/image")]
public class ImageController(
    IStorageService storageService,
    IImageCompressionService compressor,
    ICompressedImageRepository compressedImageRepository) : ControllerBase
{
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetCompressedImages(CancellationToken ct)
    {
        var userId = User.GetCurrentUserId();
        var images = await compressedImageRepository.GetCompressedImagesByUserId(userId, ct);

        return Ok(images.Select(image => new
        {
            image.CompressedImageId,
            image.ImagePath
        }));
    }

    [HttpPost("upload")]
    [Authorize]
    public async Task<IActionResult> UploadAndCompress(IFormFile? file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            throw new BaseExceptions("Empty file", 400);

        var userId = User.GetCurrentUserId();

        var url = await storageService.UploadFileAsync(file, ct);
        await using var inputStream = file.OpenReadStream();
        var compressed = await compressor.CompressAsync(inputStream, quality: 75);

        var uniqueFileName = $"{Guid.NewGuid()}.jpg";

        var compressedImageUrl = await storageService.UploadAsync(compressed, uniqueFileName, "image/jpeg");
        var compressedImage = await compressedImageRepository.CreateCompressedImage(new CompressedImageData
        {
            ImagePath = compressedImageUrl.ToString()!,
            UserId = userId
        }, ct);

        return Ok(new
        {
            Url = url,
            CompressedImageUrl = compressedImageUrl,
            compressedImage.CompressedImageId
        });
    }

}
