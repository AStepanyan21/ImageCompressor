using ImageCompressor.Authorization.Options;
using ImageCompressor.Authorization;
using ImageCompressor.Core;
using ImageCompressor.EntityFramework;
using ImageCompressor.Exceptions;
using ImageCompressor.Options;
using ImageCompressor.Storage;
using ImageCompressor.Storage.Options;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMvc();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            []
        }
    });
});
string? connection = builder.Configuration.GetConnectionString("ImageCompressorDb");
builder.Services.Configure<AuthOptions>(builder.Configuration.GetSection("AuthOptions"));
builder.Services.Configure<RedisSettings>(builder.Configuration.GetSection("Redis"));
builder.Services.Configure<AwsOptions>(builder.Configuration.GetSection("AwsOptions"));

builder.Services.AddCompressionService();
builder.Services.AddDatabase(connection!);
builder.Services.AddAuthentication(builder.Configuration);
builder.Services.AddAwsStorage();
builder.Services.AddStackExchangeRedisCache(options =>
{
    var redisSettings = builder.Configuration.GetSection("Redis").Get<RedisSettings>();
    options.Configuration = redisSettings!.Configuration;
    if (!string.IsNullOrWhiteSpace(redisSettings.Password))
    {
        options.Configuration += $",password={redisSettings.Password}";
    }
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseMiddleware<ExceptionMiddleware>();
app.UseMiddleware<UserSessionMiddleware>();
app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();
app.Run();
