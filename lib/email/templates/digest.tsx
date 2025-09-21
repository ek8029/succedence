// ===================================================================
// Digest Email Template - Server-side only
// ===================================================================

// Type definitions
interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
}

interface Listing {
  id: string
  title: string
  industry: string
  state: string
  revenue?: number
  price?: number
  description: string
}

interface DigestData {
  user: User
  listings: Listing[]
  reasons?: { [listingId: string]: string[] }
  asText?: boolean
}

// Format currency for display
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  } else {
    return `$${amount.toLocaleString()}`
  }
}

// Get user display name
function getUserDisplayName(user: User): string {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`
  } else if (user.first_name) {
    return user.first_name
  } else {
    return 'there'
  }
}

// Generate HTML email content
function generateHTMLContent(data: DigestData): string {
  const { user, listings, reasons = {} } = data
  const userName = getUserDisplayName(user)
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const listingsHtml = listings.map((listing, index) => {
    const listingReasons = reasons[listing.id] || []
    const topReasons = listingReasons.slice(0, 2)

    const financials = []
    if (listing.revenue) {
      financials.push(`Revenue: ${formatCurrency(listing.revenue)}`)
    }
    if (listing.price) {
      financials.push(`Price: ${formatCurrency(listing.price)}`)
    }
    const financialText = financials.length > 0 ? ` • ${financials.join(' • ')}` : ''

    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 16px 0;">
          <div style="margin-bottom: 8px;">
            <strong style="font-size: 16px; color: #1f2937;">${listing.title}</strong>
          </div>
          <div style="margin-bottom: 8px; color: #6b7280; font-size: 14px;">
            ${listing.industry} • ${listing.state}${financialText}
          </div>
          ${topReasons.length > 0 ? `
          <div style="margin-bottom: 8px;">
            ${topReasons.map(reason => `
              <span style="display: inline-block; background-color: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 4px; margin-bottom: 4px;">
                ✓ ${reason}
              </span>
            `).join('')}
          </div>
          ` : ''}
          <div style="color: #6b7280; font-size: 13px; line-height: 1.4;">
            ${listing.description.length > 120 ? listing.description.substring(0, 120) + '...' : listing.description}
          </div>
        </td>
      </tr>
    `
  }).join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Daily Business Matches - Succedence</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">

    <!-- Header -->
    <div style="background-color: #1e40af; color: white; padding: 24px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Succedence</h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Your Business Opportunities Digest</p>
    </div>

    <!-- Content -->
    <div style="padding: 24px;">
      <div style="margin-bottom: 24px;">
        <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #1f2937;">Hi ${userName}!</h2>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">${today}</p>
      </div>

      ${listings.length > 0 ? `
      <div style="margin-bottom: 24px;">
        <p style="margin: 0 0 16px 0; font-size: 16px;">
          We found <strong>${listings.length} new business ${listings.length === 1 ? 'opportunity' : 'opportunities'}</strong> matching your criteria:
        </p>

        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            ${listingsHtml}
          </tbody>
        </table>
      </div>

      <!-- CTA Buttons -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://succedence.com/browse?digest=today"
           style="display: inline-block; background-color: #1e40af; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin-right: 12px;">
          View All Matches
        </a>
        <a href="https://succedence.com/profile"
           style="display: inline-block; background-color: #6b7280; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">
          View Profile
        </a>
      </div>
      ` : `
      <div style="text-align: center; padding: 32px 0;">
        <p style="margin: 0 0 16px 0; font-size: 16px; color: #6b7280;">
          No new matches found today, but we're constantly updating our listings.
        </p>
        <a href="https://succedence.com/browse"
           style="display: inline-block; background-color: #1e40af; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">
          Browse All Opportunities
        </a>
      </div>
      `}
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;">
        <a href="https://succedence.com/preferences" style="color: #1e40af; text-decoration: none;">Manage your preferences</a> •
        <a href="https://succedence.com/preferences?unsubscribe=true" style="color: #6b7280; text-decoration: none;">Unsubscribe</a>
      </p>
      <p style="margin: 0; font-size: 11px; color: #9ca3af;">
        © ${new Date().getFullYear()} Succedence. Built for ambitious entrepreneurs.
      </p>
    </div>

  </div>
</body>
</html>
  `.trim()
}

// Generate plain text email content
function generateTextContent(data: DigestData): string {
  const { user, listings, reasons = {} } = data
  const userName = getUserDisplayName(user)
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  let content = `SUCCEDENCE - Your Business Opportunities Digest\n\n`
  content += `Hi ${userName}!\n`
  content += `${today}\n\n`

  if (listings.length > 0) {
    content += `We found ${listings.length} new business ${listings.length === 1 ? 'opportunity' : 'opportunities'} matching your criteria:\n\n`

    listings.forEach((listing, index) => {
      content += `${index + 1}. ${listing.title}\n`

      const details = []
      details.push(listing.industry)
      details.push(listing.state)
      if (listing.revenue) details.push(`Revenue: ${formatCurrency(listing.revenue)}`)
      if (listing.price) details.push(`Price: ${formatCurrency(listing.price)}`)
      content += `   ${details.join(' • ')}\n`

      const listingReasons = reasons[listing.id] || []
      if (listingReasons.length > 0) {
        const topReasons = listingReasons.slice(0, 2)
        content += `   Why it matches: ${topReasons.join(', ')}\n`
      }

      const description = listing.description.length > 100
        ? listing.description.substring(0, 100) + '...'
        : listing.description
      content += `   ${description}\n\n`
    })

    content += `View all matches: https://succedence.com/browse?digest=today\n`
    content += `Your profile: https://succedence.com/profile\n\n`
  } else {
    content += `No new matches found today, but we're constantly updating our listings.\n\n`
    content += `Browse all opportunities: https://succedence.com/browse\n\n`
  }

  content += `---\n`
  content += `Manage your preferences: https://succedence.com/preferences\n`
  content += `Unsubscribe: https://succedence.com/preferences?unsubscribe=true\n\n`
  content += `© ${new Date().getFullYear()} Succedence. Built for ambitious entrepreneurs.`

  return content
}

// Main render function
export function renderDigestEmail(data: DigestData): { html: string; text: string } {
  const html = generateHTMLContent(data)
  const text = generateTextContent(data)

  return { html, text }
}