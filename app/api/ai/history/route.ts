import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getUserWithRole } from '@/lib/auth/permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await getUserWithRole();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const analysisType = url.searchParams.get('analysisType') || '';
    const listingId = url.searchParams.get('listingId') || '';
    const offset = (page - 1) * limit;

    const serviceSupabase = createServiceClient();

    try {
      // Build query for AI history
      let historyQuery = (serviceSupabase as any)
        .from('ai_analyses')
        .select(`
          *,
          listings!inner (
            id,
            title,
            industry,
            city,
            state,
            price,
            revenue,
            status
          )
        `)
        .eq('user_id', authUser.id);

      if (analysisType) {
        historyQuery = historyQuery.eq('analysis_type', analysisType);
      }

      if (listingId) {
        historyQuery = historyQuery.eq('listing_id', listingId);
      }

      // Get paginated AI history
      const { data: aiHistory, error: historyError } = await historyQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (historyError) {
        console.error('Error fetching AI history:', historyError);
        throw historyError;
      }

      // Get total count for pagination
      let countQuery = (serviceSupabase as any)
        .from('ai_analyses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authUser.id);

      if (analysisType) {
        countQuery = countQuery.eq('analysis_type', analysisType);
      }

      if (listingId) {
        countQuery = countQuery.eq('listing_id', listingId);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error('Error getting AI history count:', countError);
        throw countError;
      }

      // Get listing summary (grouped by listing)
      const { data: listingSummary, error: summaryError } = await (serviceSupabase as any)
        .from('ai_analyses')
        .select(`
          listing_id,
          analysis_type,
          created_at,
          listings!inner (
            id,
            title,
            industry,
            city,
            state,
            price,
            revenue,
            status
          )
        `)
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (summaryError) {
        console.error('Error fetching listing summary:', summaryError);
        throw summaryError;
      }

      // Group by listing for summary view
      const groupedSummary = listingSummary?.reduce((acc: any, item: any) => {
        const listingId = item.listing_id;
        if (!acc[listingId]) {
          acc[listingId] = {
            listing: item.listings,
            analysisTypes: [],
            totalAnalyses: 0,
            lastAnalysisAt: item.created_at
          };
        }

        if (!acc[listingId].analysisTypes.includes(item.analysis_type)) {
          acc[listingId].analysisTypes.push(item.analysis_type);
        }

        acc[listingId].totalAnalyses += 1;

        if (new Date(item.created_at) > new Date(acc[listingId].lastAnalysisAt)) {
          acc[listingId].lastAnalysisAt = item.created_at;
        }

        return acc;
      }, {});

      const listingSummaryArray = Object.values(groupedSummary || {});

      return NextResponse.json({
        success: true,
        aiHistory: aiHistory || [],
        listingSummary: listingSummaryArray,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      });

    } catch (dbError) {
      console.error('Database error in AI history:', dbError);
      // Fallback to empty response if database queries fail
      return NextResponse.json({
        success: true,
        aiHistory: [],
        listingSummary: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        },
        message: 'AI analysis history temporarily unavailable'
      });
    }

  } catch (error) {
    console.error('Error in AI history API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get specific AI analysis by ID
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await getUserWithRole();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { analysisId } = await request.json();

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    const serviceSupabase = createServiceClient();

    // Get specific analysis
    const { data: analysis, error } = await (serviceSupabase as any)
      .from('ai_analyses')
      .select(`
        *,
        listings!inner (
          id,
          title,
          industry,
          city,
          state,
          price,
          revenue,
          description,
          status
        )
      `)
      .eq('id', analysisId)
      .eq('user_id', authUser.id)
      .single();

    if (error) {
      console.error('Error fetching AI analysis:', error);
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Error in get AI analysis API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}