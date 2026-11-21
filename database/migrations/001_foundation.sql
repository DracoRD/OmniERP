BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS omni;

CREATE TABLE omni.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name varchar(200) NOT NULL,
  display_name varchar(160) NOT NULL,
  tax_id varchar(40),
  country_code char(2) NOT NULL DEFAULT 'DO',
  base_currency char(3) NOT NULL DEFAULT 'DOP',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE omni.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES omni.companies(id),
  code varchar(30) NOT NULL,
  name varchar(160) NOT NULL,
  address text,
  phone varchar(40),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id,id), UNIQUE(company_id,code)
);

-- Identity is external: auth_subject is the immutable subject from the identity provider.
CREATE TABLE omni.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_subject varchar(255) NOT NULL UNIQUE,
  email varchar(255) NOT NULL,
  full_name varchar(180) NOT NULL,
  is_platform_admin boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE omni.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES omni.companies(id),
  user_id uuid NOT NULL REFERENCES omni.app_users(id),
  branch_id uuid,
  role_key varchar(50) NOT NULL DEFAULT 'employee',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(company_id,branch_id) REFERENCES omni.branches(company_id,id),
  UNIQUE(company_id,user_id,id)
);

CREATE TABLE omni.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(40) NOT NULL UNIQUE,
  name varchar(100) NOT NULL,
  billing_interval text NOT NULL CHECK (billing_interval IN ('month','year')),
  price numeric(14,2) NOT NULL CHECK(price >= 0),
  currency char(3) NOT NULL DEFAULT 'USD',
  limits jsonb NOT NULL DEFAULT '{"users":5,"branches":1,"storage_mb":1024}'::jsonb,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE omni.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES omni.companies(id),
  plan_id uuid NOT NULL REFERENCES omni.subscription_plans(id),
  status text NOT NULL CHECK(status IN ('trialing','active','past_due','suspended','cancelled','expired')),
  starts_at timestamptz NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  trial_ends_at timestamptz,
  cancelled_at timestamptz,
  provider varchar(50),
  provider_subscription_id varchar(180),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK(current_period_end > current_period_start)
);
CREATE INDEX subscriptions_company_status_idx ON omni.subscriptions(company_id,status);

CREATE TABLE omni.company_branding (
  company_id uuid PRIMARY KEY REFERENCES omni.companies(id),
  brand_name varchar(160),
  logo_url text,
  primary_color varchar(20) DEFAULT '#2457C5',
  secondary_color varchar(20) DEFAULT '#14213D',
  custom_domain varchar(255) UNIQUE,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE omni.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES omni.companies(id),
  sku varchar(80), barcode varchar(100), name varchar(200) NOT NULL,
  description text, category varchar(120), unit_code varchar(20) NOT NULL DEFAULT 'UND',
  cost numeric(18,4) NOT NULL DEFAULT 0 CHECK(cost >= 0),
  sale_price numeric(18,4) NOT NULL DEFAULT 0 CHECK(sale_price >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id,id), UNIQUE(company_id,sku)
);

CREATE TABLE omni.warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES omni.companies(id),
  branch_id uuid NOT NULL,
  code varchar(30) NOT NULL, name varchar(150) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  FOREIGN KEY(company_id,branch_id) REFERENCES omni.branches(company_id,id),
  UNIQUE(company_id,id), UNIQUE(company_id,code)
);

-- Immutable stock ledger. Corrections are compensating movements, not edits/deletes.
CREATE TABLE omni.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  product_id uuid NOT NULL,
  warehouse_id uuid NOT NULL,
  movement_type text NOT NULL CHECK(movement_type IN ('opening','receipt','sale','return','transfer_in','transfer_out','adjustment')),
  quantity_delta numeric(18,3) NOT NULL CHECK(quantity_delta <> 0),
  reference_type varchar(50), reference_id uuid,
  idempotency_key varchar(120) NOT NULL,
  created_by uuid REFERENCES omni.app_users(id),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(company_id,product_id) REFERENCES omni.products(company_id,id),
  FOREIGN KEY(company_id,warehouse_id) REFERENCES omni.warehouses(company_id,id),
  UNIQUE(company_id,idempotency_key)
);
CREATE INDEX inventory_balance_lookup_idx ON omni.inventory_movements(company_id,warehouse_id,product_id,occurred_at);

CREATE TABLE omni.audit_logs (
  id bigserial PRIMARY KEY,
  company_id uuid REFERENCES omni.companies(id),
  actor_user_id uuid REFERENCES omni.app_users(id),
  action varchar(80) NOT NULL, entity varchar(100) NOT NULL, entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_company_date_idx ON omni.audit_logs(company_id,created_at DESC);

-- Tenant isolation. API must validate membership and SET LOCAL app.company_id per transaction.
ALTER TABLE omni.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE omni.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE omni.company_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE omni.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE omni.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE omni.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE omni.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_branches ON omni.branches USING (company_id = nullif(current_setting('app.company_id',true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id',true),'')::uuid);
CREATE POLICY tenant_memberships ON omni.memberships USING (company_id = nullif(current_setting('app.company_id',true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id',true),'')::uuid);
CREATE POLICY tenant_branding ON omni.company_branding USING (company_id = nullif(current_setting('app.company_id',true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id',true),'')::uuid);
CREATE POLICY tenant_products ON omni.products USING (company_id = nullif(current_setting('app.company_id',true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id',true),'')::uuid);
CREATE POLICY tenant_warehouses ON omni.warehouses USING (company_id = nullif(current_setting('app.company_id',true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id',true),'')::uuid);
CREATE POLICY tenant_inventory ON omni.inventory_movements USING (company_id = nullif(current_setting('app.company_id',true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id',true),'')::uuid);
CREATE POLICY tenant_audit ON omni.audit_logs USING (company_id = nullif(current_setting('app.company_id',true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id',true),'')::uuid);

-- Seed starter plans; prices are placeholders and must be set before commercial launch.
INSERT INTO omni.subscription_plans(code,name,billing_interval,price,limits,features) VALUES
('basic-monthly','Básico mensual','month',0,'{"users":5,"branches":1,"storage_mb":1024}','{"sales":true,"inventory":true}'),
('professional-monthly','Profesional mensual','month',0,'{"users":20,"branches":5,"storage_mb":10240}','{"sales":true,"inventory":true,"accounting":true,"purchases":true}'),
('enterprise-monthly','Empresarial mensual','month',0,'{"users":-1,"branches":-1,"storage_mb":102400}','{"all_modules":true,"white_label":true}'),
('basic-yearly','Básico anual','year',0,'{"users":5,"branches":1,"storage_mb":1024}','{"sales":true,"inventory":true}'),
('professional-yearly','Profesional anual','year',0,'{"users":20,"branches":5,"storage_mb":10240}','{"sales":true,"inventory":true,"accounting":true,"purchases":true}'),
('enterprise-yearly','Empresarial anual','year',0,'{"users":-1,"branches":-1,"storage_mb":102400}','{"all_modules":true,"white_label":true}');
COMMIT;
