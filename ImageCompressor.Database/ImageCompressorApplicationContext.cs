using ImageCompressor.Database.Models;
using Microsoft.EntityFrameworkCore;

namespace ImageCompressor.Database;

public class ImageCompressorApplicationContext(DbContextOptions<ImageCompressorApplicationContext> options)
    : DbContext(options)
{
    public DbSet<User?> Users { set; get; }
    public DbSet<CompressedImage> CompressedImages { set; get; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CompressedImage>()
            .HasOne(p => p.User)
            .WithMany(d => d.CompressedImages)
            .HasForeignKey(u => u.UserId);
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();
    }
}