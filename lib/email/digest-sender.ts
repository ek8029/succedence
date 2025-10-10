// ===================================================================
// Digest Email Sender - Server-side only
// ===================================================================

import { createServiceClient } from '@/lib/supabase/server'
import { sendDigestEmail, isValidEmail } from '@/lib/email'
import { renderDigestEmail } from '@/lib/email/templates/digest'
import { computeListingScore } from '@/lib/matchEngine'

interface SendDigestsResult {
  usersConsidered: number
  emailsSent: number
  emailsSkipped: number
  failures: Array<{ userId: string; error: string }>
}

export async function sendDigestEmails(targetDate: string): Promise<SendDigestsResult> {
  const supabase = createServiceClient()
  const result: SendDigestsResult = {
    usersConsidered: 0,
    emailsSent: 0,
    emailsSkipped: 0,
    failures: []
  }

  try {
    // Get all users who have digest alerts prepared for this date
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select(`
        user_id,
        listing_ids,
        users!inner (
          id,
          email,
          name
        )
      `)
      .eq('digest_date', targetDate)
      .eq('type', 'digest')
      .returns<{
        user_id: string;
        listing_ids: string[];
        users: {
          id: string;
          email: string;
          name: string;
        };
      }[]>()

    if (alertsError) {
      console.error('Error fetching digest alerts:', alertsError)
      return result
    }

    if (!alerts?.length) {
      console.log('No digest alerts found for date:', targetDate)
      return result
    }

    console.log(`Found ${alerts.length} digest alerts to process`)

    for (const alert of alerts) {
      result.usersConsidered++
      const user = alert.users
      const userEmail = user.email

      try {
        // Skip if no valid email
        if (!userEmail || !isValidEmail(userEmail)) {
          result.emailsSkipped++
          console.log(`Skipping user ${user.id}: invalid email`)
          continue
        }

        // Check if we already sent an email for this user/date/type
        const { data: existingEvent } = await supabase
          .from('email_events')
          .select('id')
          .eq('user_id', user.id)
          .eq('digest_date', targetDate)
          .eq('type', 'digest')
          .single()

        if (existingEvent) {
          result.emailsSkipped++
          console.log(`Skipping user ${user.id}: email already sent`)
          continue
        }

        // Get the actual listing details (limit to 20 for email)
        const listingIds = alert.listing_ids.slice(0, 20)
        if (listingIds.length === 0) {
          result.emailsSkipped++
          console.log(`Skipping user ${user.id}: no listings in digest`)
          continue
        }

        const { data: listings, error: listingsError } = await supabase
          .from('listings')
          .select('*')
          .in('id', listingIds)
          .eq('status', 'active')
          .returns<{
            id: string;
            title: string;
            description: string;
            industry: string;
            state: string;
            revenue?: number;
            price?: number;
            updated_at: string;
            ebitda?: number;
            metric_type?: string;
            owner_hours?: number;
          }[]>()

        if (listingsError || !listings?.length) {
          result.emailsSkipped++
          console.log(`Skipping user ${user.id}: no active listings found`)
          continue
        }

        // Get user preferences for scoring reasons
        const { data: userPrefs } = await supabase
          .from('preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()

        // Generate match reasons for each listing
        const reasons: { [listingId: string]: string[] } = {}
        if (userPrefs) {
          listings.forEach(listing => {
            const { reasons: listingReasons } = computeListingScore(userPrefs, listing)
            reasons[listing.id] = listingReasons
          })
        }

        // Render the email
        const { html, text } = renderDigestEmail({
          user,
          listings,
          reasons
        })

        const subject = `${listings.length} new business ${listings.length === 1 ? 'opportunity' : 'opportunities'} matching your criteria`

        // Send the email
        const emailResult = await sendDigestEmail({
          to: userEmail,
          subject,
          html,
          text
        })

        // Record the email event
        const { error: eventError } = await supabase
          .from('email_events')
          .insert({
            user_id: user.id,
            email: userEmail,
            type: 'digest',
            digest_date: targetDate,
            provider_id: emailResult.id,
            status: 'sent'
          } as any)

        if (eventError) {
          console.error(`Error recording email event for user ${user.id}:`, eventError)
        }

        result.emailsSent++
        console.log(`Email sent successfully to user ${user.id} (${userEmail})`)

      } catch (error) {
        result.failures.push({
          userId: user.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        console.error(`Failed to send email to user ${user.id}:`, error)
      }
    }

    console.log('Digest email sending completed:', {
      usersConsidered: result.usersConsidered,
      emailsSent: result.emailsSent,
      emailsSkipped: result.emailsSkipped,
      failures: result.failures.length
    })

    return result

  } catch (error) {
    console.error('Error in sendDigestEmails:', error)
    throw error
  }
}