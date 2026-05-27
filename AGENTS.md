# Agent Instructions

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 13 (PHP 8.3+) |
| Frontend | React 19 + Inertia.js 3 + TypeScript (strict) |
| UI | Tailwind CSS v4 + shadcn/ui |
| DB (dev) | PostgreSQL 16 via Docker (localhost:54320) |
| Cache/Queue | Redis 7 via Docker (localhost:63790) |
| DB (tests) | SQLite in-memory (`DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`) |
| Auth | Laravel Fortify (built-in: login, register, email verification, password reset) |
| Testing | Pest |

## 📖 Documentation (MANDATORY)

The source of truth for this project is at:

```
~/Documents/dev/dev-notes/Projects/jmswebshield-store/
```

**It is mandatory to read this documentation before touching any code.** It contains:
- Roadmap and implementation phases
- What is done and what is pending
- Real stack and architecture decisions
- Business rules
- Complete setup guide

## 📝 Session log (MANDATORY)

At the start of every session, **read** `03 - Bitácora.md` in the dev-notes
to know the current project state and the latest instructions.

At the end of every session (or after any significant phase progress), **update**
`03 - Bitácora.md` recording:
- Date and summary of what was worked on
- Instructions received from the user
- Completed tasks (with checkboxes)
- Next steps

## Developer Commands

### Infra (Docker)
```bash
docker compose up -d    # Start PostgreSQL + Redis
docker compose down     # Stop services
```

### Frontend (npm)
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production (SSR included)
npm run lint         # ESLint --fix
npm run lint:check   # ESLint no-fix
npm run format       # Prettier --write resources/
npm run format:check # Prettier --check resources/
npm run types:check  # tsc --noEmit
```

### Backend (composer)
```bash
composer dev         # Runs: php artisan serve + queue:listen + pail + vite concurrently
composer lint        # Pint --parallel
composer lint:check  # Pint --parallel --test
composer test        # config:clear → lint:check → php artisan test
```

### UI (shadcn/ui)
```bash
npx shadcn@latest add [component]    # Add component (button, card, table, input, etc.)
```

### Migrations
```bash
php artisan migrate
php artisan migrate:fresh --seed
php artisan db:seed
```

## 🧩 Workflow

Every feature or change must follow this order **strictly**:

1. **Read documentation** — Review the dev-notes (`~/Documents/dev/dev-notes/Projects/jmswebshield-store/`) to understand the current project state.
2. **Assess scope** — Analyze how big the change is, which files/routes it impacts, and estimate complexity.
3. **Decide branch strategy** (MANDATORY) — Choose branch type based on the change:
   - `feature/xxx` → new functionality
   - `bugfix/xxx` → bug fixes
   - `hotfix/xxx` → urgent patches
   - `refactor/xxx` → refactoring
   - Base branch: `develop`
4. **Plan** — Define the solution before touching code.
5. **Strict TDD** — Write the failing test first, then the implementation that makes it pass.
6. **Small PRs** — Maximum ~300 lines. If the change is larger, split into multiple PRs.
7. **No auto-commits** — Do not commit or push automatically without explicit review.

## 🧱 React Components

- **Small** components with a single responsibility.
- **Functional**, never class-based.
- Each component in its **own file**.
- Location: `resources/js/components/<domain>/`
- Base shadcn/ui components live in `resources/js/components/ui/` — installed via `npx shadcn@latest add`.

## 📐 Coding Principles

- **SOLID** and **Clean Code** as baseline standards.
- **Naming conventions**:

| Element | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase | `ProductCard.tsx` |
| Functions / variables | camelCase | `getProducts()` |
| TS/TSX files | kebab-case | `product-card.tsx` |
| Constants | UPPER_SNAKE_CASE | `MAX_PRICE` |

## 🌐 Language

- **Code and comments**: English (variable names, function names, docblocks, inline comments)
- **Documentation** (`AGENTS.md`, dev-notes, commit messages): English
- **Product presentation** (UI labels, page titles, product descriptions, error messages): Spanish

## ✍️ Commits

- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`
- No auto-commit or auto-push without explicit review.

## Key Quirks

- **ESLint ignores**: `vendor/`, `node_modules/`, `public/`, `bootstrap/ssr/`, `tailwind.config.js`, `vite.config.ts`, `resources/js/actions/**`, `resources/js/components/ui/**`, `resources/js/routes/**`, `resources/js/wayfinder/**`
- **Tests**: SQLite in-memory, no Docker or external services required
- **Path alias**: `@/*` maps to `resources/js/*` (configured in tsconfig.json and eslint.config.js resolver)
- **React Compiler**: babel-plugin-react-compiler is active in vite.config.ts
- **pnpm workspace**: single package (`.`), with `publicHoistPattern` for `@inertiajs/core`
- **Prettier**: `tabWidth: 4` (non-default; most JS/TS projects use 2, but this repo uses 4)
- **Auto-generated code**: `resources/js/actions/**` and `resources/js/routes/**` are generated by `@laravel/vite-plugin-wayfinder` — never edit these directly
- **Admin auth**: Middleware `EnsureEmailIsAdmin` reads `ADMIN_EMAILS` from `.env` (comma-separated list)
- **Docker ports**: PostgreSQL on `54320`, Redis on `63790` (non-standard to avoid collisions)

## File Locations

- Frontend entry: `resources/js/app.tsx`
- Backend entry: `app/Http/Controllers/`
- Routes: `routes/web.php`, `routes/settings.php`
- React pages: `resources/js/pages/`
- Config: `config/`, `.env`
- shadcn/ui components: `resources/js/components/ui/`

## Testing

```bash
./vendor/bin/pest                           # All tests
./vendor/bin/pest --filter="TestName"       # Single test
./vendor/bin/pest --testsuite=Feature       # Feature tests only
./vendor/bin/pest --testsuite=Unit          # Unit tests only
```
