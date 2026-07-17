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

### 5. Design system
- Tailwind utility classes define spacing, color, and responsive behavior
- TailAdmin-inspired tokens and patterns keep the UI consistent

## Evolution path
As SynoHub matures, the app can add data fetching, auth, permissions, and server-backed dashboard modules without replacing the existing shell.
