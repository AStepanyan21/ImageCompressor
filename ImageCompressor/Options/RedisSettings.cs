namespace ImageCompressor.Options;

public record RedisSettings
{
    public string Configuration { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
};