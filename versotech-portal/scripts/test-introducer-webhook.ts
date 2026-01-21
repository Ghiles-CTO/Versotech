/**
 * Test script for introducer agreement webhook
 * Run with: npx tsx scripts/test-introducer-webhook.ts
 */

const TEST_PAYLOAD = {
  workflow_run_id: 'test-run-' + Date.now(),
  workflow_key: 'generate-introducer-agreement',
  triggered_by: {
    id: 'test-user-id',
    email: 'test@verso.capital',
    display_name: 'Test User',
    role: 'staff_admin',
    title: 'Test'
  },
  payload: {
    agreement_id: 'test-agreement-id',
    document_id: 'IA-260107-001',
    reference_number: 'IA-260107-001',
    agreement_date: 'January 7, 2026',
    effective_date: 'January 7, 2026',
    introducer_name: 'ABC Capital Partners',
    introducer_address: '123 Finance Street, London, UK',
    introducer_signatory_name: 'John Smith',
    introducer_email: 'john@abccapital.com',
    company_name: 'OpenAI',
    deal_id: 'test-deal-id',
    verso_representative_name: 'Julien MACHOT',
    verso_representative_title: 'Managing Partner',
    non_circumvention_period: 'a period of 24 months',
    hurdle_rate_text: 'with no hurdle rate',
    performance_cap_text: ' and no cap',
    vat_registration_text: '',
    subscription_fee_percent: '2.00',
    subscription_fee_decimal: '0.0200',
    performance_fee_percent: '20.00',
    performance_fee_decimal: '0.20',
    subscription_fee_payment_days: 3,
    performance_fee_payment_days: 10,
    governing_law: 'British Virgin Islands',
    agreement_duration_months: 36,
    example_shares: '10,000',
    example_price_per_share: '23.52',
    example_purchase_price: '235,200',
    example_introduction_fee: '4,704',
    example_redemption_price: '50.00',
    example_redemption_total: '500,000',
    example_profit: '264,800',
    example_performance_fee: '52,960',
    entity_signature_html: `
      <div style="margin-top: 10px; margin-bottom: 20px; text-align:center;">
        <div class="signature-line" style="margin:3cm auto 0.2cm; position:relative;">
          <span style="position:absolute;left:50%;top:0;font-size:1px;line-height:1px;color:#ffffff;opacity:0.01;transform:translateX(-50%);">SIG_ANCHOR:party_b</span>
        </div>
        <div class="signature-name">John Smith</div>
        <div class="signature-title">Authorised Signatory 1</div>
      </div>
    `,
    individual_signature_html: '',
    raw_subscription_fee_bps: 200,
    raw_performance_fee_bps: 2000,
    raw_hurdle_rate_bps: null,
    raw_has_performance_cap: false,
    raw_performance_cap_percent: null,
  },
  entity_type: 'introducer_agreement'
}

async function testIntroducerWebhook() {
  const webhookUrl = 'https://n8n.srv967106.hstgr.cloud/webhook/INTRODUCER_AGREEMENT'

  console.log('🚀 Testing Introducer Agreement Webhook')
  console.log('📍 URL:', webhookUrl)
  console.log('')

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_PAYLOAD)
    })

    console.log('📬 Response Status:', response.status, response.statusText)
    const contentType = response.headers.get('content-type') || ''
    console.log('📄 Content-Type:', contentType)

    if (contentType.includes('application/pdf') || contentType.includes('application/octet-stream')) {
      const buffer = await response.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      const signature = Array.from(bytes.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('')
      console.log('✅ Received binary response!')
      console.log('   Size:', buffer.byteLength, 'bytes')
      console.log('   Signature:', signature, signature === '25504446' ? '(Valid PDF)' : '(Not PDF)')
    } else {
      const text = await response.text()
      console.log('📄 Response Length:', text.length, 'chars')
      try {
        const json = JSON.parse(text)
        console.log('📄 JSON Keys:', Object.keys(json))
        if (json.data) {
          console.log('✅ Found "data" key - likely base64 PDF')
          console.log('   data length:', json.data.length, 'chars')
          // Try to decode first few bytes
          const decoded = Buffer.from(json.data.slice(0, 20), 'base64')
          console.log('   Decoded signature:', decoded.slice(0, 4).toString())
        }
        if (json.html) {
          console.log('⚠️ Found "html" key - Gotenberg NOT converting to PDF')
          console.log('   html length:', json.html.length, 'chars')
        }
      } catch {
        console.log('📄 Raw:', text.substring(0, 200))
      }
    }

    console.log('')
    console.log('✅ Test completed!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testIntroducerWebhook()
