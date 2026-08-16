-- ====================================================================
-- JRC INDUSTRIAL SALES ERP (JRCJID OPERATING SYSTEM)
-- MIGRATION 004: COMPLETE RLS POLICIES & DEPARTMENT ROLE STANDARDIZATION
-- ====================================================================

-- 1. STANDARDIZE ROLE NAMES TO CLEAN DEPARTMENTS
UPDATE public.roles SET name = 'Super Admin' WHERE code = 'super_admin';
UPDATE public.roles SET name = 'Production' WHERE code = 'production_manager';
UPDATE public.roles SET name = 'Production' WHERE code = 'production_lead';
UPDATE public.roles SET name = 'Sales' WHERE code = 'sales_rep';
UPDATE public.roles SET name = 'Finance' WHERE code = 'finance_manager';
UPDATE public.roles SET name = 'Logistics' WHERE code = 'purchasing_officer';
UPDATE public.roles SET name = 'Logistics' WHERE code = 'logistics_driver';
UPDATE public.roles SET name = 'Pest Control' WHERE code = 'pest_control_tech';

-- 2. SALES ORDER ITEMS POLICIES
ALTER TABLE public.sales_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read sales_order_items" ON public.sales_order_items;
CREATE POLICY "Allow authenticated read sales_order_items" ON public.sales_order_items FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert sales_order_items" ON public.sales_order_items;
CREATE POLICY "Allow authenticated insert sales_order_items" ON public.sales_order_items FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update sales_order_items" ON public.sales_order_items;
CREATE POLICY "Allow authenticated update sales_order_items" ON public.sales_order_items FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete sales_order_items" ON public.sales_order_items;
CREATE POLICY "Allow authenticated delete sales_order_items" ON public.sales_order_items FOR DELETE TO authenticated USING (true);

-- 3. PURCHASE ORDERS POLICIES
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read PO" ON public.purchase_orders;
CREATE POLICY "Allow authenticated read PO" ON public.purchase_orders FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert PO" ON public.purchase_orders;
CREATE POLICY "Allow authenticated insert PO" ON public.purchase_orders FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update PO" ON public.purchase_orders;
CREATE POLICY "Allow authenticated update PO" ON public.purchase_orders FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete PO" ON public.purchase_orders;
CREATE POLICY "Allow authenticated delete PO" ON public.purchase_orders FOR DELETE TO authenticated USING (true);

-- 4. PURCHASE ORDER ITEMS POLICIES
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read PO items" ON public.purchase_order_items;
CREATE POLICY "Allow authenticated read PO items" ON public.purchase_order_items FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert PO items" ON public.purchase_order_items;
CREATE POLICY "Allow authenticated insert PO items" ON public.purchase_order_items FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update PO items" ON public.purchase_order_items;
CREATE POLICY "Allow authenticated update PO items" ON public.purchase_order_items FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete PO items" ON public.purchase_order_items;
CREATE POLICY "Allow authenticated delete PO items" ON public.purchase_order_items FOR DELETE TO authenticated USING (true);

-- 5. CUSTOMERS POLICIES
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read customers" ON public.customers;
CREATE POLICY "Allow authenticated read customers" ON public.customers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert customers" ON public.customers;
CREATE POLICY "Allow authenticated insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update customers" ON public.customers;
CREATE POLICY "Allow authenticated update customers" ON public.customers FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete customers" ON public.customers;
CREATE POLICY "Allow authenticated delete customers" ON public.customers FOR DELETE TO authenticated USING (true);

-- 6. SUPPLIERS POLICIES
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read suppliers" ON public.suppliers;
CREATE POLICY "Allow authenticated read suppliers" ON public.suppliers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert suppliers" ON public.suppliers;
CREATE POLICY "Allow authenticated insert suppliers" ON public.suppliers FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update suppliers" ON public.suppliers;
CREATE POLICY "Allow authenticated update suppliers" ON public.suppliers FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete suppliers" ON public.suppliers;
CREATE POLICY "Allow authenticated delete suppliers" ON public.suppliers FOR DELETE TO authenticated USING (true);

-- 7. RECIPES & RECIPE INGREDIENTS POLICIES
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read recipes" ON public.recipes;
CREATE POLICY "Allow authenticated read recipes" ON public.recipes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert recipes" ON public.recipes;
CREATE POLICY "Allow authenticated insert recipes" ON public.recipes FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update recipes" ON public.recipes;
CREATE POLICY "Allow authenticated update recipes" ON public.recipes FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete recipes" ON public.recipes;
CREATE POLICY "Allow authenticated delete recipes" ON public.recipes FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated read recipe_ingredients" ON public.recipe_ingredients;
CREATE POLICY "Allow authenticated read recipe_ingredients" ON public.recipe_ingredients FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert recipe_ingredients" ON public.recipe_ingredients;
CREATE POLICY "Allow authenticated insert recipe_ingredients" ON public.recipe_ingredients FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update recipe_ingredients" ON public.recipe_ingredients;
CREATE POLICY "Allow authenticated update recipe_ingredients" ON public.recipe_ingredients FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete recipe_ingredients" ON public.recipe_ingredients;
CREATE POLICY "Allow authenticated delete recipe_ingredients" ON public.recipe_ingredients FOR DELETE TO authenticated USING (true);
