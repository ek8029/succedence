// Check if trial setup is working
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTrialSetup() {
  console.log('\n=================================');
  console.log('CHECKING TRIAL SETUP');
  console.log('=================================\n');

  // 1. Check if trial_ends_at column exists
  console.log('1. Checking if trial_ends_at column exists...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, plan, trial_ends_at, created_at')
      .limit(1);

    if (error) {
      console.error('❌ Error querying users table:', error.message);
      console.log('\n⚠️  ACTION REQUIRED: Run the database migration!');
      console.log('   Go to Supabase SQL Editor and run sql/007_add_trial_field.sql\n');
    } else {
      console.log('✅ trial_ends_at column exists');
    }
  } catch (err) {
    console.error('❌ Database query failed:', err.message);
  }

  // 2. Check users with trials
  console.log('\n2. Checking users with active trials...');
  try {
    const { data: trialUsers, error } = await supabase
      .from('users')
      .select('id, email, plan, trial_ends_at, created_at')
      .eq('plan', 'free')
      .not('trial_ends_at', 'is', null);

    if (error) {
      console.error('❌ Error:', error.message);
    } else if (trialUsers && trialUsers.length > 0) {
      console.log(`✅ Found ${trialUsers.length} users with trials:`);
      trialUsers.forEach(u => {
        const now = new Date();
        const trialEnd = new Date(u.trial_ends_at);
        const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
        console.log(`   - ${u.email}: ${daysLeft > 0 ? daysLeft + ' days left' : 'EXPIRED'} (ends: ${trialEnd.toLocaleDateString()})`);
      });
    } else {
      console.log('⚠️  No users with trials found');
      console.log('   This is normal if you haven\'t created any accounts yet');
    }
  } catch (err) {
    console.error('❌ Error checking trial users:', err.message);
  }

  // 3. Check most recent user signup
  console.log('\n3. Checking most recent user signup...');
  try {
    const { data: recentUsers, error } = await supabase
      .from('users')
      .select('id, email, plan, trial_ends_at, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('❌ Error:', error.message);
    } else if (recentUsers && recentUsers.length > 0) {
      console.log(`✅ Last ${recentUsers.length} users:`);
      recentUsers.forEach(u => {
        const hasTrialField = u.trial_ends_at !== null && u.trial_ends_at !== undefined;
        console.log(`   - ${u.email}:`);
        console.log(`     Plan: ${u.plan}`);
        console.log(`     Trial: ${hasTrialField ? new Date(u.trial_ends_at).toLocaleDateString() : '❌ NOT SET'}`);
        console.log(`     Created: ${new Date(u.created_at).toLocaleDateString()}`);
      });
    }
  } catch (err) {
    console.error('❌ Error checking recent users:', err.message);
  }

  console.log('\n=================================');
  console.log('CHECK COMPLETE');
  console.log('=================================\n');
}

checkTrialSetup().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
