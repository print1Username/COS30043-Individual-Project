create table IF NOT EXISTS public.profiles (
  id uuid not null default auth.uid(),
  username text not null,
  display_name text null,
  avatar_url text null,
  bio text null,
  created_at timestamp with time zone not null default now(),
  update_at timestamp with time zone not null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_username_key unique (username),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]+$')
) TABLESPACE pg_default;

-- Add the same username format guard to an existing profiles table.
-- NOT VALID keeps existing rows from blocking the migration, while still
-- enforcing the rule for new inserts and updates.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_username_format'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_username_format CHECK (username ~ '^[a-z0-9_]+$') NOT VALID;
  END IF;
END $$;

-- =====================================================
-- Row Level Security (RLS) policies for `public.profiles`
-- =====================================================
-- Enable Row Level Security on the table so policies take effect.
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Optional: allow public SELECT of profiles.
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'profiles_select_public'
  ) THEN
    CREATE POLICY profiles_select_public ON public.profiles
      FOR SELECT
      USING (true);
  END IF;

  -- Only allow an authenticated user to SELECT their own profile.
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'profiles_select_owner'
  ) THEN
    CREATE POLICY profiles_select_owner ON public.profiles
      FOR SELECT
      USING (auth.uid() = id);
  END IF;

  -- Only allow an authenticated user to INSERT their own profile.
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'profiles_insert_owner'
  ) THEN
    CREATE POLICY profiles_insert_owner ON public.profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Only allow an authenticated user to UPDATE their own profile.
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'profiles_update_owner'
  ) THEN
    CREATE POLICY profiles_update_owner ON public.profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Only allow an authenticated user to DELETE their own profile.
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'profiles_delete_owner'
  ) THEN
    CREATE POLICY profiles_delete_owner ON public.profiles
      FOR DELETE
      USING (auth.uid() = id);
  END IF;
END $$;

-- Notes:
-- - These policies assume the `id` column stores the user's UUID
--   equal to `auth.uid()`.
-- - If you use server-side (service role) keys, RLS is bypassed
--   for those operations; these policies mainly protect client
--   (browser/mobile) calls using the user's session.

-- =====================================================
-- Row Level Security (RLS) for avatar storage bucket
-- =====================================================
-- Enable RLS on the avatar bucket to control access to stored files.
-- Users can only upload/update/delete their own avatar files.

DO $$
BEGIN
  -- Allow authenticated users to upload files to their own directory (userId/).
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'avatar_upload_own'
  ) THEN
    CREATE POLICY avatar_upload_own ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'avatar' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  -- Allow authenticated users to update their own files.
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'avatar_update_own'
  ) THEN
    CREATE POLICY avatar_update_own ON storage.objects
      FOR UPDATE
      USING (
        bucket_id = 'avatar' AND
        (storage.foldername(name))[1] = auth.uid()::text
      )
      WITH CHECK (
        bucket_id = 'avatar' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  -- Allow authenticated users to delete their own files.
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'avatar_delete_own'
  ) THEN
    CREATE POLICY avatar_delete_own ON storage.objects
      FOR DELETE
      USING (
        bucket_id = 'avatar' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  -- Allow anyone to read avatar files.
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'avatar_read_public'
  ) THEN
    CREATE POLICY avatar_read_public ON storage.objects
      FOR SELECT
      USING (bucket_id = 'avatar');
  END IF;
END $$;
