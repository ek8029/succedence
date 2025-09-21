import { createServiceClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

const BUCKET_NAME = 'listing-media'

// Helper to get file extension from filename or mime type
function getFileExtension(filename: string, mimeType: string): string {
  const extensionFromName = filename.split('.').pop()?.toLowerCase()

  if (extensionFromName && ['jpg', 'jpeg', 'png', 'webp'].includes(extensionFromName)) {
    return extensionFromName
  }

  // Fallback to mime type
  const mimeExtensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  }

  return mimeExtensions[mimeType] || 'jpg'
}

// Upload a file to Supabase Storage
export async function uploadListingMedia(
  listingId: string,
  file: File
): Promise<{ url: string; storagePath: string }> {
  const supabase = createServiceClient()

  // Generate unique filename
  const fileId = uuidv4()
  const extension = getFileExtension(file.name, file.type)
  const storagePath = `${listingId}/${fileId}.${extension}`

  // Convert File to ArrayBuffer for upload
  const arrayBuffer = await file.arrayBuffer()

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false
    })

  if (error) {
    console.error('Storage upload error:', error)
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  if (!data?.path) {
    throw new Error('Upload succeeded but no path returned')
  }

  // Generate public URL (we'll use signed URLs for access)
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath)

  return {
    url: publicUrl,
    storagePath: data.path
  }
}

// Delete a file from Supabase Storage
export async function deleteListingMedia(storagePath: string): Promise<void> {
  const supabase = createServiceClient()

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([storagePath])

  if (error) {
    console.error('Storage delete error:', error)
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

// Generate a signed URL for private access
export async function getSignedMediaUrl(
  storagePath: string,
  expiresIn: number = 604800 // 7 days in seconds
): Promise<string> {
  const supabase = createServiceClient()

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, expiresIn)

  if (error) {
    console.error('Signed URL error:', error)
    throw new Error(`Failed to generate signed URL: ${error.message}`)
  }

  if (!data?.signedUrl) {
    throw new Error('No signed URL returned')
  }

  return data.signedUrl
}

// Generate signed URLs for multiple media items
export async function getSignedMediaUrls(
  storagePaths: string[],
  expiresIn: number = 604800
): Promise<Record<string, string>> {
  const supabase = createServiceClient()

  const signedUrls: Record<string, string> = {}

  // Process in batches to avoid rate limits
  const batchSize = 10
  for (let i = 0; i < storagePaths.length; i += batchSize) {
    const batch = storagePaths.slice(i, i + batchSize)

    const promises = batch.map(async (path) => {
      try {
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(path, expiresIn)

        if (error) {
          console.error(`Signed URL error for ${path}:`, error)
          return null
        }

        return { path, url: data?.signedUrl }
      } catch (error) {
        console.error(`Exception generating signed URL for ${path}:`, error)
        return null
      }
    })

    const results = await Promise.all(promises)

    results.forEach(result => {
      if (result?.url) {
        signedUrls[result.path] = result.url
      }
    })
  }

  return signedUrls
}

// Extract storage path from public URL
export function extractStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.findIndex(part => part === BUCKET_NAME)

    if (bucketIndex === -1 || bucketIndex >= pathParts.length - 1) {
      return null
    }

    // Return everything after the bucket name
    return pathParts.slice(bucketIndex + 1).join('/')
  } catch (error) {
    console.error('Error extracting storage path:', error)
    return null
  }
}

// Validate file before upload
export function validateMediaFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${maxSize / 1024 / 1024}MB`
    }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be one of: ${allowedTypes.join(', ')}`
    }
  }

  return { valid: true }
}

// Create storage bucket if it doesn't exist (for setup)
export async function ensureListingMediaBucket(): Promise<void> {
  const supabase = createServiceClient()

  try {
    // Try to get bucket info
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('Error listing buckets:', listError)
      return
    }

    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME)

    if (!bucketExists) {
      // Create bucket
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false, // Keep private, use signed URLs
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 10 * 1024 * 1024 // 10MB
      })

      if (createError) {
        console.error('Error creating bucket:', createError)
      } else {
        console.log(`Created storage bucket: ${BUCKET_NAME}`)
      }
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error)
  }
}