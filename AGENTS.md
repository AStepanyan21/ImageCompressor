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
- `ImageCompressor.Tests/` - xUnit tests for auth and compression.
- `ClientApp/` - React + Vite SPA (login, registration, image upload, history). Built into `ImageCompressor/wwwroot`.

The public API surface is currently small:

- `POST /api/auth/register` - `{ username, password, confirmPassword }`, signs the user in.
- `POST /api/auth/login` - `{ username, password }`.
- `POST /api/auth/logout` - clears the session and cookie (works without a valid session).
- `GET /api/auth/me` - current user `{ username }` or 401.
- `POST /api/image/upload` - multipart `file` + optional `quality` (1-100, default 75). Authenticated.
- `GET /api/image` - current user's compressed images (history). Authenticated.
- `GET /api/image/{id}/content[?download=true]` - streams the compressed image from S3. Authenticated, owner only.

All error responses use the `{ "message": "..." }` shape (including model validation errors).
Auth endpoints never return the JWT in the body; it is only set as an HttpOnly cookie.

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

The compose file defines PostgreSQL, Redis, and MinIO. MinIO root credentials come from `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` (default `minioadmin`), matching development app settings.

After the containers are up, initialize MinIO (idempotent, safe to re-run; starts MinIO if it is not running):

```sh
ImageCompressor/scripts/minio-init.sh
```

It waits for MinIO, creates the bucket (`MINIO_BUCKET`, default `mybucket`, must match `AwsOptions:BucketName`) and keeps it private. The bucket must not be public: images are served through the API with per-user access checks.

Apply database migrations:

```sh
dotnet ef database update --project ImageCompressor.EntityFramework --startup-project ImageCompressor
```

Frontend (from `ClientApp/`):

```sh
npm install
npm run dev     # http://localhost:5173, proxies /api to http://localhost:5114
npm test        # vitest
npm run lint    # oxlint
npm run build   # outputs to ImageCompressor/wwwroot
```

The SPA always calls the API with relative `/api/...` URLs (same origin), so the `SameSite=Strict` HttpOnly cookie works without CORS. Do not point it at an absolute API URL.

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

Notes:

- `AuthOptions.Lifetime` is in minutes for the JWT, cookie and Redis session.
- Cookie options are built in one place in `AuthController`; `HttpOnly`/`Secure` default to `true`, development sets `Secure: false` because it runs over http.
- Login returns the same 401 "Invalid username or password" for unknown users and wrong passwords.
- Duplicate username returns 409.
- Passwords are hashed with plain SHA256 and no salt. Use a password hasher before production use.

### Image Compression

`ImageCompressionService` loads the uploaded image with ImageSharp and re-encodes it in the same format.

Current behavior:

- Quality is `1..100`, default `75` (`CompressionQuality`).
- JPEG/WebP use quality directly; PNG/GIF below 100 are quantized to a palette (16-256 colors); other formats use the default encoder.
- EXIF orientation is applied to pixels, then EXIF/IPTC/XMP are stripped (ICC profile is kept).
- The result is never larger than the original: if re-encoding does not help, the original bytes are returned.
- Invalid/unsupported files (including HEIC) and empty files throw `BaseExceptions` with 400.
- There is intentionally no upload size limit (`DisableRequestSizeLimit` on the upload action).

### Storage

`S3StorageService` uploads and downloads objects.

Current behavior:

- Only the compressed image is stored; originals are not kept.
- Object keys are generated on the server: `compressed/{userId}/{guid}{ext}`. Never use `IFormFile.FileName` as a key.
- The original file name is stored in the database only for display and download naming.
- Files are streamed to clients through `GET /api/image/{id}/content`, not via public S3 URLs.

### Database

EF Core models:

- `User`
  - `UserId`
  - `Username`
  - `HashedPassword`
  - `CompressedImages`
- `CompressedImage`
  - `CompressedImageId`
  - `StorageKey`
  - `OriginalFileName`, `ContentType`
  - `OriginalSize`, `CompressedSize`, `Quality`
  - `CreatedAt` (UTC)
  - `UserId`
  - `User`

`Username` has a unique index. `CompressedImageRepository.GetCompressedImage(id, userId)` returns 404 for images of other users.

## Current Repository State To Respect

Check `git status` before starting. Treat uncommitted changes you did not make as user changes and do not revert unrelated edits.

## Coding Guidelines

- Follow the existing project split. Keep API host concerns in `ImageCompressor/`, auth in `ImageCompressor.Authorization/`, storage in `ImageCompressor.Storage/`, EF concerns in `ImageCompressor.EntityFramework/`, and compression logic in `ImageCompressor.Core/`.
- Prefer dependency injection through service extension methods, matching the current pattern.
- Keep public interfaces small and place implementations as `internal` where possible.
- Use cancellation tokens for database, cache, and external I/O paths.
- Prefer typed request/response DTOs over anonymous response shapes when an endpoint grows beyond trivial use.
- Use `BaseExceptions` for expected API errors if you want the existing exception middleware to format the response.
- Do not add broad refactors while fixing a focused bug.

## Testing And Verification

For code changes, at minimum run:

```sh
dotnet build ImageCompressor.sln
dotnet test ImageCompressor.sln
```

For frontend changes run `npm test`, `npm run lint` and `npm run build` in `ClientApp/`.

For endpoint-level changes, also verify manually through Swagger or HTTP requests after starting dependencies and the API.

Useful local flow:

```sh
docker compose -f ImageCompressor/docker-compose.yml up -d
ImageCompressor/scripts/minio-init.sh
dotnet run --project ImageCompressor/ImageCompressor.csproj
(cd ClientApp && npm run dev)
```

Then open `http://localhost:5173` (UI) or `http://localhost:5114/swagger` (API).

## Known Improvement Areas

These are known issues or incomplete areas. Do not tackle them unless relevant to the user request.

- Align Docker images with `net9.0`.
- Align NuGet package versions with the target framework where appropriate.
- Add controller/integration tests.
- Replace SHA256 password hashing with a proper password hashing strategy.
- Consider a pixel-dimension limit for uploads (there is no byte size limit by design).
- Deleting images from history is not implemented.
