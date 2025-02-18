/*
  # Add Financial Settings Table
  
  1. New Tables
    - `financial_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `cash_on_hand` (numeric)
      - `showroom_balance` (numeric)
      - `personal_loan` (numeric)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS
    - Add policies for user access
*/

CREATE TABLE IF NOT EXISTS financial_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  cash_on_hand numeric(10,2) DEFAULT 0,
  showroom_balance numeric(10,2) DEFAULT 0,
  personal_loan numeric(10,2) DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_financial_settings_user_id ON financial_settings(user_id);

ALTER TABLE financial_settings ENABLE ROW LEVEL SECURITY;

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
