BEGIN;

-- Central administration, subscription billing records and company invitations.
CREATE TABLE IF NOT EXISTS omni.subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES omni.subscriptions(id),
  company_id uuid NOT NULL REFERENCES omni.companies(id),
  amount numeric(14,2) NOT NULL CHECK(amount >= 0),
  currency char(3) NOT NULL DEFAULT 'USD',
  status text NOT NULL CHECK(status IN ('pending','paid','failed','refunded','cancelled')),
  payment_method varchar(60),
  provider varchar(60),
  provider_payment_id varchar(180),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider,provider_payment_id)
);
CREATE INDEX IF NOT EXISTS subscription_payments_company_date_idx
  ON omni.subscription_payments(company_id,created_at DESC);

CREATE TABLE IF NOT EXISTS omni.company_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES omni.companies(id),
  email varchar(255) NOT NULL,
  full_name varchar(180),
  role_key varchar(50) NOT NULL DEFAULT 'company_admin',
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  invited_by uuid REFERENCES omni.app_users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS company_invitations_company_idx
  ON omni.company_invitations(company_id,created_at DESC);

CREATE TABLE IF NOT EXISTS omni.platform_audit_logs (
  id bigserial PRIMARY KEY,
  actor_user_id uuid REFERENCES omni.app_users(id),
  action varchar(80) NOT NULL,
  entity varchar(100) NOT NULL,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS platform_audit_date_idx
  ON omni.platform_audit_logs(created_at DESC);

-- Platform-only tables must never be queried by tenant-facing database roles.
-- The API must use a separate, restricted platform-admin DB role and verify the
-- identity provider's platform-admin claim before any privileged operation.
ALTER TABLE omni.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE omni.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE omni.subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE omni.company_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE omni.platform_audit_logs ENABLE ROW LEVEL SECURITY;

-- Tenant access policies. app.company_id is set transaction-locally only after
-- the API has verified an active membership for the authenticated subject.
CREATE POLICY tenant_subscriptions_read ON omni.subscriptions
  FOR SELECT USING (company_id = nullif(current_setting('app.company_id',true),'')::uuid);
CREATE POLICY tenant_payments_read ON omni.subscription_payments
  FOR SELECT USING (company_id = nullif(current_setting('app.company_id',true),'')::uuid);
CREATE POLICY tenant_invitations_read ON omni.company_invitations
  FOR SELECT USING (company_id = nullif(current_setting('app.company_id',true),'')::uuid);

-- These tables intentionally have no tenant-facing write policies.
-- A separately authenticated platform service performs writes after checking
-- is_platform_admin and records every privileged action in platform_audit_logs.

COMMIT;
