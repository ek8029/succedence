const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, plan, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log(`\n📊 Total users in database: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Plan: ${user.plan || 'none'}`);
      console.log(`   Status: ${user.status || 'none'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkUsers();
