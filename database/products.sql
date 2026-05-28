create table public.products (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null default auth.uid (),
  name text not null default 'Name'::text,
  descriptions text null,
  value smallint not null default '1'::smallint,
  price numeric not null default '1'::numeric,
  created_at timestamp with time zone not null default now(),
  update_at timestamp with time zone not null default now(),
  type public.products_type null,
  product_image text null,
  constraint products_pkey primary key (id)
) TABLESPACE pg_default;

-- Create enum type for item categories

CREATE TYPE IF NOT EXISTS products_type AS ENUM (
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

-- Enable row-level security and rebuild product policies.
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Insert own products" ON public.products;
DROP POLICY IF EXISTS "Select own products" ON public.products;
DROP POLICY IF EXISTS "Update own products" ON public.products;
DROP POLICY IF EXISTS "Delete own products" ON public.products;

CREATE POLICY "Insert own products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Select own products"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

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

-- Storage bucket and policies for product images.
-- Uploaded paths are stored as: {product_id}/{timestamp}_{index}_{filename}
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
    AND EXISTS (
      SELECT 1
      FROM public.products
      WHERE products.id::text IN (
          (storage.foldername(name))[1],
          (storage.foldername(name))[2]
        )
        AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Select own product images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'products'
    AND EXISTS (
      SELECT 1
      FROM public.products
      WHERE products.id::text IN (
          (storage.foldername(name))[1],
          (storage.foldername(name))[2]
        )
        AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Update own product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'products'
    AND EXISTS (
      SELECT 1
      FROM public.products
      WHERE products.id::text IN (
          (storage.foldername(name))[1],
          (storage.foldername(name))[2]
        )
        AND products.user_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'products'
    AND EXISTS (
      SELECT 1
      FROM public.products
      WHERE products.id::text IN (
          (storage.foldername(name))[1],
          (storage.foldername(name))[2]
        )
        AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Delete own product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'products'
    AND EXISTS (
      SELECT 1
      FROM public.products
      WHERE products.id::text IN (
          (storage.foldername(name))[1],
          (storage.foldername(name))[2]
        )
        AND products.user_id = auth.uid()
    )
  );
