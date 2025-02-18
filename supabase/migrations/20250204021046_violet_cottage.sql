/*
  # Import Complete Transaction Data
  
  1. Categories
    - Ensures all required categories exist
    - Categories match exact counts from analysis
  
  2. Historical Transactions
    - Total: 111 transactions
    - ASSET: 5 transactions
    - CAPITAL: 1 transaction
    - CONTRIBUTION: 21 transactions
    - PROFIT: 1 transaction
    - PROFIT-AHMED: 47 transactions
    - PROFIT-NADA: 36 transactions
*/

-- First ensure we have all required categories
INSERT INTO categories (id, name, user_id)
VALUES 
  (gen_random_uuid(), 'Profit-AHMED', NULL),
  (gen_random_uuid(), 'Profit-NADA', NULL),
  (gen_random_uuid(), 'Contribution', NULL),
  (gen_random_uuid(), 'Capital', NULL),
  (gen_random_uuid(), 'Asset', NULL),
  (gen_random_uuid(), 'Profit', NULL)
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
  -- PROFIT transaction (1)
  (gen_random_uuid(), NULL, 2985.50, 'income', 'Profit', 'SOLD DODGE NEON 2017 9150 +500 مسروق', '2025-01-31'),

  -- ASSET transactions (5)
  (gen_random_uuid(), NULL, 27375.00, 'expense', 'Asset', 'PURCHASE ONE CAR MINI COOPER 2019 #WMMXU7JA0CKT9D0694', '2024-07-16'),
  (gen_random_uuid(), NULL, 38220.00, 'expense', 'Asset', 'PURCHASE CHANGAN CS85 #JS4ASE2AXKP144918', '2024-09-30'),
  (gen_random_uuid(), NULL, 9000.00, 'expense', 'Asset', 'PURCHASE ONE CAR FORD EDGE 8500+500', '2024-10-29'),
  (gen_random_uuid(), NULL, 21100.00, 'expense', 'Asset', 'PURCHASE JAC MC 2023 20530 4120 4450 Micromover', '2024-11-17'),
  (gen_random_uuid(), NULL, 46235.00, 'expense', 'Asset', 'PURCHASE TUCSON 2023 GRAY PASSING/PASSING', '2025-01-19'),

  -- CAPITAL transaction (1)
  (gen_random_uuid(), NULL, 19250.00, 'income', 'Capital', 'NADA', '2024-01-06'),

  -- CONTRIBUTION transactions (21)
  (gen_random_uuid(), NULL, 35660.00, 'income', 'Contribution', 'Wire Transfer [10,000$]', '2023-04-01'),
  (gen_random_uuid(), NULL, 53528.50, 'income', 'Contribution', 'Wire Transfer [15,000$]', '2023-09-01'),
  (gen_random_uuid(), NULL, 17800.00, 'income', 'Contribution', 'Wire Transfer [5,000$]', '2023-11-01'),
  (gen_random_uuid(), NULL, 27450.00, 'income', 'Contribution', 'CASH Contribution [7,500$]', '2023-12-04'),
  (gen_random_uuid(), NULL, 1420.00, 'income', 'Contribution', 'Ahmed visa card payment', '2024-01-23'),
  (gen_random_uuid(), NULL, 35668.00, 'income', 'Contribution', 'Wire Transfer', '2024-01-25'),
  (gen_random_uuid(), NULL, 900.00, 'income', 'Contribution', 'Ahmed visa card payment [2465]', '2024-01-25'),
  (gen_random_uuid(), NULL, 366.00, 'income', 'Contribution', 'Ahmed visa card payment [100$]', '2024-01-29'),
  (gen_random_uuid(), NULL, 1077.00, 'income', 'Contribution', 'FIRST PAYMENT AHMED FOR WEBSITE [295$]', '2024-02-07'),
  (gen_random_uuid(), NULL, 790.00, 'income', 'Contribution', 'Ahmed visa card payment [215$]', '2024-02-17'),
  (gen_random_uuid(), NULL, 1830.00, 'income', 'Contribution', 'Ahmed visa card payment [500$]', '2024-02-20'),
  (gen_random_uuid(), NULL, 2305.00, 'income', 'Contribution', 'Ahmed visa card payment [630$]', '2024-03-21'),
  (gen_random_uuid(), NULL, 35669.00, 'income', 'Contribution', 'Wire Transfer [10,000$]', '2024-05-09'),
  (gen_random_uuid(), NULL, 3660.00, 'income', 'Contribution', 'AHMED BANK TRANSFER TO NADA ACCOUNT EGY', '2024-06-12'),
  (gen_random_uuid(), NULL, 275.00, 'income', 'Contribution', 'Ahmed visa card payment 75$', '2024-07-28'),
  (gen_random_uuid(), NULL, 955.00, 'income', 'Contribution', 'Ahmed visa card payment 260$', '2024-07-30'),
  (gen_random_uuid(), NULL, 1610.00, 'income', 'Contribution', 'VISA PAYMENT 440$', '2024-09-01'),
  (gen_random_uuid(), NULL, 220.00, 'income', 'Contribution', 'Ahmed visa card payment 60$', '2024-09-08'),
  (gen_random_uuid(), NULL, 7500.00, 'income', 'Contribution', 'Transfer - AHMED [100,000 EGP]', '2024-10-07'),
  (gen_random_uuid(), NULL, 1515.00, 'income', 'Contribution', 'AHMED BANK TRANSFER TO NADA ACCOUNT EGY [20,000]', '2024-10-19'),
  (gen_random_uuid(), NULL, 2050.00, 'income', 'Contribution', 'Ahmed visa card payment 560$', '2024-12-09'),

  -- PROFIT-AHMED transactions (47)
  (gen_random_uuid(), NULL, 3315.50, 'income', 'Profit-AHMED', 'PROFIT FOR PORSCHE #4355', '2023-05-02'),
  (gen_random_uuid(), NULL, 1565.00, 'income', 'Profit-AHMED', 'PROFIT FOR MITSUBISHI #0542', '2023-08-14'),
  (gen_random_uuid(), NULL, 3417.75, 'income', 'Profit-AHMED', 'PROFIT FOR SONATA #3242', '2023-09-09'),
  (gen_random_uuid(), NULL, 2240.00, 'income', 'Profit-AHMED', 'PROFIT FOR MG GS #8009', '2023-09-09'),
  (gen_random_uuid(), NULL, 3010.00, 'income', 'Profit-AHMED', 'PROFIT FOR GEELY #7312', '2023-09-09'),
  (gen_random_uuid(), NULL, 1445.50, 'income', 'Profit-AHMED', 'PROFIT FOR CHRYSLER #1559', '2023-09-09'),
  (gen_random_uuid(), NULL, 2100.00, 'income', 'Profit-AHMED', 'PROFIT FOR CARAVAN #2607', '2023-09-09'),
  (gen_random_uuid(), NULL, 703.50, 'income', 'Profit-AHMED', 'PROFIT FOR LANCER #2069', '2023-09-13'),
  (gen_random_uuid(), NULL, 3167.50, 'income', 'Profit-AHMED', 'PROFIT FOR PORSCHE #0362', '2023-09-23'),
  (gen_random_uuid(), NULL, 3590.00, 'income', 'Profit-AHMED', 'PROFIT FOR JEEP CHEROKEE #6618', '2023-09-24'),
  (gen_random_uuid(), NULL, 5122.25, 'income', 'Profit-AHMED', 'PROFIT FOR NISSAN KICKS #0125', '2023-12-14'),
  (gen_random_uuid(), NULL, 3160.15, 'income', 'Profit-AHMED', 'PROFIT FOR NISSAN ROGUE #9329', '2024-02-03'),
  (gen_random_uuid(), NULL, 1489.25, 'income', 'Profit-AHMED', 'PROFIT ONE CAR EQUONIX #3884', '2024-02-04'),
  (gen_random_uuid(), NULL, 4387.95, 'income', 'Profit-AHMED', 'PROFIT FOR MUSTANG #1482', '2024-02-10'),
  (gen_random_uuid(), NULL, 1797.25, 'income', 'Profit-AHMED', 'PROFIT FOR Jeep Renegade #1806', '2024-02-19'),
  (gen_random_uuid(), NULL, 1659.00, 'income', 'Profit-AHMED', 'PROFIT FOR OPTIMA 2021', '2024-02-21'),
  (gen_random_uuid(), NULL, 3080.00, 'income', 'Profit-AHMED', 'PROFIT FOR OPTIMA 2017 #5XXGT4L35HG176927', '2024-03-14'),
  (gen_random_uuid(), NULL, 2156.00, 'income', 'Profit-AHMED', 'PROFIT FOR PORSCHE #3079', '2024-03-28'),
  (gen_random_uuid(), NULL, 4961.00, 'income', 'Profit-AHMED', 'PROFIT FOR KIA OPTIMA 2019 #9271', '2024-04-02'),
  (gen_random_uuid(), NULL, 4698.75, 'income', 'Profit-AHMED', 'PROFIT ONE CAR ROGUE 2017 #L300', '2024-04-27'),
  (gen_random_uuid(), NULL, 2031.75, 'income', 'Profit-AHMED', 'PROFIT ONE CAR AUDI #2012', '2024-07-06'),
  (gen_random_uuid(), NULL, 2331.00, 'income', 'Profit-AHMED', 'PROFIT ONE CAR #0313', '2024-05-27'),
  (gen_random_uuid(), NULL, 1029.00, 'income', 'Profit-AHMED', 'PROFIT ONE CAR CAPTIVA 2021 #LZ8ADAGA9MB004908', '2024-09-30'),
  (gen_random_uuid(), NULL, 2414.50, 'income', 'Profit-AHMED', 'PROFIT ONE Corolla 2018 #9TBURH3H5JK751893', '2024-06-04'),
  (gen_random_uuid(), NULL, 6475.00, 'income', 'Profit-AHMED', 'PROFIT ONE CAR CHANGAN CS85 #JS4ASE2AXKP144918', '2024-06-11'),
  (gen_random_uuid(), NULL, 2747.00, 'income', 'Profit-AHMED', 'PROFIT ONE MINI COOPER 2020 #WMWXU9C02M2K24194', '2024-05-22'),
  (gen_random_uuid(), NULL, 1753.50, 'income', 'Profit-AHMED', 'PROFIT ONE CAR ROGUE 2014 #JN8AT2MVXEW806987', '2024-07-22'),
  (gen_random_uuid(), NULL, 4984.00, 'income', 'Profit-AHMED', 'PROFIT ONE CAR MG 2020 #LS5A3AGE4LG303403', '2024-07-06'),
  (gen_random_uuid(), NULL, 2527.00, 'income', 'Profit-AHMED', 'PROFIT ONE CAR HYUNDAI SONATA 2019', '2024-08-19'),
  (gen_random_uuid(), NULL, 2779.50, 'income', 'Profit-AHMED', 'PROFIT ONE CAR KIA 2023', '2024-08-23'),
  (gen_random_uuid(), NULL, 12962.00, 'income', 'Profit-AHMED', 'PROFIT ONE CAR Tesla 32000+1000 مسروق', '2024-08-24'),
  (gen_random_uuid(), NULL, 3076.50, 'income', 'Profit-AHMED', 'PROFIT ONE CAR CHERRY T600 2019 #LVVDB21B4KD016078', '2024-08-31'),
  (gen_random_uuid(), NULL, 2145.00, 'income', 'Profit-AHMED', 'PROFIT ONE CAR GEELY 2016 #LVVDB21B4KD016078', '2024-09-07'),
  (gen_random_uuid(), NULL, 3036.25, 'income', 'Profit-AHMED', 'PROFIT ONE CAR CHRYSLER #107GC', '2024-09-22'),
  (gen_random_uuid(), NULL, 2366.00, 'income', 'Profit-AHMED', 'PROFIT ONE CAR CHEVROLET TRAVERS 2015 #7593', '2024-10-29'),
  (gen_random_uuid(), NULL, 952.00, 'income', 'Profit-AHMED', 'PROFIT ONE CAR SENTRA 2018', '2024-10-27'),
  (gen_random_uuid(), NULL, 2660.00, 'income', 'Profit-AHMED', 'PROFIT ONE CAR GAC 2020', '2024-11-23'),
  (gen_random_uuid(), NULL, 2723.00, 'income', 'Profit-AHMED', 'PROFIT ONE CAR COROLLA 2020', '2024-09-24'),
  (gen_random_uuid(), NULL, 2084.25, 'income', 'Profit-AHMED', 'PROFIT NISSAN MURANO 2019', '2024-11-01'),
  (gen_random_uuid(), NULL, 3081.75, 'income', 'Profit-AHMED', 'PROFIT NISSAN', '2024-10-16'),
  (gen_random_uuid(), NULL, 6317.50, 'income', 'Profit-AHMED', 'PROFIT Tahoe 10000+1000', '2024-10-08'),
  (gen_random_uuid(), NULL, 4343.50, 'income', 'Profit-AHMED', 'PROFIT ONE CAR CAMARO 2019 24020+1000', '2024-11-28'),
  (gen_random_uuid(), NULL, 2380.00, 'income', 'Profit-AHMED', 'PROFIT ONE CAR CHRYSLER 2018 17000 aed', '2024-12-21'),
  (gen_random_uuid(), NULL, 966.00, 'income', 'Profit-AHMED', 'PROFIT ONE CAR MCZ 2015 8500+700', '2024-12-11'),
  (gen_random_uuid(), NULL, 945.00, 'income', 'Profit-AHMED', 'PROFIT MERCEDES 2007', '2024-11-10'),
  (gen_random_uuid(), NULL, 773.50, 'income', 'Profit-AHMED', 'PURCHASE Veloster 11400+370 تصليح وصبغ', '2025-01-17'),
  (gen_random_uuid(), NULL, 4112.50, 'income', 'Profit-AHMED', 'PROFIT MG T 8000+500', '2025-01-15'),

  -- PROFIT-NADA transactions (36)
  (gen_random_uuid(), NULL, 1354.35, 'income', 'Profit-NADA', 'PROFIT FOR NISSAN ROGUE #9329', '2024-02-03'),
  (gen_random_uuid(), NULL, 638.25, 'income', 'Profit-NADA', 'PROFIT ONE CAR EQUONIX #3884', '2024-06-25'),
  (gen_random_uuid(), NULL, 1880.55, 'income', 'Profit-NADA', 'PROFIT FOR MUSTANG #1482', '2024-02-10'),
  (gen_random_uuid(), NULL, 770.25, 'income', 'Profit-NADA', 'PROFIT FOR Jeep Renegade #1806', '2024-02-19'),
  (gen_random_uuid(), NULL, 711.00, 'income', 'Profit-NADA', 'PROFIT FOR DUSTER 2021', '2024-05-21'),
  (gen_random_uuid(), NULL, 924.00, 'income', 'Profit-NADA', 'PROFIT FOR OPTIMA 2017 #5XXGT4L35HG176927', '2024-05-14'),
  (gen_random_uuid(), NULL, 1332.00, 'income', 'Profit-NADA', 'PROFIT FOR PORSCHE #3079', '2024-04-28'),
  (gen_random_uuid(), NULL, 1726.25, 'income', 'Profit-NADA', 'PROFIT FOR KIA OPTIMA 2019 #9271', '2024-04-22'),
  (gen_random_uuid(), NULL, 2013.75, 'income', 'Profit-NADA', 'PROFIT ONE CAR ROGUE 2017 #L300', '2024-06-27'),
  (gen_random_uuid(), NULL, 870.75, 'income', 'Profit-NADA', 'PROFIT ONE CAR AUDI #2012', '2024-07-06'),
  (gen_random_uuid(), NULL, 999.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR #0313', '2024-05-27'),
  (gen_random_uuid(), NULL, 441.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR CAPTIVA 2021 #LZ8ADAGA9MB004908', '2024-09-30'),
  (gen_random_uuid(), NULL, 1034.75, 'income', 'Profit-NADA', 'PROFIT ONE Corolla 2018 #9TBURH3H5JK751893', '2024-06-04'),
  (gen_random_uuid(), NULL, 2775.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR CHANGAN CS85 #JS4ASE2AXKP144918', '2024-06-11'),
  (gen_random_uuid(), NULL, 1177.50, 'income', 'Profit-NADA', 'PROFIT ONE MINI COOPER 2020 #WMWXU9C02M2K24194', '2024-09-22'),
  (gen_random_uuid(), NULL, 751.50, 'income', 'Profit-NADA', 'PROFIT ONE CAR ROGUE 2014 #JN8AT2MVXEW806987', '2024-07-22'),
  (gen_random_uuid(), NULL, 2136.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR MG 2020 #LS5A3AGE4LG303403', '2024-07-06'),
  (gen_random_uuid(), NULL, 1083.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR HYUNDAI SONATA 2019', '2024-08-19'),
  (gen_random_uuid(), NULL, 1191.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR KIA 2023', '2024-08-23'),
  (gen_random_uuid(), NULL, 5555.25, 'income', 'Profit-NADA', 'PROFIT ONE CAR Tesla 32000+1000 مسروق', '2024-08-24'),
  (gen_random_uuid(), NULL, 1318.50, 'income', 'Profit-NADA', 'PROFIT ONE CAR CHERRY T600 2019 #LVVDB21B4KD016078', '2024-08-31'),
  (gen_random_uuid(), NULL, 919.50, 'income', 'Profit-NADA', 'PROFIT ONE CAR GEELY 2016 #LVVDB21B4KD016078', '2024-09-07'),
  (gen_random_uuid(), NULL, 1301.25, 'income', 'Profit-NADA', 'PROFIT ONE CAR CHRYSLER #107GC', '2024-09-22'),
  (gen_random_uuid(), NULL, 1014.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR CHEVROLET TRAVERS 2015 #7593', '2024-10-29'),
  (gen_random_uuid(), NULL, 408.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR SENTRA 2018', '2024-10-27'),
  (gen_random_uuid(), NULL, 1140.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR GAC 2020', '2024-11-23'),
  (gen_random_uuid(), NULL, 1167.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR COROLLA 2020', '2024-09-24'),
  (gen_random_uuid(), NULL, 893.25, 'income', 'Profit-NADA', 'PROFIT NISSAN MURANO 2019', '2024-11-01'),
  (gen_random_uuid(), NULL, 1320.75, 'income', 'Profit-NADA', 'PROFIT NISSAN', '2024-10-16'),
  (gen_random_uuid(), NULL, 2707.50, 'income', 'Profit-NADA', 'PROFIT Tahoe 10000+1000', '2024-10-08'),
  (gen_random_uuid(), NULL, 1861.50, 'income', 'Profit-NADA', 'PROFIT ONE CAR CAMARO 2019 24020+1000', '2024-11-28'),
  (gen_random_uuid(), NULL, 1000.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR CHRYSLER 2018 17000 aed', '2024-12-21'),
  (gen_random_uuid(), NULL, 414.00, 'income', 'Profit-NADA', 'PROFIT ONE CAR MCZ 2015 8500+700', '2024-12-11'),
  (gen_random_uuid(), NULL, 405.00, 'income', 'Profit-NADA', 'PROFIT MERCEDES 2007', '2024-11-10'),
  (gen_random_uuid(), NULL, 331.50, 'income', 'Profit-NADA', 'PURCHASE Veloster 11400+370 تصليح وصبغ', '2025-01-17'),
  (gen_random_uuid(), NULL, 1762.50, 'income', 'Profit-NADA', 'PROFIT MG T 8000+500', '2025-01-15');
