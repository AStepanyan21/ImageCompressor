using System.Net;
using Amazon.S3;
using Amazon.S3.Model;
using ImageCompressor.Storage.Interfaces;
using ImageCompressor.Storage.Options;
using Microsoft.Extensions.Options;

namespace ImageCompressor.Storage.Services;

internal class S3StorageService(
    IAmazonS3 s3Client,
    IOptions<AwsOptions> options) : IStorageService
{
    private readonly AwsOptions _options = options.Value;

    public async Task UploadAsync(string key, byte[] data, string contentType, CancellationToken ct = default)
    {
        using var stream = new MemoryStream(data);

        await s3Client.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _options.BucketName,
            Key = key,
            InputStream = stream,
            ContentType = contentType
        }, ct);
    }

    public async Task<StoredObject?> DownloadAsync(string key, CancellationToken ct = default)
    {
        try
        {
            var response = await s3Client.GetObjectAsync(_options.BucketName, key, ct);
            return new StoredObject(response.ResponseStream, response.Headers.ContentType, response.ContentLength);
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
    }
}
