# 🚀 DealSense Production Deployment Checklist

## ✅ COMPLETED AUTOMATICALLY

### Security Fixes
- [x] Removed hardcoded admin bypasses from `lib/auth/permissions.ts`
- [x] Removed hardcoded admin bypasses from `middleware.ts`
- [x] Protected all `DEV_BYPASS_AUTH` checks with `NODE_ENV === 'development'` guards
  - [x] `app/api/ai/analyze-business/route.ts`
  - [x] `app/api/ai/buyer-match/route.ts`
  - [x] `app/api/ai/due-diligence/route.ts`
  - [x] `app/api/ai/market-intelligence/route.ts`

### Build Fixes
- [x] Fixed TypeScript error in `app/api/admin/regenerate-matches/route.ts`
- [x] Added `export const dynamic = 'force-dynamic'` to:
  - [x] `app/api/analysis/status/route.ts`
  - [x] `app/api/usage/current/route.ts`
  - [x] `app/api/usage/analysis-quota/route.ts`

---

## ⚠️ REQUIRED: MANUAL TASKS BEFORE DEPLOYMENT

### 1. Database Security (CRITICAL - 15 mins)

Run the SQL migrations in your Supabase dashboard:

```bash
# Apply security fixes
psql -h [your-supabase-host] -U postgres -d postgres -f sql/fix-supabase-security-issues.sql

# Apply remaining function fixes
psql -h [your-supabase-host] -U postgres -d postgres -f sql/fix-remaining-function-warnings.sql
```

**What this fixes:**
- Enables RLS on `broker_profiles` table
- Fixes admin policy to not use `user_metadata` (security risk)
- Changes SECURITY DEFINER views to SECURITY INVOKER
- Adds `SET search_path` to all functions (prevents injection attacks)

### 2. Supabase Dashboard Configuration (CRITICAL - 5 mins)

**Enable Password Leak Protection:**
1. Go to Supabase Dashboard
2. Navigate to: **Authentication → Settings → Password Protection**
3. Enable: **"Check passwords against HaveIBeenPwned"**

### 3. Environment Variables Verification (CRITICAL - 10 mins)

**Quick Validation:**
Run the automated validation script to check all environment variables:
```bash
node scripts/validate-env.js
```

This will verify that all required variables are set and identify any security issues.

**Manual Verification:**
Verify these environment variables are set in production:

**Required:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=your_database_url_here
```

**Feature Flags:**
```bash
OPENAI_API_KEY=your_openai_api_key_here
AI_FEATURES_ENABLED=true
EMAIL_SENDING_ENABLED=true
```

**Stripe:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
STRIPE_STARTER_PRICE_ID=price_xxxxx
STRIPE_PROFESSIONAL_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx
```

**Email:**
```bash
RESEND_API_KEY=re_xxxxx
```

**CRITICAL SAFETY CHECKS:**
```bash
# Ensure these are NOT set or set to false:
DEV_BYPASS_AUTH=false  # OR remove entirely
NODE_ENV=production
```

### 4. Image Optimization (HIGH PRIORITY - 30 mins)

Convert `<img>` tags to Next.js `<Image />` for better performance:

**Files to update:**
1. `app/admin/brokers/page.tsx:500`
2. `app/brokers/page.tsx:176`
3. `app/brokers/[id]/page.tsx:77`
4. `app/listings/[id]/page.tsx:559`

**Example conversion:**
```tsx
// Before:
<img src={broker.headshotUrl} alt={broker.displayName} className="..." />

// After:
import Image from 'next/image'

<Image
  src={broker.headshotUrl}
  alt={broker.displayName}
  width={96}
  height={96}
  className="..."
/>
```

**Benefits:**
- 40-50% faster page loads
- Better LCP scores
- Automatic WebP conversion
- Lower bandwidth costs

---

## 🧪 PRE-DEPLOYMENT TESTING

### Local Testing Checklist

Run these commands before deploying:

