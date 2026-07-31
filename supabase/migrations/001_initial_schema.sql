-- ====================================================================
-- JRC INDUSTRIAL SALES ERP (JRCJID OPERATING SYSTEM)
-- MIGRATION 001: INITIAL COMPLETE RELATIONAL SCHEMA & SECURITY
-- ====================================================================

-- 1. EXTENSIONS & SAFE ENUM CREATION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE customer_type_enum AS ENUM ('chemical_wholesale', 'chemical_retail', 'pest_control_contract');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE product_category_enum AS ENUM ('raw_material', 'finished_chemical', 'packaging', 'pest_control_supply');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE movement_type_enum AS ENUM ('PURCHASE_RECEIPT', 'PRODUCTION_CONSUMPTION', 'PRODUCTION_YIELD', 'SALES_DISPATCH', 'PEST_CONTROL_CONSUMPTION', 'ADJUSTMENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'IN_PRODUCTION', 'DISPATCHED', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE po_status_enum AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE pest_job_status_enum AS ENUM ('SCHEDULED', 'IN_TRANSIT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. AUTH & RBAC PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    department TEXT NOT NULL DEFAULT 'General',
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Insert Default Roles
INSERT INTO public.roles (code, name, description) VALUES
('super_admin', 'Super Administrator', 'Full system access'),
('production_manager', 'Production Manager', 'Manages chemical formulas, BoM, and production batches'),
('sales_rep', 'Sales Representative', 'Manages customers, quotes, and sales orders'),
('purchasing_officer', 'Purchasing Officer', 'Manages suppliers, purchase orders, and goods receipts'),
('pest_control_tech', 'Pest Control Technician', 'Executes pest control jobs and logs chemical usage'),
('finance_manager', 'Finance Manager', 'Manages invoicing, accounts receivable, and payments')
ON CONFLICT (code) DO NOTHING;

-- 3. CUSTOMER MASTER DATA
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    trade_name TEXT,
    tax_id TEXT,
    customer_type customer_type_enum NOT NULL DEFAULT 'chemical_wholesale',
    credit_limit NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    payment_terms TEXT NOT NULL DEFAULT 'COD',
    billing_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SUPPLIER MASTER DATA
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    tin TEXT,
    contact_person TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    lead_time_days INTEGER NOT NULL DEFAULT 7,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PRODUCTS & RECIPES (BILL OF MATERIALS)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category product_category_enum NOT NULL,
    uom TEXT NOT NULL DEFAULT 'KG',
    min_reorder_level NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    unit_cost NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    version TEXT NOT NULL DEFAULT 'v1.0',
    batch_size_standard NUMERIC(12,4) NOT NULL,
    uom TEXT NOT NULL DEFAULT 'L',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    raw_material_id UUID NOT NULL REFERENCES public.products(id),
    quantity_required NUMERIC(12,4) NOT NULL,
    uom TEXT NOT NULL
);

-- 6. IMMUTABLE INVENTORY LEDGER
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id),
    location TEXT NOT NULL DEFAULT 'Main Warehouse',
    movement_type movement_type_enum NOT NULL,
    quantity NUMERIC(12,4) NOT NULL,
    batch_number TEXT,
    reference_type TEXT NOT NULL,
    reference_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

-- 7. SALES ORDERS
CREATE TABLE IF NOT EXISTS public.sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    status order_status_enum NOT NULL DEFAULT 'DRAFT',
    payment_status payment_status_enum NOT NULL DEFAULT 'UNPAID',
    total_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sales_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity NUMERIC(12,4) NOT NULL,
    unit_price NUMERIC(15,2) NOT NULL,
    total_price NUMERIC(15,2) NOT NULL
);

-- 8. PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number TEXT NOT NULL UNIQUE,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
    status po_status_enum NOT NULL DEFAULT 'DRAFT',
    total_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PEST CONTROL JOBS
CREATE TABLE IF NOT EXISTS public.pest_control_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    service_address TEXT NOT NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    status pest_job_status_enum NOT NULL DEFAULT 'SCHEDULED',
    technician_id UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. SYSTEM AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    performed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. AUTOMATIC PROFILE CREATION TRIGGER FOR SUPABASE AUTH
-- Automatically grants super_admin role to the FIRST user who registers!
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_count INTEGER;
    admin_role_id UUID;
BEGIN
    -- Insert profile
    INSERT INTO public.profiles (id, email, first_name, last_name, department)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'Employee'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'department', 'Executive Management')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        department = EXCLUDED.department;

    -- Check total existing profiles
    SELECT COUNT(*) INTO user_count FROM public.profiles;

    -- If this is the FIRST registered user in the database, automatically assign super_admin role!
    IF user_count = 1 THEN
        SELECT id INTO admin_role_id FROM public.roles WHERE code = 'super_admin';
        IF admin_role_id IS NOT NULL THEN
            INSERT INTO public.user_roles (user_id, role_id)
            VALUES (NEW.id, admin_role_id)
            ON CONFLICT (user_id, role_id) DO NOTHING;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGER ATTACHED TO AUTH.USERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pest_control_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- SAFE RLS POLICIES
DROP POLICY IF EXISTS "Allow authenticated read" ON public.profiles;
CREATE POLICY "Allow authenticated read" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow individual insert profile" ON public.profiles;
CREATE POLICY "Allow individual insert profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow individual update profile" ON public.profiles;
CREATE POLICY "Allow individual update profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow authenticated read products" ON public.products;
CREATE POLICY "Allow authenticated read products" ON public.products FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated read stock" ON public.inventory_movements;
CREATE POLICY "Allow authenticated read stock" ON public.inventory_movements FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated read SO" ON public.sales_orders;
CREATE POLICY "Allow authenticated read SO" ON public.sales_orders FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated read PO" ON public.purchase_orders;
CREATE POLICY "Allow authenticated read PO" ON public.purchase_orders FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated read PC jobs" ON public.pest_control_jobs;
CREATE POLICY "Allow authenticated read PC jobs" ON public.pest_control_jobs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated read audit logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
