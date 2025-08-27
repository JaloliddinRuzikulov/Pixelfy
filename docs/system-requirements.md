# System Requirements and Dependencies

## Required System Packages

The following system packages must be installed for full functionality of the video editor:

### Core Dependencies

#### 1. FFmpeg (Required)
Used for video processing, encoding, and rendering.
```bash
sudo apt-get install ffmpeg
```

#### 2. ImageMagick (Required for presentations)
Used for converting PDF pages to images.
```bash
sudo apt-get install imagemagick
```

#### 3. Poppler Utils (Required for presentations)
Alternative PDF processing tools, includes pdftoppm.
```bash
sudo apt-get install poppler-utils
```

#### 4. LibreOffice (Required for PowerPoint conversion)
Used for converting PPT/PPTX files to PDF.
```bash
sudo apt-get install libreoffice
```

#### 5. UnoConv (Optional - PowerPoint backup converter)
Alternative converter for Office documents.
```bash
sudo apt-get install unoconv
```

### Install All Dependencies at Once

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y ffmpeg imagemagick poppler-utils libreoffice

# For additional codec support
sudo apt-get install -y libavcodec-extra
```

### macOS Installation

```bash
# Using Homebrew
brew install ffmpeg imagemagick poppler libreoffice
```

### Windows Installation

1. **FFmpeg**: Download from https://ffmpeg.org/download.html
2. **ImageMagick**: Download from https://imagemagick.org/script/download.php
3. **Poppler**: Download from https://blog.alivate.com.au/poppler-windows/
4. **LibreOffice**: Download from https://www.libreoffice.org/download/

## Node.js Dependencies

```bash
npm install
```

## Feature-Specific Requirements

### Video Export
- **FFmpeg**: Required for all video export functionality
- **libx264**: H.264 codec (usually included with FFmpeg)
- **libvpx**: VP8/VP9 codec for WebM (optional)

### Presentation Conversion
- **ImageMagick** or **Poppler**: For PDF to image conversion
- **LibreOffice**: For PPT/PPTX to PDF conversion
- **FFmpeg**: For creating video from images

### Audio Processing
- **FFmpeg**: Handles all audio encoding/decoding

## Troubleshooting

### FFmpeg Library Path Issues

If you encounter library errors like:
```
libharfbuzz.so.0: undefined symbol: FT_Get_Transform
```

This is usually caused by Android SDK or other development tools interfering with system libraries. The application handles this automatically by setting the correct library path.

### ImageMagick PDF Security Policy

If ImageMagick fails to process PDFs, you may need to modify the security policy:

```bash
sudo nano /etc/ImageMagick-6/policy.xml
```

Find and modify this line:
```xml
<policy domain="coder" rights="none" pattern="PDF" />
```
Change to:
```xml
<policy domain="coder" rights="read|write" pattern="PDF" />
```

### LibreOffice Headless Mode

LibreOffice must be able to run in headless mode. If it fails, install:
```bash
sudo apt-get install libreoffice-java-common
```

## Performance Recommendations

### System Requirements
- **RAM**: Minimum 4GB, recommended 8GB+
- **CPU**: Multi-core processor recommended for video processing
- **Storage**: SSD recommended for better I/O performance
- **Disk Space**: At least 10GB free for temporary files

### Optimization Tips
1. Use lower quality settings for faster exports during development
2. Clear `/public/uploads` and `/public/renders` directories periodically
3. Increase Node.js memory limit for large files:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run dev
   ```

## Docker Support (Future)

For consistent environment across different systems, Docker support is planned:

```dockerfile
# Planned Dockerfile snippet
FROM node:20-alpine
RUN apk add --no-cache ffmpeg imagemagick poppler-utils libreoffice
```

## Version Compatibility

- **Node.js**: 18.x or higher
- **npm**: 8.x or higher
- **FFmpeg**: 4.x or higher
- **ImageMagick**: 6.x or 7.x
- **LibreOffice**: 6.x or higher

## Security Notes

1. File upload size limits are enforced (50MB for presentations)
2. Only specific file types are allowed (PDF, PPT, PPTX)
3. Temporary files are cleaned up automatically
4. User uploads are isolated in separate directories

## Development vs Production

### Development
All dependencies listed above should be installed locally.

### Production
Consider using cloud services for heavy processing:
- AWS MediaConvert for video processing
- Google Cloud Document AI for document conversion
- Or containerize with all dependencies included

## Support

For issues related to system dependencies, check:
1. Package manager logs (`apt`, `brew`, etc.)
2. Application logs in the console
3. FFmpeg version: `ffmpeg -version`
4. ImageMagick version: `convert -version`
5. LibreOffice version: `libreoffice --version`