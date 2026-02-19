import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

function usage() {
  console.log('Usage: node scripts/check-subscription-pack-anchor-contract.mjs --pdf <unsigned.pdf> [--subscribers <n>]')
  console.log('Example: node scripts/check-subscription-pack-anchor-contract.mjs --pdf /tmp/subpack.pdf --subscribers 2')
}

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i]
    if (!item.startsWith('--')) continue

    const [key, inlineValue] = item.split('=')
    if (inlineValue !== undefined) {
      args[key.slice(2)] = inlineValue
      continue
    }

    args[key.slice(2)] = argv[i + 1]
    i += 1
  }
  return args
}

function getRequiredAnchors(subscribers) {
  const required = []

  for (let i = 1; i <= subscribers; i += 1) {
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

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (!args.pdf) {
    usage()
    process.exit(1)
  }

  const pdfPath = path.resolve(String(args.pdf))
  const subscriberCount = Number.parseInt(String(args.subscribers || '1'), 10)

  if (!Number.isFinite(subscriberCount) || subscriberCount < 1) {
    throw new Error('subscribers must be >= 1')
  }

  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF not found: ${pdfPath}`)
  }

  const root = process.cwd()
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const workerPath = path.join(root, 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')
  pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).toString()

  const pdfBytes = fs.readFileSync(pdfPath)
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(pdfBytes),
    useSystemFonts: true,
    disableFontFace: true,
  })

  const pdf = await loadingTask.promise
  const found = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()

    for (const item of textContent.items) {
      if (!('str' in item)) continue
      const text = item.str || ''

      const normal = text.match(/SIG_ANCHOR:(\S+)/)
      if (normal) {
        found.push({ anchorId: normal[1], page: pageNum })
        continue
      }

      const spaced = text.match(/SIG ANCHOR:([a-z0-9_ ]+)/i)
      if (spaced) {
        found.push({ anchorId: spaced[1].trim().replace(/ /g, '_'), page: pageNum })
      }
    }
  }

  const required = getRequiredAnchors(subscriberCount)
  const foundIds = new Set(found.map(anchor => anchor.anchorId))
  const missing = required.filter(anchorId => !foundIds.has(anchorId))

  console.log(`PDF: ${pdfPath}`)
  console.log(`Pages: ${pdf.numPages}`)
  console.log(`Subscribers expected: ${subscriberCount}`)
  console.log(`Anchors found: ${found.length}`)

  if (missing.length > 0) {
    console.error(`\nMissing required anchors (${missing.length}):`)
    for (const anchorId of missing) {
      console.error(`- ${anchorId}`)
    }

    const summary = found
      .map(anchor => `${anchor.anchorId}@p${anchor.page}`)
      .join(', ')
    console.error(`\nFound anchors:\n${summary || '(none)'}`)

    process.exit(1)
  }

  const summary = required.map(anchorId => {
    const pages = found
      .filter(anchor => anchor.anchorId === anchorId)
      .map(anchor => anchor.page)
      .join(',')
    return `${anchorId}@p${pages}`
  }).join('\n')

  console.log('\nAnchor contract OK:')
  console.log(summary)
}

main().catch(error => {
  console.error('Anchor contract validation failed:', error)
  process.exit(1)
})
