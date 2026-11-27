using ImageCompressor.Exceptions;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Gif;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Processing.Processors.Quantization;

namespace ImageCompressor.Core.Services;

internal class ImageCompressionService : IImageCompressionService
{
    public async Task<CompressionResult> CompressAsync(
        Stream inputStream,
        int quality = CompressionQuality.Default,
        CancellationToken ct = default)
    {
        if (quality is < CompressionQuality.Min or > CompressionQuality.Max)
            throw new BaseExceptions(
                $"Quality must be between {CompressionQuality.Min} and {CompressionQuality.Max}", 400);

        using var original = new MemoryStream();
        await inputStream.CopyToAsync(original, ct);
        if (original.Length == 0)
            throw new BaseExceptions("File is empty", 400);

        original.Position = 0;
        using var image = await LoadImageAsync(original, ct);

        var format = image.Metadata.DecodedImageFormat
                     ?? throw new BaseExceptions("Unable to detect image format", 400);

        // Bake EXIF orientation into pixels before dropping metadata, otherwise photos can end up rotated.
        image.Mutate(x => x.AutoOrient());
        StripMetadata(image);

        using var output = new MemoryStream();
        await image.SaveAsync(output, CreateEncoder(image, format, quality), ct);

        // Re-encoding an already well-optimized file can make it bigger; never return a worse result.
        var data = output.Length < original.Length ? output.ToArray() : original.ToArray();

        return new CompressionResult(
            data,
            format.DefaultMimeType,
            "." + format.FileExtensions.First(),
            original.Length);
    }

    private static async Task<Image> LoadImageAsync(Stream stream, CancellationToken ct)
    {
        try
        {
            return await Image.LoadAsync(stream, ct);
        }
        catch (Exception ex) when (ex is ImageFormatException or NotSupportedException)
        {
            throw new BaseExceptions("File is not a supported image", 400);
        }
    }

    private static ImageEncoder CreateEncoder(Image image, IImageFormat format, int quality) => format switch
    {
        JpegFormat => new JpegEncoder { Quality = quality },

        // PNG is lossless: below max quality reduce it to an optimized palette (like pngquant).
        PngFormat when quality < CompressionQuality.Max => new PngEncoder
        {
            ColorType = PngColorType.Palette,
            BitDepth = PngBitDepth.Bit8,
            CompressionLevel = PngCompressionLevel.BestCompression,
            Quantizer = CreateQuantizer(quality)
        },
        PngFormat => new PngEncoder { CompressionLevel = PngCompressionLevel.BestCompression },

        WebpFormat => new WebpEncoder
        {
            Quality = quality,
            FileFormat = quality < CompressionQuality.Max ? WebpFileFormatType.Lossy : WebpFileFormatType.Lossless
        },

        GifFormat => new GifEncoder { Quantizer = CreateQuantizer(quality) },

        // BMP, TIFF, TGA, etc.: re-encode with the default encoder of the same format.
        _ => (ImageEncoder)image.Configuration.ImageFormatsManager.GetEncoder(format)
    };

    /// <summary>Maps quality 1..100 to a palette size of 16..256 colors.</summary>
    private static IQuantizer CreateQuantizer(int quality)
    {
        var maxColors = Math.Clamp((int)Math.Round(256 * quality / 100.0), 16, 256);
        return new WuQuantizer(new QuantizerOptions { MaxColors = maxColors });
    }

    private static void StripMetadata(Image image)
    {
        // ICC profile is kept on purpose: removing it changes colors of wide-gamut photos.
        image.Metadata.ExifProfile = null;
        image.Metadata.IptcProfile = null;
        image.Metadata.XmpProfile = null;

        foreach (var frame in image.Frames)
        {
            frame.Metadata.ExifProfile = null;
            frame.Metadata.IptcProfile = null;
            frame.Metadata.XmpProfile = null;
        }
    }
}
