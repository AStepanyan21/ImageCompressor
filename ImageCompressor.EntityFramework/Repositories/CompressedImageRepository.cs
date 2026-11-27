using ImageCompressor.EntityFramework.DAO;
using ImageCompressor.EntityFramework.Models;
using ImageCompressor.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ImageCompressor.EntityFramework.Repositories;

public interface ICompressedImageRepository
{
    Task<CompressedImage> CreateCompressedImage(CompressedImageData data, CancellationToken ct = default);

    /// <summary>Returns the image only if it belongs to <paramref name="userId"/>, otherwise throws 404.</summary>
    Task<CompressedImage> GetCompressedImage(uint id, uint userId, CancellationToken ct = default);

    Task<List<CompressedImage>> GetCompressedImagesByUserId(uint userId, CancellationToken ct = default);
}

internal class CompressedImageRepository(ApplicationContext context) : ICompressedImageRepository
{
    public async Task<CompressedImage> CreateCompressedImage(CompressedImageData data, CancellationToken ct = default)
    {
        var image = new CompressedImage
        {
            StorageKey = data.StorageKey,
            OriginalFileName = data.OriginalFileName,
            ContentType = data.ContentType,
            OriginalSize = data.OriginalSize,
            CompressedSize = data.CompressedSize,
            Quality = data.Quality,
            CreatedAt = DateTime.UtcNow,
            UserId = data.UserId
        };
        context.CompressedImages.Add(image);
        await context.SaveChangesAsync(ct);
        return image;
    }

    public async Task<CompressedImage> GetCompressedImage(uint id, uint userId, CancellationToken ct = default)
    {
        var image = await context.CompressedImages
            .AsNoTracking()
            .FirstOrDefaultAsync(image => image.CompressedImageId == id && image.UserId == userId, ct);

        return image ?? throw new BaseExceptions("Image not found", 404);
    }

    public Task<List<CompressedImage>> GetCompressedImagesByUserId(uint userId, CancellationToken ct = default)
    {
        return context.CompressedImages
            .AsNoTracking()
            .Where(image => image.UserId == userId)
            .OrderByDescending(image => image.CompressedImageId)
            .ToListAsync(ct);
    }
}
