import { z } from 'zod'

// File upload constraints
export const FileUploadConstraints = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  allowedExtensions: ['jpg', 'jpeg', 'png', 'webp']
} as const

// Base listing fields with validation
const baseListingSchema = {
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),

  description: z.string()
    .min(1, 'Description is required')
    .max(5000, 'Description must be less than 5000 characters'),

  industry: z.string()
    .min(1, 'Industry is required')
    .max(100, 'Industry must be less than 100 characters'),

  city: z.string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters'),

  state: z.string()
    .min(1, 'State is required')
    .max(100, 'State must be less than 100 characters'),

  revenue: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? undefined : Number(val),
    z.number()
      .int('Revenue must be a whole number')
      .min(0, 'Revenue must be positive')
      .max(1000000000, 'Revenue must be less than $1B')
      .optional()
  ),

  ebitda: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? undefined : Number(val),
    z.number()
      .int('EBITDA must be a whole number')
      .min(-100000000, 'EBITDA must be greater than -$100M')
      .max(1000000000, 'EBITDA must be less than $1B')
      .optional()
  ),

  metric_type: z.string()
    .max(50, 'Metric type must be less than 50 characters')
    .optional()
    .nullable(),

  owner_hours: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? undefined : Number(val),
    z.number()
      .int('Owner hours must be a whole number')
      .min(0, 'Owner hours must be positive')
      .max(168, 'Owner hours cannot exceed 168 hours per week')
      .optional()
  ),

  employees: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? undefined : Number(val),
    z.number()
      .int('Employee count must be a whole number')
      .min(0, 'Employee count must be positive')
      .max(100000, 'Employee count must be less than 100,000')
      .optional()
  ),

  price: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? undefined : Number(val),
    z.number()
      .int('Price must be a whole number')
      .min(0, 'Price must be positive')
      .max(10000000000, 'Price must be less than $10B')
      .optional()
  )
}

// Schema for creating a new listing
export const ListingCreateInput = z.object({
  ...baseListingSchema,
  source: z.string()
    .max(100, 'Source must be less than 100 characters')
    .default('user_submission')
})

// Schema for creating/updating drafts (all fields optional - ultra permissive)
export const ListingDraftInput = z.object({
  title: z.string().max(200, 'Title must be less than 200 characters').optional().nullable(),

  description: z.string().max(5000, 'Description must be less than 5000 characters').optional().nullable(),

  industry: z.string().max(100, 'Industry must be less than 100 characters').optional().nullable(),

  city: z.string().max(100, 'City must be less than 100 characters').optional().nullable(),

  state: z.string().max(100, 'State must be less than 100 characters').optional().nullable(),

  revenue: z.number().int().min(0).max(1000000000).optional().nullable(),

  ebitda: z.number().int().min(-100000000).max(1000000000).optional().nullable(),

  metric_type: z.string().max(50).optional().nullable(),

  owner_hours: z.number().int().min(0).max(168).optional().nullable(),

  employees: z.number().int().min(0).max(100000).optional().nullable(),

  price: z.number().int().min(0).max(10000000000).optional().nullable(),

  source: z.string().max(100).default('manual').optional()
})

// Schema for updating an existing listing
export const ListingUpdateInput = z.object({
  ...baseListingSchema
}).partial()

// Schema for request publish action
export const ListingRequestPublishInput = z.object({
  action: z.literal('request_publish')
})

// Schema for admin publish/reject actions
export const AdminPublishInput = z.object({
  status: z.enum(['active', 'rejected'])
})

export const AdminRejectInput = z.object({
  reason: z.string()
    .min(1, 'Rejection reason is required')
    .max(500, 'Reason must be less than 500 characters')
    .optional()
})

// File upload validation
export const FileUploadInput = z.object({
  file: z.instanceof(File)
    .refine(
      (file) => file.size <= FileUploadConstraints.maxSize,
      `File size must be less than ${FileUploadConstraints.maxSize / 1024 / 1024}MB`
    )
    .refine(
      (file) => FileUploadConstraints.allowedTypes.includes(file.type as any),
      `File type must be one of: ${FileUploadConstraints.allowedTypes.join(', ')}`
    )
})

// Listing with media type for API responses
export type ListingWithMedia = {
  id: string
  owner_user_id: string
  source: string
  title: string
  description: string
  industry: string
  city: string
  state: string
  revenue?: number
  ebitda?: number
  metric_type?: string
  owner_hours?: number
  employees?: number
  price?: number
  status: 'draft' | 'active' | 'rejected' | 'archived'
  created_at: string
  updated_at: string
  media?: Array<{
    id: string
    listing_id: string
    url: string
    kind: string
    created_at: string
  }>
  owner?: {
    id: string
    email: string
    first_name?: string
    last_name?: string
  }
}

// Browse filters schema
export const BrowseFiltersInput = z.object({
  q: z.string().optional(), // search query
  industries: z.array(z.string()).optional(),
  states: z.array(z.string()).optional(),
  min_revenue: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? undefined : Number(val),
    z.number().min(0).optional()
  ),
  max_price: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? undefined : Number(val),
    z.number().min(0).optional()
  ),
  metric_type: z.string().optional(),
  page: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? 1 : Number(val),
    z.number().int().min(1).default(1)
  ),
  limit: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? 20 : Number(val),
    z.number().int().min(1).max(100).default(20)
  )
})

// Type exports for use in components
export type ListingCreateInputType = z.infer<typeof ListingCreateInput>
export type ListingDraftInputType = z.infer<typeof ListingDraftInput>
export type ListingUpdateInputType = z.infer<typeof ListingUpdateInput>
export type BrowseFiltersInputType = z.infer<typeof BrowseFiltersInput>