```bash
# 1. Clean build
npm run build

# 2. TypeScript check
npx tsc --noEmit

# 3. Lint check
npm run lint

# 4. Security audit
npm audit --production
```

### Functionality Testing

Test these critical flows:

- [ ] User registration and login
- [ ] Create a new listing (draft and publish)
- [ ] Browse listings with filters
- [ ] AI analysis features (if subscribed)
- [ ] Profile creation and editing
- [ ] Subscription upgrade flow (Stripe)
- [ ] Email sending (digest emails)
- [ ] Matching engine (admin regenerate matches)
- [ ] Broker profile creation
- [ ] Admin dashboard access

---

## 🔒 SECURITY VERIFICATION

Before going live, verify:

- [ ] No hardcoded credentials in code
- [ ] `.env` file is in `.gitignore`
- [ ] All `DEV_BYPASS_AUTH` checks are protected with `NODE_ENV`
- [ ] Admin routes check database role, not hardcoded emails
- [ ] RLS policies are enabled on all tables
- [ ] Stripe webhook signature verification is working
- [ ] CORS is properly configured
- [ ] Rate limiting is in place (if applicable)

---

## 📊 POST-DEPLOYMENT MONITORING

Set up monitoring for:

1. **Error Tracking**
   - Set up Sentry or similar for error monitoring
   - Monitor `/api/health` endpoint

2. **Performance**
   - Monitor bundle sizes
   - Track Core Web Vitals
   - Set up Lighthouse CI

3. **Database**
   - Monitor query performance
   - Set up slow query logging
   - Monitor connection pool usage

4. **Business Metrics**
   - User registrations
   - Subscription conversions
   - AI analysis usage
   - Email delivery rates

---

## 🎯 DEPLOYMENT STEPS

1. **Pre-deployment:**
   ```bash
   git add .
   git commit -m "Production hardening: Remove admin bypasses, add dynamic declarations"
   git push origin master
   ```

2. **Apply database migrations** (see step 1 above)

3. **Deploy to Vercel/hosting:**
   ```bash
   npx vercel --prod
   ```
   Or use your hosting platform's deployment method

4. **Verify environment variables** are set in hosting dashboard

5. **Run post-deployment smoke tests:**
   - [ ] Homepage loads
   - [ ] Can create an account
   - [ ] Can browse listings
   - [ ] API routes respond correctly
   - [ ] Images load properly

6. **Monitor logs** for first 24 hours after deployment

---

## 🆘 ROLLBACK PLAN

If issues occur:

1. **Quick rollback:**
   ```bash
   # Vercel
   vercel rollback

   # Or redeploy previous commit
   git revert HEAD
   git push origin master
   ```

2. **Database rollback:**
   - Keep backups of your database before applying migrations
   - Supabase has automatic backups - use dashboard to restore

3. **Emergency contact:**
   - Have your team's contact info ready
   - Document who can access production systems

---

## ✨ OPTIONAL ENHANCEMENTS

These can be done after initial deployment:

- [ ] Set up CDN for static assets
- [ ] Enable Redis caching for hot data
- [ ] Add database read replicas
- [ ] Set up automated backups
- [ ] Configure log aggregation
- [ ] Set up uptime monitoring
- [ ] Add performance profiling
- [ ] Implement feature flags
- [ ] Set up A/B testing infrastructure

---

## 📞 SUPPORT CONTACTS

**Critical Issues:**
- Database: Supabase support
- Hosting: Vercel/your hosting provider
- Payments: Stripe support
- Email: Resend support

**Documentation:**
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs

---

## ✅ FINAL SIGN-OFF

Before marking deployment complete:

- [ ] All critical security fixes applied
- [ ] Environment variables verified
- [ ] Database migrations successful
- [ ] Smoke tests passed
- [ ] Monitoring is active
- [ ] Team has been notified
- [ ] Documentation is updated
- [ ] Rollback plan is ready

**Deployment Date:** _______________
**Deployed By:** _______________
**Verified By:** _______________

---

**🎉 You're ready to launch! Good luck with your rollout!**
