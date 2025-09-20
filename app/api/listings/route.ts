import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

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
      .order('updatedAt', { ascending: false })

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

const createListingSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  industry: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  revenue: z.number().positive().optional(),
  ebitda: z.number().optional(),
  metricType: z.string().optional(),
  ownerHours: z.number().optional(),
  employees: z.number().optional(),
  price: z.number().positive().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const listingData = createListingSchema.parse(body)

    // Create listing
    const { data, error } = await supabase
      .from('listings')
      .insert({
        ...listingData,
        source: 'user_created',
        status: 'active',
        ownerUserId: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating listing:', error)
      return NextResponse.json(
        { error: 'Failed to create listing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Listing created successfully',
      listing: data
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST listings:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
