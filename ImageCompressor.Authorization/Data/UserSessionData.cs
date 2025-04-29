namespace ImageCompressor.Authorization.Data;

public record UserSessionData
{
    public string Username { init; get; } = string.Empty;
}