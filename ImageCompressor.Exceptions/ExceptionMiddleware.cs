using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ImageCompressor.Exceptions;

public class ExceptionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await next(httpContext);
        }

        catch (BaseExceptions ex)
        {
            await HandleExceptionAsync(httpContext, ex.Message, ex.StatusCode);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, string message, int statusCode)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        var errorResponse = new { message };
        var json = JsonConvert.SerializeObject(errorResponse);
        await context.Response.WriteAsync(json);
    }
}