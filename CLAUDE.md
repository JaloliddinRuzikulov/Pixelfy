# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- `npm run migrate:up` - Run database migrations up (uses tsx scripts/migrate.ts)
- `npm run migrate:down` - Roll back database migrations
- `npm run cleanup-db` - Clean up database (tsx scripts/cleanup-db.ts)
- `npm run setup-auth` - Initialize authentication system
- `npm run create-admin` - Create admin user for the system

### Presentation Conversion Service (Optional)
For PowerPoint/PDF to video conversion:
- `./libreoffice-service.sh start` - Start LibreOffice Docker service
- `./libreoffice-service.sh stop` - Stop the service
- `./libreoffice-service.sh status` - Check service health
- `docker-compose up -d libreoffice-converter` - Alternative startup method

## Architecture Overview

Pixelfy is a browser-based video editor built with Next.js 15, TypeScript, and Remotion for video rendering. The application follows a component-driven architecture with state management via Zustand and event-driven updates through vendored @designcombo packages.

### Core Technology Stack
- **Framework**: Next.js 15.3.2 with App Router
- **Language**: TypeScript 5 (strict mode enabled)
- **Runtime**: React 19
- **State Management**: Zustand 5 stores with vendored @designcombo/state StateManager
- **Video Processing**: Remotion 4.0.315 for video composition and export
- **Timeline**: Vendored @designcombo/timeline for timeline UI and interactions
- **UI Components**: Radix UI primitives with Tailwind CSS v4
- **Code Style**: Biome 1.9.4 formatter (tabs for indentation, double quotes)
- **Testing**: Jest 30 with React Testing Library 16 and jsdom environment
- **AI Integration**: Google AI SDK for voice-over generation
- **Media APIs**: Pexels API (optional), sample videos, and stock media
- **Animations**: Framer Motion 11 for UI animations
- **Database**: PostgreSQL with Kysely 0.28.2 query builder (optional)
- **Authentication**: JWT-based with bcryptjs for password hashing
- **Internationalization**: next-intl with support for en, ru, uz locales

### Vendored @designcombo Packages
Located in `src/vendor/designcombo/`:
- **@designcombo/state**: Central state management with event dispatching
- **@designcombo/timeline**: Canvas-based timeline rendering engine
- **@designcombo/events**: Pub/sub event bus for component communication
- **@designcombo/types**: TypeScript type definitions for track items
- **@designcombo/frames**: Frame/timing conversion utilities

### Path Aliases Configuration
From `tsconfig.json`:
- `@/*` → `./src/*`
- `@designcombo/*` → `./src/vendor/designcombo/*`

### Key Architectural Components

