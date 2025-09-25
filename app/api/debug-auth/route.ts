import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check auth session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    let dbUser = null;
    let dbError = null;

    if (user) {
      // Try to get user from database
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        dbUser = data;
        dbError = error;
      } catch (e) {
        dbError = e;
      }
    }

    const result = {
      timestamp: new Date().toISOString(),
      auth: {
        authenticated: !!user,
        user: user ? {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata,
          app_metadata: user.app_metadata
        } : null,
        authError: authError?.message || null
      },
      database: {
        userInDB: !!dbUser,
        dbUser: dbUser,
        dbError: dbError?.message || dbError?.toString() || null,
        tableExists: dbError?.code !== 'PGRST116' // PGRST116 = table doesn't exist
      },
      environment: {
        AI_FEATURES_ENABLED: process.env.AI_FEATURES_ENABLED,
        OPENAI_API_KEY_EXISTS: !!process.env.OPENAI_API_KEY
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Debug auth error:', error);

    return NextResponse.json(
      {
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}