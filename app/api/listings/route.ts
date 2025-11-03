import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ListingCreateInput, ListingDraftInput } from '@/lib/validation/listings'

// Helper function to convert database snake_case to frontend camelCase
function mapListingFromDb(dbListing: any) {
  return {
    id: dbListing.id,
    ownerUserId: dbListing.owner_user_id,
    source: dbListing.source,
    title: dbListing.title,
    description: dbListing.description,
    industry: dbListing.industry,
    city: dbListing.city,
    state: dbListing.state,
    revenue: dbListing.revenue,
    ebitda: dbListing.ebitda,
    cashFlow: dbListing.cash_flow,
    metricType: dbListing.metric_type,
    ownerHours: dbListing.owner_hours,
    employees: dbListing.employees,
    yearEstablished: dbListing.year_established,
    reasonForSelling: dbListing.reason_for_selling,
    price: dbListing.price,
    contactPhone: dbListing.contact_phone,
    contactEmail: dbListing.contact_email,
    contactOther: dbListing.contact_other,
    sourceUrl: dbListing.source_url,
    sourceWebsite: dbListing.source_website,
    sourceId: dbListing.source_id,
    brokerName: dbListing.broker_name,
    brokerCompany: dbListing.broker_company,
    brokerPhone: dbListing.broker_phone,
    brokerEmail: dbListing.broker_email,
    status: dbListing.status,
    brokerProfileId: dbListing.broker_profile_id,
    createdAt: dbListing.created_at,
    updatedAt: dbListing.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Use service client for public listings to bypass RLS for testing
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const q = searchParams.get('q')
    const industries = searchParams.get('industries')?.split(',').filter(Boolean)
    const states = searchParams.get('states')?.split(',').filter(Boolean)
    const minRevenue = searchParams.get('min_revenue')
    const priceMax = searchParams.get('price_max')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const status = searchParams.get('status') // draft, active, etc.
    const myListings = searchParams.get('my_listings') === 'true'

    // If requesting user's own listings/drafts, check authentication
    if (myListings) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Use service client to bypass RLS for user's own listings
      const serviceSupabase = createServiceClient()
      let query = serviceSupabase
        .from('listings')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('updated_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data: listings, error } = await query

      if (error) {
        console.error('Error fetching user listings:', error)
        return NextResponse.json(
          { error: 'Failed to fetch listings' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        listings: (listings || []).map(mapListingFromDb),
        pagination: {
          page: 1,
          pageSize: listings?.length || 0,
          total: listings?.length || 0,
          totalPages: 1
        }
      })
    }

    // Build query for public listings
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
      listings: (listings || []).map(mapListingFromDb),
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
    // Use draft schema since all new listings start as drafts
    const validatedData = ListingDraftInput.parse(body)

    // Try using the regular client instead of service client
    // This will use RLS but should work with the policies we set up
    const { data: listing, error: createError } = await (supabase
      .from('listings') as any)
      .insert({
        owner_user_id: user.id,
        source: validatedData.source || 'manual',
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
        contact_phone: validatedData.contact_phone,
        contact_email: validatedData.contact_email,
        contact_other: validatedData.contact_other,
        broker_profile_id: (validatedData as any).broker_profile_id || null,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, status, created_at')
      .single()

    if (createError) {
      console.error('Error creating listing:', createError)
      console.error('Error details:', {
        message: createError.message,
        details: createError.details,
        hint: createError.hint,
        code: createError.code
      })
      return NextResponse.json(
        {
          error: 'Failed to create listing',
          details: createError.message
        },
        { status: 500 }
      )
    }

    const created = listing as any;
    return NextResponse.json({
      message: 'Listing created successfully',
      listing: {
        id: created?.id,
        status: created?.status,
        created_at: created?.created_at
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
