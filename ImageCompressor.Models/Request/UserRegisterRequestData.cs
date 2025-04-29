namespace ImageCompressor.Models.Request;

public record UserRegisterRequestData : UserLoginRequestData
{
    public required string ConfirmPassword  { init; get; }
}