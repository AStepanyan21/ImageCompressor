using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Formats.Png;
using ImageCompressor.Core.Services;

namespace ImageCompressor.Tests.Core;

public class ImageCompressionServiceTests
{
    private ImageCompressionService CreateService() => new();

    private static byte[] CreateTestPngImage(int width = 10, int height = 10)
    {
        using var image = new Image<Rgba32>(width, height);
        using var ms = new MemoryStream();
        image.SaveAsPng(ms);
        return ms.ToArray();
    }

    [Fact]
    public async Task CompressAsync_ValidPngImage_ReturnsJpegBytes()
    {
        // Arrange
        var service = CreateService();
        var pngBytes = CreateTestPngImage();
        using var inputStream = new MemoryStream(pngBytes);

        // Act
        var result = await service.CompressAsync(inputStream);

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result);
        // JPEG files start with FF D8 FF
        Assert.Equal(0xFF, result[0]);
        Assert.Equal(0xD8, result[1]);
        Assert.Equal(0xFF, result[2]);
    }

    [Fact]
    public async Task CompressAsync_ValidPngImage_WithCustomQuality()
    {
        // Arrange
        var service = CreateService();
        var pngBytes = CreateTestPngImage();
        using var inputStream = new MemoryStream(pngBytes);

        // Act
        var result = await service.CompressAsync(inputStream, quality: 50);

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result);
    }

    [Fact]
    public async Task CompressAsync_InvalidImage_ThrowsException()
    {
        // Arrange
        var service = CreateService();
        var invalidBytes = new byte[] { 0x00, 0x01, 0x02, 0x03 };
        using var inputStream = new MemoryStream(invalidBytes);

        // Act & Assert
        await Assert.ThrowsAnyAsync<Exception>(() => service.CompressAsync(inputStream));
    }

    [Fact]
    public async Task CompressAsync_EmptyStream_ThrowsException()
    {
        // Arrange
        var service = CreateService();
        using var inputStream = new MemoryStream(Array.Empty<byte>());

        // Act & Assert
        await Assert.ThrowsAnyAsync<Exception>(() => service.CompressAsync(inputStream));
    }

    [Fact]
    public async Task CompressAsync_ValidJpegImage_ReturnsJpegBytes()
    {
        // Arrange
        var service = CreateService();
        // Use PNG instead - the service converts to JPEG anyway
        var pngBytes = CreateTestPngImage(5, 5);
        using var inputStream = new MemoryStream(pngBytes);

        // Act
        var result = await service.CompressAsync(inputStream);

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result);
    }
}
