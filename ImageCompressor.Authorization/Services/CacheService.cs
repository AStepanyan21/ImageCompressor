using System.Text.Json;
using ImageCompressor.Authorization.Options;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;

namespace ImageCompressor.Authorization.Services;

public interface ICacheService
{
    Task SetUserSessionAsync(string sessionId, object userData);
    Task<T?> GetUserSessionAsync<T>(string sessionId);
    Task RemoveUserSessionAsync(string sessionId);
}

public class CacheService(IDistributedCache cache, IOptions<AuthOptions> options) : ICacheService
{
    private readonly AuthOptions _authOptions = options.Value;

    public async Task SetUserSessionAsync(string sessionId, object userData)
    {
        var jsonData = JsonSerializer.Serialize(userData);
        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(_authOptions.Lifetime)
        };

        await cache.SetStringAsync($"UserSession:{sessionId}", jsonData, cacheOptions);
    }

    public async Task<T?> GetUserSessionAsync<T>(string sessionId)
    {
        var jsonData = await cache.GetStringAsync($"UserSession:{sessionId}");
        return jsonData is null ? default : JsonSerializer.Deserialize<T>(jsonData);
    }

    public async Task RemoveUserSessionAsync(string sessionId)
    {
        await cache.RemoveAsync($"UserSession:{sessionId}");
    }
}