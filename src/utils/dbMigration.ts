import { supabase } from '../services/supabase';

export async function runMigration() {
  try {
    const { error } = await supabase.rpc('run_migration', {
      sql: `
        -- Add new columns to vehicles table
        ALTER TABLE vehicles
        ADD COLUMN IF NOT EXISTS owner_name text,
        ADD COLUMN IF NOT EXISTS tc_number text,
        ADD COLUMN IF NOT EXISTS certificate_number text,
        ADD COLUMN IF NOT EXISTS registration_location text;
      `
    });

    if (error) throw error;
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  }
}
