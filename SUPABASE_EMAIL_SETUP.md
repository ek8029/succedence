# Supabase Email Configuration Guide

## Issue
The forgot password feature is not sending emails. This is because Supabase requires email configuration to be set up in your Supabase Dashboard.

## Solution Steps

### 1. Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `gizyuepvykxkgzjgenvw`

### 2. Configure Email Settings

#### Option A: Use Supabase's Built-in Email Service (For Testing)
1. Navigate to **Authentication** → **Email Templates**
2. Ensure "Enable Email" is turned ON
3. Check that email templates are configured for:
   - **Reset Password** template
   - **Confirm Signup** template

#### Option B: Configure Custom SMTP (For Production)
1. Navigate to **Settings** → **Auth**
2. Scroll down to **SMTP Settings**
3. Toggle "Enable Custom SMTP" to ON
4. Configure your SMTP provider:

   **For Gmail (example):**
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: `your-email@gmail.com`
   - Password: `your-app-specific-password`
   - Sender email: `your-email@gmail.com`
   - Sender name: `Succedence`

   **For SendGrid (recommended for production):**
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: `your-sendgrid-api-key`
   - Sender email: `noreply@succedence.com`
   - Sender name: `Succedence`

### 3. Configure Email Templates
1. Navigate to **Authentication** → **Email Templates**
2. Customize the **Reset Password** template:

```html
<h2>Reset Your Password</h2>
<p>Hello,</p>
<p>You requested to reset your password. Click the link below to set a new password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, please ignore this email.</p>
<p>Thanks,<br>The Succedence Team</p>
```

### 4. Configure Redirect URLs
1. Navigate to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/reset-password`
   - `https://yourdomain.com/auth/reset-password` (for production)

### 5. Rate Limiting Settings
1. Navigate to **Authentication** → **Email**
2. Check rate limiting settings:
   - Default is usually 4 emails per hour per address
   - Adjust if needed for testing

## Testing the Configuration

### Local Testing
1. The code implementation is already correct in `/contexts/AuthContext.tsx`:
```typescript
const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  // ...
}
```

2. Test the forgot password flow:
   - Go to http://localhost:3000/auth
   - Click "Forgot your password?"
   - Enter an email address
   - Check the email inbox

### Troubleshooting

If emails are still not sending:

1. **Check Supabase Logs:**
   - Go to Supabase Dashboard → **Logs** → **Auth**
   - Look for email sending errors

2. **Verify Email is Enabled:**
   - Dashboard → **Authentication** → **Settings**
   - Ensure "Enable email confirmations" is ON

3. **Check Email Provider Limits:**
   - Free tier Supabase has email limits
   - Consider upgrading or using custom SMTP

4. **Test with Different Email:**
   - Some email providers may block test emails
   - Try Gmail or another provider

## Production Recommendations

1. **Use a Professional Email Service:**
   - SendGrid
   - AWS SES
   - Postmark
   - Mailgun

2. **Configure SPF/DKIM/DMARC:**
   - Improves email deliverability
   - Prevents emails going to spam

3. **Monitor Email Metrics:**
   - Track delivery rates
   - Monitor bounce rates
   - Check spam reports

## Current Implementation Status

✅ **Frontend Code:** Correctly implemented in `/app/auth/page.tsx`
✅ **Reset Password Function:** Correctly implemented in `/contexts/AuthContext.tsx`
✅ **Reset Password Page:** Exists at `/app/auth/reset-password/page.tsx`
❌ **Supabase Email Configuration:** Needs to be configured in dashboard

## Next Steps

1. Log into your Supabase Dashboard
2. Follow the configuration steps above
3. Test the forgot password flow
4. For production, set up custom SMTP with a professional email service