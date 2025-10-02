import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const brokerProfileUpdateSchema = z.object({
  displayName: z.string().min(1).optional(),
  headshotUrl: z.string().url().optional().nullable(),
  bio: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  company: z.string().optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  workAreas: z.array(z.string()).optional().nullable(),
  specialties: z.array(z.string()).optional().nullable(),
  yearsExperience: z.number().int().min(0).optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  isPublic: z.string().optional(),
  customSections: z.record(z.any()).optional().nullable(),
})

// GET single broker profile (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || (userData as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { data: broker, error: brokerError } = await supabase
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
      .eq('id', params.id)
      .single()

    if (brokerError) {
      console.error('Error fetching broker profile:', brokerError)
      return NextResponse.json(
        { error: 'Broker profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ broker })

  } catch (error) {
    console.error('Error in GET broker:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update broker profile (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || (userData as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const brokerData = brokerProfileUpdateSchema.parse(body)

    // Map to database column names
    const dbData: Record<string, any> = {}
    if (brokerData.displayName !== undefined) dbData.display_name = brokerData.displayName
    if (brokerData.headshotUrl !== undefined) dbData.headshot_url = brokerData.headshotUrl
    if (brokerData.bio !== undefined) dbData.bio = brokerData.bio
    if (brokerData.phone !== undefined) dbData.phone = brokerData.phone
    if (brokerData.email !== undefined) dbData.email = brokerData.email
    if (brokerData.company !== undefined) dbData.company = brokerData.company
    if (brokerData.licenseNumber !== undefined) dbData.license_number = brokerData.licenseNumber
    if (brokerData.workAreas !== undefined) dbData.work_areas = brokerData.workAreas
    if (brokerData.specialties !== undefined) dbData.specialties = brokerData.specialties
    if (brokerData.yearsExperience !== undefined) dbData.years_experience = brokerData.yearsExperience
    if (brokerData.websiteUrl !== undefined) dbData.website_url = brokerData.websiteUrl
    if (brokerData.linkedinUrl !== undefined) dbData.linkedin_url = brokerData.linkedinUrl
    if (brokerData.isPublic !== undefined) dbData.is_public = brokerData.isPublic
    if (brokerData.customSections !== undefined) dbData.custom_sections = brokerData.customSections

    // Update broker profile
    const { data: broker, error: updateError } = await (supabase
      .from('broker_profiles') as any)
      .update(dbData)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating broker profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to update broker profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Broker profile updated successfully',
      broker
    })

  } catch (error) {
    console.error('Error in PUT broker:', error)

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

// DELETE broker profile (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || (userData as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get broker profile to find user_id
    const { data: broker, error: brokerError } = await supabase
      .from('broker_profiles')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (brokerError || !broker) {
      return NextResponse.json(
        { error: 'Broker profile not found' },
        { status: 404 }
      )
    }

    // Delete broker profile
    const { error: deleteError } = await supabase
      .from('broker_profiles')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting broker profile:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete broker profile' },
        { status: 500 }
      )
    }

    // Optionally update user role back to buyer or seller
    // (commented out - you may want to keep broker role or add logic to determine new role)
    // await supabase
    //   .from('users')
    //   .update({ role: 'buyer' })
    //   .eq('id', broker.user_id)

    return NextResponse.json({
      message: 'Broker profile deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE broker:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
