/*
  # Import Profit-NADA Transactions
  
  1. Purpose
    - Import all Profit-NADA transactions with correct dates and amounts
    - Total: 36 transactions
  
  2. Data Details
    - All transactions are income type
    - All amounts in AED
    - Dates preserved exactly as provided
*/

-- First ensure we have the Profit-NADA category
INSERT INTO categories (id, name, user_id)
VALUES 
  (gen_random_uuid(), 'Profit-NADA', NULL)
ON CONFLICT (name) DO NOTHING;

-- Import Profit-NADA transactions
INSERT INTO transactions (
  id,
  user_id,
  amount,
  type,
  category,
  description,
  date
) VALUES
  (gen_random_uuid(), NULL, 1354.35, 'income', 'Profit-NADA', 'PROFIT FOR NISSAN ROGUE #9329', '2024-02-03'),
  (gen_random_uuid(), NULL, 638.25, 'income', 'Profit-NADA', 'PROFIT ONE CAR EQUONIX #3884', '2024-06-25'),
  (gen_random_uuid(), NULL, 1880.55, 'income', 'Profit-NADA', 'PROFIT FOR MUSTANG #1482', '2024-02-10'),
  (gen_random_uuid(), NULL, 770.25, 'income', 'Profit-NADA', 'PROFIT FOR Jeep Renegade #1806', '2024-02-19'),
  (gen_random_uuid(), NULL, 711.00, 'income', 'Profit-NADA', 'PROFIT ONE DUSTER 2021', '2024-05-21'),
  (gen_random_uuid(), NULL, 924.00, 'income', 'Profit-NADA', 'PROFIT FOR OPTIMA 2017 #5XXGT4L35HG176927', '2024-05-14'),
  (gen_random_uuid(), NULL, 1332.00, 'income', 'Profit-NADA', 'PROFIT FOR PORSCHE #3079', '2024-04-28'),
  (gen_random_uuid(), NULL, 2126.25, 'income', 'Profit-NADA', 'PROFIT FOR KIA OPTIMA 2019 #8221', '2024-04-02'),
  (gen_random_uuid(), NULL, 2013.75, 'income', 'Profit-NADA', 'PROFIT FOR ONE CAR ROGUE 2017 #5300', '2024-06-27'),
  (gen_random_uuid(), NULL, 870.75, 'income', 'Profit-NADA', 'PROFIT ONE CAR AUDI #2012', '2024-07-06'),
  (gen_random_uuid(), NULL, 999.00, 'income', 'Profit-NADA', 'PROFIT FOR CHARGER #0313', '2024-05-27'),
  (gen_random_uuid(), NULL, 441.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR CAPTIVA 2021 #LZ8ADAGA9MB004908', '2024-09-30'),
  (gen_random_uuid(), NULL, 1063.50, 'income', 'Profit-NADA', 'PROFIT FOR Corolla 2018 #5YFBURHE3JE751893', '2024-06-04'),
  (gen_random_uuid(), NULL, 2775.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR CHANGAN CS85 #LS4ASE2AXKP144918', '2024-06-11'),
  (gen_random_uuid(), NULL, 1177.50, 'income', 'Profit-NADA', 'PROFIT ONE CAR MINI COOPER 2020 #WMWXU9C08L2M24194', '2024-09-22'),
  (gen_random_uuid(), NULL, 751.50, 'income', 'Profit-NADA', 'PROFIT ONE CAR ROGUE 2014 17000+1000 #5N1AT2MV6EC806987', '2024-07-22'),
  (gen_random_uuid(), NULL, 2136.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR MG 2020 #LS5A3AGE4LG303403 15000+1000', '2024-07-06'),
  (gen_random_uuid(), NULL, 1083.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR HYUNDAI SONATA 2019 #', '2024-08-19'),
  (gen_random_uuid(), NULL, 1191.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR KIA 2023', '2024-08-23'),
  (gen_random_uuid(), NULL, 5555.25, 'income', 'Profit-NADA', 'PROFIT ONE CAR Tesla 32000+1000 مسروق', '2024-08-24'),
  (gen_random_uuid(), NULL, 1318.50, 'income', 'Profit-NADA', 'PROFIT ONE CAR CHERRY T600 2019 #LVVDB21B4KD016078', '2024-08-31'),
  (gen_random_uuid(), NULL, 919.50, 'income', 'Profit-NADA', 'PROFIT ONE CAR GEELY 2016 #LVVDB21B4KD016078', '2024-09-07'),
  (gen_random_uuid(), NULL, 1301.25, 'income', 'Profit-NADA', 'PROFIT ONE CAR CHRYSLER 2008 #10766', '2024-09-22'),
  (gen_random_uuid(), NULL, 1014.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR CHEVROLET TRAVERS 2015 #7593', '2024-10-29'),
  (gen_random_uuid(), NULL, 408.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR SENTRA 2018', '2024-10-27'),
  (gen_random_uuid(), NULL, 1140.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR GAC 2020', '2024-11-23'),
  (gen_random_uuid(), NULL, 1167.00, 'income', 'Profit-NADA', 'PROFIT COROLLA 2020', '2024-09-24'),
  (gen_random_uuid(), NULL, 893.25, 'income', 'Profit-NADA', 'PROFIT NISSAN MURANO 2019', '2024-11-01'),
  (gen_random_uuid(), NULL, 1320.75, 'income', 'Profit-NADA', 'PROFIT AUDI 2018', '2024-10-16'),
  (gen_random_uuid(), NULL, 2707.50, 'income', 'Profit-NADA', 'PROFIT Tahoe 40000+1000', '2024-10-08'),
  (gen_random_uuid(), NULL, 1861.50, 'income', 'Profit-NADA', 'PROFIT ONE CAR CAMARO 2019 24020+1000', '2024-11-28'),
  (gen_random_uuid(), NULL, 1000.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR CHRYSLER 2018 17000 aed', '2024-12-21'),
  (gen_random_uuid(), NULL, 414.00, 'income', 'Profit-NADA', 'PROFIT LINCOLON MKZ 2015 8500+700', '2024-12-11'),
  (gen_random_uuid(), NULL, 405.00, 'income', 'Profit-NADA', 'PROFIT MERCEDES 2007', '2024-11-30'),
  (gen_random_uuid(), NULL, 331.50, 'income', 'Profit-NADA', 'PURCHASE Veloster 11400+370 تصليح وصبغ', '2025-01-17'),
  (gen_random_uuid(), NULL, 1762.50, 'income', 'Profit-NADA', 'PROFIT MG 17 8000+500', '2025-01-15');
