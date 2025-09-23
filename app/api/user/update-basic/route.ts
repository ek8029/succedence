import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateBasicSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['user', 'admin']).optional(),
  plan: z.enum(['free', 'starter', 'professional', 'enterprise', 'beta']).optional()
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateBasicSchema.parse(body);

    // Check if user is admin for role/plan updates
    const { data: currentUser } = await (supabase as any)
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    // Prepare update data
    const updateData: any = {
      name: validatedData.name,
      email: validatedData.email
    };

    // Only allow admin users to update role and plan
    if (currentUser?.role === 'admin') {
      if (validatedData.role) {
        updateData.role = validatedData.role;
      }
      if (validatedData.plan) {
        updateData.plan = validatedData.plan;
      }
    }

    // Update user's basic info in the database
    const { error: updateError } = await (supabase as any)
      .from('users')
      .update(updateData)
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user basic info:', updateError);
      return NextResponse.json(
        { error: 'Failed to update basic information' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Basic information updated successfully',
      data: updateData
    });

  } catch (error) {
    console.error('Error in update-basic API:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}