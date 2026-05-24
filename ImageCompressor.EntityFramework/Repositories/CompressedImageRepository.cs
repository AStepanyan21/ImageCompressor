using ImageCompressor.EntityFramework.DAO;
using ImageCompressor.EntityFramework.Models;
using Microsoft.EntityFrameworkCore;

namespace ImageCompressor.EntityFramework.Repositories;

public interface ICompressedImageRepository
{
    Task<CompressedImage> CreateCompressedImage(CompressedImageData data, CancellationToken ct = default);
    Task<CompressedImage> GetCompressedImage(uint id, CancellationToken ct = default);
    Task<List<CompressedImage>> GetCompressedImagesByUserId(uint userId, CancellationToken ct = default);
}

internal class CompressedImageRepository(ApplicationContext context) : ICompressedImageRepository
{
    public async Task<CompressedImage> CreateCompressedImage(CompressedImageData data, CancellationToken ct = default)
    {
        CompressedImage image = new CompressedImage()
        {
            ImagePath = data.ImagePath,
            UserId = data.UserId
        };
        context.CompressedImages.Add(image);
        await context.SaveChangesAsync(ct);
        return image;
    }

    public Task<CompressedImage> GetCompressedImage(uint id, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }

    public Task<List<CompressedImage>> GetCompressedImagesByUserId(uint userId, CancellationToken ct = default)
    {
        return context.CompressedImages
            .Where(image => image.UserId == userId)
            .OrderByDescending(image => image.CompressedImageId)
            .ToListAsync(ct);
    }
}
