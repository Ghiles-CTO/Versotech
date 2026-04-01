import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

describe('subscription pack template', () => {
  it('reinforces the page-2 outer right border on summary tables', () => {
    const templatePath = path.resolve(process.cwd(), '../VERSO/VERSOsign/subscription_pack_template.html')
    const html = fs.readFileSync(templatePath, 'utf8')

    expect(html).toContain('.summary-page table.summary-table td:last-child')
    expect(html).toContain('.summary-page table.summary-signature-table td:last-child')
    expect(html).toContain('border-right: 1px solid #000;')
    expect(html).toContain('border-right: 2px solid #000 !important;')
  })

  it('renders subscription, management, and performance fees on separate summary rows', () => {
    const templatePath = path.resolve(process.cwd(), '../VERSO/VERSOsign/subscription_pack_template.html')
    const html = fs.readFileSync(templatePath, 'utf8')

    expect(html).toContain('class="compact summary-table summary-terms-table"')
    expect(html).toContain('Subscription Fee:</td>')
    expect(html).toContain('Management Fee:</td>')
    expect(html).toContain('Performance Fee:</td>')
  })

  it('uses dedicated wire currency placeholders in the wire instruction sections', () => {
    const templatePath = path.resolve(process.cwd(), '../VERSO/VERSOsign/subscription_pack_template.html')
    const html = fs.readFileSync(templatePath, 'utf8')

    expect(html).toContain('{{ $json.wire_currency_code }} (FYI: {{ $json.wire_currency_long }})')
    expect(html).toContain('{{ $json.wire_currency_code }} ({{ $json.wire_currency_long }})')
  })

  it('does not contain fallback fake wire details in the repo template or workflow snapshot', () => {
    const templatePath = path.resolve(process.cwd(), '../VERSO/VERSOsign/subscription_pack_template.html')
    const workflowPath = path.resolve(process.cwd(), '../VERSO/VERSOsign/subscription_pack_n8n_workflow.json')
    const html = fs.readFileSync(templatePath, 'utf8')
    const workflow = fs.readFileSync(workflowPath, 'utf8')

    expect(html).not.toContain("|| 'ING Luxembourg S.A.'")
    expect(html).not.toContain("|| 'Dupont Partners'")
    expect(html).not.toContain("|| 'CELLLULLXXX'")
    expect(workflow).not.toContain("|| 'ING Luxembourg S.A.'")
    expect(workflow).not.toContain("|| 'Dupont Partners'")
    expect(workflow).not.toContain("|| 'CELLLULLXXX'")
  })
})
