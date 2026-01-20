import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

function usage() {
  console.log('Usage: node scripts/validate-subscription-pack-signatures.mjs --pdf <signed.pdf> [--unsigned <unsigned.pdf>] [--subscribers <n>] [--tolerance <pt>]')
  console.log('Example: node scripts/validate-subscription-pack-signatures.mjs --pdf /tmp/signed.pdf --unsigned /tmp/unsigned.pdf --subscribers 2 --tolerance 10')
}

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i]
    if (value.startsWith('--')) {
      const [key, inlineVal] = value.split('=')
      if (inlineVal !== undefined) {
        args[key.slice(2)] = inlineVal
      } else {
        args[key.slice(2)] = argv[i + 1]
        i += 1
      }
    }
  }
  return args
}

function readNumberFromText(text, key, fileLabel) {
  const regex = new RegExp(`${key}:\\s*([0-9]+(?:\\.[0-9]+)?)`)
  const match = text.match(regex)
  if (!match) {
    throw new Error(`Missing ${key} in ${fileLabel}`)
  }
  return Number.parseFloat(match[1])
}

function readNumberFromRegex(text, regex, label, fileLabel) {
  const match = text.match(regex)
  if (!match) {
    throw new Error(`Missing ${label} in ${fileLabel}`)
  }
  return Number.parseFloat(match[1])
}

function getLabelFromAnchor(anchorId) {
  if (anchorId.endsWith('_form')) return 'subscription_form'
  if (anchorId.endsWith('_wire')) return 'wire_instructions'
  if (anchorId.endsWith('_tcs')) return 'tcs'
  return 'main_agreement'
}

function getBasePosition(anchorId) {
  return anchorId.replace(/_(form|wire|tcs)$/, '')
}

function getRequiredAnchorsForSubscriptionPack(subscriberCount) {
  const required = []

  for (let i = 1; i <= subscriberCount; i += 1) {
    const base = i === 1 ? 'party_a' : `party_a_${i}`
    required.push(`${base}_form`)
    required.push(base)
  }

  required.push('party_b_form')
  required.push('party_b_wire')
  required.push('party_b')
  required.push('party_b_tcs')

  required.push('party_c')
  required.push('party_c_tcs')

  return required
}

