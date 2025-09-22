import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return new Response(JSON.stringify({
      error: 'Email parameter required'
    }), { status: 400 });
  }

  try {
    // Check auth.users table
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = authUsers?.users.find((u: any) => u.email === email);

    // Check users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    // Check profiles table
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', authUser?.id)
      .single();

    return new Response(JSON.stringify({
      authUser: authUser ? {
        id: authUser.id,
        email: authUser.email,
        user_metadata: authUser.user_metadata,
        app_metadata: authUser.app_metadata,
        created_at: authUser.created_at
      } : null,
      userData,
      profileData,
      errors: {
        authError: authError?.message,
        userError: userError?.message,
        profileError: profileError?.message
      }
    }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: error.message
    }), { status: 500 });
  }
}