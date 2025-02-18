# Product Requirements Document: Financial Management System

## 1. Introduction

This document outlines the requirements for a comprehensive Financial Management System designed to track income, expenses, assets, and profit distribution, with a focus on vehicle sales and related financial activities. The system will provide detailed reporting, user management, and configuration options.

## 2. Goals

*   Provide a clear and accurate overview of the financial status of the business.
*   Track all income and expenses related to vehicle sales and other activities.
*   Manage vehicle inventory, including purchase and sale details.
*   Automate profit distribution calculations.
*   Offer detailed reporting and analytics capabilities.
*   Provide a user-friendly and intuitive interface.
*   Ensure data security and integrity.
*   Allow for configuration of global settings.
*   Provide audit logging for all critical actions.
*   Support data backup and restore functionality.

## 3. Target Users

*   **Admin:** Full access to all features, including user management, settings, and all data.
*   **User:** (Currently, all users have admin-like access. This will be refined in future iterations.) Access to all features except user management.

## 4. Features

### 4.1. Authentication and Authorization

*   **User Registration:** Allow new users to create accounts.
*   **User Login:** Secure login with email and password.
*   **Password Reset:** Allow users to reset forgotten passwords.
*   **Authentication Guard:** Protect routes that require authentication.
*   **Auto Logout:** Automatically log out users after a period of inactivity (configurable).
*   **User Roles:** (Currently simplified to all users having full access. Will be expanded to include distinct roles in the future.)

### 4.2. Dashboard

*   **Overall Money Flow:** Display total income minus total expenses.
*   **Total Capital:** Show the total capital, calculated as contributions + additional capital - expenses - loans - cash on hand - profit distributions.
*   **Bank Balance:** Display the calculated bank balance.
*   **Cash on Hand:** Show the current cash on hand (editable).
*   **Showroom Balance:** Show the current showroom balance (editable).
*   **Personal Loan:** Show the current personal loan amount (editable).
*   **Additional Capital:** Show any additional capital contributions (editable).
*   **Total Contribution:** Display the total contributions received.
*   **Profit Distribution:** Show profit distribution for Ahmed and Nada.
*   **Assets:** Display the total value of available vehicles.
*   **Expenses:** Show total expenses.
*   **Business Analytics:** Provide charts and graphs for monthly profit, income vs. expenses, and profit percentage.
*   **Yearly Overview:** Display yearly financial summaries.

### 4.3. Transactions

*   **Transaction List:** Display all transactions with details (date, description, type, category, amount).
*   **Filtering:** Allow filtering transactions by date range, type, and category.
*   **Sorting:** Allow sorting transactions by date, amount, and category.
*   **Searching:** Allow searching transactions by description.
*   **Add Transaction:** Allow adding new transactions (income or expense).
*   **Edit Transaction:** Allow editing existing transactions.
*   **Delete Transaction:** Allow deleting transactions.
*   **Transaction Categories:** Manage transaction categories (add, edit, delete).
*   **Pagination:** Implement pagination for large transaction lists.
*   **Export:** Export transactions to CSV and PDF.

### 4.4. Categories

*   **Category List:** Display all categories.
*   **Add Category:** Allow adding new categories.
*   **Edit Category:** Allow editing existing categories.
*   **Delete Category:** Allow deleting categories.

### 4.5. Vehicles

*   **Vehicle List:** Display all vehicles with details (VIN, make, model, year, color, status, purchase price, sale price, purchase date, sale date).
*   **Filtering:** Allow filtering vehicles by status (available, sold).
*   **Sorting:** Allow sorting vehicles by purchase date, sale date, price, etc.
*   **Searching:** Allow searching vehicles by VIN, make, model, or year.
*   **Add Vehicle:** Allow adding new vehicles with all relevant details.
*   **Edit Vehicle:** Allow editing existing vehicle details.
*   **Delete Vehicle:** Allow deleting vehicles.
*   **Vehicle Details Page:** Show detailed information for a single vehicle, including:
    *   Purchase details
    *   Sale details (if sold)
    *   Expenses associated with the vehicle
    *   Profit distribution (if sold)
    *   Registration details (owner name, TC number, certificate number, registration location)
    *   Notes
*   **Expense Tracking:** Add, edit, and delete expenses associated with a specific vehicle.
*   **Profit Distribution:** Automatically calculate and distribute profit when a vehicle is sold.
*   **Vehicle Report:** Generate a PDF report for a specific vehicle, including all details, expenses, and profit distribution.

### 4.6. Users

*   **User List:** Display all registered users (currently simplified to show all users with full access).
*   **Edit User:** Allow updating user details (name, avatar).
*   **Change Password:** Allow users to change their password.
*   **Avatar Upload:** Allow users to upload and update their avatar.

### 4.7. Settings

*   **Global Settings:** Manage global settings for the application:
    *   Company Name
    *   Company Address
    *   Company Phone
    *   Company Email
    *   Currency (default: AED)
    *   Exchange Rate (USD to AED)
    *   Date Format
    *   Auto Logout Timer (in minutes)
*   **Backup & Restore:**
    *   Create Backup: Generate a JSON backup of all data.
    *   Restore Backup: Upload and restore data from a backup file.
*   **Audit Logs:** View a log of all actions performed in the system, including:
    *   Timestamp
    *   User
    *   Action Type (CREATE, UPDATE, DELETE, LOGIN, LOGOUT, BACKUP, RESTORE)
    *   Entity Type (VEHICLE, TRANSACTION, etc.)
    *   Entity ID
    *   Old Data (for updates and deletes)
    *   New Data (for creates and updates)
    *   Description
    *   IP Address
    *   User Agent
    *   Formatted Details (human-readable changes)

