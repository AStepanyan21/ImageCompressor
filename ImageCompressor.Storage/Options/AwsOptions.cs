namespace ImageCompressor.Storage.Options;

public record AwsOptions
{
    public string AccessKey { get; init; } = string.Empty;
    public string SecretKey { get; init; } = string.Empty;
    public string Region { get; init; } = string.Empty;
    public string BucketName { get; init; } = string.Empty;
    public string? ServiceUrl { get; init; }
}