function findClosestByY(items, expectedY) {
  if (!items.length) return null
  let bestIndex = -1
  let bestDelta = Number.POSITIVE_INFINITY
  for (let i = 0; i < items.length; i += 1) {
    const delta = Math.abs(items[i].rawY - expectedY)
    if (delta < bestDelta) {
      bestDelta = delta
      bestIndex = i
    }
  }
  if (bestIndex === -1) return null
  const [match] = items.splice(bestIndex, 1)
  return { match, delta: bestDelta }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  const signedArg = args.signed || args.pdf
  if (!signedArg) {
    usage()
    process.exit(1)
  }

  const signedPdfPath = path.resolve(String(signedArg))
  const unsignedPdfPath = args.unsigned ? path.resolve(String(args.unsigned)) : signedPdfPath
  const subscriberCount = args.subscribers ? Number.parseInt(String(args.subscribers), 10) : null
  const tolerance = args.tolerance ? Number.parseFloat(String(args.tolerance)) : 10

  if (!Number.isFinite(tolerance) || tolerance <= 0) {
    throw new Error('Tolerance must be a positive number in points')
  }

  if (!fs.existsSync(signedPdfPath)) {
    throw new Error(`Signed PDF not found: ${signedPdfPath}`)
  }
  if (!fs.existsSync(unsignedPdfPath)) {
    throw new Error(`Unsigned PDF not found: ${unsignedPdfPath}`)
  }

  const root = process.cwd()
  const configPath = path.join(root, 'src/lib/signature/config.ts')
  const anchorDetectorPath = path.join(root, 'src/lib/signature/anchor-detector.ts')
  const pdfProcessorPath = path.join(root, 'src/lib/signature/pdf-processor.ts')

  const configText = fs.readFileSync(configPath, 'utf8')
  const anchorText = fs.readFileSync(anchorDetectorPath, 'utf8')
  const pdfProcessorText = fs.readFileSync(pdfProcessorPath, 'utf8')

  const timestampOffsetY = readNumberFromText(configText, 'timestampOffsetY', configPath)
  const signerNameOffsetY = readNumberFromText(configText, 'signerNameOffsetY', configPath)
  const compactSignerOffset = readNumberFromRegex(
    anchorText,
    /const compactSignerOffset = ([0-9]+(?:\\.[0-9]+)?)/,
    'compactSignerOffset',
    anchorDetectorPath
  )
  const lineGap = readNumberFromRegex(
    anchorText,
    /const lineGap = ([0-9]+(?:\\.[0-9]+)?)/,
    'lineGap',
    anchorDetectorPath
  )
  const compactTimestampOffset = readNumberFromRegex(
    pdfProcessorText,
    /const timestampOffset = isCompactLayout \? ([0-9]+(?:\\.[0-9]+)?) :/,
    'compactTimestampOffset',
    pdfProcessorPath
  )
  const compactSignerOffsetEmbed = readNumberFromRegex(
    pdfProcessorText,
    /const signerOffset = isCompactLayout \? ([0-9]+(?:\\.[0-9]+)?) :/,
    'compactSignerOffsetEmbed',
    pdfProcessorPath
  )

  if (compactSignerOffsetEmbed !== compactSignerOffset) {
    throw new Error(
      `compactSignerOffset mismatch: anchor-detector=${compactSignerOffset}, pdf-processor=${compactSignerOffsetEmbed}`
    )
  }

  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const workerPath = path.join(root, 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')
  pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).toString()

  async function loadPdf(pdfPath) {
    const pdfBytes = fs.readFileSync(pdfPath)
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBytes),
      useSystemFonts: true,
      disableFontFace: true
    })
    return loadingTask.promise
  }

  const anchors = []
  const signedItems = []
  const signerItems = []

  const anchorPdf = await loadPdf(unsignedPdfPath)
  const signedPdf = await loadPdf(signedPdfPath)

  for (let pageNum = 1; pageNum <= anchorPdf.numPages; pageNum += 1) {
    const page = await anchorPdf.getPage(pageNum)
    const textContent = await page.getTextContent()

    for (const item of textContent.items) {
      if (!('str' in item)) continue
      const text = item.str || ''
      const rawX = item.transform[4]
      const rawY = item.transform[5]

      const hasNormalAnchor = text.includes('SIG_ANCHOR:')
      const hasSpaceAnchor = text.includes('SIG ANCHOR:')

      if (hasNormalAnchor || hasSpaceAnchor) {
        let anchorId = null
        if (hasNormalAnchor) {
          const match = text.match(/SIG_ANCHOR:(\S+)/)
          if (match) anchorId = match[1]
        } else if (hasSpaceAnchor) {
          const match = text.match(/SIG ANCHOR:([a-z0-9_ ]+)/i)
          if (match) anchorId = match[1].trim().replace(/ /g, '_')
        }

        if (anchorId) {
          anchors.push({
            anchorId,
            pageNumber: pageNum,
            rawX,
            rawY
          })
        }
      }

      if (text.startsWith('Signed:') || text.startsWith('Signer:')) {
        // Skip signer metadata in the unsigned PDF
      }
    }
  }

  for (let pageNum = 1; pageNum <= signedPdf.numPages; pageNum += 1) {
    const page = await signedPdf.getPage(pageNum)
    const textContent = await page.getTextContent()

    for (const item of textContent.items) {
      if (!('str' in item)) continue
      const text = item.str || ''
      const rawX = item.transform[4]
      const rawY = item.transform[5]

      if (text.startsWith('Signed:')) {
        signedItems.push({ pageNumber: pageNum, rawX, rawY, text })
      }

      if (text.startsWith('Signer:')) {
        signerItems.push({ pageNumber: pageNum, rawX, rawY, text })
      }
    }
  }

  console.log(`Signed PDF: ${signedPdfPath}`)
  console.log(`Unsigned PDF: ${unsignedPdfPath}`)
  console.log(`Pages (signed): ${signedPdf.numPages}`)
  console.log(`Pages (unsigned): ${anchorPdf.numPages}`)
  console.log(`Anchors found: ${anchors.length}`)
  console.log(`Signed items found: ${signedItems.length}`)
  console.log(`Signer items found: ${signerItems.length}`)
  console.log(`Tolerance: ${tolerance}pt`)

  if (anchorPdf.numPages !== signedPdf.numPages) {
    console.log('Warning: signed and unsigned page counts differ')
  }
  if (anchors.length === 0 && unsignedPdfPath === signedPdfPath) {
    console.log('Warning: no anchors found in signed PDF. Provide --unsigned for anchor detection.')
  }
  if (anchors.length === 0) {
    console.log('No anchors found; cannot validate placements.')
    process.exit(1)
  }

  if (subscriberCount !== null && Number.isFinite(subscriberCount)) {
    const required = getRequiredAnchorsForSubscriptionPack(subscriberCount)
    const found = new Set(anchors.map(anchor => anchor.anchorId))
    const missing = required.filter(anchorId => !found.has(anchorId))
    if (missing.length > 0) {
      console.log(`Missing anchors (${missing.length}): ${missing.join(', ')}`)
    } else {
      console.log('All required anchors found')
    }
  }

  const signedByPage = new Map()
  const signerByPage = new Map()

  for (const item of signedItems) {
    if (!signedByPage.has(item.pageNumber)) signedByPage.set(item.pageNumber, [])
    signedByPage.get(item.pageNumber).push(item)
  }
  for (const item of signerItems) {
    if (!signerByPage.has(item.pageNumber)) signerByPage.set(item.pageNumber, [])
    signerByPage.get(item.pageNumber).push(item)
  }

  const results = []

  for (const anchor of anchors) {
    const label = getLabelFromAnchor(anchor.anchorId)
    const signaturePosition = getBasePosition(anchor.anchorId)

    const signerOffset = label === 'wire_instructions' ? compactSignerOffset : signerNameOffsetY
    const signatureY = anchor.rawY + signerOffset + lineGap
    const isCompact = label === 'wire_instructions'
    const expectedSignedY = signatureY - (isCompact ? compactTimestampOffset : timestampOffsetY)
    const expectedSignerY = signatureY - (isCompact ? compactSignerOffset : signerNameOffsetY)

    const signedPageItems = signedByPage.get(anchor.pageNumber) || []
    const signerPageItems = signerByPage.get(anchor.pageNumber) || []

    const signedMatch = findClosestByY(signedPageItems, expectedSignedY)
    const signerMatch = findClosestByY(signerPageItems, expectedSignerY)

    const signedOk = signedMatch ? signedMatch.delta <= tolerance : false
    const signerOk = signerMatch ? signerMatch.delta <= tolerance : false

    results.push({
      anchorId: anchor.anchorId,
      signaturePosition,
      label,
      pageNumber: anchor.pageNumber,
      expectedSignedY,
      expectedSignerY,
      signedMatch,
      signerMatch,
      signedOk,
      signerOk
    })
  }

  let passed = 0
  let failed = 0

  console.log('\nValidation results:')
  for (const result of results) {
    const signedDelta = result.signedMatch ? result.signedMatch.delta.toFixed(1) : 'n/a'
    const signerDelta = result.signerMatch ? result.signerMatch.delta.toFixed(1) : 'n/a'
    const signedActual = result.signedMatch ? result.signedMatch.match.rawY.toFixed(1) : 'n/a'
    const signerActual = result.signerMatch ? result.signerMatch.match.rawY.toFixed(1) : 'n/a'
    const status = result.signedOk && result.signerOk ? 'OK' : 'FAIL'

    console.log(
      `${status} page=${result.pageNumber} anchor=${result.anchorId} label=${result.label} ` +
      `signedY exp=${result.expectedSignedY.toFixed(1)} act=${signedActual} delta=${signedDelta} ` +
      `signerY exp=${result.expectedSignerY.toFixed(1)} act=${signerActual} delta=${signerDelta}`
    )

    if (status === 'OK') passed += 1
    else failed += 1
  }

  console.log(`\nSummary: ${passed} passed, ${failed} failed`)

  const leftoverSigned = []
  const leftoverSigner = []
  for (const [page, items] of signedByPage.entries()) {
    for (const item of items) leftoverSigned.push({ page, y: item.rawY.toFixed(1), text: item.text })
  }
  for (const [page, items] of signerByPage.entries()) {
    for (const item of items) leftoverSigner.push({ page, y: item.rawY.toFixed(1), text: item.text })
  }

  if (leftoverSigned.length > 0) {
    console.log(`Unmatched Signed items: ${leftoverSigned.length}`)
    for (const item of leftoverSigned) {
      console.log(`  page=${item.page} y=${item.y} text="${item.text}"`)
    }
  }
  if (leftoverSigner.length > 0) {
    console.log(`Unmatched Signer items: ${leftoverSigner.length}`)
    for (const item of leftoverSigner) {
      console.log(`  page=${item.page} y=${item.y} text="${item.text}"`)
    }
  }

  if (failed > 0) {
    process.exitCode = 1
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
