import { NextRequest, NextResponse } from 'next/server';
import { generateMarketIntelligence, isAIEnabled } from '@/lib/ai/openai';
import { createClient } from '@/lib/supabase/server';
import { getUserWithRole, hasFeatureAccess } from '@/lib/auth/permissions';

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

    const body = await request.json();
    const { industry, geography, dealSize } = body;

    if (!industry) {
      return NextResponse.json(
        { error: 'Industry is required' },
        { status: 400 }
      );
    }

    // Generate market intelligence
    const intelligence = await generateMarketIntelligence(industry, geography, dealSize);

    // TODO: Store the analysis for caching (temporarily disabled due to type issues)
    // const { error: insertError } = await supabase
    //   .from('ai_analyses')
    //   .insert({
    //     userId: authUser.id,
    //     analysisType: 'market_intelligence',
    //     analysisData: {
    //       ...intelligence,
    //       industry,
    //       geography,
    //       dealSize
    //     },
    //     createdAt: new Date().toISOString(),
    //     updatedAt: new Date().toISOString()
    //   });

    // if (insertError) {
    //   console.error('Error storing market intelligence:', insertError);
    // }

    return NextResponse.json({
      success: true,
      intelligence,
      parameters: {
        industry,
        geography,
        dealSize
      }
    });

  } catch (error) {
    console.error('Error generating market intelligence:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate market intelligence',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}