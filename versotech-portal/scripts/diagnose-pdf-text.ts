/**
 * Diagnostic script to extract ALL text from a PDF and search for anchors
 *
 * Run: npx tsx scripts/diagnose-pdf-text.ts <path-to-pdf>
 */

import * as fs from 'fs'

async function diagnosePdfText() {
  const pdfPath = process.argv[2]

  if (!pdfPath) {
    console.error('Usage: npx tsx scripts/diagnose-pdf-text.ts <path-to-pdf>')
    process.exit(1)
  }

  console.log(`\n📄 Diagnosing PDF: ${pdfPath}\n`)

  const buffer = fs.readFileSync(pdfPath)
  const pdfBytes = new Uint8Array(buffer)

  // Dynamic import pdfjs-dist
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
  console.log(`PDF has ${pdf.numPages} pages\n`)

  // Track all SIG_ANCHOR occurrences
  const anchorsFound: string[] = []

  // Pages to examine in detail for missing anchors
  const pagesOfInterest = [2, 3, 4, 5, 14, 15] // Wire instructions and signature pages

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()

    // Collect all text on this page
    const pageText = textContent.items
      .filter((item): item is { str: string; transform: number[] } => 'str' in item)
      .map(item => item.str)
      .join(' ')

    // Check for any SIG_ANCHOR
    const anchorMatches = pageText.match(/SIG_ANCHOR:\S+/g)
    if (anchorMatches) {
      anchorMatches.forEach(anchor => {
        anchorsFound.push(`Page ${pageNum}: ${anchor}`)
        console.log(`✅ Page ${pageNum}: Found ${anchor}`)
      })
    }

    // For pages of interest, show more detail
    if (pagesOfInterest.includes(pageNum)) {
      console.log(`\n📃 Page ${pageNum} content preview:`)
      console.log('─'.repeat(60))

      // Show first 500 chars
      const preview = pageText.substring(0, 800).replace(/\s+/g, ' ')
      console.log(preview)
      console.log('─'.repeat(60))

      // Check for specific keywords
      const keywords = ['WIRE TRANSFER', 'Attorney', 'Verso Management', 'party_b_wire', 'party_c']
      keywords.forEach(kw => {
        if (pageText.toLowerCase().includes(kw.toLowerCase())) {
          console.log(`   ✓ Contains "${kw}"`)
        }
      })
      console.log('')
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))
  console.log(`\nTotal anchors found: ${anchorsFound.length}`)
  anchorsFound.forEach(a => console.log(`  - ${a}`))

  // Check for missing expected anchors
  const expected = [
    'party_a', 'party_a_form', 'party_a_appendix',
    'party_a_2', 'party_a_2_form', 'party_a_2_appendix',
    'party_b', 'party_b_form', 'party_b_wire', 'party_b_tcs',
    'party_c', 'party_c_tcs'
  ]

  const foundIds = anchorsFound.map(a => a.split('SIG_ANCHOR:')[1])
  const missing = expected.filter(e => !foundIds.includes(e))

  if (missing.length > 0) {
    console.log(`\n❌ Missing anchors: ${missing.join(', ')}`)
  } else {
    console.log('\n✅ All expected anchors found!')
  }
}

diagnosePdfText().catch(console.error)
