-- First ensure we have the required categories
INSERT INTO categories (id, name, user_id)
VALUES 
  (gen_random_uuid(), 'Personal Expenses', NULL),
  (gen_random_uuid(), 'Distribution', NULL)
ON CONFLICT (name) DO NOTHING;

-- Import Personal Expenses transactions
WITH transactions_data AS (
  SELECT * FROM (VALUES
    ('2023-07-04', 8700.00, 'Personal Expenses - VACATION'),
    ('2023-11-02', 3000.00, 'SEWA'),
    ('2023-11-03', 9700.00, '3 MONTH RENT+COMISSION +SERVICES'),
    ('2023-11-04', 2550.00, 'Bedroom Furniture'),
    ('2023-11-05', 700.00, 'KITCHENS STUFF'),
    ('2023-11-06', 1100.00, 'LIVING ROOM'),
    ('2023-11-07', 3500.00, 'fridge and washing machine'),
    ('2023-11-08', 700.00, 'CURTAINS'),
    ('2023-11-09', 700.00, 'TABLE AND Chest Of Drawers'),
    ('2023-11-10', 500.00, 'CARPET'),
    ('2023-12-04', 20189.00, 'Personal Expnses'),
    ('2023-12-07', 1150.00, 'Personal Expnses rent car VACATION'),
    ('2024-02-01', 6750.00, 'Apartment rent'),
    ('2024-04-02', 2000.00, 'Mualih flat 509 Security cheque REFUNDABLE END OF THE CONTRACT'),
    ('2024-04-09', 2500.00, 'Gold Earing'),
    ('2024-05-01', 6750.00, 'Apartment rent'),
    ('2024-06-18', 1830.00, 'EID GIFT'),
    ('2024-07-22', 250.00, 'VACATION NET'),
    ('2024-07-23', 250.00, 'VACATION RENT CAR'),
    ('2024-08-01', 6750.00, 'Apartment rent'),
    ('2024-08-27', 2000.00, 'NADA GOLD'),
    ('2024-10-17', 1300.00, 'MUNICIPALITY'),
    ('2024-11-16', 7000.00, 'RENT'),
    ('2024-11-20', 3000.00, 'IPHONE PRO MAX')
  ) AS t(date, amount, description)
)
INSERT INTO transactions (id, amount, type, category, description, date)
SELECT 
  gen_random_uuid(),
  amount,
  'expense',
  'Personal Expenses',
  description,
  date::date
FROM transactions_data;

-- Import Distribution transactions
WITH distribution_data AS (
  SELECT * FROM (VALUES
    ('2024-01-01', 8571.00, 'Money given to Nada 120,000EGP'),
    ('2024-01-01', 350.00, 'Money transfer to AHMED EGP in USD')
  ) AS t(date, amount, description)
)
INSERT INTO transactions (id, amount, type, category, description, date)
SELECT 
  gen_random_uuid(),
  amount,
  'expense',
  'Distribution',
  description,
  date::date
FROM distribution_data;
