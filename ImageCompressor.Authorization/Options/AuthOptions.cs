namespace ImageCompressor.Authorization.Options;

public record AuthOptions
{
    public int Lifetime { get; init; }
    public string SigningKey { get; init; } = string.Empty;
}