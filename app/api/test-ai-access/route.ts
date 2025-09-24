import { NextRequest, NextResponse } from 'next/server';
import { isAIEnabled } from '@/lib/ai/openai';
import { getUserWithRole, hasFeatureAccess } from '@/lib/auth/permissions';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Test 1: Check if AI features are enabled via environment variables
    const aiEnabled = isAIEnabled();

    // Test 2: Check if user is authenticated and has permissions
    const authUser = await getUserWithRole();

    // Test 3: Check database connection
    const supabase = createClient();
    let dbUser = null;
    let dbError = null;

    if (authUser) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        dbUser = data;
        dbError = error;
      } catch (e) {
        dbError = e;
      }
    }

    // Test 4: Check feature access
    const hasAccess = authUser ? hasFeatureAccess(authUser.plan, authUser.role) : false;

    const result = {
      timestamp: new Date().toISOString(),
      tests: {
        environmentVariables: {
          AI_FEATURES_ENABLED: process.env.AI_FEATURES_ENABLED,
          OPENAI_API_KEY_EXISTS: !!process.env.OPENAI_API_KEY,
          OPENAI_API_KEY_LENGTH: process.env.OPENAI_API_KEY?.length || 0,
          isAIEnabled: aiEnabled,
          status: aiEnabled ? '✅ PASS' : '❌ FAIL'
        },
        authentication: {
          isAuthenticated: !!authUser,
          authUser: authUser ? {
            id: authUser.id,
            email: authUser.email,
            role: authUser.role,
            plan: authUser.plan
          } : null,
          status: authUser ? '✅ PASS' : '❌ FAIL'
        },
        database: {
          userExistsInDB: !!dbUser,
          dbUser: dbUser,
          dbError: dbError?.message || null,
          status: (dbUser && !dbError) ? '✅ PASS' : '❌ FAIL'
        },
        permissions: {
          hasFeatureAccess: hasAccess,
          requiredPlan: 'non-free (starter/professional/enterprise) or admin role',
          status: hasAccess ? '✅ PASS' : '❌ FAIL'
        }
      },
      overall: {
        allTestsPass: aiEnabled && !!authUser && !!dbUser && !dbError && hasAccess,
        aiReady: aiEnabled && !!authUser && !!dbUser && !dbError && hasAccess,
        status: (aiEnabled && !!authUser && !!dbUser && !dbError && hasAccess) ? '✅ AI READY' : '❌ AI NOT READY'
      },
      troubleshooting: {
        nextSteps: !aiEnabled ? 'Set AI_FEATURES_ENABLED=true and OPENAI_API_KEY in .env.local' :
                  !authUser ? 'Sign in to authenticate' :
                  (!dbUser || dbError) ? 'Run the supabase-setup-complete.sql script in Supabase SQL Editor' :
                  !hasAccess ? 'Update user plan to starter/professional/enterprise or role to admin' :
                  'All checks passed - AI features should work!'
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in AI access test:', error);

    return NextResponse.json(
      {
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: '❌ ERROR'
      },
      { status: 500 }
    );
  }
}