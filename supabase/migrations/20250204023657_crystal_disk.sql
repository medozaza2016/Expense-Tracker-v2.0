-- First ensure we have all required categories
INSERT INTO categories (id, name, user_id)
VALUES 
  (gen_random_uuid(), 'Asset', NULL),
  (gen_random_uuid(), 'Capital', NULL),
  (gen_random_uuid(), 'Contribution', NULL)
ON CONFLICT (name) DO NOTHING;

-- Import transactions using CTE
WITH transactions_data AS (
  SELECT * FROM (VALUES
    -- Asset transactions (expense type)
    ('PURCHASE ONE CAR MINI COOPER 2019 #WMMXU7JA06KTM90694', 27375.00, 'Asset', 'expense', '2024-07-16'),
    ('PURCHASE CHARGER 2021 +150+38070', 38220.00, 'Asset', 'expense', '2024-09-30'),
    ('PURCHASE ONE CAR FORD EDGE 8500+500', 9000.00, 'Asset', 'expense', '2024-10-29'),
    ('PURCHASE JAC 2023 20530 +120 +450 vinremover', 21100.00, 'Asset', 'expense', '2024-11-17'),
    ('PURCHASE TUCSON 2023 GRAY 150+80 RECOVERY+PASSING', 46235.00, 'Asset', 'expense', '2025-01-19'),

    -- Capital transaction (income type)
    ('NADA', 19950.00, 'Capital', 'income', '2025-01-06'),

    -- Contribution transactions (income type)
    ('Wire Transfer [10,000$]', 35660.00, 'Contribution', 'income', '2023-04-01'),
    ('Wire Transfer [15,000$]', 53528.50, 'Contribution', 'income', '2023-09-01'),
    ('Wire Transfer [5,000$]', 17800.00, 'Contribution', 'income', '2023-11-01'),
    ('CASH Contribution [7,500$]', 27450.00, 'Contribution', 'income', '2023-12-04'),
    ('Ahmed visa card payment', 1420.00, 'Contribution', 'income', '2024-01-23'),
    ('Wire Transfer [10,000$]', 35668.00, 'Contribution', 'income', '2024-01-25'),
    ('Ahmed visa card payment [246$]', 900.00, 'Contribution', 'income', '2024-01-25'),
    ('Ahmed visa card payment [100$]', 366.00, 'Contribution', 'income', '2024-01-29'),
    ('FIRST PAYMENT AHMED FOR WEBSITE [295$]', 1077.00, 'Contribution', 'income', '2024-02-07'),
    ('Ahmed visa card payment [215$]', 790.00, 'Contribution', 'income', '2024-02-17'),
    ('Ahmed visa card payment [500$]', 1830.00, 'Contribution', 'income', '2024-02-20'),
    ('Ahmed visa card payment [630$]', 2305.00, 'Contribution', 'income', '2024-03-21'),
    ('Wire Transfer [10,000$]', 35669.00, 'Contribution', 'income', '2024-05-09'),
    ('AHMED BANK TRANSFER TO NADA ACCOUNT EGY', 3660.00, 'Contribution', 'income', '2024-06-12'),
    ('Ahmed visa card payment 75$', 275.00, 'Contribution', 'income', '2024-07-28'),
    ('Ahmed visa card payment 260$', 955.00, 'Contribution', 'income', '2024-07-30'),
    ('VISA PAYMENT 440$', 1610.00, 'Contribution', 'income', '2024-09-01'),
    ('Ahmed visa card payment 60$', 220.00, 'Contribution', 'income', '2024-09-08'),
    ('Transfer - AHMED [100,000 EGP]', 7500.00, 'Contribution', 'income', '2024-10-07'),
    ('AHMED BANK TRANSFER TO NADA ACCOUNT EGY (20,000)', 1515.00, 'Contribution', 'income', '2024-10-19'),
    ('Ahmed visa card payment 560$', 2050.00, 'Contribution', 'income', '2024-12-09')
  ) AS t(description, amount, category, type, date)
)
INSERT INTO transactions (id, user_id, amount, type, category, description, date)
SELECT 
  gen_random_uuid(),
  NULL,
  amount,
  type,
  category,
  description,
  date::date
FROM transactions_data;
