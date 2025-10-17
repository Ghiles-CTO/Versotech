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

## Setup Steps (Required)

### 1. Generate a CRON_SECRET

Generate a secure random token:
```bash
openssl rand -base64 32
```

Or use this online tool: https://www.random.org/strings/

### 2. Add GitHub Secrets

Go to your repository settings:
1. Navigate to: **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these two secrets:

**Secret 1: CRON_SECRET**
- Name: `CRON_SECRET`
- Value: The token you generated above

**Secret 2: VERCEL_URL**
- Name: `VERCEL_URL`
- Value: Your production Vercel URL (e.g., `https://your-app.vercel.app`)

### 3. Add CRON_SECRET to Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - Key: `CRON_SECRET`
   - Value: The same token you used in GitHub secrets
   - Environment: **Production** (and Preview/Development if needed)

### 4. Deploy Changes

Commit and push these changes:
```bash
git add .
git commit -m "feat: Migrate from Vercel Cron to GitHub Actions"
git push
```

Your deployment will now succeed without the cron job limit error!

### 5. Test the Workflows (Optional)

After setup, you can manually trigger the workflows to test them:
1. Go to **Actions** tab in your GitHub repository
2. Select either workflow on the left
3. Click **Run workflow** → **Run workflow**
4. Check the logs to ensure it works correctly

## How It Works

- GitHub Actions runs on schedule and calls your API endpoints
- The endpoints check for the `Authorization: Bearer <CRON_SECRET>` header
- If the secret matches, the cron job executes
- If not, it returns a 401 Unauthorized error

## Monitoring

- View workflow runs: Repository → **Actions** tab
- View logs: Click on any workflow run to see detailed logs
- Get notifications: GitHub will email you if a workflow fails

## Future Cron Jobs

To add more cron jobs in the future:
1. Create a new workflow file in `.github/workflows/`
2. Copy one of the existing files as a template
3. Update the schedule and API endpoint
4. No need to update any secrets - they're already configured!
