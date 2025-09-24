import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateBasicSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['buyer', 'seller', 'admin']).optional(),
  plan: z.enum(['free', 'starter', 'professional', 'enterprise']).optional(),
  targetUserId: z.string().optional() // For admin editing other users
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

    // Check if user is admin for role/plan updates and get current email
    const { data: currentUser } = await (supabase as any)
      .from('users')
      .select('role, email')
      .eq('id', user.id)
      .single();

    const isAdmin = currentUser?.role === 'admin';
    const targetUserId = validatedData.targetUserId || user.id;
    const isEditingOtherUser = targetUserId !== user.id;

    // Only admins can edit other users
    if (isEditingOtherUser && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized to edit other users' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {
      name: validatedData.name,
      email: validatedData.email
    };

    // Only allow admin users to update role and plan
    if (isAdmin) {
      if (validatedData.role) {
        updateData.role = validatedData.role;
      }
      if (validatedData.plan) {
        updateData.plan = validatedData.plan;
      }
    }

    // For non-admin users changing their email, we need to handle email verification
    const emailChanged = validatedData.email !== currentUser?.email;
    if (emailChanged && !isAdmin && !isEditingOtherUser) {
      // Update email in Supabase Auth for regular users
      const { error: authUpdateError } = await supabase.auth.updateUser({
        email: validatedData.email
      });

      if (authUpdateError) {
        console.error('Error updating email in auth:', authUpdateError);
        return NextResponse.json(
          { error: 'Failed to update email. Please try again.', requiresVerification: true },
          { status: 400 }
        );
      }

      // Don't update email in database yet - it will be updated after verification
      delete updateData.email;
    }

    // Log what we're updating for debugging
    console.log('Updating user with ID:', targetUserId);
    console.log('Update data:', updateData);

    // Update user's basic info in the database
    const { error: updateError } = await (supabase as any)
      .from('users')
      .update(updateData)
      .eq('id', targetUserId);

    if (updateError) {
      console.error('Error updating user basic info:', updateError);

      // Handle specific enum value errors
      if (updateError.code === '22P02' && updateError.message.includes('invalid input value for enum')) {
        return NextResponse.json(
          { error: `Invalid value provided. ${updateError.message}` },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to update basic information' },
        { status: 500 }
      );
    }

    // Verify the update worked
    const { data: updatedUser } = await (supabase as any)
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single();

    console.log('User after update:', updatedUser);

    const message = emailChanged && !isAdmin && !isEditingOtherUser
      ? 'Basic information updated successfully. Please check your email to verify your new email address.'
      : 'Basic information updated successfully';

    return NextResponse.json({
      success: true,
      message,
      data: updateData,
      requiresEmailVerification: emailChanged && !isAdmin && !isEditingOtherUser
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