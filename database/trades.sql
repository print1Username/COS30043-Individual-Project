-- Enable enum type for products if not exists
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

-- CREATE TABLE for trades to record successful transactions between two users
CREATE TABLE IF NOT EXISTS public.trades (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  products_user_id uuid NOT NULL DEFAULT auth.uid (),
  buyer_user_id uuid NOT NULL DEFAULT auth.uid (),
  products_id uuid NOT NULL,
  value smallint NOT NULL DEFAULT '0'::smallint,
  price numeric NOT NULL DEFAULT 0,
  created_at timestamp WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT trades_pkey PRIMARY KEY (id),
  CONSTRAINT trades_products_id_fkey FOREIGN KEY (products_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE CASCADE
) TABLESPACE pg_default;

-- Enable Row Level Security (RLS) on trades
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- DROP existing policies if any
DROP POLICY IF EXISTS "Select own trades as seller" ON public.trades;
DROP POLICY IF EXISTS "Select own trades as buyer" ON public.trades;
DROP POLICY IF EXISTS "Insert own trades" ON public.trades;

-- CREATE SELECT policy: Users can see trades where they are the seller or buyer
CREATE POLICY "Select own trades as seller"
  ON public.trades
  FOR SELECT
  TO authenticated
  USING (products_user_id = auth.uid() OR buyer_user_id = auth.uid());

-- CREATE INSERT policy: System or authenticated users can insert trades
CREATE POLICY "Insert own trades"
  ON public.trades
  FOR INSERT
  TO authenticated
  WITH CHECK (products_user_id = auth.uid() OR buyer_user_id = auth.uid());