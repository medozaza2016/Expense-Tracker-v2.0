/*
  # Import Historical Transaction Data
  
  1. Categories
    - Ensures required categories exist
    - Categories: Sales, Investment, Asset, Profit-NADA, Profit-AHMED
  
  2. Historical Transactions
    - Imports all historical transactions
    - Maps transaction types to appropriate categories
    - Preserves original dates and amounts
*/

-- First ensure we have the required categories
INSERT INTO categories (id, name, user_id)
VALUES 
  (gen_random_uuid(), 'Sales', NULL),
  (gen_random_uuid(), 'Investment', NULL),
  (gen_random_uuid(), 'Asset', NULL),
  (gen_random_uuid(), 'Profit-NADA', NULL),
  (gen_random_uuid(), 'Profit-AHMED', NULL);

-- Import historical transactions
INSERT INTO transactions (
  id,
  user_id,
  amount,
  type,
  category,
  description,
  date
) VALUES
  -- Profit transactions
  (gen_random_uuid(), NULL, 3315.50, 'income', 'Profit-NADA', 'PROFIT FOR PORSCHE #4355', '2023-05-02'),
  (gen_random_uuid(), NULL, 1565.00, 'income', 'Profit-NADA', 'PROFIT FOR MITSUBISHI #0542', '2023-08-14'),
  (gen_random_uuid(), NULL, 3417.75, 'income', 'Profit-NADA', 'PROFIT FOR SONATA #3242', '2023-09-09'),
  (gen_random_uuid(), NULL, 2240.00, 'income', 'Profit-NADA', 'PROFIT FOR MG G8 #1009', '2023-09-09'),
  (gen_random_uuid(), NULL, 3010.00, 'income', 'Profit-NADA', 'PROFIT FOR GEELY #7312', '2023-09-05'),
  (gen_random_uuid(), NULL, 1445.50, 'income', 'Profit-NADA', 'PROFIT FOR CHRYSLER #1559', '2023-09-09'),
  (gen_random_uuid(), NULL, 2100.00, 'income', 'Profit-NADA', 'PROFIT FOR CARAVAN #2607', '2023-09-09'),
  (gen_random_uuid(), NULL, 703.50, 'income', 'Profit-NADA', 'PROFIT FOR LANCER #2069', '2023-09-13'),
  (gen_random_uuid(), NULL, 3167.50, 'income', 'Profit-NADA', 'PROFIT FOR PORSCHE #0362', '2023-09-23'),
  (gen_random_uuid(), NULL, 3590.00, 'income', 'Profit-NADA', 'PROFIT FOR JEEP CHEROKEE #6618', '2023-09-24'),
  (gen_random_uuid(), NULL, 5122.25, 'income', 'Profit-NADA', 'PROFIT FOR NISSAN KICKS #0125', '2023-12-14'),
  (gen_random_uuid(), NULL, 3160.15, 'income', 'Profit-NADA', 'PROFIT FOR ROGUE #0329', '2024-02-03'),
  
  -- Investment/Contribution transactions
  (gen_random_uuid(), NULL, 35660.00, 'income', 'Investment', 'Wire Transfer [10,000$]', '2023-04-01'),
  (gen_random_uuid(), NULL, 53528.50, 'income', 'Investment', 'Wire Transfer [15,000$]', '2023-09-01'),
  (gen_random_uuid(), NULL, 17800.00, 'income', 'Investment', 'Wire Transfer [5,000$]', '2023-11-01'),
  (gen_random_uuid(), NULL, 27450.00, 'income', 'Investment', 'CASH Contribution [7,500$]', '2023-12-04'),
  (gen_random_uuid(), NULL, 1420.00, 'income', 'Investment', 'Ahmed visa card payment', '2024-01-23'),
  (gen_random_uuid(), NULL, 35668.00, 'income', 'Investment', 'Wire Transfer', '2024-01-25'),
  
  -- Asset/Purchase transactions
  (gen_random_uuid(), NULL, 27375.00, 'expense', 'Asset', 'PURCHASE ONE CAR MINI COOPER 2019 #WMMXU7JA0CKT9D0694', '2023-07-16'),
  (gen_random_uuid(), NULL, 38220.00, 'expense', 'Asset', 'PURCHASE CHANGAN CS85 #JS4ASE2AXKP144918', '2023-09-30'),
  (gen_random_uuid(), NULL, 9000.00, 'expense', 'Asset', 'PURCHASE ONE CAR FORD EDGE 8500+500', '2023-10-29'),
  (gen_random_uuid(), NULL, 21100.00, 'expense', 'Asset', 'PURCHASE JAC MC 2023 20530 4120 4450 Micromover', '2023-11-17');
