-- Create enum type if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'history_type') THEN
    CREATE TYPE public.history_type AS ENUM ('add', 'modify', 'success', 'delete');
  END IF;
END
$$;

-- Create table if it does not exist
CREATE TABLE IF NOT EXISTS public.history (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null default auth.uid (),
  name text null,
  history_type public.history_type not null default 'add'::history_type,
  created_at timestamp with time zone not null default now(),
  constraint history_pkey primary key (id)
) TABLESPACE pg_default;

ALTER TABLE public.history
ADD COLUMN IF NOT EXISTS name text;

-- Enable Row Level Security (RLS) on history
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Select own history" ON public.history;
DROP POLICY IF EXISTS "Insert own history" ON public.history;

-- Create SELECT policy: Users can only see their own history records
CREATE POLICY "Select own history"
  ON public.history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create INSERT policy: Users can insert their own history records
CREATE POLICY "Insert own history"
  ON public.history
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Note: No UPDATE or DELETE policies are created, which implicitly prevents
-- authenticated and anonymous users from modifying or deleting history records.

-- Trigger function to automatically log changes from products to history
CREATE OR REPLACE FUNCTION public.sync_product_to_history()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.history (user_id, name, history_type)
    VALUES (NEW.user_id, NEW.name, 'add');
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists on products table
DROP TRIGGER IF EXISTS trigger_sync_product_to_history ON public.products;

-- Create AFTER trigger to sync insert, update, delete operations on products
CREATE TRIGGER trigger_sync_product_to_history
AFTER INSERT OR UPDATE OR DELETE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.sync_product_to_history();
