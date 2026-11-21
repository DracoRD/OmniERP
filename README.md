# OmniERP — foundation

Multi-company ERP foundation for web, Android and Windows. Commercial model: monthly/annual subscriptions, central platform administration, optional white-label branding.

## Stack
- API: NestJS + TypeScript
- Database: PostgreSQL
- Web: React + Vite + TypeScript
- Offline design: IndexedDB outbox + server-side idempotency (next implementation phase)
- Android: Capacitor wrapper (next implementation phase)
- Windows: Tauri wrapper (next implementation phase)

## Start the database
1. Copy `.env.example` to `.env` and change all secrets.
2. Run `docker compose up -d db`.
3. Apply `database/migrations/001_foundation.sql` using a PostgreSQL migration runner or `psql`.

## Important security boundary
The migration does not store user passwords. Identity/password authentication must be handled by a properly configured identity provider or a dedicated auth module using Argon2id, MFA and secure session rotation. The API must verify a user's active membership before setting `app.company_id` inside a transaction. Never expose database credentials to web/mobile clients.

The initial API and web app are development scaffolds, not production-ready ERP modules. Sales, accounting, fiscal e-CF/NCF, payroll, subscription billing, offline conflict resolution and platform packaging are planned implementation stages.
