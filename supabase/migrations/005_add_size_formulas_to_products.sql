-- ====================================================================
-- JRC INDUSTRIAL SALES ERP (JRCJID OPERATING SYSTEM)
-- MIGRATION 005: ADD SIZE_FORMULAS AND PRODUCT METADATA TO PRODUCTS TABLE
-- ====================================================================

-- 1. ADD STRUCTURED MULTI-SIZE FORMULAS AND METADATA COLUMNS TO PRODUCTS
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS size_formulas JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS base_name TEXT;

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS product_type TEXT;

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS variant_scent TEXT DEFAULT 'Standard';

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS supplier_name TEXT;

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS supplier_price NUMERIC(15,2) DEFAULT 0.00;

-- 2. CREATE INDEX ON PRODUCTS SKU & CATEGORY FOR FAST LOOKUPS
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products (sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);

-- 3. ENSURE RLS PERMISSIONS REMAIN ACTIVE FOR PRODUCTS TABLE
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read products" ON public.products;
CREATE POLICY "Allow authenticated read products" ON public.products 
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert products" ON public.products;
CREATE POLICY "Allow authenticated insert products" ON public.products 
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update products" ON public.products;
CREATE POLICY "Allow authenticated update products" ON public.products 
FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete products" ON public.products;
CREATE POLICY "Allow authenticated delete products" ON public.products 
FOR DELETE TO authenticated USING (true);
