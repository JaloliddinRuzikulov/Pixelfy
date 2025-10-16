# Lipsync Timeout Configuration

## Problem
Long-running AI lip-sync requests (>2-3 minutes) may timeout on the frontend with "Ulanish vaqti tugadi" error, even though the backend server successfully completes the video processing.

## Causes
1. **Next.js Development Server**: Default 60s timeout
2. **Node.js HTTP**: Default 120s timeout  
3. **Nginx/Proxy**: May have timeout settings
4. **Vercel Free Tier**: 10s serverless function timeout
5. **Vercel Pro Tier**: Up to 300s (5min) with maxDuration config

## Solutions

### 1. For Production (Self-Hosted)

#### Next.js Server Timeout
Edit `server.js` or add to `package.json` start script:

```javascript
// Increase Node.js HTTP timeout
const server = app.listen(port, () => {
  server.timeout = 600000; // 10 minutes
  server.keepAliveTimeout = 600000;
  server.headersTimeout = 600000;
});
```

Or with environment variable:
```bash
# In .env or docker-compose
NODE_OPTIONS="--max-http-header-size=16384"
SERVER_TIMEOUT=600000
```

#### Nginx Proxy
```nginx
location /api/lipsync/ {
    proxy_pass http://localhost:3000;
    proxy_read_timeout 600s;
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
}
```

### 2. For Development

#### Option A: Use production build locally
```bash
npm run build
npm run start  # Production server has higher timeouts
```

#### Option B: Direct backend connection
Temporarily bypass Next.js proxy and connect frontend directly to AI service:

In `wav2lip.tsx`:
```typescript
// Development only - bypass Next.js API
const apiUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:9001/generate'  // Direct to AI service
  : '/api/lipsync/generate';           // Through Next.js API
```

### 3. For Vercel Deployment

Vercel has strict function timeouts:
- **Free**: 10 seconds max
- **Pro**: Up to 300 seconds with `maxDuration`

Current config (already applied):
```typescript
// In /api/lipsync/generate/route.ts
export const maxDuration = 300; // 5 minutes (Pro only)
export const dynamic = "force-dynamic";
```

**Note**: Lip-sync processing often takes 3-5 minutes, so Vercel Pro is required for production deployment.

### 4. Monitoring Server Progress

Backend logs show processing stages:
```
Oct 16 00:00:13 - Request received
Oct 16 00:00:45 - Face detection complete
Oct 16 00:02:30 - Wav2Lip inference running
Oct 16 00:03:13 - ✅ Video created successfully
```

If frontend times out but backend completes, the issue is in the network/proxy layer, not the AI processing.

## Current Configuration

### Frontend
- ✅ No client-side timeout (removed 5min limit)
- ✅ Progress indicators during processing
- ✅ Detailed error messages

### Backend  
- ✅ 300s Wav2Lip processing timeout
- ✅ Auto-retry for TTS (3 attempts)
- ✅ Face detection recovery on OOM

### Next.js API Routes
- ✅ `maxDuration = 300` (Vercel Pro)
- ✅ `dynamic = "force-dynamic"`
- ❌ Need custom server for self-hosted (see above)

## Recommendations

### For Self-Hosted Production:
1. Create custom Next.js server with increased timeouts
2. Configure nginx/caddy proxy timeouts
3. Use PM2 or Docker with proper timeout configs

### For Vercel:
1. Upgrade to Pro plan ($20/month)
2. Or use separate AI service with webhook/polling:
   - Frontend submits job → returns job ID
   - Poll /status/{jobId} endpoint
   - Download result when ready

### For Development:
1. Use `npm run build && npm run start` instead of `npm run dev`
2. Or connect directly to AI service (bypass Next.js)

## Testing

Test timeout configuration:
```bash
# Start services
cd ../lipsync && python start.py  # Port 9001
cd ../web && npm run start         # Port 3000

# Test with long video (should take 3-5 min)
curl -X POST http://localhost:3000/api/lipsync/generate \
  -F "video=@long_video.mp4" \
  -F "audio=@long_audio.mp3" \
  --max-time 600  # 10 min timeout
```

## Current Status

✅ Fixed:
- Frontend client timeout removed
- Backend processing optimized
- Error messages improved

⚠️ Known Issues:
- Next.js dev server has 60s default timeout
- Production mode works fine
- Vercel Free tier cannot support long videos

