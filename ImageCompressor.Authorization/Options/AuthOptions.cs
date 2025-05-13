namespace ImageCompressor.Authorization.Options;

public record AuthOptions
{
    public int Lifetime { get; init; }
    public string SigningKey { get; init; } = string.Empty;
    public string CookieKeyName { get; init; } = "access_token";
    public bool HttpOnly { get; init; } = false;
    public bool Secure { get; init; } = false;
}