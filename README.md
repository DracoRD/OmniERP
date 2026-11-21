# OmniERP — central administration foundation v0.2.0

OmniERP is a multi-company ERP foundation intended for web, Android and Windows, with offline-first workflows and a centrally managed subscription model. This package contains the initial central-admin web interface, NestJS API scaffold, PostgreSQL schema and Docker database service.

## Product decisions
- Commercial model: monthly/yearly subscriptions.
- Administration: central OmniERP superadministrator plus tenant-specific company administrators.
- Branding: standard OmniERP branding or optional company white-label branding.
- Platforms: web, Android (Capacitor) and Windows (Tauri); desktop/mobile wrappers are later implementation stages.
- Offline: IndexedDB outbox and idempotent server synchronization are planned; not yet production-enabled.

## Stack
- API: NestJS + TypeScript
- Database: PostgreSQL
- Web: React + Vite + TypeScript
- Icons: Lucide
- Deployment: Docker Compose for local database; production VPS deployment to be configured.

## Run the web administration preview
```bash
cd web
npm install
npm run dev
```
The current admin UI uses clearly labeled in-memory demonstration records. Creating or editing a company changes the current browser session only; it does not create a real account, subscription, payment or database record. The API URL flag only indicates configuration and does not imply that endpoints have been implemented.

## Start PostgreSQL
1. Copy `.env.example` to `.env` and replace every example secret.
2. Run `docker compose up -d db` from the project root.
3. Apply migrations in order:
   - `database/migrations/001_foundation.sql`
   - `database/migrations/002_central_admin.sql`

## Security requirements before production
- Use a real identity provider or implement secure authentication with Argon2id, MFA, short-lived access tokens and refresh-token rotation.
- Never trust a role or company ID supplied by the browser. Verify the identity provider subject and active membership on the API.
- Set `app.company_id` transaction-locally only after membership verification. Use a distinct privileged service role for central administration; never expose DB credentials to clients.
- The central-admin API, tenant APIs, billing provider webhooks, invitation flow and audit enforcement are not implemented in this preview.
- Review and test all RLS policies with separate tenant and platform database roles before production. Do not use a database owner/superuser connection for normal application traffic.
- Configure payment provider, tax treatment, billing terms, backups, monitoring and secrets before accepting subscriptions.

## Current delivery scope
Included: initial database foundation, central-admin interface prototype, company list/form interactions in demo mode, plan presentation, white-label preview, Docker database configuration.
Not yet included: production authentication, real CRUD API, invitations/email, payment collection, automated subscription lifecycle, complete ERP modules, offline conflict resolution, Android/Windows installers, or DGII e-CF certification/integration.
