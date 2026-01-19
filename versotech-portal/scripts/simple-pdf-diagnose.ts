/**
 * Simple PDF text extraction to find missing anchors
 */

import * as fs from 'fs'

async function diagnose() {
  const pdfPath = '/tmp/subscription-pack-diagnose.pdf'

  if (!fs.existsSync(pdfPath)) {
    console.error('PDF not found at', pdfPath)
    process.exit(1)
  }

  console.log(`📄 Diagnosing: ${pdfPath}\n`)

  const buffer = fs.readFileSync(pdfPath)

  // Simple text search in raw PDF bytes
  const pdfString = buffer.toString('latin1')

  const anchorsToFind = [
    'party_a', 'party_a_form', 'party_a_appendix',
    'party_a_2', 'party_a_2_form', 'party_a_2_appendix',
    'party_b', 'party_b_form', 'party_b_wire', 'party_b_tcs',
    'party_c', 'party_c_tcs'
  ]

  console.log('Searching for anchors in raw PDF bytes...\n')

  anchorsToFind.forEach(anchor => {
    const searchTerm = `SIG_ANCHOR:${anchor}`
    const found = pdfString.includes(searchTerm)
    console.log(`${found ? '✅' : '❌'} ${anchor}: ${found ? 'FOUND' : 'NOT FOUND'}`)
  })

  // Also search for key text that should be near the missing anchors
  console.log('\n--- Checking for related content ---\n')

  const relatedTexts = [
    { name: 'Wire Transfer page', text: 'WIRE TRANSFER INSTRUCTIONS' },
    { name: 'Wire signature area', text: 'Thank you for your consideration' },
    { name: 'Arranger block', text: 'The Attorney' },
    { name: 'Verso Management', text: 'Verso Management Ltd' },
    { name: 'Main signature page', text: 'Signature page to the Equity' },
  ]

  relatedTexts.forEach(({ name, text }) => {
    const found = pdfString.includes(text)
    console.log(`${found ? '✅' : '❌'} ${name}: ${found ? 'FOUND' : 'NOT FOUND'}`)
  })
}

diagnose().catch(console.error)
