namespace ImageCompressor.Models.Response;

public record UserLoginResponseData
{
    public required string Username { init; get; }
    public required string Token { init; get; }
}