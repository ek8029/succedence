import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ListingCreateInput } from '@/lib/validation/listings'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const q = searchParams.get('q')
    const industries = searchParams.get('industries')?.split(',').filter(Boolean)
    const states = searchParams.get('states')?.split(',').filter(Boolean)
    const minRevenue = searchParams.get('min_revenue')
    const priceMax = searchParams.get('price_max')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    // Build query
    let query = supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })

    // Apply filters
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
    }

    if (industries && industries.length > 0) {
      query = query.in('industry', industries)
    }

    if (states && states.length > 0) {
      query = query.in('state', states)
    }

    if (minRevenue) {
      const revenue = parseInt(minRevenue)
      if (!isNaN(revenue)) {
        query = query.gte('revenue', revenue)
      }
    }

    if (priceMax) {
      const price = parseInt(priceMax)
      if (!isNaN(price)) {
        query = query.lte('price', price)
      }
    }

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data: listings, error, count } = await query

    if (error) {
      console.error('Error fetching listings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch listings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      listings: listings || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    })
  } catch (error) {
    console.error('Error in GET listings:', error)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = ListingCreateInput.parse(body)

    // Use service client for write operations (bypasses RLS)
    const serviceSupabase = createServiceClient()

    // Create the listing
    const { data: listing, error: createError } = await serviceSupabase
      .from('listings')
      .insert({
        owner_user_id: user.id,
        source: validatedData.source,
        title: validatedData.title,
        description: validatedData.description,
        industry: validatedData.industry,
        city: validatedData.city,
        state: validatedData.state,
        revenue: validatedData.revenue,
        ebitda: validatedData.ebitda,
        metric_type: validatedData.metric_type,
        owner_hours: validatedData.owner_hours,
        employees: validatedData.employees,
        price: validatedData.price,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, status, created_at')
      .single()

    if (createError) {
      console.error('Error creating listing:', createError)
      return NextResponse.json(
        { error: 'Failed to create listing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Listing created successfully',
      listing: {
        id: listing.id,
        status: listing.status,
        created_at: listing.created_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error in listings POST:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
