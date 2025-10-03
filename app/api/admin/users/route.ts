import { NextRequest, NextResponse } from 'next/server'
import { createClient, createBackgroundServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Schema for creating new admin
const createAdminSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6)
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user and verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use background service client to bypass RLS for admin check
    const serviceClient = createBackgroundServiceClient()

    // Check if user is admin
    const { data: userData, error: userError } = await serviceClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || (userData as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all users with their roles and plans using background service client to bypass RLS
    const { data: users, error: usersError } = await serviceClient
      .from('users')
      .select('id, name, email, role, plan, status, created_at')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Error in admin users GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user and verify admin role
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

    if (userError || (userData as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, password } = createAdminSchema.parse(body)

    // Use background service client for admin operations
    const serviceClient = createBackgroundServiceClient()

    // Create admin user using Supabase Auth Admin API
    const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'admin'
      }
    })

    if (createError) {
      console.error('Error creating admin user:', createError)
      return NextResponse.json(
        { error: createError.message || 'Failed to create admin user' },
        { status: 400 }
      )
    }

    // Insert user data into users table
    const { error: insertError } = await (serviceClient
      .from('users') as any)
      .insert({
        id: newUser.user.id,
        name,
        email,
        role: 'admin'
      })

    if (insertError) {
      console.error('Error inserting user data:', insertError)
      // Try to clean up the auth user if database insert failed
      await serviceClient.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json(
        { error: 'Failed to complete admin creation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: newUser.user.id,
        email,
        name,
        role: 'admin'
      }
    })

  } catch (error) {
    console.error('Error in admin users POST:', error)

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

// Delete admin user
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user and verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use background service client to bypass RLS
    const serviceClient = createBackgroundServiceClient()

    // Check if user is admin using service client
    const { data: userData, error: userError } = await serviceClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || (userData as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Prevent self-deletion
    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // First, delete from Supabase Auth (this will cascade to auth-dependent tables)
    const { error: deleteAuthError } = await serviceClient.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError)
      return NextResponse.json(
        { error: `Failed to delete auth user: ${deleteAuthError.message}` },
        { status: 500 }
      )
    }

    // Then delete from users table (CASCADE will automatically delete all related records)
    const { error: deleteUserError } = await serviceClient
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteUserError) {
      console.error('Error deleting user from users table:', deleteUserError)
      // Log detailed error info
      console.error('Delete error details:', {
        code: deleteUserError.code,
        message: deleteUserError.message,
        details: deleteUserError.details,
        hint: deleteUserError.hint
      })

      return NextResponse.json(
        {
          error: 'Failed to delete user from database',
          details: deleteUserError.message,
          hint: deleteUserError.hint || 'Check foreign key constraints and RLS policies'
        },
        { status: 500 }
      )
    }

    console.log(`Successfully deleted user ${userId}`)

    return NextResponse.json({
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Error in admin users DELETE:', error)

    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}