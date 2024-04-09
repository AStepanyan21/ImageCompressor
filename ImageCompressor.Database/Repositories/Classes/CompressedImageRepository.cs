using ImageCompressor.Database.DAO;
using ImageCompressor.Database.Models;
using ImageCompressor.Database.Repositories.Interfaces;

namespace ImageCompressor.Database.Repositories.Classes;

public class CompressedImageRepository(ImageCompressorApplicationContext context) : ICompressedImageRepository
{
    private readonly ImageCompressorApplicationContext _context = context;

    public async Task<CompressedImage> CreateCompressedImage(CompressedImageData data)
    {
        CompressedImage image = new CompressedImage()
        {
            ImagePath = data.ImagePath,
            UserId = data.UserId
        };
        _context.CompressedImages.Add(image);
        await _context.SaveChangesAsync();
        return image;
    }

    public Task<CompressedImage> GetCompressedImage(uint id)
    {
        throw new NotImplementedException();
    }
}