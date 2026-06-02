DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'history_type') THEN
    CREATE TYPE public.history_type AS ENUM ('add', 'modify', 'success', 'delete');
  END IF;
END
$$;

ALTER TYPE public.history_type ADD VALUE IF NOT EXISTS 'success';

CREATE TABLE IF NOT EXISTS public.history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NULL,
  history_type public.history_type NOT NULL DEFAULT 'add'::history_type,
  created_at timestamp WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT history_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

ALTER TABLE public.history
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS trade_id uuid NULL,
  ADD COLUMN IF NOT EXISTS product_id uuid NULL,
  ADD COLUMN IF NOT EXISTS quantity smallint NULL,
  ADD COLUMN IF NOT EXISTS unit_price numeric(12, 2) NULL,
  ADD COLUMN IF NOT EXISTS total_price numeric(12, 2) NULL;

DO $$
BEGIN
  IF to_regclass('public.trades') IS NOT NULL
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

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'history_product_id_fkey'
      AND conrelid = 'public.history'::regclass
  ) THEN
    ALTER TABLE public.history
      ADD CONSTRAINT history_product_id_fkey
      FOREIGN KEY (product_id)
      REFERENCES public.products (id)
      ON DELETE SET NULL;
  END IF;
END
$$;

ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Select own history" ON public.history;
DROP POLICY IF EXISTS "Insert own history" ON public.history;

CREATE POLICY "Select own history"
  ON public.history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Insert own history"
  ON public.history
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.sync_product_to_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.history (user_id, name, history_type)
    VALUES (NEW.user_id, NEW.name, 'add');
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF current_setting('app.skip_product_history', true) = 'true' THEN
      RETURN NEW;
    END IF;

    INSERT INTO public.history (user_id, name, history_type)
    VALUES (NEW.user_id, NEW.name, 'modify');
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.history (user_id, name, history_type)
    VALUES (OLD.user_id, OLD.name, 'delete');
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_product_to_history ON public.products;

CREATE TRIGGER trigger_sync_product_to_history
AFTER INSERT OR UPDATE OR DELETE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.sync_product_to_history();
