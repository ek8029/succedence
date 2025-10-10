// ===================================================================
// Digest Email Template - Server-side only
// ===================================================================

// Type definitions
interface User {
  id: string
  email: string
  name: string
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
  // Extract first name from full name
  const firstName = user.name?.split(' ')[0]
  return firstName || 'there'
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
      <tr style="border-bottom: 1px solid rgba(212, 166, 80, 0.15);">
        <td style="padding: 20px 0;">
          <div style="background: rgba(26, 29, 35, 0.5); border: 1px solid rgba(212, 166, 80, 0.2); border-radius: 12px; padding: 20px; backdrop-filter: blur(10px);">
            <div style="margin-bottom: 12px;">
              <strong style="font-size: 18px; color: #FFFFFF; font-family: 'Crimson Text', Georgia, serif; font-weight: 600; line-height: 1.4;">${listing.title}</strong>
            </div>
            <div style="margin-bottom: 12px; color: #E0E0E0; font-size: 13px; opacity: 0.8;">
              <span style="color: #D4A650; font-weight: 500;">${listing.industry}</span> • ${listing.state}${financialText}
            </div>
            ${topReasons.length > 0 ? `
            <div style="margin-bottom: 12px;">
              ${topReasons.map(reason => `
                <span style="display: inline-block; background: linear-gradient(135deg, rgba(184, 154, 95, 0.2) 0%, rgba(201, 169, 110, 0.2) 100%); color: #D4A650; padding: 4px 12px; border-radius: 12px; font-size: 11px; margin-right: 6px; margin-bottom: 6px; font-weight: 500; border: 1px solid rgba(212, 166, 80, 0.3);">
                  ✓ ${reason}
                </span>
              `).join('')}
            </div>
            ` : ''}
            <div style="color: #E0E0E0; font-size: 14px; line-height: 1.6; opacity: 0.85;">
              ${listing.description.length > 120 ? listing.description.substring(0, 120) + '...' : listing.description}
            </div>
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 40px 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #E0E0E0; background: linear-gradient(135deg, #0B0E14 0%, #1A1D23 100%);">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #1A1D23 0%, #2F3847 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3); border: 1px solid rgba(212, 166, 80, 0.2);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #B89A5F 0%, #C9A96E 100%); color: #0B0E14; padding: 32px 24px; text-align: center; position: relative;">
      <h1 style="margin: 0; font-size: 28px; font-weight: 700; font-family: 'Crimson Text', Georgia, serif; letter-spacing: 0.025em;">Succedence</h1>
      <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.85; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 500;">Premium Business Opportunities</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px 24px;">
      <div style="margin-bottom: 32px;">
        <h2 style="margin: 0 0 8px 0; font-size: 24px; color: #FFFFFF; font-family: 'Crimson Text', Georgia, serif; font-weight: 600;">Hi ${userName}!</h2>
        <p style="margin: 0; color: #E0E0E0; font-size: 14px; opacity: 0.7;">${today}</p>
      </div>

      ${listings.length > 0 ? `
      <div style="margin-bottom: 28px;">
        <p style="margin: 0 0 20px 0; font-size: 17px; color: #F5F5F5; line-height: 1.6;">
          We found <strong style="color: #D4A650; font-weight: 600;">${listings.length} new premium business ${listings.length === 1 ? 'opportunity' : 'opportunities'}</strong> matching your acquisition criteria:
        </p>

        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            ${listingsHtml}
          </tbody>
        </table>
      </div>

      <!-- CTA Buttons -->
      <div style="text-align: center; margin: 36px 0 28px 0;">
        <a href="https://succedence.com/matches"
           style="display: inline-block; background: linear-gradient(135deg, #B89A5F 0%, #C9A96E 100%); color: #0B0E14; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; margin-right: 12px; letter-spacing: 0.025em; box-shadow: 0 4px 12px rgba(201, 169, 110, 0.3);">
          View All Matches
        </a>
        <a href="https://succedence.com/preferences"
           style="display: inline-block; background: transparent; color: #E0E0E0; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 500; border: 2px solid rgba(224, 224, 224, 0.3);">
          Update Preferences
        </a>
      </div>
      ` : `
      <div style="text-align: center; padding: 40px 0;">
        <p style="margin: 0 0 20px 0; font-size: 17px; color: #E0E0E0; opacity: 0.8;">
          No new matches today, but we're constantly adding premium opportunities.
        </p>
        <a href="https://succedence.com/browse"
           style="display: inline-block; background: linear-gradient(135deg, #B89A5F 0%, #C9A96E 100%); color: #0B0E14; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; letter-spacing: 0.025em; box-shadow: 0 4px 12px rgba(201, 169, 110, 0.3);">
          Browse All Opportunities
        </a>
      </div>
      `}
    </div>

    <!-- Footer -->
    <div style="background: rgba(11, 14, 20, 0.5); padding: 24px; text-align: center; border-top: 1px solid rgba(212, 166, 80, 0.2);">
      <p style="margin: 0 0 12px 0; font-size: 13px; color: #E0E0E0; opacity: 0.7;">
        <a href="https://succedence.com/preferences" style="color: #D4A650; text-decoration: none; font-weight: 500;">Manage your preferences</a> •
        <a href="https://succedence.com/preferences?unsubscribe=true" style="color: #E0E0E0; text-decoration: none; opacity: 0.6;">Unsubscribe</a>
      </p>
      <p style="margin: 0; font-size: 11px; color: #E0E0E0; opacity: 0.5; font-style: italic;">
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

    content += `View all matches: https://succedence.com/matches\n`
    content += `Update preferences: https://succedence.com/preferences\n\n`
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