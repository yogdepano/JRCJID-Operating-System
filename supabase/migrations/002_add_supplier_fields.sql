-- ====================================================================
-- JRC INDUSTRIAL SALES ERP (JRCJID OPERATING SYSTEM)
-- MIGRATION 002: ADD SUPPLIER NAME AND SUPPLIER PRICE TO PRODUCTS
-- ====================================================================

-- Add supplier_name and supplier_price to public.products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS supplier_name TEXT DEFAULT 'Chemical Vendor',
ADD COLUMN IF NOT EXISTS supplier_price NUMERIC(15,2) DEFAULT 0.00;

-- Comment for database documentation
COMMENT ON COLUMN public.products.supplier_name IS 'Primary chemical vendor / distributor name for raw materials & supplies';
COMMENT ON COLUMN public.products.supplier_price IS 'Current purchase price from supplier per UOM';
