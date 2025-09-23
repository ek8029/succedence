const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function addContactFields() {
  console.log('🔧 Adding contact fields to listings table...');

  try {
    // Check if contact fields already exist
    const { data: columns, error: checkError } = await supabase
      .from('listings')
      .select('contact_phone, contact_email, contact_other')
      .limit(1);

    if (!checkError) {
      console.log('✅ Contact fields already exist in the database.');
      return;
    }

    // If we get here, the fields don't exist and we need to add them
    console.log('📝 Contact fields not found, adding them...');

    // Note: We can't directly add columns via the Supabase client
    // This would need to be done via the Supabase dashboard or SQL commands
    console.log('⚠️  Please add the following columns to your listings table via the Supabase dashboard:');
    console.log('   - contact_phone (text, nullable)');
    console.log('   - contact_email (text, nullable)');
    console.log('   - contact_other (text, nullable)');
    console.log('');
    console.log('📝 SQL to run in Supabase SQL Editor:');
    console.log('ALTER TABLE listings ADD COLUMN IF NOT EXISTS contact_phone TEXT;');
    console.log('ALTER TABLE listings ADD COLUMN IF NOT EXISTS contact_email TEXT;');
    console.log('ALTER TABLE listings ADD COLUMN IF NOT EXISTS contact_other TEXT;');

  } catch (error) {
    console.error('❌ Error checking contact fields:', error);
  }
}

addContactFields().catch(console.error);