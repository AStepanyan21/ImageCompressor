using Amazon;
using Amazon.S3;
using ImageCompressor.Storage.Interfaces;
using ImageCompressor.Storage.Options;
using ImageCompressor.Storage.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace ImageCompressor.Storage;

public static class ServiceExtensions
{
    public static IServiceCollection AddAwsStorage(this IServiceCollection services)
    {
        services.AddSingleton<IAmazonS3>(sp =>
        {
            var options = sp.GetRequiredService<IOptions<AwsOptions>>().Value;
            var config = new AmazonS3Config
            {
                RegionEndpoint = RegionEndpoint.GetBySystemName(options.Region),
                ForcePathStyle = true,
            };

            if (!string.IsNullOrEmpty(options.ServiceUrl))
            {
                config.ServiceURL = options.ServiceUrl;
            }

            return new AmazonS3Client(options.AccessKey, options.SecretKey, config);
        });
        services.AddScoped<IStorageService, S3StorageService>();

        return services;
    }
}