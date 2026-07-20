# Feature Breakdown

## 1. Application shell
- Persistent sidebar navigation
- Top bar with contextual actions
- Responsive layout for desktop and mobile
- Dark mode-friendly styling

## 2. Dashboard home
- KPI cards
- Trend charts
- Recent activity or recent orders table
- Summary panels for actionable insights

## 3. Authentication pages
- Sign in
- Sign up
- Shared auth layout
- Not-found fallback

## 4. UI building blocks
- Buttons, badges, alerts, avatars, and images
- Reusable form components
- Table patterns
- Chart examples

## 5. Project management
- Project board with grid/list views, search, and status filtering
- Create and edit project workflow in a shared side drawer
- Dedicated project command center with health, progress, phase, milestone, and attention metrics
- Operational tabs for overview, plan, work, risks and issues, decisions, updates, and activity
- Dedicated project-operations workspace at `/projects/:projectId/operations`
- In-page, non-modal create workflows for milestones, work items, explicit work dependencies, risks and issues, decisions, and status updates
- Complete line-by-line validation feedback for every operations form
- Frontend persistence so approved project records survive navigation and refreshes during the API-free prototype phase
- Shared operations data between the management workspace and the project command center
- Contextual AI intelligence with evidence references and PM review entry points
- Milestone outlook, explicit dependency register, work board, risk register, and decision log
- Evidence-backed status-update drafts that remain subject to PM approval
- Project profile, repository, and attachment information
- Safe not-found handling for invalid project links

## 6. Extensibility hooks
- Centralized layout and routing
- Shared component layer for future reuse
- Theme tokens and Tailwind utility conventions
- Versioned browser-storage adapter that can be replaced by a backend repository without changing route-level workflows