#### 1. Editor System (`src/features/editor/`)
The main editor orchestrates all editing functionality:
- **editor.tsx**: Root component managing StateManager instance and coordinating Timeline, Scene, and Controls
- **editor-lazy.tsx**: Lazy-loaded editor wrapper
- **redesigned-editor.tsx**: Alternative layout with improved spacing and modern UI
- **timeline/**: Canvas-based timeline implementation using CanvasTimeline class
- **scene/**: Preview area with Remotion Player and interactive element manipulation
- **player/**: Remotion-based video composition system with sequence-based rendering

#### 2. State Management Architecture
Multiple Zustand stores handle different aspects of application state:
- **use-store.ts**: Core timeline and player state (tracks, items, playback)
- **use-layout-store.ts**: UI layout and panel configuration
- **use-data-state.ts**: Media assets, fonts, and resources
- **use-crop-store.ts**: Crop tool state
- **use-chroma-key-store.ts**: Chroma key/green screen settings
- **use-download-state.ts**: Export and download management
- **use-upload-store.ts**: File upload management and progress tracking
- **use-folder.ts**: Folder organization for media assets
- **use-scene-store.ts**: Scene-specific state management
- **use-subscription-store.ts**: Subscription and billing state

StateManager from @designcombo/state coordinates complex state operations with event-driven updates via @designcombo/events pub/sub system.

#### 3. Media Processing Pipeline
- **Upload Service** (`src/utils/upload-service.ts`): Handles file uploads with presigned URLs
- **Local APIs** (`src/app/api/local-*/`): Backend endpoints for media processing
  - `/api/local-fonts`: Font management
  - `/api/local-render`: Local video rendering
- **Stock Media APIs**:
  - `/api/pexels`: Pexels images API
  - `/api/pexels-videos`: Pexels videos API
- **Presentation APIs** (`src/app/api/presentations/`): PPT/PDF conversion endpoints
- **Remotion Rendering** (`src/app/api/remotion-render/`): Server-side video rendering
- **Admin APIs** (`src/app/api/admin/`): Admin-only endpoints for user and content management

#### 4. Video Composition System (Remotion)
Configuration in `remotion.config.ts`:
- Video image format: JPEG
- Concurrency: 1 (for stability)
- Chromium OpenGL renderer: angle
- Delay render timeout: 120 seconds

Composition components:
- **Sequences**: Time-based composition of media elements
- **Track Items**: Video, audio, text, and image elements
- **Effects**: Transitions, filters, chroma key support
- **Export**: Frame-by-frame rendering to video files

### Biome Configuration
From `biome.json`:
- Indentation: tabs
- Quotes: double
- Linter rules:
  - `noUnusedVariables`: off
  - `useExhaustiveDependencies`: off
  - `noExplicitAny`: off
  - `useImportType`: off

### Jest Testing Configuration
From `jest.config.js`:
- Test environment: jsdom
- Setup file: `jest.setup.js`
- Path aliases: @/ and @designcombo/ supported
- Coverage threshold: 50% for all metrics
- Test patterns: `__tests__/**/*.{js,jsx,ts,tsx}` and `*.{spec,test}.{js,jsx,ts,tsx}`

### Important Implementation Patterns

#### React 19 and Hook Rules
- **NEVER** call React components as functions - always use JSX: `<Component />` not `Component()`
- Hooks must maintain consistent order - no conditional hook calls
- Components using hooks require proper React element rendering

#### Event-Driven Communication
Event namespaces from @designcombo/events:
- **Timeline Events**: Prefixed with `TIMELINE_` (e.g., TIMELINE_SEEK, TIMELINE_PLAY)
- **State Events**: DESIGN_LOAD, EDIT_OBJECT, DELETE_OBJECT
- **Player Events**: PLAYER_PLAY, PLAYER_PAUSE, PLAYER_SEEK
- **Layer Events**: LAYER_* for layer selection
- Subscribe in useEffect, clean up subscriptions on unmount

#### Frame and Timing Calculations
- **Internal**: All timing in milliseconds
- **Display**: Convert to frames using 30 FPS default
- **Remotion**: Frame-based calculations for video composition
- **Utils**: Use `@designcombo/frames` utilities for conversions

#### Canvas Timeline Implementation
- **CanvasTimeline class**: Core rendering logic
- **Draw loop**: Optimized requestAnimationFrame rendering
- **Interaction**: Mouse/touch events handled via canvas coordinates
- **Virtualization**: Only render visible timeline segments

#### Middleware and Route Protection
- Internationalization middleware for locale handling
- Authentication middleware for protected routes
- Admin role verification for /admin routes
- Public routes: /auth/*, /api/auth/*

## Environment Configuration

Optional environment variables (create `.env` from `.env.example` or `.env.development`):
```
# Stock Media (Optional - app works without these)
PEXELS_API_KEY=""  # For Pexels API stock media

# Authentication (Required for user system)
JWT_SECRET=""  # Required for JWT authentication

# Optional AI Features
GOOGLE_AI_API_KEY=""  # Google AI for voice-over generation
COMBO_SH_JWT=""  # Combo.sh JWT token

# Optional Database (PostgreSQL - required for user system)
DATABASE_URL=""  # Format: postgresql://user:password@localhost:5432/video_editor
REDIS_URL=""  # Redis for caching

