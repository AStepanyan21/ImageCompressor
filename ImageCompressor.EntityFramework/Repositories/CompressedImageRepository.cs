using ImageCompressor.EntityFramework.DAO;
using ImageCompressor.EntityFramework.Models;

namespace ImageCompressor.EntityFramework.Repositories;

public interface ICompressedImageRepository
{
    Task<CompressedImage> CreateCompressedImage(CompressedImageData data);
    Task<CompressedImage> GetCompressedImage(uint id);
}

public class CompressedImageRepository(ApplicationContext context) : ICompressedImageRepository
{


    public async Task<CompressedImage> CreateCompressedImage(CompressedImageData data)
    {
        CompressedImage image = new CompressedImage()
        {
            ImagePath = data.ImagePath,
            UserId = data.UserId
        };
        context.CompressedImages.Add(image);
        await context.SaveChangesAsync();
        return image;
    }

    public Task<CompressedImage> GetCompressedImage(uint id)
    {
        throw new NotImplementedException();
    }
}