### 4.8 Reports
*   **Monthly Reports:** Generate monthly reports for transactions, vehicles sold, expenses, and profit.
*   **Custom Reports:** Allow users to generate custom reports based on specific criteria.
*   **Export Reports:** Export reports in various formats (PDF, CSV).

## 5. Technical Requirements

*   **Frontend:** React with TypeScript, Tailwind CSS, Lucide React (icons), Chart.js (charts), jsPDF (PDF generation).
*   **Backend:** Supabase (PostgreSQL database, authentication, storage).
*   **State Management:** React Context, React Query.
*   **Routing:** React Router.
*   **Deployment:** WebContainer (in-browser Node.js runtime).

## 6. Future Considerations

*   **User Roles and Permissions:** Implement distinct user roles (Admin, User) with different access levels.
*   **Multi-Currency Support:** Allow users to select and manage multiple currencies.
*   **Advanced Reporting:** Implement more advanced reporting features, including custom date ranges, filtering, and visualizations.
*   **Notifications:** Implement email or in-app notifications for important events (e.g., low stock, upcoming payments).
*   **Mobile App:** Develop a mobile app for iOS and Android.
*   **Integration with Accounting Software:** Integrate with popular accounting software (e.g., Xero, QuickBooks).
*   **Inventory Management:** Add more robust inventory management features, such as tracking vehicle parts and accessories.
*   **Customer Relationship Management (CRM):** Integrate basic CRM features to manage customer interactions.

## 7. Open Issues

*   **Detailed design for Reports page.**
*   **Specific requirements for user roles and permissions.**
*   **Finalize data validation rules.**

## 8. Automatic Transaction Handling

### 8.1 Vehicle Purchase

When a new vehicle is added:

1.  **Trigger:** `AFTER INSERT` on the `vehicles` table.
2.  **Action:**
    *   Create a new transaction in the `transactions` table.
    *   `amount`: `purchase_price` from the new vehicle.
    *   `type`: `expense`.
    *   `category`: `Vehicle Purchase`.
    *   `description`: `Vehicle Purchased - {Year} {Make} {Model} (VIN: {VIN})`.
    *   `date`: `purchase_date` from the new vehicle.
    *   `reference_id`: `id` of the new vehicle.

### 8.2 Vehicle Sale

When a vehicle's status is updated to `SOLD`:

1.  **Trigger:** `AFTER UPDATE` on the `vehicles` table (check for `status` change to 'SOLD').
2.  **Actions:**
    *   Create a new transaction in the `transactions` table.
        *   `amount`: `sale_price` from the updated vehicle.
        *   `type`: `income`.
        *   `category`: `Vehicle Sale`.
        *   `description`: `Vehicle Sold - {Year} {Make} {Model} (VIN: {VIN})`.
        *   `date`: `sale_date` from the updated vehicle.
        *   `reference_id`: `id` of the updated vehicle.
    *   Calculate the net profit: `sale_price` - `purchase_price` - `total_expenses` (from `vehicle_expenses` table).
    *   Create profit distribution transactions (see 8.3).

### 8.3 Profit Distribution

When a vehicle's status is updated to `SOLD` (triggered by the same event as 8.2):

1.  **Calculate Net Profit:** `sale_price` - `purchase_price` - `total_expenses` (sum of all expenses for the vehicle).
2.  **Calculate Distribution Amounts:**
    *   Ahmed: 35% of net profit + reimbursement for any expenses paid by Ahmed + purchase price.
    *   Nada: 15% of net profit + reimbursement for any expenses paid by Nada.
    *   Shaker: 50% of net profit + reimbursement for any expenses paid by Shaker.
3.  **Create Transactions:**
    *   For each recipient (Ahmed, Nada, Shaker):
        *   Create a new transaction in the `transactions` table.
        *   `amount`: Calculated distribution amount for the recipient.
        *   `type`: `income`.
        *   `category`: `Profit-AHMED`, `Profit-NADA`, or `Profit-SHAKER` based on the recipient.
        *   `description`: `Vehicle Sold - {Year} {Make} {Model} (VIN: {VIN})\n{Percentage}% of net profit (AED {profit_amount})${expenses_reimbursement_text}`
        *   `date`: `sale_date` from the updated vehicle.
        *   `reference_id`: `id` of the updated vehicle.

### 8.4 Vehicle Expenses

When a new expense is added for a vehicle:

1.  **Trigger:** `AFTER INSERT` on the `vehicle_expenses` table.
2.  **Action:**
    *   If the `recipient` is 'Ahmed', create a corresponding transaction:
        *   `amount`: `amount` from the new expense.
        *   `type`: `expense`.
        *   `category`: `Vehicle Expense`.
        *   `description`: `Vehicle Expense - {Year} {Make} {Model} (VIN: {VIN})`.
        *   `date`: `date` from the new expense.
        *   `reference_id`: `id` of the new expense.

When an expense is updated or deleted:

1.  **Trigger:** `AFTER UPDATE` or `AFTER DELETE` on the `vehicle_expenses` table.
2.  **Action:**
    *   If the original expense had `recipient` as 'Ahmed', delete or update the corresponding transaction.
    *   If the updated expense has `recipient` as 'Ahmed', create or update the corresponding transaction.
