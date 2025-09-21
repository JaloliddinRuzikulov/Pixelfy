#!/bin/bash

echo "LibreOffice Conversion Service Startup Script"
echo "============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

echo ""
echo "Building LibreOffice Docker image..."
echo "This may take 5-10 minutes on first run as it installs LibreOffice."
echo ""

# Build the Docker image
docker-compose build libreoffice-converter

if [ $? -ne 0 ]; then
    echo "Error: Failed to build Docker image"
    exit 1
fi

echo ""
echo "Starting LibreOffice service..."

# Start the service
docker-compose up -d libreoffice-converter

if [ $? -ne 0 ]; then
    echo "Error: Failed to start service"
    exit 1
fi

echo "Waiting for service to be ready..."
sleep 5

# Check if service is healthy
for i in {1..30}; do
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        echo ""
        echo "✅ LibreOffice conversion service is running!"
        echo ""
        echo "Service URL: http://localhost:8080"
        echo "Health endpoint: http://localhost:8080/health"
        echo "Convert endpoint: http://localhost:8080/convert"
        echo ""
        echo "To stop the service: docker-compose stop libreoffice-converter"
        echo "To view logs: docker logs -f libreoffice-converter"
        echo ""
        exit 0
    fi
    echo -n "."
    sleep 2
done

echo ""
echo "⚠️  Service started but health check failed."
echo "Check logs with: docker logs libreoffice-converter"
exit 1