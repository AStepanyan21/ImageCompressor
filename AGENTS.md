# AGENTS.md

Guidance for coding agents working in this repository.

## Project Overview

ImageCompressor is an ASP.NET Core Web API solution for user authentication and image compression.

The solution is split into several projects:

- `ImageCompressor/` - main ASP.NET Core API host, controllers, configuration, Docker files.
- `ImageCompressor.Authorization/` - JWT cookie authentication, Redis-backed user sessions, auth services.
- `ImageCompressor.Core/` - image compression service based on SixLabors ImageSharp.
- `ImageCompressor.Storage/` - S3-compatible storage integration, intended for MinIO/AWS S3.
- `ImageCompressor.EntityFramework/` - EF Core PostgreSQL context, entities, repositories, migrations.
- `ImageCompressor.Models/` - request/response DTOs.
- `ImageCompressor.Exceptions/` - shared exception type and exception middleware.

The public API surface is currently small:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/image/upload`

## Runtime And Tooling

- Target framework: `net9.0`.
- SDK selection is controlled by `global.json`, currently requesting .NET SDK `9.0.0` with roll-forward enabled.
- The Dockerfile currently uses .NET 8 images, which does not match the project target framework.
- Main local HTTP profile: `http://localhost:5114`.
- Swagger is enabled only in Development.

Useful commands:

```sh
dotnet restore ImageCompressor.sln
dotnet build ImageCompressor.sln
dotnet run --project ImageCompressor/ImageCompressor.csproj
```

Infrastructure services are defined in `ImageCompressor/docker-compose.yml`:

```sh
docker compose -f ImageCompressor/docker-compose.yml up -d
```

The compose file defines PostgreSQL, Redis, and MinIO. MinIO credentials are read from environment variables, while development app settings currently use `minioadmin` for access and secret keys.

## Configuration

Development configuration lives in `ImageCompressor/appsettings.Development.json`.

Important sections:

- `ConnectionStrings:ImageCompressorDb` - PostgreSQL connection.
- `Redis` - Redis endpoint and password.
- `AuthOptions` - JWT lifetime, signing key, cookie behavior.
- `AwsOptions` - S3/MinIO credentials, bucket, region, and service URL.

Do not commit real production secrets. If adding new configuration, prefer typed options classes and bind them in `Program.cs`.

## Architecture Notes

### Authentication

Authentication uses JWT bearer auth, but tokens are read from a cookie named by `AuthOptions.CookieKeyName`.

Flow:

1. `AuthService` validates or creates a user.
2. A random `SessionId` is stored in Redis via `CacheService`.
3. `JwtTokenService` creates a JWT containing the `SessionId` claim.
4. Controllers write the JWT to a cookie.
5. `UserSessionMiddleware` reads the Redis session and adds user claims to the current identity.

Current caveats:

- Passwords are hashed with plain SHA256 and no salt. Use a password hasher before production use.
- `CacheService` uses `TimeSpan.FromHours(_authOptions.Lifetime)`, while JWT and cookie expiration use minutes.
- `UserSessionMiddleware` adds a second `SessionId` claim when a session is found.
- `AuthController.UserRegistration` hardcodes cookie `HttpOnly` and `Secure` differently from login.

### Image Compression

`ImageCompressionService` loads the uploaded image with ImageSharp and saves it as JPEG.

Current behavior:

- Default quality is `75`.
- Output format is always JPEG.
- EXIF/metadata handling is not explicitly configured.
- Invalid or unsupported files will currently bubble as non-`BaseExceptions` errors.

### Storage

`S3StorageService` uploads files through `TransferUtility`.

Current behavior:

- Original uploads use the client-provided file name as the object key.
- Compressed uploads use a generated GUID with `.jpg`.
- URLs are manually composed from `ServiceUrl`, `BucketName`, and object key.

Be careful with object keys. Avoid trusting raw `IFormFile.FileName` for permanent storage paths.

### Database

EF Core models:

- `User`
  - `UserId`
  - `Username`
  - `HashedPassword`
  - `CompressedImages`
- `CompressedImage`
  - `CompressedImageId`
  - `ImagePath`
  - `UserId`
  - `User`

`Username` has a unique index. `CompressedImageRepository.GetCompressedImage` is currently not implemented.

## Current Repository State To Respect

At the time this file was created, the worktree already had uncommitted changes in:

- `ImageCompressor.Core/ImageCompressor.Core.csproj`
- `ImageCompressor.EntityFramework/ImageCompressor.EntityFramework.csproj`
- `ImageCompressor.Storage/ImageCompressor.Storage.csproj`
- `ImageCompressor.Storage/Services/S3StorageService.cs`

Treat those as user changes unless you are explicitly asked to modify them. Do not revert unrelated edits.

## Coding Guidelines

- Follow the existing project split. Keep API host concerns in `ImageCompressor/`, auth in `ImageCompressor.Authorization/`, storage in `ImageCompressor.Storage/`, EF concerns in `ImageCompressor.EntityFramework/`, and compression logic in `ImageCompressor.Core/`.
- Prefer dependency injection through service extension methods, matching the current pattern.
- Keep public interfaces small and place implementations as `internal` where possible.
- Use cancellation tokens for database, cache, and external I/O paths.
- Prefer typed request/response DTOs over anonymous response shapes when an endpoint grows beyond trivial use.
- Use `BaseExceptions` for expected API errors if you want the existing exception middleware to format the response.
- Do not add broad refactors while fixing a focused bug.

## Testing And Verification

There are currently no test projects in the solution.

For code changes, at minimum run:

```sh
dotnet build ImageCompressor.sln
```

For endpoint-level changes, also verify manually through Swagger or HTTP requests after starting dependencies and the API.

Useful local flow:

```sh
docker compose -f ImageCompressor/docker-compose.yml up -d
dotnet run --project ImageCompressor/ImageCompressor.csproj
```

Then open:

```text
http://localhost:5114/swagger
```

## Known Improvement Areas

These are known issues or incomplete areas. Do not tackle them unless relevant to the user request.

- Align Docker images with `net9.0`.
- Align NuGet package versions with the target framework where appropriate.
- Add test projects for auth, compression, and controller behavior.
- Replace SHA256 password hashing with a proper password hashing strategy.
- Make image upload authenticated if images are user-owned.
- Persist compressed image records through `ICompressedImageRepository`.
- Implement `CompressedImageRepository.GetCompressedImage`.
- Normalize cookie security settings between registration and login.
- Fix Redis session lifetime units.
- Add validation for uploaded file type, size, and image decoding failures.
- Avoid using raw uploaded file names as S3 object keys.
