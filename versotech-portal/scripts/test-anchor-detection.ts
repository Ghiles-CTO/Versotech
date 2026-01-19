/**
 * Test script for anchor detection
 *
 * Run: npx tsx scripts/test-anchor-detection.ts <path-to-pdf>
 */

import * as fs from 'fs'

async function testAnchorDetection() {
  // Dynamic import to match how it's used in the actual code
  const { detectAnchors, getAnchorById, validateRequiredAnchors } = await import('../src/lib/signature/anchor-detector')

  const pdfPath = process.argv[2]

  if (!pdfPath) {
    console.error('Usage: npx tsx scripts/test-anchor-detection.ts <path-to-pdf>')
    process.exit(1)
  }

  console.log(`\n📄 Testing anchor detection on: ${pdfPath}\n`)

  const buffer = fs.readFileSync(pdfPath)
  const pdfBytes = new Uint8Array(buffer)

  console.log(`PDF size: ${pdfBytes.length} bytes`)

  try {
    const anchors = await detectAnchors(pdfBytes)

    console.log(`\n📊 Results:`)
    console.log(`   Found ${anchors.length} anchor(s)`)

    if (anchors.length > 0) {
      console.log(`\n   Anchors:`)
      anchors.forEach(a => {
        console.log(`   - ${a.anchorId}: page ${a.pageNumber}, x=${(a.xPercent * 100).toFixed(1)}%, y=${a.yFromBottom.toFixed(1)}pt`)
      })

      // Test getAnchorById - Note: first subscriber is 'party_a', NOT 'party_a_1'
      console.log(`\n   Testing getAnchorById('party_a'):`)
      try {
        const anchor = getAnchorById(anchors, 'party_a')
        console.log(`   ✅ Found: page ${anchor.pageNumber}, (${anchor.rawX.toFixed(1)}, ${anchor.rawY.toFixed(1)})`)
      } catch (e) {
        console.log(`   ❌ ${(e as Error).message}`)
      }

      // Test validation - party_a is first subscriber, party_b is issuer
      console.log(`\n   Testing validateRequiredAnchors(['party_a', 'party_b']):`)
      try {
        validateRequiredAnchors(anchors, ['party_a', 'party_b'])
        console.log(`   ✅ All required anchors present`)
      } catch (e) {
        console.log(`   ❌ ${(e as Error).message}`)
      }
    } else {
      console.log(`\n   ⚠️ No anchors found in PDF`)
      console.log(`   This is EXPECTED for existing PDFs without SIG_ANCHOR markers.`)
      console.log(`   When signing is attempted, a clear error will be thrown.`)

      // Simulate what would happen on signing attempt
      console.log(`\n   Simulating signing attempt...`)
      try {
        validateRequiredAnchors(anchors, ['party_a'])
      } catch (e) {
        console.log(`   ✅ Expected error: ${(e as Error).message.substring(0, 100)}...`)
      }
    }

  } catch (e) {
    console.error(`\n❌ Error: ${(e as Error).message}`)
    process.exit(1)
  }
}

testAnchorDetection().catch(console.error)
