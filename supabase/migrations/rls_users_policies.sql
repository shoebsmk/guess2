ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_insert_own
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY users_select_own
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY users_update_own
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, email, username, created_at, updated_at)
  VALUES (NEW.id, NEW.email, split_part(NEW.email,'@',1), now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
