using ImageCompressor.Core.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ImageCompressor.Core;

public static class ServiceExtensions
{
    public static IServiceCollection AddCompressionService(this IServiceCollection services)
    {
        services.AddScoped<IImageCompressionService, ImageCompressionService>();
        return services;
    }
}