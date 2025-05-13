using Amazon.S3;
using Amazon.S3.Transfer;
using ImageCompressor.Storage.Interfaces;
using ImageCompressor.Storage.Options;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace ImageCompressor.Storage.Services;

public class S3StorageService(
    IAmazonS3 s3Client,
    IOptions<AwsOptions> options) : IStorageService
{
    private readonly AwsOptions _options = options.Value;

    public async Task<string> UploadFileAsync(IFormFile? file, CancellationToken ct = default)
    {
        var fileTransferUtility = new TransferUtility(s3Client);

        using var newMemoryStream = new MemoryStream();
        await file!.CopyToAsync(newMemoryStream, ct);

        var uploadRequest = new TransferUtilityUploadRequest
        {
            InputStream = newMemoryStream,
            Key = file.FileName,
            BucketName = _options.BucketName,
            ContentType = file.ContentType
        };

        await fileTransferUtility.UploadAsync(uploadRequest, ct);

        var fileUrl = $"{_options.ServiceUrl}/{_options.BucketName}/{file.FileName}";
        return fileUrl;
    }

    public async Task<object> UploadAsync(byte[] compressed, string uniqueFileName, string imageJpeg)
    {
        using var ms = new MemoryStream(compressed);

        var uploadRequest = new TransferUtilityUploadRequest
        {
            InputStream = ms,
            Key = uniqueFileName,
            BucketName = _options.BucketName,
            ContentType = imageJpeg
        };

        var fileTransferUtility = new TransferUtility(s3Client);
        await fileTransferUtility.UploadAsync(uploadRequest);

        // Ссылка
        return $"{_options.ServiceUrl.TrimEnd('/')}/{_options.BucketName}/{Uri.EscapeDataString(uniqueFileName)}";
    }
}