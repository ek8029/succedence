# Supabase Email Reset Link Fix

## Current Issue
Reset password links are expiring or invalid with error:
`error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired`

## Root Causes & Solutions

### 1. **OTP Expiration Settings**
**Fix in Supabase Dashboard:**
1. Go to **Authentication** → **Settings**
2. Find **Email OTP Expiration**
3. Increase from default (3600 seconds/1 hour) to 7200 (2 hours) or more
4. Save changes

### 2. **Redirect URL Mismatch**
The URL is redirecting to root (`/#error=`) instead of `/auth/reset-password#access_token=`

**Fix in Supabase Dashboard:**
1. Go to **Authentication** → **Email Templates**
2. Edit **Reset Password** template
3. Ensure the template uses:
```html
<h2>Reset Your Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

### 3. **URL Configuration Issues**
**Fix in Supabase Dashboard:**
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://www.succedence.com`
3. Add to **Redirect URLs**:
   - `https://www.succedence.com/auth/reset-password`
   - `https://succedence.com/auth/reset-password`
   - `http://localhost:3000/auth/reset-password`

### 4. **Update Auth Context Code**
The reset password function needs to specify the correct redirect:

```typescript
// In contexts/AuthContext.tsx
const resetPassword = async (email: string) => {
  try {
    console.log('🔑 Sending password reset email to:', email)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      console.error('Password reset request failed:', error)
      return { error: error.message }
    }

    console.log('✅ Password reset email sent successfully')
    return {}
  } catch (error: any) {
    console.error('Password reset exception:', error)
    return { error: error.message || 'Failed to send reset email' }
  }
}
```

### 5. **Email Provider Settings**
If using custom SMTP, ensure:
1. SPF records are set up
2. DKIM is configured
3. Email provider isn't blocking Supabase

## Testing Steps

1. **Clear Browser Cache**
   - Clear cookies for succedence.com
   - Try incognito/private browsing

2. **Request Fresh Email**
   - Go to https://www.succedence.com/auth
   - Click "Forgot Password"
   - Enter email
   - Click link IMMEDIATELY (within 1-2 minutes)

3. **Check Email Headers**
   - View the raw email source
   - Look for the actual link URL
   - Ensure it contains `/auth/reset-password`

## Debug Information

Run this in browser console on your site:
```javascript
// Check current origin
console.log('Current origin:', window.location.origin);

// Check Supabase URL
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
```

## Alternative Manual Reset

If emails continue to fail, you can manually reset via Supabase Dashboard:
1. Go to **Authentication** → **Users**
2. Find the user
3. Click menu (3 dots) → **Send Password Recovery**
4. Or use "Reset Password" to set a temporary password

## Long-term Solution

Consider implementing:
1. Custom password reset flow with your own tokens
2. Magic link authentication (passwordless)
3. Social auth providers (Google, GitHub, etc.)