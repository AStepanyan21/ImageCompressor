using ImageCompressor.EntityFramework.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ImageCompressor.EntityFramework;

public static class ServiceExtensions
{
    public static IServiceCollection AddDatabase(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<ApplicationContext>(options => options.UseNpgsql(connectionString));

        services.AddScoped<ICompressedImageRepository, CompressedImageRepository>();
        services.AddScoped<IUserRepository, UserRepository>();

        return services;
    }
}