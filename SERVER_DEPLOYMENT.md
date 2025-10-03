# Server Deployment Guide for Pixelfy

## Problem: Chrome/Chromium Dependencies Missing

The error `libatk-1.0.so.0: cannot open shared object file` occurs when Remotion tries to launch Chrome for video rendering but required system libraries are missing.

## Solution 1: Install Dependencies on Ubuntu/Debian Server

Run the installation script:

```bash
chmod +x install-server-deps.sh
./install-server-deps.sh
```

Or manually install:

```bash
sudo apt-get update
sudo apt-get install -y \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libxshmfence1 \
    libnss3 \
    libnspr4 \
    libx11-xcb1 \
    libxss1 \
    libxtst6 \
    fonts-liberation
```

## Solution 2: Using Docker

Build and run with Docker:

```bash
# Build the Docker image
docker build -f Dockerfile.production -t pixelfy-app .

# Run the container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  pixelfy-app
```

## Solution 3: Use Software Rendering

If your server doesn't have a GPU, configure Remotion to use software rendering:

1. Set environment variables in `.env.production`:
```env
REMOTION_GL=swangle
REMOTION_DISABLE_HEADLESS=false
```

2. Or export them before running:
```bash
export REMOTION_GL=swangle
export REMOTION_DISABLE_HEADLESS=false
bun start
```

## Solution 4: Install Chrome/Chromium Manually

If the bundled Chrome doesn't work:

```bash
# Install Google Chrome
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
sudo apt-get update
sudo apt-get install -y google-chrome-stable

# Or install Chromium
sudo apt-get install -y chromium-browser

# Set the path in environment
export REMOTION_CHROME_EXECUTABLE_PATH=/usr/bin/chromium-browser
# or
export REMOTION_CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

## Verifying Installation

After installing dependencies, verify Chrome can launch:

```bash
# Test Remotion browser
npx remotion browser ensure

# Test rendering
npx remotion render src/remotion/index.tsx MyComposition out.mp4
```

## Common Issues and Fixes

### Issue: "No usable sandbox" error
Add these flags to environment:
```bash
export REMOTION_PUPPETEER_ARGS="--no-sandbox,--disable-setuid-sandbox"
```

### Issue: "Failed to launch browser" on VPS/Cloud
Some VPS providers have limited resources. Try:
```bash
export REMOTION_PUPPETEER_ARGS="--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage"
export REMOTION_GL=swangle
```

### Issue: Out of memory during render
Limit concurrent renders in `remotion.config.ts`:
```javascript
export const Config = {
  Rendering: {
    concurrency: 1,
    imageFormat: 'jpeg',
    jpegQuality: 80,
  },
};
```

## Production Deployment Checklist

- [ ] Install all Chrome dependencies
- [ ] Configure environment variables
- [ ] Set up database connection
- [ ] Configure AI service URLs
- [ ] Test Remotion browser launch
- [ ] Test video rendering
- [ ] Set up nginx/reverse proxy
- [ ] Configure SSL certificates
- [ ] Set up process manager (PM2/systemd)
- [ ] Configure monitoring

## PM2 Configuration

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'pixelfy',
    script: 'bun',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      REMOTION_GL: 'swangle'
    }
  }]
};
```

Run with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Support

If issues persist, check:
- Remotion Troubleshooting: https://remotion.dev/docs/troubleshooting/browser-launch
- System logs: `journalctl -u pixelfy`
- Application logs: `pm2 logs pixelfy`