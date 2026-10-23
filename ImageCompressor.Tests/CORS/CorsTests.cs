using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

namespace ImageCompressor.Tests.CORS;

public class CorsTests
{
    [Fact]
    public async Task CorsPolicy_AllowsFrontendOrigin()
    {
        // Arrange
        var hostBuilder = new WebHostBuilder()
            .ConfigureServices(services =>
            {
                services.AddCors(options =>
                {
                    options.AddPolicy("AllowFrontend", policy =>
                    {
                        policy.WithOrigins("http://localhost:5173")
                              .AllowAnyMethod()
                              .AllowAnyHeader();
                    });
                });
            })
            .Configure(app =>
            {
                app.UseCors("AllowFrontend");
                app.Run(async context => await context.Response.WriteAsync("OK"));
            });

        var server = new TestServer(hostBuilder);
        var client = server.CreateClient();

        // Act
        var request = new HttpRequestMessage(HttpMethod.Options, "/");
        request.Headers.Add("Origin", "http://localhost:5173");
        request.Headers.Add("Access-Control-Request-Method", "GET");
        request.Headers.Add("Access-Control-Request-Headers", "Content-Type");

        var response = await client.SendAsync(request);

        // Assert
        Assert.True(response.Headers.Contains("Access-Control-Allow-Origin"));
        var originHeader = response.Headers.GetValues("Access-Control-Allow-Origin").First();
        Assert.Equal("http://localhost:5173", originHeader);
    }

    [Fact]
    public async Task CorsPolicy_RejectsNonFrontendOrigin()
    {
        // Arrange
        var hostBuilder = new WebHostBuilder()
            .ConfigureServices(services =>
            {
                services.AddCors(options =>
                {
                    options.AddPolicy("AllowFrontend", policy =>
                    {
                        policy.WithOrigins("http://localhost:5173")
                              .AllowAnyMethod()
                              .AllowAnyHeader();
                    });
                });
            })
            .Configure(app =>
            {
                app.UseCors("AllowFrontend");
                app.Run(async context => await context.Response.WriteAsync("OK"));
            });

        var server = new TestServer(hostBuilder);
        var client = server.CreateClient();

        // Act
        var request = new HttpRequestMessage(HttpMethod.Options, "/");
        request.Headers.Add("Origin", "http://malicious-site.com");
        request.Headers.Add("Access-Control-Request-Method", "GET");

        var response = await client.SendAsync(request);

        // Assert
        Assert.False(response.Headers.Contains("Access-Control-Allow-Origin"));
    }

    [Fact]
    public async Task CorsPolicy_AllowsAnyHeader()
    {
        // Arrange
        var hostBuilder = new WebHostBuilder()
            .ConfigureServices(services =>
            {
                services.AddCors(options =>
                {
                    options.AddPolicy("AllowFrontend", policy =>
                    {
                        policy.WithOrigins("http://localhost:5173")
                              .AllowAnyMethod()
                              .AllowAnyHeader();
                    });
                });
            })
            .Configure(app =>
            {
                app.UseCors("AllowFrontend");
                app.Run(async context => await context.Response.WriteAsync("OK"));
            });

        var server = new TestServer(hostBuilder);
        var client = server.CreateClient();

        // Act
        var request = new HttpRequestMessage(HttpMethod.Options, "/");
        request.Headers.Add("Origin", "http://localhost:5173");
        request.Headers.Add("Access-Control-Request-Method", "POST");
        request.Headers.Add("Access-Control-Request-Headers", "Authorization, X-Custom-Header");

        var response = await client.SendAsync(request);

        // Assert
        Assert.True(response.Headers.Contains("Access-Control-Allow-Headers"));
        var headers = response.Headers.GetValues("Access-Control-Allow-Headers").First();
        Assert.Contains("Authorization", headers);
        Assert.Contains("X-Custom-Header", headers);
    }
}
