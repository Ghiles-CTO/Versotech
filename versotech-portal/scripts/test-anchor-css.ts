/**
 * Quick test to verify anchor CSS survives HTML→PDF conversion
 *
 * This creates a minimal HTML with different CSS approaches,
 * converts to PDF, and checks which anchors are detectable.
 *
 * Run: npx tsx scripts/test-anchor-css.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const TEST_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Anchor CSS Test</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12pt; }
    .signature-line { border-top: 1px solid black; width: 200px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>Anchor CSS Detection Test</h1>
  <p>This PDF tests different CSS approaches for invisible anchors.</p>

  <h2>Test 1: Fully Transparent (rgba)</h2>
  <p>Anchor before line:</p>
  <span style="font-size:1px;line-height:0;color:rgba(0,0,0,0);">SIG_ANCHOR:test_rgba</span>
  <div class="signature-line"></div>
  <p>Name: Test Signer 1</p>

  <h2>Test 2: White Color</h2>
  <p>Anchor before line:</p>
  <span style="font-size:1px;line-height:0;color:white;">SIG_ANCHOR:test_white</span>
  <div class="signature-line"></div>
  <p>Name: Test Signer 2</p>

  <h2>Test 3: Near-Zero Opacity</h2>
  <p>Anchor before line:</p>
  <span style="font-size:1px;line-height:0;opacity:0.01;">SIG_ANCHOR:test_opacity</span>
  <div class="signature-line"></div>
  <p>Name: Test Signer 3</p>

  <h2>Test 4: Very Small Font (0.5px)</h2>
  <p>Anchor before line:</p>
  <span style="font-size:0.5px;line-height:0;color:rgba(0,0,0,0);">SIG_ANCHOR:test_tiny</span>
  <div class="signature-line"></div>
  <p>Name: Test Signer 4</p>

  <h2>Test 5: VISIBLE (Control)</h2>
  <p>Anchor before line:</p>
  <span style="font-size:8px;color:red;">SIG_ANCHOR:test_visible</span>
  <div class="signature-line"></div>
  <p>Name: Test Signer 5</p>

  <h2>Test 6: Zero-width space trick</h2>
  <p>Anchor before line:</p>
  <span style="font-size:1px;color:transparent;">SIG_ANCHOR:test_transparent</span>
  <div class="signature-line"></div>
  <p>Name: Test Signer 6</p>

</body>
</html>`

async function main() {
  const outputDir = path.join(process.cwd(), 'test-output')

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const htmlPath = path.join(outputDir, 'anchor-test.html')
  const pdfPath = path.join(outputDir, 'anchor-test.pdf')

  // Write test HTML
  fs.writeFileSync(htmlPath, TEST_HTML)
  console.log(`📝 Created test HTML: ${htmlPath}`)

  // Check if Gotenberg is available (for local testing)
  const gotenbergUrl = process.env.GOTENBERG_URL || 'http://localhost:3000'

  console.log(`\n🔄 Attempting PDF conversion via Gotenberg at ${gotenbergUrl}...`)

  try {
    const formData = new FormData()
    formData.append('files', new Blob([TEST_HTML], { type: 'text/html' }), 'index.html')

    const response = await fetch(`${gotenbergUrl}/forms/chromium/convert/html`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Gotenberg returned ${response.status}: ${response.statusText}`)
    }

    const pdfBuffer = await response.arrayBuffer()
    fs.writeFileSync(pdfPath, Buffer.from(pdfBuffer))
    console.log(`✅ PDF created: ${pdfPath}`)

    // Now test anchor detection
    console.log(`\n🔍 Testing anchor detection...`)

    const { detectAnchors } = await import('../src/lib/signature/anchor-detector')
    const pdfBytes = new Uint8Array(fs.readFileSync(pdfPath))
    const anchors = await detectAnchors(pdfBytes)

    console.log(`\n📊 RESULTS:`)
    console.log(`   Total anchors found: ${anchors.length}`)

    const expectedAnchors = [
      'test_rgba',
      'test_white',
      'test_opacity',
      'test_tiny',
      'test_visible',
      'test_transparent'
    ]

    console.log(`\n   Anchor Detection Results:`)
    for (const expected of expectedAnchors) {
      const found = anchors.find(a => a.anchorId === expected)
      if (found) {
        console.log(`   ✅ ${expected}: DETECTED at page ${found.pageNumber}, y=${found.yFromBottom.toFixed(1)}pt`)
      } else {
        console.log(`   ❌ ${expected}: NOT DETECTED`)
      }
    }

    // Recommendation
    const workingApproaches = expectedAnchors.filter(e => anchors.find(a => a.anchorId === e))
    const invisibleWorking = workingApproaches.filter(e => e !== 'test_visible')

    console.log(`\n💡 RECOMMENDATION:`)
    if (invisibleWorking.length > 0) {
      console.log(`   Use CSS from: ${invisibleWorking[0]}`)
      if (invisibleWorking.includes('test_rgba')) {
        console.log(`   ✅ Current implementation (rgba) works!`)
      }
    } else if (workingApproaches.includes('test_visible')) {
      console.log(`   ⚠️ Only visible anchors work. Need different approach.`)
      console.log(`   Consider: very small font with matching background color`)
    } else {
      console.log(`   ❌ No anchors detected. PDF.js extraction may have issues.`)
    }

  } catch (error) {
    console.log(`\n⚠️ Gotenberg not available: ${(error as Error).message}`)
    console.log(`\n📋 MANUAL TEST INSTRUCTIONS:`)
    console.log(`   1. Open the HTML file in a browser: ${htmlPath}`)
    console.log(`   2. Print to PDF (save as): ${pdfPath}`)
    console.log(`   3. Run: npx tsx scripts/test-anchor-detection.ts ${pdfPath}`)
    console.log(`\n   Or use your n8n workflow to convert the HTML to PDF.`)
  }
}

main().catch(console.error)
