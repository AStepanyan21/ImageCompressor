namespace ImageCompressor.Models.Response;

public record CurrentUserResponseData
{
    public required string Username { init; get; }
}
