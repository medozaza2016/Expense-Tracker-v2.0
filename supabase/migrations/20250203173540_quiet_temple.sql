/*
  # Fix financial settings table structure

  1. Changes
    - Drop and recreate financial_settings table with all required columns
    - Add proper constraints and defaults
    - Recreate RLS policies

  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Drop existing table and recreate with all columns
DROP TABLE IF EXISTS financial_settings;

CREATE TABLE financial_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  cash_on_hand numeric(10,2) DEFAULT 0,
  showroom_balance numeric(10,2) DEFAULT 0,
  personal_loan numeric(10,2) DEFAULT 0,
  additional numeric(10,2) DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Create unique index to ensure one settings per user
CREATE UNIQUE INDEX idx_financial_settings_user_id ON financial_settings(user_id);

-- Enable RLS
ALTER TABLE financial_settings ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Users can read own financial settings"
  ON financial_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial settings"
  ON financial_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial settings"
  ON financial_settings
  FOR UPDATE
  USING (auth.uid() = user_id);
