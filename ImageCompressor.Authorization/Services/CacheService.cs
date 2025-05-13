using System.Text.Json;
using ImageCompressor.Authorization.Options;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;

namespace ImageCompressor.Authorization.Services;

public interface ICacheService
{
    Task SetUserSessionAsync(string sessionId, object userData, CancellationToken ct = default);
    Task<T?> GetUserSessionAsync<T>(string sessionId, CancellationToken ct = default);
    Task RemoveUserSessionAsync(string sessionId, CancellationToken ct = default);
}

public class CacheService(IDistributedCache cache, IOptions<AuthOptions> options) : ICacheService
{
    private readonly AuthOptions _authOptions = options.Value;

    public async Task SetUserSessionAsync(string sessionId, object userData, CancellationToken ct = default)
    {
        var jsonData = JsonSerializer.Serialize(userData);
        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(_authOptions.Lifetime)
        };

        await cache.SetStringAsync($"UserSession:{sessionId}", jsonData, cacheOptions, ct);
    }

    public async Task<T?> GetUserSessionAsync<T>(string sessionId, CancellationToken ct = default)
    {
        var jsonData = await cache.GetStringAsync($"UserSession:{sessionId}", ct);
        return jsonData is null ? default : JsonSerializer.Deserialize<T>(jsonData);
    }

    public async Task RemoveUserSessionAsync(string sessionId, CancellationToken ct = default)
    {
        await cache.RemoveAsync($"UserSession:{sessionId}", ct);
    }
}