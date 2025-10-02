const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function grantAccessToAllUsers() {
  try {
    // Get all users who are not admins
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, email, name, role, plan')
      .neq('role', 'admin');

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return;
    }

    console.log(`Found ${users.length} non-admin users`);

    // Update all non-admin users to have beta access
    for (const user of users) {
      console.log(`\nUpdating user: ${user.email}`);
      console.log(`  Current plan: ${user.plan || 'none'}`);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          status: 'active'
        })
        .eq('id', user.id);

      if (updateError) {
        console.error(`  ❌ Error updating ${user.email}:`, updateError);
      } else {
        console.log(`  ✅ Granted access to ${user.email}`);
      }
    }

    console.log('\n✅ Done! All non-admin users now have beta access.');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

grantAccessToAllUsers();
