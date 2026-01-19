import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

async function downloadPdf() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  const fileKey = 'subscriptions/4d49c9fe-97de-4b84-8f5c-cefc6a208b76/regenerated/1768585252142-VC215 - SUBSCRIPTION PACK - ANTHROPIC - Ghiless Business Ventures LLC - 160126.pdf'

  console.log('Downloading from:', fileKey)

  const { data, error } = await supabase.storage
    .from('deal-documents')
    .download(fileKey)

  if (error) {
    console.error('Download error:', error)
    process.exit(1)
  }

  const buffer = Buffer.from(await data.arrayBuffer())
  const outputPath = '/tmp/regenerated-subscription-pack.pdf'
  fs.writeFileSync(outputPath, buffer)
  console.log(`✅ Downloaded to ${outputPath}, size: ${buffer.length} bytes`)
}

downloadPdf().catch(console.error)
