/*
  # Create categories table with transaction tracking

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on categories table
    - Add policies for:
      - Users can read all categories
      - Users can manage their own categories
      - Admins can manage all categories

  3. Views
    - Create view for category usage statistics
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Categories are readable by all users"
  ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own categories"
  ON categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON categories
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can delete their own categories"
  ON categories
  FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create view for category usage count
CREATE OR REPLACE VIEW category_usage AS
SELECT 
  c.id,
  c.name,
  COUNT(t.id) as transaction_count
FROM categories c
LEFT JOIN transactions t ON t.category = c.name
GROUP BY c.id, c.name;
