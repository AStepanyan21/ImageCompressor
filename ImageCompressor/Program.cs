using ImageCompressor.Authorization.Options;
using ImageCompressor.Authorization;
using ImageCompressor.EntityFramework;
using ImageCompressor.Options;
using ImageCompressor.Storage;
using ImageCompressor.Storage.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMvc();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
string? connection = builder.Configuration.GetConnectionString("ImageCompressorDb");
builder.Services.Configure<AuthOptions>(builder.Configuration.GetSection("AuthOptions"));
builder.Services.Configure<RedisSettings>(builder.Configuration.GetSection("Redis"));
builder.Services.Configure<AwsOptions>(builder.Configuration.GetSection("AwsOptions"));

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
app.UseMiddleware<UserSessionMiddleware>();
app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();
app.Run();