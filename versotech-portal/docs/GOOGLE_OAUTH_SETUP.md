# Google OAuth Setup Guide

This guide walks you through setting up Google OAuth authentication for both the Investor Portal and Staff Portal.

## Prerequisites

- Supabase project created and running
- Access to Google Cloud Console
- Admin access to your Supabase project

## Step 1: Create Google OAuth Credentials

### 1.1 Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**

### 1.2 Configure OAuth Consent Screen

1. Click on **OAuth consent screen** in the left sidebar
2. Choose **External** (for general use) or **Internal** (for Google Workspace organizations only)
3. Fill in the required information:
   - **App name**: VERSO Holdings Portal
   - **User support email**: Your support email
   - **App logo**: (optional) Upload your company logo
   - **Application home page**: Your production domain or localhost for testing
   - **Authorized domains**: Add your domain (e.g., `versoholdings.com`)
   - **Developer contact information**: Your email address
4. Click **Save and Continue**
5. On the **Scopes** page, you don't need to add any scopes (Supabase handles this)
6. Click **Save and Continue**
7. Review and click **Back to Dashboard**

### 1.3 Create OAuth Client ID

1. Click on **Credentials** in the left sidebar
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Web application** as the application type
4. Configure the OAuth client:
   - **Name**: VERSO Holdings Portal
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (for development)
     - `https://your-production-domain.com` (for production)
   - **Authorized redirect URIs**:
     - `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
     - Replace `YOUR_SUPABASE_PROJECT_REF` with your actual Supabase project reference ID
5. Click **Create**
6. **Important**: Copy the **Client ID** and **Client Secret** - you'll need these in the next step

## Step 2: Configure Supabase

### 2.1 Enable Google Provider

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list and click to expand it
5. Toggle **Enable Sign in with Google** to ON

### 2.2 Add Google Credentials

1. Paste the **Client ID** from Step 1.3
2. Paste the **Client Secret** from Step 1.3
3. Click **Save**

### 2.3 Configure Site URL

1. Navigate to **Authentication** → **URL Configuration** (or **Settings** → **General** → **Site URL**)
2. Set the **Site URL** to:
   - Development: `http://localhost:3000`
   - Production: `https://your-production-domain.com`
3. Click **Save**

### 2.4 Configure Redirect URLs

1. In the same section, add **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://your-production-domain.com/auth/callback` (for production)
2. Click **Save**

## Step 3: Configure Environment Variables

### 3.1 Update `.env.local`

Create or update your `.env.local` file in the `versotech-portal` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application URL (required for OAuth callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# For production:
# NEXT_PUBLIC_APP_URL=https://your-production-domain.com
# NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

### 3.2 Restart Development Server

After updating environment variables:

```bash
# Stop the dev server (Ctrl+C)
# Then restart it
npm run dev
```

## Step 4: Test Google OAuth

### 4.1 Test Investor Portal Login

1. Open your browser to `http://localhost:3000/versoholdings/login`
2. Click the **Continue with Google** button
3. Select or sign in with your Google account
4. You should be redirected to the investor dashboard
5. Verify that a profile was created in the `profiles` table with role `investor`

### 4.2 Test Staff Portal Login

1. Open your browser to `http://localhost:3000/versotech/login`
2. Click the **Continue with Google** button
3. Sign in with a Google account that has a `@versotech.com` or `@verso.com` domain
   - Accounts with these domains will be assigned staff roles
   - Other domains will be rejected for staff portal access
4. You should be redirected to the staff dashboard
5. Verify that a profile was created in the `profiles` table with an appropriate staff role

## Step 5: Troubleshooting

### Issue: "OAuth Error" or "Invalid Redirect URI"

**Solution:**
- Verify that the redirect URI in Google Cloud Console exactly matches:
  `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
- Make sure there are no trailing slashes
- Check that your Supabase project reference ID is correct

### Issue: "Site URL not configured"

**Solution:**
- Ensure the Site URL in Supabase matches your `NEXT_PUBLIC_APP_URL`
- Restart your development server after changing environment variables
- Clear your browser cache and cookies

### Issue: "User redirected to wrong portal"

**Solution:**
- The portal context is passed via the `portal` query parameter
- Check that the redirect URL includes `?portal=investor` or `?portal=staff`
- Review the `signInWithGoogle()` function in `src/lib/auth-client.ts`

### Issue: "Profile not created automatically"

**Solution:**
- Check the `src/app/auth/callback/route.ts` file
- Ensure profile creation logic is working properly
- Check Supabase logs for any database errors
- Verify that the `profiles` table exists and RLS policies allow inserts

### Issue: "Google button doesn't work"

**Solution:**
- Open browser console to check for JavaScript errors
- Verify `NEXT_PUBLIC_APP_URL` is set in your environment
- Check that the `signInWithGoogle` function is imported correctly
- Ensure you're using the latest version of `@supabase/supabase-js`

## Step 6: Production Deployment

### 6.1 Update Google Cloud Console

1. Go back to Google Cloud Console → **Credentials**
2. Edit your OAuth 2.0 Client ID
3. Add production URLs to **Authorized JavaScript origins**:
   - `https://your-production-domain.com`
4. Add production redirect URI to **Authorized redirect URIs**:
   - `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
5. Save changes

### 6.2 Update Supabase Settings

1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Update **Site URL** to your production domain
3. Add production redirect URL to **Redirect URLs**:
   - `https://your-production-domain.com/auth/callback`
4. Save changes

### 6.3 Update Environment Variables in Production

Update your production environment variables:

```env
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

If using Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` to your production domain
3. Redeploy your application

## Security Considerations

1. **Never commit** your Google Client Secret to version control
2. **Use different OAuth credentials** for development and production
3. **Regularly review** authorized domains and redirect URIs
4. **Monitor** authentication logs in Supabase for suspicious activity
5. **Enable email verification** for enhanced security (see Signup Flow documentation)
6. **Implement rate limiting** on authentication endpoints to prevent abuse

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

## Support

If you encounter issues not covered in this guide:

1. Check the [Supabase Community Forum](https://github.com/supabase/supabase/discussions)
2. Review the [Google OAuth Playground](https://developers.google.com/oauthplayground/)
3. Enable debug logging in your application (see `src/lib/auth-client.ts`)
4. Contact your development team with specific error messages and logs

