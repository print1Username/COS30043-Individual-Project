DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'products_type') THEN
    CREATE TYPE public.products_type AS ENUM (
      'food_and_beverage',
      'tools_and_equipment',
      'furniture_and_home_goods',
      'clothing_and_wearables',
      'raw_materials',
      'components_and_parts',
      'structures',
      'entertainment_and_hobby',
      'medical_and_health',
      'personal_care_and_cosmetics',
      'containers_and_storage'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL DEFAULT 'Name'::text,
  descriptions text NULL,
  value smallint NOT NULL DEFAULT 1,
  price numeric(12, 2) NOT NULL DEFAULT 1,
  created_at timestamp WITH TIME ZONE NOT NULL DEFAULT now(),
  update_at timestamp WITH TIME ZONE NOT NULL DEFAULT now(),
  type public.products_type NULL,
  product_image text NULL,
  CONSTRAINT products_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

ALTER TABLE public.products
  ALTER COLUMN price TYPE numeric(12, 2) USING ROUND(price::numeric, 2),
  ALTER COLUMN price SET DEFAULT 1;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Insert own products" ON public.products;
DROP POLICY IF EXISTS "Select own products" ON public.products;
DROP POLICY IF EXISTS "Select all products" ON public.products;
DROP POLICY IF EXISTS "Update own products" ON public.products;
DROP POLICY IF EXISTS "Delete own products" ON public.products;

CREATE POLICY "Insert own products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Select all products"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Update own products"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Delete own products"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

UPDATE storage.buckets
SET public = true
WHERE id = 'products';

DROP POLICY IF EXISTS "Insert own product images" ON storage.objects;
DROP POLICY IF EXISTS "Select own product images" ON storage.objects;
DROP POLICY IF EXISTS "Update own product images" ON storage.objects;
DROP POLICY IF EXISTS "Delete own product images" ON storage.objects;

CREATE POLICY "Insert own product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Select own product images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'products'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Update own product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'products'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'products'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Delete own product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'products'
  AND (storage.foldername(name))[1] = auth.uid()::text
);