using ImageCompressor.Database.DAO;
using ImageCompressor.Database.Models;

namespace ImageCompressor.Database.Repositories.Interfaces;

public interface ICompressedImageRepository
{
    Task<CompressedImage> CreateCompressedImage(CompressedImageData data);
    Task<CompressedImage> GetCompressedImage(uint id);
}