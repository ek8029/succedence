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

    // TODO: Re-enable after running 004_ai_analyses_table.sql migration
    // For now, return empty data since ai_analyses table doesn't exist yet
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
      message: 'AI analysis history will be available after database migration'
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