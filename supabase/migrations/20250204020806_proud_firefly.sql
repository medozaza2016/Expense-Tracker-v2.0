/*
  # Import Complete Historical Transaction Data
  
  1. Categories
    - Ensures all required categories exist
    - Categories: Profit-AHMED, Profit-NADA, Contribution, Capital, Asset
  
  2. Historical Transactions
    - Imports all historical transactions with proper dates
    - Uses sold date for profit transactions
    - Preserves exact amounts and descriptions
*/

-- First ensure we have all required categories
INSERT INTO categories (id, name, user_id)
VALUES 
  (gen_random_uuid(), 'Profit-AHMED', NULL),
  (gen_random_uuid(), 'Profit-NADA', NULL),
  (gen_random_uuid(), 'Contribution', NULL),
  (gen_random_uuid(), 'Capital', NULL),
  (gen_random_uuid(), 'Asset', NULL)
ON CONFLICT (name) DO NOTHING;

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
  -- PROFIT-AHMED transactions (using sold date)
  (gen_random_uuid(), NULL, 3315.50, 'income', 'Profit-AHMED', 'PROFIT FOR PORSCHE #4355', '2023-05-02'),
  (gen_random_uuid(), NULL, 1565.00, 'income', 'Profit-AHMED', 'PROFIT FOR MITSUBISHI #0542', '2023-08-14'),
  (gen_random_uuid(), NULL, 3417.75, 'income', 'Profit-AHMED', 'PROFIT FOR SONATA #3242', '2023-09-09'),
  (gen_random_uuid(), NULL, 2240.00, 'income', 'Profit-AHMED', 'PROFIT FOR MG GS #8009', '2023-09-09'),
  (gen_random_uuid(), NULL, 3010.00, 'income', 'Profit-AHMED', 'PROFIT FOR GEELY #7312', '2023-09-09'),
  (gen_random_uuid(), NULL, 1445.50, 'income', 'Profit-AHMED', 'PROFIT FOR CHRYSLER #1559', '2023-09-09'),
  (gen_random_uuid(), NULL, 2100.00, 'income', 'Profit-AHMED', 'PROFIT FOR CARAVAN #2607', '2023-09-09'),
  (gen_random_uuid(), NULL, 703.50, 'income', 'Profit-AHMED', 'PROFIT FOR LANCER #2069', '2023-09-13'),
  (gen_random_uuid(), NULL, 3167.50, 'income', 'Profit-AHMED', 'PROFIT FOR PORSCHE #0362', '2023-09-23'),
  (gen_random_uuid(), NULL, 3990.00, 'income', 'Profit-AHMED', 'PROFIT FOR JEEP CHEROKEE #6618', '2023-09-24'),
  (gen_random_uuid(), NULL, 5122.25, 'income', 'Profit-AHMED', 'PROFIT FOR NISSAN KICKS #0125', '2023-12-14'),
  (gen_random_uuid(), NULL, 3160.15, 'income', 'Profit-AHMED', 'PROFIT FOR NISSAN ROGUE #9329', '2024-02-03'),

  -- PROFIT-NADA transactions (using sold date)
  (gen_random_uuid(), NULL, 1354.35, 'income', 'Profit-NADA', 'PROFIT FOR NISSAN ROGUE #9329', '2024-02-03'),
  (gen_random_uuid(), NULL, 638.25, 'income', 'Profit-NADA', 'PROFIT ONE CAR EQUONIX #3884', '2024-06-25'),
  (gen_random_uuid(), NULL, 1880.55, 'income', 'Profit-NADA', 'PROFIT FOR MUSTANG #1482', '2024-02-10'),
  (gen_random_uuid(), NULL, 770.25, 'income', 'Profit-NADA', 'PROFIT FOR Jeep Renegade #1806', '2024-02-19'),
  (gen_random_uuid(), NULL, 711.00, 'income', 'Profit-NADA', 'PROFIT FOR DUSTER 2021', '2024-05-21'),
  (gen_random_uuid(), NULL, 924.00, 'income', 'Profit-NADA', 'PROFIT FOR OPTIMA 2017 #5XXGT4L35HG176927', '2024-05-14'),

  -- Contribution transactions (using transaction date)
  (gen_random_uuid(), NULL, 35660.00, 'income', 'Contribution', 'Wire Transfer [10,000$]', '2023-04-01'),
  (gen_random_uuid(), NULL, 53528.50, 'income', 'Contribution', 'Wire Transfer [15,000$]', '2023-09-01'),
  (gen_random_uuid(), NULL, 17800.00, 'income', 'Contribution', 'Wire Transfer [5,000$]', '2023-11-01'),
  (gen_random_uuid(), NULL, 27450.00, 'income', 'Contribution', 'CASH Contribution [7,500$]', '2023-12-04'),
  (gen_random_uuid(), NULL, 1420.00, 'income', 'Contribution', 'Ahmed visa card payment', '2024-01-23'),
  (gen_random_uuid(), NULL, 35668.00, 'income', 'Contribution', 'Wire Transfer', '2024-01-25'),
  (gen_random_uuid(), NULL, 900.00, 'income', 'Contribution', 'Ahmed visa card payment [2465]', '2024-01-25'),
  (gen_random_uuid(), NULL, 366.00, 'income', 'Contribution', 'Ahmed visa card payment [100$]', '2024-01-29'),

  -- Capital transactions (using transaction date)
  (gen_random_uuid(), NULL, 19250.00, 'income', 'Capital', 'NADA', '2024-01-06'),

  -- Asset transactions (using transaction date)
  (gen_random_uuid(), NULL, 27375.00, 'expense', 'Asset', 'PURCHASE ONE CAR MINI COOPER 2019 #WMMXU7JA0CKT9D0694', '2024-07-16'),
  (gen_random_uuid(), NULL, 38220.00, 'expense', 'Asset', 'PURCHASE CHANGAN CS85 #JS4ASE2AXKP144918', '2024-09-30'),
  (gen_random_uuid(), NULL, 9000.00, 'expense', 'Asset', 'PURCHASE ONE CAR FORD EDGE 8500+500', '2024-10-29'),
  (gen_random_uuid(), NULL, 21100.00, 'expense', 'Asset', 'PURCHASE JAC MC 2023 20530 4120 4450 Micromover', '2024-11-17'),
  (gen_random_uuid(), NULL, 2985.50, 'expense', 'Asset', 'SOLD DODGE NEON 2017 9150 +500 مسروق', '2025-01-31'),
  (gen_random_uuid(), NULL, 46235.00, 'expense', 'Asset', 'PURCHASE TUCSON 2023 GRAY PASSING/PASSING', '2025-01-19');
