// ===================================================================
// Email Service - Server-side only
// ===================================================================

import { Resend } from 'resend'

// Type definitions
export interface SendEmailParams {
  to: string
  subject: string
  html: string
  text: string
}

export interface SendEmailResult {
  id: string
}

// Initialize Resend client
let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required')
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

// Main email sending function
export async function sendDigestEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { to, subject, html, text } = params

  // Check if email sending is enabled
  if (process.env.EMAIL_SENDING_ENABLED === 'false') {
    console.log(`Email sending disabled, would have sent to ${to}: ${subject}`)
    return { id: 'disabled-' + Date.now() }
  }

  try {
    const resend = getResendClient()

    const { data, error } = await resend.emails.send({
      from: 'Succedence <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
      text,
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    if (!data?.id) {
      throw new Error('No email ID returned from Resend')
    }

    console.log(`Email sent successfully to ${to}, ID: ${data.id}`)
    return { id: data.id }

  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

// Utility function to validate email address
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}