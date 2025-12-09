import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Fetch valuations for user (type cast needed for new tables)
    const { data: valuations, error, count } = await (supabase
      .from('valuations') as ReturnType<typeof supabase.from>)
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch valuations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch valuation history' },
        { status: 500 }
      );
    }

    // Format response (type cast needed for new tables)
    const valuationsList = valuations as Array<Record<string, unknown>> | null;
    const formattedValuations = valuationsList?.map(v => ({
      id: v.id,
      businessName: v.business_name,
      industry: v.industry,
      sourceType: v.source_type,
      sourcePlatform: v.source_platform,
      sourceUrl: v.source_url,

      // Financials
      revenue: v.raw_revenue,
      sde: v.normalized_sde,
      ebitda: v.normalized_ebitda,
      askingPrice: v.raw_asking_price,

      // Valuation
      valuationLow: v.valuation_low,
      valuationMid: v.valuation_mid,
      valuationHigh: v.valuation_high,

      // Score
      dealQualityScore: v.deal_quality_score,
      mispricingPercent: v.mispricing_percent,

      // Location
      city: v.city,
      state: v.state,

      // Metadata
      createdAt: v.created_at,
      listingId: v.listing_id,
    })) || [];

    return NextResponse.json({
      valuations: formattedValuations,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Valuation history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch valuation history' },
      { status: 500 }
    );
  }
}
