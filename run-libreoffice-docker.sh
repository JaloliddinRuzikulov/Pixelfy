#!/bin/bash

echo "Starting LibreOffice Docker service..."

# Stop and remove existing container
docker stop libreoffice-converter 2>/dev/null
docker rm libreoffice-converter 2>/dev/null

# Run LibreOffice container directly
docker run -d \
  --name libreoffice-converter \
  -v $(pwd)/public/uploads:/data \
  -v $(pwd)/convert.sh:/app/convert.sh \
  jodconverter/jodconverter-examples \
  tail -f /dev/null

echo "LibreOffice Docker service started"
echo ""
echo "To convert a presentation:"
echo "docker exec libreoffice-converter /app/convert.sh /data/presentation.pptx /data/output png"
echo ""
echo "To stop the service:"
echo "docker stop libreoffice-converter"