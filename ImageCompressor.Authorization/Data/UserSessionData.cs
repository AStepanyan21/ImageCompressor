namespace ImageCompressor.Authorization.Data;

public record UserSessionData
{
    public uint UserId { init; get; }
    public string Username { init; get; } = string.Empty;
}
