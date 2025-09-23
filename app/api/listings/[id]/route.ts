import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ListingUpdateInput, ListingDraftInput, ListingRequestPublishInput, ListingWithMedia } from '@/lib/validation/listings'
import { getSignedMediaUrls, extractStoragePath } from '@/lib/storage/listingMedia'

// Helper to check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  // Check if user has admin role using regular client
  const supabase = createClient()
  const { data: user, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return false
  }

  return (user as any)?.role === 'admin'
}

// Helper to check if user owns the listing
async function checkListingOwnership(listingId: string, userId: string): Promise<{ isOwner: boolean; listing?: any }> {
  const supabase = createClient()

  const { data: listing, error } = await supabase
    .from('listings')
    .select('owner_user_id, status')
    .eq('id', listingId)
    .single()

  if (error || !listing) {
    return { isOwner: false }
  }

  return {
    isOwner: (listing as any)?.owner_user_id === userId,
    listing
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get authenticated user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check ownership or admin status
    const { isOwner, listing: basicListing } = await checkListingOwnership(id, user.id)
    const userIsAdmin = await isAdmin(user.id)

    if (!isOwner && !userIsAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Fetch full listing with media using regular client
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select(`
        *,
        listing_media (
          id,
          listing_id,
          url,
          kind,
          created_at
        )
      `)
      .eq('id', id)
      .single()

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    const listingData = listing as any;

    // Generate signed URLs for media
    if (listingData.listing_media && listingData.listing_media.length > 0) {
      const storagePaths = listingData.listing_media
        .map((media: any) => extractStoragePath(media.url))
        .filter(Boolean) as string[]

      if (storagePaths.length > 0) {
        try {
          const signedUrls = await getSignedMediaUrls(storagePaths)

          listingData.listing_media = listingData.listing_media.map((media: any) => {
            const storagePath = extractStoragePath(media.url)
            return {
              ...media,
              signed_url: storagePath ? signedUrls[storagePath] : media.url
            }
          })
        } catch (error) {
          console.error('Error generating signed URLs:', error)
          // Continue without signed URLs
        }
      }
    }

    return NextResponse.json({
      listing: {
        id: listingData.id,
        owner_user_id: listingData.owner_user_id,
        source: listingData.source,
        title: listingData.title,
        description: listingData.description,
        industry: listingData.industry,
        city: listingData.city,
        state: listingData.state,
        revenue: listingData.revenue,
        ebitda: listingData.ebitda,
        metric_type: listingData.metric_type,
        owner_hours: listingData.owner_hours,
        employees: listingData.employees,
        price: listingData.price,
        status: listingData.status,
        created_at: listingData.created_at,
        updated_at: listingData.updated_at,
        media: listingData.listing_media || [],
        owner: userIsAdmin ? listingData.users : undefined
      }
    })

  } catch (error) {
    console.error('Error in listing GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get authenticated user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check ownership
    const { isOwner, listing } = await checkListingOwnership(id, user.id)

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Check if listing can be edited (only draft or rejected)
    if (!['draft', 'rejected'].includes(listing.status)) {
      return NextResponse.json(
        { error: 'Listing cannot be edited in current status' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Check if this is a draft update
    if (body.action === 'update_draft') {
      const { action, ...updateData } = body;

      // Validate draft data (allows partial data)
      const validatedData = ListingDraftInput.parse(updateData);

      // Update listing with new data
      const serviceSupabase = createServiceClient()
      const { data: updatedListing, error: updateError } = await (serviceSupabase
        .from('listings') as any)
        .update({
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
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('id, status, updated_at')
        .single()

      if (updateError) {
        console.error('Error updating draft:', updateError)
        return NextResponse.json(
          { error: 'Failed to update draft' },
          { status: 500 }
        )
      }

      const updated = updatedListing as any;
      return NextResponse.json({
        message: 'Draft updated successfully',
        listing: {
          id: updated?.id,
          status: updated?.status,
          updated_at: updated?.updated_at
        }
      })
    }

    // Check if this is a request to publish
    if (body.action === 'request_publish') {
      const validatedRequest = ListingRequestPublishInput.parse(body)

      // Update status or add a flag to indicate publish request
      const serviceSupabase = createServiceClient()
      const { error: updateError } = await (serviceSupabase
        .from('listings') as any)
        .update({
          status: 'pending_review', // You might want to add this status
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) {
        console.error('Error requesting publish:', updateError)
        return NextResponse.json(
          { error: 'Failed to request publish' },
          { status: 500 }
        )
      }

      // TODO: Create audit log entry for publish request
      // await serviceSupabase.from('audit_logs').insert({
      //   user_id: user.id,
      //   action: 'request_publish',
      //   resource_type: 'listing',
      //   resource_id: id,
      //   created_at: new Date().toISOString()
      // })

      return NextResponse.json({
        message: 'Publish request submitted successfully'
      })
    }

    // Regular update
    const validatedData = ListingUpdateInput.parse(body)

    // Update listing
    const serviceSupabase = createServiceClient()
    const { data: updatedListing, error: updateError } = await (serviceSupabase
      .from('listings') as any)
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, status, updated_at')
      .single()

    if (updateError) {
      console.error('Error updating listing:', updateError)
      return NextResponse.json(
        { error: 'Failed to update listing' },
        { status: 500 }
      )
    }

    const updated = updatedListing as any;
    return NextResponse.json({
      message: 'Listing updated successfully',
      listing: {
        id: updated?.id,
        status: updated?.status,
        updated_at: updated?.updated_at
      }
    })

  } catch (error) {
    console.error('Error in listing PATCH:', error)

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get authenticated user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check ownership or admin status
    const { isOwner } = await checkListingOwnership(id, user.id)
    const userIsAdmin = await isAdmin(user.id)

    if (!isOwner && !userIsAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Soft delete by setting status to 'archived'
    const serviceSupabase = createServiceClient()
    const { error: deleteError } = await (serviceSupabase
      .from('listings') as any)
      .update({
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting listing:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete listing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Listing deleted successfully'
    })

  } catch (error) {
    console.error('Error in listing DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}