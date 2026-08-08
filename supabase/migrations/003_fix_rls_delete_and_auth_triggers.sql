-- ====================================================================
-- JRC INDUSTRIAL SALES ERP (JRCJID OPERATING SYSTEM)
-- MIGRATION 003: FULL RLS DELETE & UPDATE POLICIES & AUTH INTEGRATION
-- ====================================================================

-- 1. PROFILES POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated read" ON public.profiles;
CREATE POLICY "Allow authenticated read" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon read profile" ON public.profiles;
CREATE POLICY "Allow anon read profile" ON public.profiles FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow individual insert profile" ON public.profiles;
CREATE POLICY "Allow individual insert profile" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow individual update profile" ON public.profiles;
CREATE POLICY "Allow individual update profile" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete profile" ON public.profiles;
CREATE POLICY "Allow authenticated delete profile" ON public.profiles FOR DELETE TO authenticated USING (true);

-- 2. USER ROLES POLICIES
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read user_roles" ON public.user_roles;
CREATE POLICY "Allow authenticated read user_roles" ON public.user_roles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon read user_roles" ON public.user_roles;
CREATE POLICY "Allow anon read user_roles" ON public.user_roles FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert user_roles" ON public.user_roles;
CREATE POLICY "Allow authenticated insert user_roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update user_roles" ON public.user_roles;
CREATE POLICY "Allow authenticated update user_roles" ON public.user_roles FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete user_roles" ON public.user_roles;
CREATE POLICY "Allow authenticated delete user_roles" ON public.user_roles FOR DELETE TO authenticated USING (true);

-- 3. PRODUCTS POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read products" ON public.products;
CREATE POLICY "Allow authenticated read products" ON public.products FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert products" ON public.products;
CREATE POLICY "Allow authenticated insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update products" ON public.products;
CREATE POLICY "Allow authenticated update products" ON public.products FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete products" ON public.products;
CREATE POLICY "Allow authenticated delete products" ON public.products FOR DELETE TO authenticated USING (true);

-- 4. SALES ORDERS POLICIES
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read SO" ON public.sales_orders;
CREATE POLICY "Allow authenticated read SO" ON public.sales_orders FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert SO" ON public.sales_orders;
CREATE POLICY "Allow authenticated insert SO" ON public.sales_orders FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update SO" ON public.sales_orders;
CREATE POLICY "Allow authenticated update SO" ON public.sales_orders FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete SO" ON public.sales_orders;
CREATE POLICY "Allow authenticated delete SO" ON public.sales_orders FOR DELETE TO authenticated USING (true);

-- 5. INVENTORY MOVEMENTS POLICIES
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read stock" ON public.inventory_movements;
CREATE POLICY "Allow authenticated read stock" ON public.inventory_movements FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert stock" ON public.inventory_movements;
CREATE POLICY "Allow authenticated insert stock" ON public.inventory_movements FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update stock" ON public.inventory_movements;
CREATE POLICY "Allow authenticated update stock" ON public.inventory_movements FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete stock" ON public.inventory_movements;
CREATE POLICY "Allow authenticated delete stock" ON public.inventory_movements FOR DELETE TO authenticated USING (true);

-- 6. PEST CONTROL JOBS POLICIES
ALTER TABLE public.pest_control_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read PC jobs" ON public.pest_control_jobs;
CREATE POLICY "Allow authenticated read PC jobs" ON public.pest_control_jobs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert PC jobs" ON public.pest_control_jobs;
CREATE POLICY "Allow authenticated insert PC jobs" ON public.pest_control_jobs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update PC jobs" ON public.pest_control_jobs;
CREATE POLICY "Allow authenticated update PC jobs" ON public.pest_control_jobs FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete PC jobs" ON public.pest_control_jobs;
CREATE POLICY "Allow authenticated delete PC jobs" ON public.pest_control_jobs FOR DELETE TO authenticated USING (true);

-- 7. AUDIT LOGS POLICIES
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read audit logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert audit logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete audit logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated delete audit logs" ON public.audit_logs FOR DELETE TO authenticated USING (true);
