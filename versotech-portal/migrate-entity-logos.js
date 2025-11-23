/**
 * Migrate entity logos from private 'documents' bucket to public 'public-assets' bucket
 *
 * This script fixes the issue where vehicle logos stored in the private 'documents' bucket
 * cannot be accessed via public URLs, causing 400 errors when loading images.
 *
 * Usage:
 *   node migrate-entity-logos.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function migrateEntityLogos() {
  console.log('🔍 Finding vehicles with logos in documents bucket...\n')

  // Find all vehicles with logo_url pointing to documents bucket
  const { data: vehicles, error: queryError } = await supabase
    .from('vehicles')
    .select('id, name, logo_url')
    .like('logo_url', '%/documents/entity-logos/%')
    .not('logo_url', 'is', null)

  if (queryError) {
    console.error('Error querying vehicles:', queryError)
    process.exit(1)
  }

  if (!vehicles || vehicles.length === 0) {
    console.log('✅ No vehicles found with logos in documents bucket. Migration not needed.')
    process.exit(0)
  }

  console.log(`Found ${vehicles.length} vehicle(s) to migrate:\n`)
  vehicles.forEach(v => {
    console.log(`  - ${v.name}`)
    console.log(`    Current URL: ${v.logo_url}\n`)
  })

  // Migrate each logo
  for (const vehicle of vehicles) {
    console.log(`\n📦 Migrating logo for: ${vehicle.name}`)

    // Extract the file path from the URL
    const urlParts = vehicle.logo_url.split('/documents/')
    if (urlParts.length !== 2) {
      console.error(`  ❌ Invalid URL format: ${vehicle.logo_url}`)
      continue
    }

    const sourcePath = urlParts[1]
    console.log(`  Source path: ${sourcePath}`)

    // Download the file from documents bucket
    console.log(`  ⬇️  Downloading from documents bucket...`)
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(sourcePath)

    if (downloadError) {
      console.error(`  ❌ Download failed:`, downloadError)
      continue
    }

    // Upload to public-assets bucket
    console.log(`  ⬆️  Uploading to public-assets bucket...`)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('public-assets')
      .upload(sourcePath, fileData, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      console.error(`  ❌ Upload failed:`, uploadError)
      continue
    }

    // Generate new public URL
    const newLogoUrl = `${supabaseUrl}/storage/v1/object/public/public-assets/${sourcePath}`
    console.log(`  New URL: ${newLogoUrl}`)

    // Update vehicle record
    console.log(`  💾 Updating vehicle record...`)
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({ logo_url: newLogoUrl })
      .eq('id', vehicle.id)

    if (updateError) {
      console.error(`  ❌ Update failed:`, updateError)
      continue
    }

    console.log(`  ✅ Successfully migrated logo for ${vehicle.name}`)
  }

  console.log('\n\n🎉 Migration complete!')
  console.log('\nNext steps:')
  console.log('1. Verify logos load correctly in the holdings page')
  console.log('2. Optionally clean up old files from documents bucket')
}

migrateEntityLogos()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Migration failed:', err)
    process.exit(1)
  })
