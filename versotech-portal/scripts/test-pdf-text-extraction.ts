import * as fs from 'fs';

async function testPdfTextExtraction() {
  // Dynamic import for ES module
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

  // Find a subscription pack PDF in storage or use a test file
  // Adjust path to an actual generated subscription pack PDF
  const pdfPath = process.argv[2];

  if (!pdfPath) {
    console.error('Usage: npx tsx scripts/test-pdf-text-extraction.ts <path-to-pdf>');
    process.exit(1);
  }

  const buffer = fs.readFileSync(pdfPath);
  const pdfBytes = new Uint8Array(buffer);
  const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;

  console.log(`\n📄 PDF has ${pdf.numPages} pages\n`);

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });

    const textItems = textContent.items
      .filter((item): item is { str: string; transform: number[] } => 'str' in item && item.str.trim() !== '')
      .map(item => ({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5]
      }));

    console.log(`--- Page ${i} (${viewport.width}x${viewport.height}pt) ---`);
    console.log(`Found ${textItems.length} text items`);

    // Show first 10 items with positions
    textItems.slice(0, 10).forEach(t => {
      console.log(`  "${t.text}" at (${t.x.toFixed(1)}, ${t.y.toFixed(1)})`);
    });

    // Check for signature-related text
    const sigRelated = textItems.filter(t =>
      t.text.toLowerCase().includes('signature') ||
      t.text.toLowerCase().includes('signatory') ||
      t.text.toLowerCase().includes('name:') ||
      t.text.toLowerCase().includes('title:')
    );

    if (sigRelated.length > 0) {
      console.log(`\n  🖊️ Signature-related text on page ${i}:`);
      sigRelated.forEach(t => {
        console.log(`    "${t.text}" at (${t.x.toFixed(1)}, ${t.y.toFixed(1)})`);
      });
    }
    console.log('');
  }
}

testPdfTextExtraction().catch(console.error);
