using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;

namespace ImageCompressor.Core.Services;

public interface IImageCompressionService
{
    Task<byte[]> CompressAsync(Stream inputStream, int quality = 75);
}

internal class ImageCompressionService: IImageCompressionService
{
    public async Task<byte[]> CompressAsync(Stream inputStream, int quality = 75)
    {
        using var image = await Image.LoadAsync(inputStream);

        var encoder = new JpegEncoder
        {
            Quality = quality
        };

        using var ms = new MemoryStream();
        await image.SaveAsJpegAsync(ms, encoder);
        return ms.ToArray();
    }
}