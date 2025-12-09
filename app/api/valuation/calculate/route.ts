import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateValuation, ValuationInput, ValuationOutput } from '@/lib/valuation';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CalculateRequest {
  sourceType: 'url_parse' | 'manual_entry' | 'existing_listing';
  listingId?: string;
  sourceUrl?: string;
  sourcePlatform?: string;
  input: ValuationInput;
  anonymousId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CalculateRequest = await request.json();
    const { sourceType, listingId, sourceUrl, sourcePlatform, input, anonymousId } = body;

    // Validate required fields
    if (!input.industry) {
      return NextResponse.json(
        { error: 'Industry is required' },
        { status: 400 }
      );
    }

    if (!input.revenue && !input.sde && !input.ebitda && !input.cashFlow) {
      return NextResponse.json(
        { error: 'At least one financial metric (revenue, SDE, EBITDA, or cash flow) is required' },
        { status: 400 }
      );
    }

    // Get authenticated user (optional for free tier)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check free tier limits for anonymous users
    if (!user && anonymousId) {
      const canUse = await checkFreeTierLimit(supabase, anonymousId);
      if (!canUse.allowed) {
        return NextResponse.json(
          {
            error: 'Free valuation limit reached',
            message: 'Sign up for a free account to run more valuations',
            requiresSignup: true,
          },
          { status: 403 }
        );
      }
    }

    // If existing listing, fetch its data
    let enrichedInput = { ...input };
    if (sourceType === 'existing_listing' && listingId) {
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (listingError || !listing) {
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        );
      }

      // Type assertion for listing fields
      const listingData = listing as {
        title?: string;
        industry?: string;
        city?: string;
        state?: string;
        revenue?: number;
        ebitda?: number;
        cash_flow?: number;
        price?: number;
        employees?: number;
        year_established?: number;
        owner_hours?: number;
      };

      // Merge listing data with input (input takes precedence)
      enrichedInput = {
        businessName: listingData.title,
        industry: input.industry || listingData.industry || 'general_business',
        city: input.city || listingData.city,
        state: input.state || listingData.state,
        revenue: input.revenue ?? listingData.revenue,
        ebitda: input.ebitda ?? listingData.ebitda,
        cashFlow: input.cashFlow ?? listingData.cash_flow,
        askingPrice: input.askingPrice ?? listingData.price,
        employees: input.employees ?? listingData.employees,
        yearEstablished: input.yearEstablished ?? listingData.year_established,
        ownerHoursPerWeek: input.ownerHoursPerWeek ?? listingData.owner_hours,
        ...input,
      };
    }

    // Run valuation calculation
    const valuation: ValuationOutput = calculateValuation(enrichedInput);

    // Generate valuation ID
    const valuationId = uuidv4();

    // Store valuation in database
    const valuationRecord = {
      id: valuationId,
      user_id: user?.id || null,
      listing_id: listingId || null,
      source_type: sourceType,
      source_url: sourceUrl || null,
      source_platform: sourcePlatform || null,

      // Raw inputs
      raw_revenue: enrichedInput.revenue || null,
      raw_sde: enrichedInput.sde || null,
      raw_ebitda: enrichedInput.ebitda || null,
      raw_cash_flow: enrichedInput.cashFlow || null,
      raw_asking_price: enrichedInput.askingPrice || null,
      raw_inventory: enrichedInput.inventory || null,
      raw_ffe: enrichedInput.ffe || null,

      // Normalized
      normalized_sde: valuation.normalizedFinancials.sde || null,
      normalized_ebitda: valuation.normalizedFinancials.ebitda || null,
      normalization_adjustments: valuation.normalizationDetails.adjustments,

      // Business details
      business_name: enrichedInput.businessName || null,
      industry: enrichedInput.industry,
      naics_code: valuation.industryData.naicsCode || null,
      city: enrichedInput.city || null,
      state: enrichedInput.state || null,
      year_established: enrichedInput.yearEstablished || null,
      employees: enrichedInput.employees || null,
      owner_hours: enrichedInput.ownerHoursPerWeek || null,

      // Risk factors
      risk_factors: valuation.riskAdjustments,

      // Valuation results
      valuation_low: valuation.valuationRange.low,
      valuation_mid: valuation.valuationRange.mid,
      valuation_high: valuation.valuationRange.high,

      // Multiples
      sde_multiple_low: valuation.multiplesUsed.sde.low.toFixed(2),
      sde_multiple_mid: valuation.multiplesUsed.sde.mid.toFixed(2),
      sde_multiple_high: valuation.multiplesUsed.sde.high.toFixed(2),
      ebitda_multiple_low: valuation.multiplesUsed.ebitda.low.toFixed(2),
      ebitda_multiple_mid: valuation.multiplesUsed.ebitda.mid.toFixed(2),
      ebitda_multiple_high: valuation.multiplesUsed.ebitda.high.toFixed(2),

      // Deal quality
      deal_quality_score: valuation.dealQualityScore,
      deal_quality_breakdown: valuation.dealQualityBreakdown,

      // Analysis
      ai_analysis: {
        industryData: valuation.industryData,
        normalizedFinancials: valuation.normalizedFinancials,
        multiplesUsed: valuation.multiplesUsed,
        totalRiskAdjustment: valuation.totalRiskAdjustment,
      },
      key_strengths: valuation.keyStrengths,
      red_flags: valuation.redFlags,
      negotiation_recommendations: valuation.negotiationRecommendations,
      methodology_explanation: valuation.methodology,

      // Mispricing
      mispricing_percent: valuation.mispricing?.label || null,
      mispricing_analysis: valuation.mispricing?.analysis || null,

      // Anonymous tracking
      anonymous_id: !user ? anonymousId || null : null,
    };

    // Insert into database (using snake_case for Supabase)
    // Type cast needed: Drizzle types use camelCase but Supabase expects snake_case column names
    const { error: insertError } = await (supabase
      .from('valuations') as ReturnType<typeof supabase.from>)
      .insert(valuationRecord as never);

    if (insertError) {
      console.error('Failed to store valuation:', insertError);
      // Continue anyway - don't fail the request
    }

    // Update free tier tracking for anonymous users
    if (!user && anonymousId) {
      await recordFreeValuationUsage(supabase, anonymousId, request);
    }

    return NextResponse.json({
      success: true,
      valuationId,
      valuation: {
        id: valuationId,
        valuationRange: valuation.valuationRange,
        dealQualityScore: valuation.dealQualityScore,
        dealQualityBreakdown: valuation.dealQualityBreakdown,
        multiplesUsed: valuation.multiplesUsed,
        normalizedFinancials: valuation.normalizedFinancials,
        riskAdjustments: valuation.riskAdjustments,
        totalRiskAdjustment: valuation.totalRiskAdjustment,
        mispricing: valuation.mispricing,
        methodology: valuation.methodology,
        keyStrengths: valuation.keyStrengths,
        redFlags: valuation.redFlags,
        negotiationRecommendations: valuation.negotiationRecommendations,
        industryData: valuation.industryData,
      },
      isFreeTier: !user,
      requiresSignup: false,
    });
  } catch (error) {
    console.error('Valuation calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate valuation' },
      { status: 500 }
    );
  }
}

