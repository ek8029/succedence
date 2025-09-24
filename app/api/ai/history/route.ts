import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const analysisType = searchParams.get('analysisType'); // Filter by specific analysis type
    const offset = (page - 1) * limit;

    let query = supabase
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
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by analysis type if specified
    if (analysisType) {
      query = query.eq('analysis_type', analysisType);
    }

    const { data: aiHistory, error } = await query;

    if (error) {
      console.error('Error fetching AI history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch AI analysis history' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('ai_analyses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authUser.id);

    if (analysisType) {
      countQuery = countQuery.eq('analysis_type', analysisType);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting AI history:', countError);
    }

    // Group by listing for summary view
    const listingSummary = aiHistory?.reduce((acc: any, analysis: any) => {
      const listingId = analysis.listing_id;
      if (!acc[listingId]) {
        acc[listingId] = {
          listing: analysis.listings,
          analysisTypes: [],
          totalAnalyses: 0,
          lastAnalysisAt: analysis.created_at
        };
      }
      acc[listingId].analysisTypes.push(analysis.analysis_type);
      acc[listingId].totalAnalyses++;
      if (new Date(analysis.created_at) > new Date(acc[listingId].lastAnalysisAt)) {
        acc[listingId].lastAnalysisAt = analysis.created_at;
      }
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      aiHistory: aiHistory || [],
      listingSummary: Object.values(listingSummary || {}),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

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

    const supabase = createClient();

    // Get specific analysis
    const { data: analysis, error } = await supabase
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