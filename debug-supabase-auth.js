// Debug script to check Supabase auth configuration
require('dotenv').config({ path: '.env.local' });

console.log('\n=================================');
console.log('SUPABASE AUTH DEBUG');
console.log('=================================\n');

console.log('Environment Variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing');

console.log('\nProject URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('\n=================================\n');

console.log('Common Issues:\n');
console.log('1. Email Confirmation Required');
console.log('   - Go to Supabase Dashboard → Authentication → Settings');
console.log('   - Check "Enable email confirmations"');
console.log('   - If enabled, users must verify email before appearing\n');

console.log('2. Email Provider Not Configured');
console.log('   - Supabase uses built-in email (limited in development)');
console.log('   - Or configure custom SMTP\n');

console.log('3. Accounts in Database But Not Auth');
console.log('   - Check: SELECT * FROM auth.users;');
console.log('   - vs: SELECT * FROM public.users;\n');

console.log('4. Signup Errors Not Caught');
console.log('   - Check browser console for errors');
console.log('   - Check Network tab for failed requests\n');

console.log('=================================\n');
