import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

describe('subscription pack template', () => {
  it('reinforces the page-2 outer right border on summary tables', () => {
    const templatePath = path.resolve(process.cwd(), '../VERSO/VERSOsign/subscription_pack_template.html')
    const html = fs.readFileSync(templatePath, 'utf8')

    expect(html).toContain('.summary-page table.summary-table td:last-child')
    expect(html).toContain('.summary-page table.summary-signature-table td:last-child')
    expect(html).toContain('border-right: 1.5px solid #000;')
  })
})
