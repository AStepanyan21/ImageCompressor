using ImageCompressor.Core.Services;
using ImageCompressor.Exceptions;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;
using SixLabors.ImageSharp.PixelFormats;

namespace ImageCompressor.Tests.Core;

public class ImageCompressionServiceTests
{
    private ImageCompressionService CreateService() => new();

    /// <summary>Random noise compresses poorly, so a quality change is clearly visible in the output size.</summary>
    private static Image<Rgba32> CreateNoisyImage(int width = 64, int height = 64)
    {
        var random = new Random(42);
        var image = new Image<Rgba32>(width, height);
        image.ProcessPixelRows(rows =>
        {
            for (var y = 0; y < rows.Height; y++)
            {
                foreach (ref var pixel in rows.GetRowSpan(y))
                {
                    pixel = new Rgba32((byte)random.Next(256), (byte)random.Next(256), (byte)random.Next(256));
                }
            }
        });
        return image;
    }

    private static byte[] Encode(Image image, ImageEncoder encoder)
    {
        using var ms = new MemoryStream();
        image.Save(ms, encoder);
        return ms.ToArray();
    }

    private async Task<CompressionResult> CompressAsync(byte[] bytes, int quality = CompressionQuality.Default)
    {
        using var input = new MemoryStream(bytes);
        return await CreateService().CompressAsync(input, quality);
    }

    [Fact]
    public async Task CompressAsync_Jpeg_KeepsJpegFormatAndReducesSize()
    {
        using var image = CreateNoisyImage();
        var original = Encode(image, new JpegEncoder { Quality = 100 });

        var result = await CompressAsync(original, quality: 50);

        Assert.Equal("image/jpeg", result.ContentType);
        Assert.Equal(".jpg", result.FileExtension);
        Assert.Equal(original.Length, result.OriginalSize);
        Assert.True(result.Data.Length < original.Length);
        Assert.IsType<JpegFormat>(Image.DetectFormat(result.Data));
    }

    [Fact]
    public async Task CompressAsync_Png_KeepsPngFormat()
    {
        using var image = CreateNoisyImage();
        var original = Encode(image, new PngEncoder());

        var result = await CompressAsync(original);

        Assert.Equal("image/png", result.ContentType);
        Assert.Equal(".png", result.FileExtension);
        Assert.IsType<PngFormat>(Image.DetectFormat(result.Data));
    }

    [Fact]
    public async Task CompressAsync_Webp_KeepsWebpFormat()
    {
        using var image = CreateNoisyImage();
        var original = Encode(image, new WebpEncoder { FileFormat = WebpFileFormatType.Lossless });

        var result = await CompressAsync(original);

        Assert.Equal("image/webp", result.ContentType);
        Assert.Equal(".webp", result.FileExtension);
        Assert.IsType<WebpFormat>(Image.DetectFormat(result.Data));
    }

    [Theory]
    [InlineData(1)]
    [InlineData(75)]
    [InlineData(100)]
    public async Task CompressAsync_NeverReturnsLargerFileThanOriginal(int quality)
    {
        using var image = CreateNoisyImage();
        // Already heavily compressed: re-encoding at high quality would make it bigger.
        var original = Encode(image, new JpegEncoder { Quality = 10 });

        var result = await CompressAsync(original, quality);

        Assert.True(result.Data.Length <= original.Length);
    }

    [Fact]
    public async Task CompressAsync_RemovesExifMetadata()
    {
        using var image = CreateNoisyImage();
        // ImageSharp 4 rejects empty EXIF profiles, so fill it before assigning.
        var exif = new ExifProfile();
        exif.SetValue(ExifTag.Make, "TestCamera");
        image.Metadata.ExifProfile = exif;
        var original = Encode(image, new JpegEncoder { Quality = 100 });

        var result = await CompressAsync(original, quality: 50);

        using var compressed = Image.Load(result.Data);
        Assert.Null(compressed.Metadata.ExifProfile);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(101)]
    [InlineData(-5)]
    public async Task CompressAsync_QualityOutOfRange_ThrowsBadRequest(int quality)
    {
        using var image = CreateNoisyImage(4, 4);
        var original = Encode(image, new PngEncoder());

        var ex = await Assert.ThrowsAsync<BaseExceptions>(() => CompressAsync(original, quality));
        Assert.Equal(400, ex.StatusCode);
    }

    [Fact]
    public async Task CompressAsync_InvalidImage_ThrowsBadRequest()
    {
        var ex = await Assert.ThrowsAsync<BaseExceptions>(() => CompressAsync([0x00, 0x01, 0x02, 0x03]));
        Assert.Equal(400, ex.StatusCode);
    }

    [Fact]
    public async Task CompressAsync_EmptyStream_ThrowsBadRequest()
    {
        var ex = await Assert.ThrowsAsync<BaseExceptions>(() => CompressAsync([]));
        Assert.Equal(400, ex.StatusCode);
    }
}
