using ImageCompressor.Database;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMvc();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
string? connection = builder.Configuration.GetConnectionString("ImageCompressorDb");
builder.Services.AddDbContext<ImageCompressorApplicationContext>(options => options.UseNpgsql(connection));


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