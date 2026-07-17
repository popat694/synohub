# SynoHub Project Instructions

## Goals

- Keep the dashboard scaffold clean, responsive, and production-ready.
- Preserve TailAdmin-style layout, spacing, and visual hierarchy.
- Prefer small, reviewable changes.

## Workflow

1. Update the relevant component or page.
2. Update docs if the architecture or user flow changes.
3. Run `npm run build` before handing off.
4. If the change affects a reusable pattern, keep it in the shared component layer.

## Conventions

- Use React function components and TypeScript types where helpful.
- Keep dashboard pages feature-oriented.
- Keep shared UI primitives in `src/components`.
- Keep route-level pages in `src/pages`.
- Preserve Tailwind utility-first styling.

## Verification

- `npm run lint`
- `npm run build`
