#!/bin/bash

# LibreOffice Docker Service Management Script

case "$1" in
  start)
    echo "Starting LibreOffice converter service..."
    docker-compose up -d libreoffice-converter
    echo "Waiting for service to be ready..."
    sleep 5
    curl -f http://localhost:8080/health > /dev/null 2>&1
    if [ $? -eq 0 ]; then
      echo "LibreOffice converter service is running at http://localhost:8080"
    else
      echo "Service started but health check failed. Check logs with: docker logs libreoffice-converter"
    fi
    ;;
  
  stop)
    echo "Stopping LibreOffice converter service..."
    docker-compose stop libreoffice-converter
    ;;
  
  restart)
    echo "Restarting LibreOffice converter service..."
    docker-compose restart libreoffice-converter
    ;;
  
  logs)
    docker logs -f libreoffice-converter
    ;;
  
  status)
    curl -f http://localhost:8080/health > /dev/null 2>&1
    if [ $? -eq 0 ]; then
      echo "LibreOffice converter service is running"
    else
      echo "LibreOffice converter service is not running"
    fi
    ;;
  
  build)
    echo "Building LibreOffice converter Docker image..."
    docker-compose build libreoffice-converter
    ;;
  
  *)
    echo "Usage: $0 {start|stop|restart|logs|status|build}"
    echo ""
    echo "  start   - Start the LibreOffice converter service"
    echo "  stop    - Stop the LibreOffice converter service"
    echo "  restart - Restart the LibreOffice converter service"
    echo "  logs    - View service logs"
    echo "  status  - Check if service is running"
    echo "  build   - Build the Docker image"
    exit 1
    ;;
esac