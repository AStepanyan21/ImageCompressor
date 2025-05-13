namespace ImageCompressor.Exceptions;

public class BaseExceptions : Exception
{
    public override string Message { get; } = "Bad request";
    public int StatusCode { init; get; } = 400;

    public BaseExceptions()
    {
    }

    public BaseExceptions(string message, int statusCode)
    {
        Message = message;
        StatusCode = statusCode;
    }

    public BaseExceptions(string message)
    {
        Message = message;
    }
}