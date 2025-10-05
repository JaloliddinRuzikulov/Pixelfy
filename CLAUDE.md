# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

### Most Common Commands
```bash
# Docker (Recommended)
make setup           # First time setup
make dev             # Start all services with hot reload
make status          # Check service status
make logs            # View logs
make test            # Test all endpoints

# Web Development (Native)
cd web
npm run dev          # Start dev server
npm test             # Run tests
npm run format       # Format code (Biome)

# Code Quality (Always run before committing)
cd web
npm run format       # Format with Biome
npm run lint         # Check linting
npm test            # Run tests
```

## Repository Structure

This is a monorepo containing five main components of the Pixelfy video editing platform:

- **`/web`** - Main Next.js web application for video editing
- **`/lipsync`** - Python-based AI services for lip-sync and TTS (Wav2Lip)
- **`/office`** - Office document processing services for PPT/PDF conversion
- **`/presentai`** - AI-powered presentation generation service
- **`/storage`** - Centralized storage service for all media files

## Development Commands

### Essential Commands
- `npm run dev` - Start Next.js development server (http://localhost:3000)
- `npm run build` - Build production application
- `npm run start` - Start production server after build
- `npm run lint` - Run Next.js linting
- `npm run format` - Format code using Biome (tabs for indentation, double quotes)

### Testing Commands
- `npm test` - Run all Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report (50% threshold)
- `npm test -- path/to/test.test.ts` - Run a single test file
- `npm test -- --testNamePattern="test name"` - Run tests matching pattern

### Database & Authentication Commands (Optional)
- `npm run migrate:up` - Run database migrations up
- `npm run migrate:down` - Roll back database migrations
- `npm run cleanup-db` - Clean up database
- `npm run setup-auth` - Initialize authentication system
- `npm run create-admin` - Create admin user for the system

## Architecture Overview

Pixelfy is a browser-based video editor built with Next.js 15, TypeScript, and Remotion for video rendering.

### Core Technology Stack
- **Framework**: Next.js 15.3.2 with App Router
- **Language**: TypeScript 5 (strict mode disabled for development flexibility)
- **Runtime**: React 19
- **State Management**: Zustand 5 stores with @designcombo/state StateManager
- **Video Processing**: Remotion 4.0.315 for video composition and export
- **Timeline**: @designcombo/timeline for timeline UI and interactions
- **UI Components**: Radix UI primitives with Tailwind CSS v4
- **Code Style**: Biome 1.9.4 formatter (tabs for indentation, double quotes)
- **Testing**: Jest 30 with React Testing Library 16 and jsdom environment
- **Database**: PostgreSQL with Kysely 0.28.2 query builder (optional)
- **Authentication**: JWT-based with bcryptjs for password hashing
- **Internationalization**: next-intl with support for en, ru, uz locales

### Service URLs (Environment Variables)

Development (.env.development):
```bash
LIPSYNC_SERVICE_URL=http://localhost:9001
PRESENTAI_SERVICE_URL=http://localhost:9004
OFFICE_SERVICE_URL=http://localhost:9002
STORAGE_SERVICE_URL=http://localhost:9005
```

Production (.env.production):
```bash
LIPSYNC_SERVICE_URL=https://lipsync.pixelfy.uz
PRESENTAI_SERVICE_URL=https://presentai.pixelfy.uz
OFFICE_SERVICE_URL=https://office.pixelfy.uz
STORAGE_SERVICE_URL=https://storage.pixelfy.uz
```

## Authentication Setup

### Prerequisites
1. PostgreSQL Database running
2. Node.js 18+

### Setup Steps
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env and configure:
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=postgresql://username:password@localhost:5432/video_editor

# 3. Install dependencies
npm install

# 4. Run authentication setup
npm run setup-auth

# 5. Start development server
npm run dev
```

### Authentication Features
- Password hashing with bcryptjs
- JWT sessions (7-day expiration)
- Email verification (token-based)
- Protected routes via middleware
- User registration and login
- Admin panel with role-based access

### API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/verify-email` - Email verification

## System Requirements

### Core Dependencies
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y ffmpeg imagemagick poppler-utils libreoffice

# macOS
brew install ffmpeg imagemagick poppler libreoffice
```

### Required Packages
- **FFmpeg**: Video processing, encoding, rendering
- **ImageMagick**: PDF to image conversion
- **Poppler Utils**: Alternative PDF processing (pdftoppm)
- **LibreOffice**: PPT/PPTX to PDF conversion

### Docker Configuration
```dockerfile
RUN apt-get update && apt-get install -y \
    ffmpeg \
    imagemagick \
    poppler-utils \
    libreoffice \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
```

## Presentation Conversion

### Supported Formats
- **PDF** - Processed using poppler-utils
- **PPTX** - Converted via LibreOffice → PDF → Images
- **PPT** - Converted via LibreOffice → PDF → Images

### Output Specifications
- **Format**: PNG images
- **Resolution**: 1920x1080 (Full HD)
- **Quality**: High quality (95% compression)
- **Timeline Duration**: 3 seconds per slide

### Environment Variables
```env
MAX_PRESENTATION_SIZE=52428800  # 50MB limit
TEMP_DIR=/tmp/presentations
PRESENTATIONS_OUTPUT_DIR=/public/uploads/presentation-pages
```

## Keyboard Shortcuts

### Basic Editing
- **Ctrl+Z** - Undo
- **Ctrl+Y** - Redo
- **Ctrl+C/V/X** - Copy/Paste/Cut
- **Ctrl+D** - Duplicate
- **Delete** - Delete selected items

### Playback Controls
- **Space** - Play/Pause
- **Left/Right Arrow** - Seek 1 second
- **Shift+Left/Right** - Seek 5 seconds
- **Home/End** - Go to start/end

### Timeline
- **S** - Split at playhead
- **M** - Add marker
- **Ctrl+=/-** - Zoom in/out
- **Ctrl+0** - Zoom to fit

### Project
- **Ctrl+S** - Save project
- **Ctrl+Shift+E** - Export video

## Code Style (Biome Configuration)

- Indentation: **tabs**
- Quotes: **double quotes**
- Linter rules:
  - `noUnusedVariables`: off
  - `useExhaustiveDependencies`: off
  - `noExplicitAny`: off

## Important Technical Notes

### React 19 Rules
- **NEVER** call components as functions - always use JSX: `<Component />` not `Component()`
- TypeScript strict mode is disabled for development flexibility
- Use path alias `@/*` for imports from `src/*`

### State Management Pattern
- Use event-driven updates with @designcombo/events pub/sub
- Subscribe in useEffect, always clean up subscriptions
- Prevent duplicate subscriptions with WeakMap registry pattern

### Video Processing
- Frame calculations at 30 FPS default
- Remotion for video composition and rendering
- Canvas-based timeline for efficiency

### Input/Textarea Components
- Light mode: white background (`bg-input` = `oklch(1 0 0)`)
- Dark mode: semi-transparent (`bg-input/30`)
- All inputs and textareas use `bg-input` class for consistent styling

## Common Development Workflows

### Starting Full Stack Development

#### Option 1: Using Docker (Recommended)
```bash
make setup        # First time
make dev          # Start all services
make status       # Check services
make logs         # View logs
make test         # Test endpoints
```

#### Option 2: Native (Without Docker)
```bash
# Terminal 1: AI services
cd ai && python start.py

# Terminal 2: PresentAI service
cd presentai && python start.py

# Terminal 3: Office service
cd office && python start.py

# Terminal 4: Storage service
cd storage && python start.py

# Terminal 5: Web app
cd web && npm run dev
```

### Code Quality Workflow
```bash
cd web
npm run format       # Format with Biome before committing
npm run lint         # Check for linting issues
npm test            # Run tests to ensure nothing breaks
```

## File Structure References

### Core Files
- **Main editor**: `src/features/editor/editor.tsx`
- **Timeline**: `src/features/editor/timeline/timeline.tsx`
- **Scene**: `src/features/editor/scene/scene-interactions.tsx`
- **Player**: `src/features/editor/player/composition.tsx`

### Configuration
- **Next.js**: `next.config.mjs`
- **Biome**: `biome.json`
- **Jest**: `jest.config.js`
- **Remotion**: `remotion.config.ts`
- **TypeScript**: `tsconfig.json`

### API Routes
- **Health checks**: `src/app/api/health/*`
- **Office service**: `src/app/api/office/*`
- **PresentAI service**: `src/app/api/presentai/*`
- **Storage service**: `src/app/api/storage/*`
- **Auth endpoints**: `src/app/api/auth/*`
- **Admin panel**: `src/app/api/admin/*`

## Performance Considerations

### System Requirements
- **RAM**: Minimum 4GB, recommended 8GB+
- **CPU**: Multi-core processor for video processing
- **Storage**: SSD recommended, 10GB+ free space
- **Disk Space**: For temporary files and renders

### Optimization Tips
1. Use lower quality settings during development
2. Clear `/public/uploads` and `/public/renders` periodically
3. Increase Node.js memory for large files:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run dev
   ```

## Troubleshooting

### Database Connection
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check firewall settings

### FFmpeg Issues
- Check version: `ffmpeg -version`
- Ensure libx264 codec is available
- Check library path settings

### ImageMagick PDF Policy
```bash
sudo nano /etc/ImageMagick-6/policy.xml
# Change: <policy domain="coder" rights="none" pattern="PDF" />
# To: <policy domain="coder" rights="read|write" pattern="PDF" />
```

### LibreOffice Headless
```bash
sudo apt-get install libreoffice-java-common
```

### Timeline Width Issue
- Timeline auto-resizes on container resize
- ResizeObserver monitors container changes
- 100ms initial delay ensures proper sizing

## Security Notes

1. File upload size limits enforced (50MB)
2. Only specific file types allowed
3. Temporary files auto-cleaned
4. User uploads isolated
5. JWT secrets required for auth
6. CSRF protection with secure cookies
