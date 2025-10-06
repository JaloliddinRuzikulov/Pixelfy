# Remotion Dependencies Installation (Ubuntu/Debian Server)

## Error
```
libatk-1.0.so.0: cannot open shared object file: No such file or directory
```

## Solution - Install Chrome/Chromium Dependencies

### Ubuntu 20.04 / 22.04 / 24.04
```bash
sudo apt-get update

# Install all Chrome dependencies
sudo apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0 \
    libxshmfence1
```

### Alternative - Install all at once
```bash
sudo apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils
```

## Verify Installation
```bash
# Check if Chrome can run
/home/shabserver/Projects/DiD/Pixelfy/node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell --version

# Should output something like: HeadlessChrome 131.0.6778.69
```

## Test Remotion Render
```bash
cd ~/Projects/DiD/Pixelfy
bun run dev

# Then try to export a video from the web interface
```

## Docker Alternative (If you want to use Docker)
```bash
# Use official Remotion Docker image with all dependencies
docker run --rm -v $(pwd):/app remotion/renderer render ...
```

## References
- https://remotion.dev/docs/troubleshooting/browser-launch
- https://pptr.dev/troubleshooting#chrome-headless-doesnt-launch-on-unix
