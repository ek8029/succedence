import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const brokerProfileCreateSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string().min(1),
  headshotUrl: z.string().url().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  company: z.string().optional(),
  licenseNumber: z.string().optional(),
  workAreas: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  yearsExperience: z.number().int().min(0).optional(),
  websiteUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  isPublic: z.string().optional(),
  customSections: z.record(z.any()).optional(),
})

// GET all broker profiles (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service client to check admin role (bypasses RLS)
    const serviceSupabase = createServiceClient()
    const { data: userData, error: userError } = await serviceSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || (userData as any).role !== 'admin') {
      console.error('Admin check failed:', { userError, role: (userData as any)?.role, userId: user.id })
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Fetch all broker profiles with user data - use service client to bypass RLS
    const { data: brokers, error: brokersError } = await serviceSupabase
      .from('broker_profiles')
      .select(`
        *,
        users:user_id (
          id,
          email,
          name,
          role,
          status
        )
      `)
      .order('created_at', { ascending: false })

    if (brokersError) {
      console.error('Error fetching broker profiles:', brokersError)
      return NextResponse.json(
        { error: 'Failed to fetch broker profiles' },
        { status: 500 }
      )
    }

    return NextResponse.json({ brokers })

  } catch (error) {
    console.error('Error in GET brokers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create broker profile (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service client to check admin role (bypasses RLS)
    const serviceSupabase = createServiceClient()
    const { data: userData, error: userError } = await serviceSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || (userData as any).role !== 'admin') {
      console.error('Admin check failed:', { userError, role: (userData as any)?.role, userId: user.id })
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const brokerData = brokerProfileCreateSchema.parse(body)

    // Check if user exists and update their role to broker
    const { data: targetUser, error: targetUserError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', brokerData.userId)
      .single()

    if (targetUserError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user role to broker
    const { error: roleUpdateError } = await (supabase
      .from('users') as any)
      .update({ role: 'broker' })
      .eq('id', brokerData.userId)

    if (roleUpdateError) {
      console.error('Error updating user role:', roleUpdateError)
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      )
    }

    // Map to database column names
    const dbData = {
      user_id: brokerData.userId,
      display_name: brokerData.displayName,
      headshot_url: brokerData.headshotUrl,
      bio: brokerData.bio,
      phone: brokerData.phone,
      email: brokerData.email,
      company: brokerData.company,
      license_number: brokerData.licenseNumber,
      work_areas: brokerData.workAreas,
      specialties: brokerData.specialties,
      years_experience: brokerData.yearsExperience,
      website_url: brokerData.websiteUrl,
      linkedin_url: brokerData.linkedinUrl,
      is_public: brokerData.isPublic ?? 'true',
      custom_sections: brokerData.customSections,
    }

    // Create broker profile
    const { data: broker, error: createError } = await (supabase
      .from('broker_profiles') as any)
      .insert(dbData)
      .select()
      .single()

    if (createError) {
      console.error('Error creating broker profile:', createError)
      return NextResponse.json(
        { error: 'Failed to create broker profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Broker profile created successfully',
      broker
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST broker:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
