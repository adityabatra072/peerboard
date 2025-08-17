CREATE TABLE boards (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  data JSONB
);


ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to create boards"
ON boards FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to view boards"
ON boards FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update boards"
ON boards FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);