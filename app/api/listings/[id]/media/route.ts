import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { uploadListingMedia, deleteListingMedia, validateMediaFile, extractStoragePath } from '@/lib/storage/listingMedia'

// Helper to check if user owns the listing
async function checkListingOwnership(listingId: string, userId: string): Promise<{ isOwner: boolean; status?: string }> {
  const serviceSupabase = createServiceClient()

  const { data: listing, error } = await serviceSupabase
    .from('listings')
    .select('owner_user_id, status')
    .eq('id', listingId)
    .single()

  if (error || !listing) {
    return { isOwner: false }
  }

  // Type assertion to fix TypeScript error
  const listingData = listing as { owner_user_id: string | null; status: string }

  return {
    isOwner: listingData.owner_user_id === userId,
    status: listingData.status
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: listingId } = params

    // Get authenticated user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check ownership and listing status
    const { isOwner, status } = await checkListingOwnership(listingId, user.id)

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Only allow uploads for draft or rejected listings
    if (!['draft', 'rejected'].includes(status || '')) {
      return NextResponse.json(
        { error: 'Media can only be uploaded to draft or rejected listings' },
        { status: 400 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateMediaFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Upload to storage
    const { url, storagePath } = await uploadListingMedia(listingId, file)

    // Save media record to database
    const serviceSupabase = createServiceClient()
    const { data: mediaRecord, error: dbError } = await (serviceSupabase
      .from('listing_media') as any)
      .insert({
        listing_id: listingId,
        url: url,
        kind: 'image',
        created_at: new Date().toISOString()
      })
      .select('id, listing_id, url, kind, created_at')
      .single()

    if (dbError) {
      console.error('Error saving media record:', dbError)

      // Try to clean up uploaded file
      try {
        await deleteListingMedia(storagePath)
      } catch (cleanupError) {
        console.error('Error cleaning up uploaded file:', cleanupError)
      }

      return NextResponse.json(
        { error: 'Failed to save media record' },
        { status: 500 }
      )
    }

    const record = mediaRecord as any;
    return NextResponse.json({
      message: 'Media uploaded successfully',
      media: {
        id: record?.id,
        listing_id: record?.listing_id,
        url: record?.url,
        kind: record?.kind,
        created_at: record?.created_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error in media POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    // Parse request body to get media ID
    const body = await request.json()
    const { mediaId } = body

    if (!mediaId) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      )
    }

    // Get media record and check ownership
    const serviceSupabase = createServiceClient()
    const { data: mediaRecord, error: mediaError } = await serviceSupabase
      .from('listing_media')
      .select(`
        id,
        listing_id,
        url,
        listings!inner (
          owner_user_id,
          status
        )
      `)
      .eq('id', mediaId)
      .single()

    if (mediaError || !mediaRecord) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    const record = mediaRecord as any;

    // Check ownership
    if (record?.listings?.owner_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Check listing status
    if (!['draft', 'rejected'].includes(record?.listings?.status)) {
      return NextResponse.json(
        { error: 'Media can only be deleted from draft or rejected listings' },
        { status: 400 }
      )
    }

    // Extract storage path from URL
    const storagePath = extractStoragePath(record?.url)

    // Delete from database first
    const { error: deleteError } = await serviceSupabase
      .from('listing_media')
      .delete()
      .eq('id', mediaId)

    if (deleteError) {
      console.error('Error deleting media record:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete media record' },
        { status: 500 }
      )
    }

    // Delete from storage
    if (storagePath) {
      try {
        await deleteListingMedia(storagePath)
      } catch (storageError) {
        console.error('Error deleting from storage:', storageError)
        // Don't fail the request if storage deletion fails
      }
    }

    return NextResponse.json({
      message: 'Media deleted successfully'
    })

  } catch (error) {
    console.error('Error in media DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}