/**
 * Check if anonymous user can use free tier
 */
async function checkFreeTierLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  anonymousId: string
): Promise<{ allowed: boolean; remaining: number }> {
  const FREE_LIMIT = 1;

  const { data, error } = await (supabase
    .from('free_valuation_tracking') as ReturnType<typeof supabase.from>)
    .select('valuations_used')
    .eq('anonymous_id', anonymousId)
    .single();

  if (error || !data) {
    // No record = first time user
    return { allowed: true, remaining: FREE_LIMIT };
  }

  const trackingData = data as { valuations_used: number };
  const remaining = FREE_LIMIT - trackingData.valuations_used;
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
  };
}

/**
 * Record free valuation usage
 */
async function recordFreeValuationUsage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  anonymousId: string,
  request: NextRequest
): Promise<void> {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const now = new Date().toISOString();

  // Type cast needed for new tables not yet in generated Supabase types
  const trackingTable = supabase.from('free_valuation_tracking') as ReturnType<typeof supabase.from>;

  const { data: existing } = await trackingTable
    .select('id, valuations_used')
    .eq('anonymous_id', anonymousId)
    .single();

  const existingRecord = existing as { id: string; valuations_used: number } | null;

  if (existingRecord) {
    await trackingTable
      .update({
        valuations_used: existingRecord.valuations_used + 1,
        last_valuation_at: now,
        updated_at: now,
      } as never)
      .eq('id', existingRecord.id);
  } else {
    // Create new tracking record
    await trackingTable
      .insert({
        anonymous_id: anonymousId,
        ip_address: ip,
        user_agent: userAgent,
        valuations_used: 1,
        first_valuation_at: now,
        last_valuation_at: now,
      } as never);
  }
}
