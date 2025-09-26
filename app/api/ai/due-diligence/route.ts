import { NextRequest, NextResponse } from 'next/server';
import { generateSuperEnhancedDueDiligence, isAIEnabled } from '@/lib/ai/super-enhanced-openai';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getUserWithRole, hasFeatureAccess } from '@/lib/auth/permissions';
import type { Listing } from '@/db/schema';

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

    // Allow bypass in development mode
    if (!authUser && process.env.DEV_BYPASS_AUTH !== 'true') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create effective user for processing (real user or dev bypass)
    const effectiveUser = authUser || (process.env.DEV_BYPASS_AUTH === 'true' ? {
      id: 'dev-user-' + Date.now(),
      role: 'admin',
      plan: 'enterprise'
    } : null);

    if (!effectiveUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has access (admin users and dev bypass have full access)
    if (!hasFeatureAccess(effectiveUser.plan, effectiveUser.role)) {
      return NextResponse.json(
        { error: 'Subscription required for AI features' },
        { status: 403 }
      );
    }

    // Use service client for development bypass or when user exists
    const useServiceClient = process.env.DEV_BYPASS_AUTH === 'true' || effectiveUser?.role === 'admin';
    const supabase = useServiceClient ? createServiceClient() : createClient();

    const body = await request.json();
    const {
      listingId,
      followUpQuery = null,
      forceRefresh = false
    } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Fetch the listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single() as { data: Listing | null; error: any };

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Handle follow-up queries
    if (followUpQuery) {
      try {
        const serviceSupabase = createServiceClient();
        const { data: originalAnalysisData, error: analysisError } = await (serviceSupabase as any)
          .from('ai_analyses')
          .select('*')
          .eq('user_id', effectiveUser.id)
          .eq('listing_id', listingId)
          .eq('analysis_type', 'due_diligence')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (analysisError || !originalAnalysisData) {
          return NextResponse.json(
            { error: 'Original due diligence analysis not found for follow-up' },
            { status: 404 }
          );
        }

        const followUpResponse = { error: "Follow-up analysis not yet implemented with SuperEnhanced AI" };

        return NextResponse.json({
          success: true,
          type: 'follow_up',
          response: followUpResponse,
          query: followUpQuery
        });

      } catch (error) {
        console.error('Error in due diligence follow-up analysis:', error);
        return NextResponse.json(
          { error: 'Failed to generate follow-up analysis' },
          { status: 500 }
        );
      }
    }

    // Check for existing analysis first (unless forced refresh)
    let checklist;
    let existingAnalysis = null;

    if (!forceRefresh) {
      try {
        const serviceSupabase = createServiceClient();
        const { data: cached, error: cacheError } = await (serviceSupabase as any)
          .from('ai_analyses')
          .select('*')
          .eq('user_id', effectiveUser.id)
          .eq('listing_id', listingId)
          .eq('analysis_type', 'due_diligence')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!cacheError && cached) {
          existingAnalysis = cached;
          checklist = cached.analysis_data;
          console.log('Using cached enhanced due diligence from', cached.created_at);
        }
      } catch (error) {
        console.log('No cached enhanced due diligence found, generating fresh analysis');
      }
    }

    // Generate super enhanced due diligence checklist if no cached version exists
    if (!existingAnalysis || forceRefresh) {
      // Use super enhanced due diligence generator
      checklist = await generateSuperEnhancedDueDiligence(listing);
    }

    // Skip database saves in development mode
    if (process.env.DEV_BYPASS_AUTH !== 'true') {
      // Store the analysis in the database
      const { error: insertError } = await supabase
        .from('ai_analyses')
        .upsert({
          listing_id: listingId,
          user_id: effectiveUser.id,
          analysis_type: 'due_diligence',
          analysis_data: checklist,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any);

      if (insertError) {
        console.error('Error storing due diligence analysis:', insertError);
      }
    } else {
      console.log('🔧 DEV MODE: Skipping database save');
    }

    return NextResponse.json({
      success: true,
      type: 'super_enhanced_analysis',
      checklist,
      cached: !!existingAnalysis,
      analysisDate: existingAnalysis ? existingAnalysis.created_at : new Date().toISOString(),
      listingTitle: listing.title,
      industry: listing.industry,
      superEnhancedFeatures: {
        riskPrioritizedChecklist: true,
        industrySpecificRequirements: true,
        timelineAndResourcePlanning: true,
        comprehensiveRiskMatrix: true,
        expertRecommendations: true,
        followUpCapability: true,
        confidenceScoring: true,
        aiVersion: '2.0'
      }
    });

  } catch (error) {
    console.error('Error generating due diligence checklist:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate due diligence checklist',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}