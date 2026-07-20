# Technical Architecture

## Frontend stack
- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router

## Architecture style
The project follows a feature-oriented frontend structure with route-level pages and shared components for repeated UI patterns. The shell is separated from content pages so the dashboard can grow without turning into a flat component dump.

## Key layers

### 1. App bootstrap
- `src/main.tsx` mounts the app
- Global styles and theme providers are loaded at startup

### 2. Routing
- Top-level routes map to dashboard, auth, and fallback pages
- Layout routes keep navigation and chrome stable across pages

### 3. Layout
- Shared dashboard layout owns sidebar, header, and content container
- Auth layout stays separate to avoid dashboard chrome on login pages

### 4. Feature pages
- Pages compose reusable components into user-facing screens
- Dashboard home is the primary landing experience
- The project command center uses one route-level page with accessible tab panels for PM workflows
- The dedicated project-operations route provides clean, non-modal management workflows for canonical PM records
- Typed command-center fixtures are isolated in `src/data/projectCommandCenter.ts` and `src/data/projectCommandCenterByProject.ts` until live APIs replace them

### 5. Frontend data boundary
- `src/data/projectOperationsStore.ts` is the temporary repository boundary for project operations data
- The hook loads typed seed data, safely ignores malformed browser-storage payloads, and persists updates under a versioned project key
- The Project Operations page owns write workflows; the Project Command Center consumes the same read model
- Explicit dependency records reference predecessor and successor work-item IDs rather than inferring a delivery chain from milestone order
- Browser storage is prototype persistence only; authentication, authorization, concurrency, server validation, and audit guarantees require the planned backend API

### 6. Design system
- Tailwind utility classes define spacing, color, and responsive behavior
- TailAdmin-inspired tokens and patterns keep the UI consistent

## Evolution path
Replace the temporary browser-storage repository with authenticated API calls while preserving the typed `ProjectCommandCenterData` boundary. The backend must add workspace isolation, role checks, immutable audit events, optimistic concurrency, and server-side validation before these workflows are production-ready.
