import { NextRequest, NextResponse } from 'next/server';
import { isAIEnabled } from '@/lib/ai/openai';
import { getUserWithRole } from '@/lib/auth/permissions';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const environment = process.env.VERCEL_ENV || 'development';
    const isProduction = environment === 'production';

    // Get environment variables
    const aiEnabled = process.env.AI_FEATURES_ENABLED;
    const openaiKey = process.env.OPENAI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Test AI enablement
    const isEnabled = isAIEnabled();

    // Test authentication
    let authResult = null;
    let authError = null;

    try {
      const authUser = await getUserWithRole();
      authResult = authUser ? {
        id: authUser.id,
        email: authUser.email,
        role: authUser.role,
        plan: authUser.plan
      } : null;
    } catch (error) {
      authError = error instanceof Error ? error.message : String(error);
    }

    // Test database connection
    let dbTest = null;
    let dbError = null;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('listings')
        .select('id, title')
        .limit(1);

      dbTest = {
        connected: !error,
        listingCount: data?.length || 0
      };

      if (error) {
        dbError = error.message;
      }
    } catch (error) {
      dbError = error instanceof Error ? error.message : String(error);
    }

    const result = {
      timestamp: new Date().toISOString(),
      environment: {
        vercel_env: environment,
        is_production: isProduction,
        node_env: process.env.NODE_ENV,
        url: request.url
      },
      ai_config: {
        AI_FEATURES_ENABLED: aiEnabled,
        AI_FEATURES_ENABLED_type: typeof aiEnabled,
        OPENAI_API_KEY_exists: !!openaiKey,
        OPENAI_API_KEY_length: openaiKey?.length || 0,
        OPENAI_API_KEY_prefix: openaiKey?.substring(0, 10) || null,
        isAIEnabled_result: isEnabled
      },
      supabase_config: {
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
        NEXT_PUBLIC_SUPABASE_URL_exists: !!supabaseUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY_exists: !!supabaseAnonKey,
        NEXT_PUBLIC_SUPABASE_ANON_KEY_length: supabaseAnonKey?.length || 0
      },
      authentication: {
        user: authResult,
        error: authError
      },
      database: {
        connection: dbTest,
        error: dbError
      },
      diagnosis: {
        ai_should_work: isEnabled && !!authResult && authResult.plan !== 'free',
        main_issues: [
          !aiEnabled ? 'AI_FEATURES_ENABLED not set' : null,
          !openaiKey ? 'OPENAI_API_KEY not set' : null,
          !authResult ? 'Authentication failed' : null,
          authResult?.plan === 'free' ? 'User needs paid plan' : null,
          dbError ? 'Database connection failed' : null
        ].filter(Boolean),
        next_steps: isProduction ? [
          'Check Vercel Dashboard > Settings > Environment Variables',
          'Ensure AI_FEATURES_ENABLED=true is set',
          'Ensure OPENAI_API_KEY is set with valid key',
          'Redeploy after adding environment variables'
        ] : [
          'Environment variables look good in development',
          'Issue might be specific to production deployment'
        ]
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Debug production error:', error);

    return NextResponse.json(
      {
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}