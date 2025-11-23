const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = 'https://ipguxdssecfexudnvtia.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZ3V4ZHNzZWNmZXh1ZG52dGlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM2MTgzNywiZXhwIjoyMDczOTM3ODM3fQ.pTl2HtHIzLE6qI2WMbUnuMb13BRUZkQk7piYToXB4OI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251120133313_add_arranger_entities.sql')
  const sql = fs.readFileSync(migrationPath, 'utf8')

  console.log('Applying migration: add_arranger_entities...')

  const { data, error } = await supabase.rpc('exec', { sql })

  if (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }

  console.log('✅ Migration applied successfully!')
  console.log('VERSO MANAGEMENT LTD has been seeded as the first arranger entity.')
}

applyMigration()
