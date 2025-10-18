# Cron Jobs Setup with GitHub Actions

## What Changed

We've migrated from Vercel Cron Jobs to GitHub Actions to avoid plan limitations. This gives you:
- ✅ Unlimited free cron jobs
- ✅ Better logging and visibility
- ✅ More flexible scheduling
- ✅ No additional costs

## Files Modified

1. **[versotech-portal/vercel.json](versotech-portal/vercel.json)** - Removed cron jobs configuration
2. **[.github/workflows/data-room-expiry.yml](.github/workflows/data-room-expiry.yml)** - Runs daily at 2 AM UTC
3. **[.github/workflows/data-room-expiry-warnings.yml](.github/workflows/data-room-expiry-warnings.yml)** - Runs daily at 3 AM UTC
4. **[.github/workflows/publish-documents.yml](.github/workflows/publish-documents.yml)** - Runs hourly
5. **[.github/workflows/unpublish-documents.yml](.github/workflows/unpublish-documents.yml)** - Runs hourly

## Setup Steps (Required)

### 1. Use Your Generated CRON_SECRET

Your CRON_SECRET has been generated and added to your local `.env.local` file:
```
DscCeBtGZIeRNe9lgrQ+DhDSdEWva+P8DWWAL/q0lvc=
```

**IMPORTANT:** Use this exact same token in all the steps below.

### 2. Add GitHub Secrets

Go to your repository settings:
1. Navigate to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions
2. Click **New repository secret**
3. Add these two secrets:

**Secret 1: CRON_SECRET**
- Name: `CRON_SECRET`
- Value: `DscCeBtGZIeRNe9lgrQ+DhDSdEWva+P8DWWAL/q0lvc=`

**Secret 2: VERCEL_URL**
- Name: `VERCEL_URL`
- Value: Your production Vercel URL (e.g., `https://versotech-portal.vercel.app`)
  - **Find this in your Vercel dashboard** → Select your project → **Settings** → **Domains**

### 3. Add CRON_SECRET to Vercel Environment Variables

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project (versotech-portal)
3. Navigate to **Settings** → **Environment Variables**
4. Add a new variable:
   - Key: `CRON_SECRET`
   - Value: `DscCeBtGZIeRNe9lgrQ+DhDSdEWva+P8DWWAL/q0lvc=`
   - Environment: **Production** (required), **Preview**, and **Development** (optional but recommended)
5. Click **Save**

### 4. Deploy Changes

The code changes have been committed. Now push to trigger deployment:
```bash
git add .
git commit -m "feat: Complete GitHub Actions cron migration with all 4 workflows"
git push origin main
```

After pushing:
1. **Vercel will automatically deploy** the changes
2. **Wait for deployment to complete** (check https://vercel.com/dashboard)
3. **Verify CRON_SECRET is available** in your production environment

### 5. Test the Workflows (Recommended)

After setup, test each workflow to ensure everything works:

1. Go to **Actions** tab: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
2. Select a workflow from the left sidebar:
   - Data Room Expiry Check
   - Data Room Expiry Warnings
   - Publish Scheduled Documents
   - Unpublish Expired Documents
3. Click **Run workflow** → **Run workflow** button
4. Click on the running workflow to view logs
5. Verify you see a successful green checkmark ✅
6. If you see a red X ❌, click to view error logs

**What to check in logs:**
- Should see the `curl` command executing
- Should receive a response from your API endpoint
- No "Unauthorized" errors (means CRON_SECRET is configured correctly)

## How It Works

- **GitHub Actions** runs on schedule (defined by cron expressions)
- Each workflow makes an HTTP request to your Vercel-hosted API endpoint
- The API endpoint checks for `Authorization: Bearer <CRON_SECRET>` header
- If the secret matches `process.env.CRON_SECRET`, the cron job executes
- If not, it returns a **401 Unauthorized** error

### Cron Job Schedule Summary

| Workflow | Schedule | Frequency | Endpoint |
|----------|----------|-----------|----------|
| Data Room Expiry | `0 2 * * *` | Daily at 2 AM UTC | `/api/cron/data-room-expiry` |
| Data Room Warnings | `0 3 * * *` | Daily at 3 AM UTC | `/api/cron/data-room-expiry-warnings` |
| Publish Documents | `0 * * * *` | Every hour | `/api/cron/publish-documents` |
| Unpublish Documents | `0 * * * *` | Every hour | `/api/cron/unpublish-documents` |

## Monitoring

- View workflow runs: Repository → **Actions** tab
- View logs: Click on any workflow run to see detailed logs
- Get notifications: GitHub will email you if a workflow fails

## Troubleshooting

### Issue: "401 Unauthorized" in workflow logs
**Solution:**
- Verify `CRON_SECRET` is set in GitHub Secrets
- Verify `CRON_SECRET` is set in Vercel Environment Variables
- Ensure both use the **exact same value**: `DscCeBtGZIeRNe9lgrQ+DhDSdEWva+P8DWWAL/q0lvc=`
- Redeploy your Vercel project after adding environment variables

### Issue: Workflow doesn't run at scheduled time
**Solution:**
- GitHub Actions scheduled workflows can be delayed by up to 10 minutes during high load
- Check if the workflow is enabled in GitHub Actions settings
- Manually trigger the workflow to test if it works

### Issue: API endpoint returns 500 error
**Solution:**
- Check Vercel deployment logs for errors
- Check Supabase connection is working
- Verify database tables and RLS policies are correctly configured

## Future Cron Jobs

To add more cron jobs in the future:
1. Create a new API route in `versotech-portal/src/app/api/cron/your-job-name/route.ts`
2. Add CRON_SECRET validation (copy from existing cron endpoints)
3. Create a new workflow file in `.github/workflows/your-job-name.yml`
4. Copy one of the existing workflow files as a template
5. Update the schedule (cron expression) and API endpoint URL
6. No need to update secrets - they're already configured!
