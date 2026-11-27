using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ImageCompressor.EntityFramework.Migrations
{
    /// <inheritdoc />
    public partial class AddCompressedImageDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ImagePath",
                table: "CompressedImages",
                newName: "StorageKey");

            migrationBuilder.AddColumn<long>(
                name: "CompressedSize",
                table: "CompressedImages",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "ContentType",
                table: "CompressedImages",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "CompressedImages",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "OriginalFileName",
                table: "CompressedImages",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "OriginalSize",
                table: "CompressedImages",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<int>(
                name: "Quality",
                table: "CompressedImages",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Legacy rows stored a full public URL ("{ServiceUrl}/{bucket}/{key}") and were always JPEG
            // compressed with quality 75. Keep only the object key and fill in known values.
            migrationBuilder.Sql("""
                UPDATE "CompressedImages"
                SET "StorageKey" = regexp_replace("StorageKey", '^https?://[^/]+/[^/]+/', ''),
                    "ContentType" = 'image/jpeg',
                    "Quality" = 75,
                    "CreatedAt" = now()
                WHERE "ContentType" = '';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompressedSize",
                table: "CompressedImages");

            migrationBuilder.DropColumn(
                name: "ContentType",
                table: "CompressedImages");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "CompressedImages");

            migrationBuilder.DropColumn(
                name: "OriginalFileName",
                table: "CompressedImages");

            migrationBuilder.DropColumn(
                name: "OriginalSize",
                table: "CompressedImages");

            migrationBuilder.DropColumn(
                name: "Quality",
                table: "CompressedImages");

            migrationBuilder.RenameColumn(
                name: "StorageKey",
                table: "CompressedImages",
                newName: "ImagePath");
        }
    }
}
