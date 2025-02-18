/*
  # Vehicle Management Schema

  1. New Tables
    - `vehicles`
      - Basic vehicle information (VIN, make, model, etc.)
      - Status tracking
      - Financial details
    - `vehicle_expenses`
      - Expense tracking for each vehicle
      - Links to vehicles and recipients
    - `profit_distributions`
      - Profit sharing records
      - Percentage-based calculations
      - Distribution tracking

  2. Views
    - `vehicle_financials`
      - Aggregated financial data per vehicle
    - `profit_distribution_summary`
      - Summary of profit distributions

  3. Security
    - Enable RLS on all tables
    - Policies for authenticated access
*/

-- Create vehicles table
CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vin text UNIQUE,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  color text,
  status text NOT NULL CHECK (status IN ('AVAILABLE', 'SOLD', 'IN_MAINTENANCE')),
  purchase_price numeric(15,2) NOT NULL,
  sale_price numeric(15,2),
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  sale_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vehicle_expenses table
CREATE TABLE vehicle_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  type text NOT NULL,
  amount numeric(15,2) NOT NULL CHECK (amount > 0),
  recipient text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create profit_distributions table
CREATE TABLE profit_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) NOT NULL,
  recipient text NOT NULL,
  amount numeric(15,2) NOT NULL,
  percentage numeric(5,2) NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_vin ON vehicles(vin);
CREATE INDEX idx_vehicle_expenses_vehicle_id ON vehicle_expenses(vehicle_id);
CREATE INDEX idx_profit_distributions_vehicle_id ON profit_distributions(vehicle_id);

-- Enable Row Level Security
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_distributions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can manage vehicles"
  ON vehicles
  FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage vehicle expenses"
  ON vehicle_expenses
  FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage profit distributions"
  ON profit_distributions
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Create view for vehicle financials
CREATE OR REPLACE VIEW vehicle_financials AS
SELECT 
  v.id,
  v.vin,
  v.make,
  v.model,
  v.year,
  v.status,
  v.purchase_price,
  v.sale_price,
  COALESCE(SUM(ve.amount), 0) as total_expenses,
  CASE 
    WHEN v.status = 'SOLD' THEN 
      v.sale_price - v.purchase_price - COALESCE(SUM(ve.amount), 0)
    ELSE 
      0
  END as net_profit,
  COALESCE(SUM(pd.amount), 0) as total_distributed
FROM vehicles v
LEFT JOIN vehicle_expenses ve ON ve.vehicle_id = v.id
LEFT JOIN profit_distributions pd ON pd.vehicle_id = v.id
GROUP BY v.id, v.vin, v.make, v.model, v.year, v.status, v.purchase_price, v.sale_price;

-- Create view for profit distribution summary
CREATE OR REPLACE VIEW profit_distribution_summary AS
SELECT 
  pd.vehicle_id,
  pd.recipient,
  COUNT(*) as distribution_count,
  SUM(pd.amount) as total_amount,
  AVG(pd.percentage) as avg_percentage
FROM profit_distributions pd
GROUP BY pd.vehicle_id, pd.recipient;

-- Function to update vehicle timestamps
CREATE OR REPLACE FUNCTION update_vehicle_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating vehicle timestamps
CREATE TRIGGER update_vehicle_timestamp
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_timestamp();
