# Presentation Conversion System Requirements

## Overview
This document outlines the system requirements for the presentation to image conversion feature in Pixelfy.

## System Dependencies

### Required Software
The following software packages must be installed on the production server:

#### 1. ImageMagick (Required for image processing)
- **Package**: `imagemagick`
- **Minimum Version**: 6.9.x or higher
- **Purpose**: Convert presentation files to images, image optimization
- **Installation**:
  ```bash
  # Ubuntu/Debian
  sudo apt-get install imagemagick
  
  # CentOS/RHEL
  sudo yum install ImageMagick
  ```

#### 2. Poppler Utils (Required for PDF processing)
- **Package**: `poppler-utils`
- **Minimum Version**: 0.86.x or higher
- **Purpose**: Convert PDF files to images with high quality
- **Installation**:
  ```bash
  # Ubuntu/Debian
  sudo apt-get install poppler-utils
  
  # CentOS/RHEL
  sudo yum install poppler-utils
  ```

#### 3. LibreOffice (Required for PowerPoint processing)
- **Package**: `libreoffice`
- **Minimum Version**: 6.4.x or higher
- **Purpose**: Convert PPT/PPTX files to PDF, then to images
- **Installation**:
  ```bash
  # Ubuntu/Debian
  sudo apt-get install libreoffice --no-install-recommends
  
  # CentOS/RHEL
  sudo yum install libreoffice-headless
  ```

### Docker Configuration
For Docker-based deployments, add the following to your Dockerfile:

```dockerfile
# Install system dependencies
RUN apt-get update && apt-get install -y \
    imagemagick \
    poppler-utils \
    libreoffice \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Configure ImageMagick security policy (if needed)
RUN sed -i 's/policy domain="coder" rights="none" pattern="PDF"/policy domain="coder" rights="read|write" pattern="PDF"/' /etc/ImageMagick-6/policy.xml
```

## Node.js Dependencies
The following npm packages are used for presentation processing:

- `sharp` - Image processing and optimization (already installed)
- `pdf-lib` - PDF parsing and manipulation (already installed)

## File Support
The system supports the following presentation formats:
- **PDF** - Processed using poppler-utils (pdftoppm)
- **PPTX** - Converted via LibreOffice → PDF → Images
- **PPT** - Converted via LibreOffice → PDF → Images

## Output Specifications
- **Format**: PNG images
- **Resolution**: 1920x1080 (Full HD)
- **Quality**: High quality (95% compression)
- **Timeline Duration**: 3 seconds per slide (user adjustable)

## Performance Considerations
- Processing time depends on file size and slide count
- Large presentations (>50MB or >100 slides) may take 30+ seconds
- Concurrent processing is handled via job queue system
- Temporary files are cleaned up automatically

## Security Notes
- Uploaded files are validated for type and size
- Temporary processing files are stored in `/tmp` and cleaned up
- ImageMagick policy may need adjustment for PDF processing
- File size limit: 50MB per presentation

## Troubleshooting
Common issues and solutions:

### LibreOffice Symbol Lookup Error
If LibreOffice shows symbol lookup errors:
```bash
# Try reinstalling freetype and harfbuzz libraries
sudo apt-get install --reinstall libfreetype6 libharfbuzz0b
```

### ImageMagick PDF Policy Error
If ImageMagick can't process PDFs:
```bash
# Edit ImageMagick policy
sudo nano /etc/ImageMagick-6/policy.xml
# Change PDF policy from "none" to "read|write"
```

## API Endpoints
- `POST /api/presentations/upload` - Upload presentation file
- `GET /api/presentations/status/{jobId}` - Check conversion status
- Generated images stored in `/public/uploads/presentation-pages/{jobId}/`

## Environment Variables
```env
# Maximum file size for presentations (default: 50MB)
MAX_PRESENTATION_SIZE=52428800

# Temporary directory for processing
TEMP_DIR=/tmp/presentations

# Output directory for generated images
PRESENTATIONS_OUTPUT_DIR=/public/uploads/presentation-pages
```