import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .limit(3);

  if (error) {
    return new Response(JSON.stringify({ ok:false, error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ ok:true, rows: data }), { headers: { 'content-type': 'application/json' } });
}