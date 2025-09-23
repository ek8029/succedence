import { NextRequest, NextResponse } from 'next/server';
import { generateSmartBuyBox, isAIEnabled } from '@/lib/ai/openai';
import { createClient } from '@/lib/supabase/server';
import { getUserWithRole, hasFeatureAccess } from '@/lib/auth/permissions';
import type { Preferences, Profile } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if AI features are enabled
    if (!isAIEnabled()) {
      return NextResponse.json(
        { error: 'AI features are not enabled' },
        { status: 503 }
      );
    }

    // Authenticate user and get role
    const authUser = await getUserWithRole();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has access (admin users bypass all restrictions)
    if (!hasFeatureAccess(authUser.plan, authUser.role)) {
      return NextResponse.json(
        { error: 'Subscription required for AI features' },
        { status: 403 }
      );
    }

    const supabase = createClient();

    // Get user preferences and profile
    const { data: preferences, error: preferencesError } = await supabase
      .from('preferences')
      .select('*')
      .eq('userId', authUser.id)
      .single() as { data: Preferences | null; error: any };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('userId', authUser.id)
      .single() as { data: Profile | null; error: any };

    // Build user profile for AI analysis
    const userProfile = {
      industries: preferences?.industries || [],
      dealSizeRange: {
        min: preferences?.minRevenue || 0,
        max: preferences?.priceMax || 10000000
      },
      riskTolerance: 'medium',
      experienceLevel: 'experienced',
      investmentGoals: ['growth', 'roi']
    };

    // Generate smart buy-box
    const buyBox = await generateSmartBuyBox(userProfile);

    // TODO: Store the analysis (temporarily disabled due to type issues)
    // const { error: insertError } = await supabase
    //   .from('ai_analyses')
    //   .upsert({
    //     userId: authUser.id,
    //     analysisType: 'smart_buybox',
    //     analysisData: {
    //       ...buyBox,
    //       userProfile
    //     },
    //     createdAt: new Date().toISOString(),
    //     updatedAt: new Date().toISOString()
    //   });

    // if (insertError) {
    //   console.error('Error storing smart buy-box:', insertError);
    // }

    return NextResponse.json({
      success: true,
      buyBox,
      userProfile: {
        name: profile?.company || authUser.email,
        experienceLevel: userProfile.experienceLevel,
        riskTolerance: userProfile.riskTolerance
      }
    });

  } catch (error) {
    console.error('Error generating smart buy-box:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate smart buy-box',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}