/**
 * Download PDF from Supabase and diagnose anchors
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing env vars. Make sure .env.local exists with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function downloadAndDiagnose() {
  const fileKey = 'subscriptions/4d49c9fe-97de-4b84-8f5c-cefc6a208b76/regenerated/1768752591071-VC215 - SUBSCRIPTION PACK - ANTHROPIC - Ghiless Business Ventures LLC - 180126.pdf'

  console.log('📥 Downloading PDF from Supabase...')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { data, error } = await supabase.storage
    .from('deal-documents')
    .download(fileKey)

  if (error) {
    console.error('❌ Download error:', error)
    process.exit(1)
  }

  const buffer = Buffer.from(await data.arrayBuffer())
  console.log(`✅ Downloaded: ${buffer.length} bytes`)

  // Save locally for inspection
  const localPath = '/tmp/subscription-pack-diagnose.pdf'
  fs.writeFileSync(localPath, buffer)
  console.log(`💾 Saved to: ${localPath}`)

  // Now diagnose
  const pdfBytes = new Uint8Array(buffer)

  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.mjs',
    import.meta.url
  ).toString()

  const loadingTask = pdfjsLib.getDocument({
    data: pdfBytes,
    useSystemFonts: true,
    disableFontFace: true,
  })

  const pdf = await loadingTask.promise
  console.log(`\n📄 PDF has ${pdf.numPages} pages\n`)

  const anchorsFound: string[] = []

  // Check specific pages for wire instructions and signature page
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()

    const pageText = textContent.items
      .filter((item): item is { str: string } => 'str' in item)
      .map(item => item.str)
      .join(' ')

    // Check for anchors
    const anchorMatches = pageText.match(/SIG_ANCHOR:\S+/g)
    if (anchorMatches) {
      anchorMatches.forEach(anchor => {
        anchorsFound.push(`Page ${pageNum}: ${anchor}`)
        console.log(`✅ Page ${pageNum}: Found ${anchor}`)
      })
    }

    // Look for wire transfer page
    if (pageText.includes('WIRE TRANSFER INSTRUCTIONS')) {
      console.log(`\n📃 Page ${pageNum} is WIRE TRANSFER INSTRUCTIONS`)
      console.log('   Checking for party_b_wire anchor...')
      if (pageText.includes('party_b_wire')) {
        console.log('   ✅ party_b_wire text found!')
      } else {
        console.log('   ❌ party_b_wire NOT found in text')
        // Show snippet around signature block
        const signatureIdx = pageText.indexOf('Thank you for your consideration')
        if (signatureIdx > -1) {
          console.log('   Content near signature area:')
          console.log('   ' + pageText.substring(signatureIdx, signatureIdx + 300))
        }
      }
    }

    // Look for main signature page
    if (pageText.includes('Signature page to the Equity Certificates')) {
      console.log(`\n📃 Page ${pageNum} is MAIN SIGNATURE PAGE`)
      console.log('   Checking for party_c (arranger) anchor...')
      if (pageText.includes('party_c') && !pageText.includes('party_c_tcs')) {
        console.log('   ✅ party_c text found!')
      } else if (pageText.includes('SIG_ANCHOR:party_c')) {
        console.log('   ✅ SIG_ANCHOR:party_c found!')
      } else {
        console.log('   ❌ party_c NOT found in text')
      }

      // Check for arranger block
      if (pageText.includes('The Attorney') || pageText.includes('Verso Management Ltd')) {
        console.log('   ✅ Arranger signature block text IS present')
      } else {
        console.log('   ❌ Arranger signature block text NOT present')
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total anchors found: ${anchorsFound.length}`)

  const expected = ['party_b_wire', 'party_c']
  expected.forEach(e => {
    const found = anchorsFound.some(a => a.includes(e))
    console.log(`${found ? '✅' : '❌'} ${e}: ${found ? 'FOUND' : 'MISSING'}`)
  })
}

downloadAndDiagnose().catch(console.error)
