-- CREATE TABLE for successful trades between product owners and buyers.
CREATE TABLE IF NOT EXISTS public.trades (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  products_user_id uuid NOT NULL,
  buyer uuid NOT NULL DEFAULT auth.uid(),
  products_id uuid NOT NULL,
  value smallint NOT NULL DEFAULT 0,
  price numeric(12, 2) NOT NULL DEFAULT 0,
  created_at timestamp WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT trades_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'trades'
      AND column_name = 'buyer_user_id'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'trades'
      AND column_name = 'buyer'
  ) THEN
    ALTER TABLE public.trades RENAME COLUMN buyer_user_id TO buyer;
  END IF;
END
$$;

ALTER TABLE public.trades
  ALTER COLUMN price TYPE numeric(12, 2) USING ROUND(price::numeric, 2),
  ALTER COLUMN price SET DEFAULT 0,
  ALTER COLUMN products_user_id DROP DEFAULT,
  ALTER COLUMN buyer SET DEFAULT auth.uid();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'trades_products_id_fkey'
      AND conrelid = 'public.trades'::regclass
  ) THEN
    ALTER TABLE public.trades
      ADD CONSTRAINT trades_products_id_fkey
      FOREIGN KEY (products_id)
      REFERENCES public.products (id)
      ON UPDATE CASCADE
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'trades_products_user_id_fkey'
      AND conrelid = 'public.trades'::regclass
  ) THEN
    ALTER TABLE public.trades
      ADD CONSTRAINT trades_products_user_id_fkey
      FOREIGN KEY (products_user_id)
      REFERENCES auth.users (id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'trades_buyer_fkey'
      AND conrelid = 'public.trades'::regclass
  ) THEN
    ALTER TABLE public.trades
      ADD CONSTRAINT trades_buyer_fkey
      FOREIGN KEY (buyer)
      REFERENCES auth.users (id)
      ON DELETE CASCADE;
  END IF;

  IF to_regclass('public.history') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'history_trade_id_fkey'
      AND conrelid = 'public.history'::regclass
  ) THEN
    ALTER TABLE public.history
      ADD CONSTRAINT history_trade_id_fkey
      FOREIGN KEY (trade_id)
      REFERENCES public.trades (id)
      ON DELETE SET NULL;
  END IF;
END
$$;

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Select own trades" ON public.trades;
DROP POLICY IF EXISTS "Select own trades as seller" ON public.trades;
DROP POLICY IF EXISTS "Select own trades as buyer" ON public.trades;
DROP POLICY IF EXISTS "Insert own trades" ON public.trades;

CREATE POLICY "Select own trades"
  ON public.trades
  FOR SELECT
  TO authenticated
  USING (products_user_id = auth.uid() OR buyer = auth.uid());

CREATE POLICY "Insert own trades"
  ON public.trades
  FOR INSERT
  TO authenticated
  WITH CHECK (
    buyer = auth.uid()
    AND products_user_id <> auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.products
      WHERE products.id = products_id
        AND products.user_id = products_user_id
    )
  );

CREATE OR REPLACE FUNCTION public.create_trade(
  p_products_id uuid,
  p_products_user_id uuid,
  p_value smallint,
  p_price numeric
)
RETURNS public.trades
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_buyer uuid := auth.uid();
  v_product public.products%ROWTYPE;
  v_trade public.trades%ROWTYPE;
  v_total_price numeric(12, 2);
BEGIN
  IF v_buyer IS NULL THEN
    RAISE EXCEPTION 'No authenticated user session found.';
  END IF;

  IF p_value IS NULL OR p_value < 1 THEN
    RAISE EXCEPTION 'Trade quantity must be at least 1.';
  END IF;

  IF p_price IS NULL OR p_price <= 0 THEN
    RAISE EXCEPTION 'Trade price must be greater than 0.';
  END IF;

  SELECT *
  INTO v_product
  FROM public.products
  WHERE id = p_products_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found.';
  END IF;

  IF v_product.user_id <> p_products_user_id THEN
    RAISE EXCEPTION 'Seller does not match the product owner.';
  END IF;

  IF v_product.user_id = v_buyer THEN
    RAISE EXCEPTION 'You cannot trade with your own product.';
  END IF;

  IF v_product.value < p_value THEN
    RAISE EXCEPTION 'Not enough product quantity available.';
  END IF;

  IF ROUND(v_product.price::numeric, 2) <> ROUND(p_price::numeric, 2) THEN
    RAISE EXCEPTION 'Product price has changed. Please refresh and try again.';
  END IF;

  PERFORM set_config('app.skip_product_history', 'true', true);

  UPDATE public.products
  SET
    value = value - p_value,
    update_at = now()
  WHERE id = v_product.id;

  INSERT INTO public.trades (
    products_user_id,
    buyer,
    products_id,
    value,
    price
  )
  VALUES (
    v_product.user_id,
    v_buyer,
    v_product.id,
    p_value,
    ROUND(p_price::numeric, 2)
  )
  RETURNING *
  INTO v_trade;

  v_total_price := ROUND((p_value::numeric * p_price::numeric), 2);

  INSERT INTO public.history (
    user_id,
    name,
    history_type,
    trade_id,
    product_id,
    quantity,
    unit_price,
    total_price
  )
  VALUES
    (
      v_product.user_id,
      v_product.name,
      'success',
      v_trade.id,
      v_product.id,
      p_value,
      ROUND(p_price::numeric, 2),
      v_total_price
    ),
    (
      v_buyer,
      v_product.name,
      'success',
      v_trade.id,
      v_product.id,
      p_value,
      ROUND(p_price::numeric, 2),
      v_total_price
    );

  RETURN v_trade;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_trade(uuid, uuid, smallint, numeric) TO authenticated;
