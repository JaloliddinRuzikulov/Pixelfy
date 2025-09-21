# LibreOffice Conversion Service

This service provides presentation (PPT, PPTX, PDF) to image conversion functionality using LibreOffice in a Docker container.

## Architecture

The service runs as a separate Docker container that:
- Starts once and keeps running
- Exposes an HTTP API on port 8080
- Accepts conversion requests via REST API
- Processes files mounted via Docker volume

## Setup

### 1. Build the Docker Image (one-time setup)
```bash
docker-compose build libreoffice-converter
# or
./libreoffice-service.sh build
```

### 2. Start the Service
```bash
docker-compose up -d libreoffice-converter
# or
./libreoffice-service.sh start
```

The service will be available at `http://localhost:8080`

### 3. Verify Service is Running
```bash
./libreoffice-service.sh status
# or
curl http://localhost:8080/health
```

## Service Management

### Using the Helper Script
```bash
# Start the service
./libreoffice-service.sh start

# Stop the service
./libreoffice-service.sh stop

# Restart the service
./libreoffice-service.sh restart

# View logs
./libreoffice-service.sh logs

# Check status
./libreoffice-service.sh status
```

### Using Docker Compose
```bash
# Start
docker-compose up -d libreoffice-converter

# Stop
docker-compose stop libreoffice-converter

# View logs
docker logs -f libreoffice-converter

# Remove container
docker-compose down libreoffice-converter
```

## API Endpoints

### Health Check
```bash
GET http://localhost:8080/health
```
Response:
```json
{
  "status": "healthy"
}
```

### Convert Presentation
```bash
POST http://localhost:8080/convert
Content-Type: application/json

{
  "input_file": "/data/presentation.pptx",
  "output_dir": "/data/output",
  "format": "png"
}
```

Response:
```json
{
  "success": true,
  "files": ["slide-1.png", "slide-2.png"],
  "output": "Conversion successful"
}
```

## How It Works

1. **File Upload**: User uploads presentation file through the main app
2. **API Request**: App sends conversion request to Docker service
3. **Conversion**: LibreOffice converts presentation to PDF, then to PNG images
4. **Response**: Service returns list of generated slide images
5. **Timeline**: App adds slides to video timeline

## File Paths

- Host files: `./public/uploads/`
- Container mount: `/data/`
- Presentation uploads: `/data/presentations/`
- Converted images: `/data/presentation-pages/{jobId}/`

## Troubleshooting

### Service Not Starting
```bash
# Check if port 8080 is already in use
lsof -i :8080

# Check Docker logs
docker logs libreoffice-converter

# Rebuild image
docker-compose build --no-cache libreoffice-converter
```

### Conversion Failing
```bash
# Check service logs
docker logs -f libreoffice-converter

# Verify file permissions
ls -la public/uploads/

# Test conversion manually
docker exec libreoffice-converter /app/convert.sh /data/test.pptx /data/output png
```

### Performance Issues
- The first conversion may be slower as LibreOffice initializes
- Subsequent conversions should be faster
- Container keeps LibreOffice loaded in memory

## Requirements

- Docker and Docker Compose installed
- Port 8080 available
- Sufficient disk space for Docker images (~2GB)
- Write permissions for `public/uploads/` directory