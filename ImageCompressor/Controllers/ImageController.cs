using ImageCompressor.Core.Services;
using ImageCompressor.EntityFramework.DAO;
using ImageCompressor.EntityFramework.Models;
using ImageCompressor.EntityFramework.Repositories;
using ImageCompressor.Exceptions;
using ImageCompressor.Helpers;
using ImageCompressor.Models.Response;
using ImageCompressor.Storage.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ImageCompressor.Controllers;

[ApiController]
[Authorize]
[Route("api/image")]
public class ImageController(
    IStorageService storageService,
    IImageCompressionService compressor,
    ICompressedImageRepository compressedImageRepository) : ControllerBase
{
    private const int MaxFileNameLength = 255;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CompressedImageResponseData>>> GetCompressedImages(CancellationToken ct)
    {
        var userId = User.GetCurrentUserId();
        var images = await compressedImageRepository.GetCompressedImagesByUserId(userId, ct);

        return Ok(images.Select(ToResponse));
    }

    [HttpPost("upload")]
    [DisableRequestSizeLimit]
    [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue, ValueLengthLimit = int.MaxValue)]
    public async Task<ActionResult<CompressedImageResponseData>> UploadAndCompress(
        IFormFile? file,
        [FromForm] int quality = CompressionQuality.Default,
        CancellationToken ct = default)
    {
        if (file == null || file.Length == 0)
            throw new BaseExceptions("File is empty", 400);

        var userId = User.GetCurrentUserId();

        await using var inputStream = file.OpenReadStream();
        var compressed = await compressor.CompressAsync(inputStream, quality, ct);

        // Never use the client-provided file name as an object key.
        var storageKey = $"compressed/{userId}/{Guid.NewGuid():N}{compressed.FileExtension}";
        await storageService.UploadAsync(storageKey, compressed.Data, compressed.ContentType, ct);

        var image = await compressedImageRepository.CreateCompressedImage(new CompressedImageData
        {
            StorageKey = storageKey,
            OriginalFileName = SanitizeFileName(file.FileName, compressed.FileExtension),
            ContentType = compressed.ContentType,
            OriginalSize = compressed.OriginalSize,
            CompressedSize = compressed.Data.LongLength,
            Quality = quality,
            UserId = userId
        }, ct);

        return Ok(ToResponse(image));
    }

    [HttpGet("{id}/content")]
    public async Task<IActionResult> GetCompressedImageContent(
        uint id,
        [FromQuery] bool download = false,
        CancellationToken ct = default)
    {
        var userId = User.GetCurrentUserId();
        var image = await compressedImageRepository.GetCompressedImage(id, userId, ct);

        var stored = await storageService.DownloadAsync(image.StorageKey, ct)
                     ?? throw new BaseExceptions("Image file not found", 404);

        var contentType = string.IsNullOrEmpty(image.ContentType) ? stored.ContentType : image.ContentType;

        // Stored objects are immutable (unique key per upload), so the browser may cache them.
        Response.Headers.CacheControl = "private, max-age=31536000, immutable";

        return download
            ? File(stored.Content, contentType, BuildDownloadFileName(image))
            : File(stored.Content, contentType);
    }

    private static CompressedImageResponseData ToResponse(CompressedImage image) => new()
    {
        Id = image.CompressedImageId,
        OriginalFileName = image.OriginalFileName,
        ContentType = image.ContentType,
        OriginalSize = image.OriginalSize,
        CompressedSize = image.CompressedSize,
        Quality = image.Quality,
        CreatedAt = DateTime.SpecifyKind(image.CreatedAt, DateTimeKind.Utc),
        Url = $"/api/image/{image.CompressedImageId}/content",
        DownloadUrl = $"/api/image/{image.CompressedImageId}/content?download=true"
    };

    private static string SanitizeFileName(string? fileName, string fallbackExtension)
    {
        var name = Path.GetFileName(fileName ?? string.Empty).Trim();
        if (string.IsNullOrEmpty(name))
            name = "image" + fallbackExtension;

        return name.Length > MaxFileNameLength ? name[..MaxFileNameLength] : name;
    }

    private static string BuildDownloadFileName(CompressedImage image)
    {
        var baseName = Path.GetFileNameWithoutExtension(image.OriginalFileName);
        if (string.IsNullOrWhiteSpace(baseName))
            baseName = $"image-{image.CompressedImageId}";

        return $"{baseName}-compressed{Path.GetExtension(image.StorageKey)}";
    }
}
