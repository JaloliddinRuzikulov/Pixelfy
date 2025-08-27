# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start Next.js development server (http://localhost:3000)
- `npm run build` - Build production application
- `npm run lint` - Run Next.js linting
- `npm run format` - Format code using Biome (uses tabs, double quotes)
- `npm test` - Run all Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm test -- path/to/test.test.ts` - Run a single test file
- `npm test -- --testNamePattern="test name"` - Run tests matching pattern

### Database Commands (Optional)
- `npm run migrate:up` - Run database migrations up
- `npm run migrate:down` - Roll back database migrations
- `npm run cleanup-db` - Clean up database

### Development Setup
To run the application locally:
1. Clone the repository and install dependencies with `npm install`
2. Copy `.env.example` to `.env` and configure environment variables
3. At minimum, set `PEXELS_API_KEY` for stock media integration
4. Run `npm run dev` to start the development server

## Architecture Overview

This is a browser-based video editor built with Next.js 15, TypeScript, and Remotion for video rendering. The application follows a component-driven architecture with state management via Zustand and event-driven updates through @designcombo packages.

### Core Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode enabled)
- **State Management**: Zustand stores with @designcombo/state StateManager
- **Video Processing**: Remotion for video composition and export
- **Timeline**: @designcombo/timeline for timeline UI and interactions
- **UI Components**: Radix UI primitives with Tailwind CSS v4
- **Code Style**: Biome formatter (tabs for indentation, double quotes)
- **Testing**: Jest with React Testing Library
- **AI Integration**: Google AI SDK for voice-over generation
- **Media APIs**: Pexels API for stock videos and images
- **Animations**: Framer Motion for UI animations

### Key Architectural Components

#### 1. Editor System (`src/features/editor/`)
The main editor orchestrates all editing functionality:
- **editor.tsx**: Root component managing StateManager instance and coordinating Timeline, Scene, and Controls
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

StateManager from @designcombo/state coordinates complex state operations with event-driven updates via @designcombo/events pub/sub system.

#### 3. Media Processing Pipeline
- **Upload Service** (`src/utils/upload-service.ts`): Handles file uploads with presigned URLs
- **Local APIs** (`src/app/api/local-*/`): Backend endpoints for media processing
- **Stock Media**: Pexels API integration for stock videos/images
- **Caching**: CacheManager for thumbnail and media optimization

#### 4. Video Composition System
Remotion-based rendering with:
- **Sequences**: Time-based composition of media elements
- **Track Items**: Video, audio, text, and image elements
- **Effects**: Transitions, filters, chroma key support
- **Export**: Frame-by-frame rendering to video files

### Important Implementation Notes

#### React Components and Hooks
- Components using hooks must be rendered as React elements, not called as functions
- Maintain consistent hook order - avoid conditional hook calls
- Use proper component composition with JSX syntax

#### Canvas and Performance
- Timeline uses direct canvas manipulation for performance
- Frame-based timing at 30 FPS default
- All timing values in milliseconds internally

#### Event System
- Components communicate via @designcombo/events
- StateManager dispatches DESIGN_LOAD, EDIT_OBJECT, etc.
- Timeline events use TIMELINE_PREFIX namespace

#### File Organization
- Feature-based structure under `src/features/editor/`
- Shared components in `src/components/`
- API routes in `src/app/api/`
- Type definitions from `@designcombo/types`

#### Local Development Architecture
The application uses local APIs for development:
- **Local Media Processing** (`/api/local-*/`): Handles uploads, rendering, and media processing without external dependencies
- **Font Management**: Local font loading system using `src/features/editor/data/local-fonts.ts`
- **Error Boundaries**: Implemented in `src/components/error-boundary.tsx` for graceful error handling
- **Theme System**: Dark/light mode support with customizable themes

## Environment Configuration

Required environment variables in `.env`:
```
# Required
PEXELS_API_KEY=""  # For stock media integration (get from https://www.pexels.com/api/)

# Optional AI Features
GOOGLE_AI_API_KEY=""  # Google AI for voice-over generation
COMBO_SH_JWT=""  # Combo.sh JWT token for additional services

# Optional Database (PostgreSQL)
DATABASE_URL=""  # Format: postgresql://user:password@localhost:5432/video_editor

# Optional Storage (S3-compatible)
S3_BUCKET=""
S3_REGION=""
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
```

## Code Style Guidelines

- **Formatting**: Biome with tabs for indentation, double quotes for strings
- **TypeScript**: Strict mode enabled, use type imports where appropriate
- **Path Aliases**: Use `@/` for imports from `src/` directory
- **Component Exports**: Named exports for components, default for pages
- **React 19**: Uses React 19 features and concurrent features
- **Linting**: Biome linter with custom rules (unused variables disabled, exhaustive deps disabled)
- **Testing**: Jest with jsdom environment, coverage threshold of 50%

## Common Development Tasks

### Adding New Track Item Types
1. Create component in `src/features/editor/player/items/`
2. Register in `src/features/editor/player/sequence-item.tsx`
3. Add timeline rendering in `src/features/editor/timeline/items/`
4. Update type definitions if needed

### Modifying State Management
1. Update relevant Zustand store in `src/features/editor/store/`
2. Dispatch events via @designcombo/events if needed
3. Handle events in components using useEffect subscriptions

### Working with Remotion
- Compositions use Sequence and AbsoluteFill components
- Calculate frames using fps and duration utilities
- Maintain consistent frame timing across components

### Debugging and Error Handling
- React components must have unique `key` props when rendered in lists
- Check browser console for detailed error messages
- Use React DevTools for component inspection
- Remotion Player errors often relate to frame calculation or media loading
- Error boundaries are implemented for graceful error handling
- Performance monitoring available through built-in hooks

### Testing Strategy
- Unit tests in `src/__tests__/` directory
- Test components with React Testing Library
- Coverage reports available with `npm run test:coverage`
- Mock external dependencies and APIs in tests
- Use `jest.setup.js` for global test configuration

### Performance Considerations
- Timeline uses canvas for efficient rendering of large datasets
- Media caching system in `src/lib/cache-manager.ts` for thumbnail optimization
- Lazy loading implemented for heavy editor components
- Web Workers recommended for heavy video processing tasks
- Virtual scrolling should be considered for long timelines