# Optional Storage (S3-compatible)
S3_BUCKET=""
S3_REGION=""
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=""
NEXT_PUBLIC_ENABLE_RECORDING=""
NEXT_PUBLIC_ENABLE_TEMPLATES=""

# Presentation Processing (Optional)
MAX_PRESENTATION_SIZE="52428800"  # Default: 50MB
TEMP_DIR="/tmp/presentations"
PRESENTATIONS_OUTPUT_DIR="/public/uploads/presentation-pages"
```

## Common Development Tasks

### Adding New Track Item Types
1. Create component in `src/features/editor/player/items/`
2. Register in `src/features/editor/player/sequence-item.tsx`
3. Add timeline rendering in `src/features/editor/timeline/items/`
4. Update type definitions if needed in vendored @designcombo/types

### Modifying State Management
1. Update relevant Zustand store in `src/features/editor/store/`
2. Dispatch events via @designcombo/events if needed
3. Handle events in components using useEffect subscriptions
4. Prevent duplicate subscriptions using WeakMap registry pattern (see use-state-manager-events.ts)

### Working with Remotion
- Compositions use Sequence and AbsoluteFill components
- Calculate frames using fps and duration utilities
- Maintain consistent frame timing across components
- Export composition in `src/features/editor/player/export-composition.tsx`
- Server-side rendering configuration in `remotion.config.ts`

### Testing Strategy
- Unit tests in `src/__tests__/` directory
- Component tests with React Testing Library
- Coverage reports with `npm run test:coverage` (50% threshold)
- Mock external dependencies and APIs
- Global test configuration in `jest.setup.js`

### Performance Optimization Patterns
- Timeline uses canvas for efficient rendering of large datasets
- Media caching system for thumbnail optimization
- Lazy loading for heavy editor components (editor-lazy.tsx)
- Virtual scrolling for timeline segments
- Memoization and selective re-rendering
- Frame-based calculations at 30 FPS
- RequestAnimationFrame for smooth canvas updates

### Authentication and Admin System
- JWT-based authentication with bcryptjs
- Role-based access control for admin panel
- User management via `/api/admin/users`
- Database: PostgreSQL with Kysely query builder
- Setup: Run `npm run create-admin` to create initial admin user

### Presentation Processing
Supports converting presentations (PPT/PPTX/PDF) to video:
- Upload via `/api/presentations/upload` endpoint
- Conversion uses LibreOffice Docker service
- Docker service runs on port 8080
- Output: PNG images at 1920x1080, 3 seconds per slide in timeline
- See `PRESENTATION_SYSTEM_REQUIREMENTS.md` for setup details

## Key File Locations

### Core Editor Files
- Main editor: `src/features/editor/editor.tsx`
- Timeline canvas: `src/features/editor/timeline/canvas-timeline.ts`
- Scene interactions: `src/features/editor/scene/scene-interactions.tsx`
- Player composition: `src/features/editor/player/composition.tsx`

### State Management
- Core stores: `src/features/editor/store/`
- StateManager integration: `src/features/editor/hooks/use-state-manager-events.ts`

### API Routes
- Local rendering: `src/app/api/local-render/`
- Presentations: `src/app/api/presentations/`
- Remotion render: `src/app/api/remotion-render/`
- Admin endpoints: `src/app/api/admin/`

### Configuration Files
- TypeScript: `tsconfig.json`
- Biome formatter: `biome.json`
- Jest testing: `jest.config.js`
- Remotion: `remotion.config.ts`
- Next.js: `next.config.mjs`

### Database and Auth
- Models: `src/lib/db-models.ts`
- Database utilities: `src/lib/db-*.ts`
- Auth utilities: `src/lib/auth.ts`, `src/lib/auth-server.ts`
- Role utilities: `src/lib/role-utils.ts`

### Vendored Libraries
- All @designcombo packages: `src/vendor/designcombo/`

### Internationalization
- Locale configuration: `src/i18n/config.ts`
- Message files: `src/i18n/messages/*.json`
- Middleware handling: `src/middleware.ts`