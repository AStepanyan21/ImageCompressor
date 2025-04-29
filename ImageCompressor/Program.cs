using ImageCompressor.Authorization.Options;
using ImageCompressor.Authorization;
using ImageCompressor.EntityFramework;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMvc();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
string? connection = builder.Configuration.GetConnectionString("ImageCompressorDb");
builder.Services.Configure<AuthOptions>(builder.Configuration.GetSection("AuthOptions"));
var serviceProvider = builder.Services.BuildServiceProvider();
var authOptions = serviceProvider.GetRequiredService<IOptions<AuthOptions>>().Value;
builder.Services.AddDatabase(connection!);
builder.Services.AddAuthentication(authOptions);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.MapControllers();
app.Run();