CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, email, username, password_hash, created_at, updated_at)
  VALUES (NEW.id, NEW.email, split_part(NEW.email,'@',1), 'supabase_auth', now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
