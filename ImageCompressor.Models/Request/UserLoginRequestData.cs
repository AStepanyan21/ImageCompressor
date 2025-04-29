namespace ImageCompressor.Models.Request;

public record UserLoginRequestData
{
    public required string Username { init; get; } 
    public required string Password { init; get; }
}