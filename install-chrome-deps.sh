#!/bin/bash
echo "Installing Chrome/Chromium dependencies for Remotion..."

sudo apt-get update

sudo apt-get install -y \
  libgbm1 \
  libnss3 \
  libnspr4 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm-dev \
  libpango-1.0-0 \
  libcairo2 \
  libasound2 \
  libatspi2.0-0 \
  libx11-xcb1 \
  libxcb-dri3-0

echo "✅ Chrome dependencies installed successfully!"
echo "You can now run: npm run dev"
