# SynoHub Backend

TypeScript backend for SynoHub using Express, Sequelize, and MySQL. The source is organized as feature modules with MVC responsibilities separated inside each module.

## Structure

```text
src/
├── common/middleware/       # Cross-cutting HTTP middleware
├── config/                  # Validated environment configuration
├── database/                # Sequelize adapter and future models/migrations
├── modules/<feature>/       # routes, controllers, services, models/repositories
├── app.ts                   # Express composition root
├── routes.ts                # Versioned API router
└── server.ts                # Database and HTTP lifecycle
```

Dependency flow: `route -> controller -> service -> repository/model`. Controllers handle HTTP only; services own business rules; repositories/models own persistence.

## Local setup

```bash
cp .env.example .env
npm install
npm run dev
```

Start MySQL from the repository root after creating its environment file with `cp .env.example .env`, replacing both placeholder passwords, then run `docker compose up -d mysql`. The backend example uses `127.0.0.1:3307`; set `DB_PASSWORD` to the root `.env` file's `MYSQL_PASSWORD` value. Containers communicate with MySQL on internal port `3306`.

## API endpoints

- `GET /api/v1/health` — process liveness (does not query MySQL)
- `GET /api/v1/health/ready` — service readiness using a timeout-bounded, briefly cached MySQL authentication check

Request logs redact authorization, cookie, API-key, and set-cookie values. Valid client request IDs are preserved and correlated with the `x-request-id` response header; unsafe values are replaced.

## Quality checks

```bash
npm test
npm run lint
npm run build
```

## Database changes

Do not use Sequelize `sync({ alter: true })` in production. Add versioned migrations when the first domain model is introduced, and run them as an explicit deployment step.
