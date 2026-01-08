/**
 * Test script for certificate generation webhook
 * Run with: npx tsx scripts/test-certificate-webhook.ts
 *
 * Sends payload in the EXACT structure that triggerWorkflow() uses
 * n8n accesses data via: {{ $json.body.payload.field_name }}
 */

// Certificate payload (nested inside 'payload' key)
const CERTIFICATE_DATA = {
  // === HEADER TABLE DATA ===
  vehicle_logo_url: 'https://ipguxdssecfexudnvtia.supabase.co/storage/v1/object/public/docs/vehicle-logos/5fd92c13-2d82-4ee5-b4b5-5f532decfe85/1760818173794-st_small_507x507-pad_600x600_f8f8f8.webp',
  series_number: '206',
  subscription_number: '1000012',
  units: 15000,
  close_at: 'January 7, 2026',

  // === ISSUER SECTION DATA ===
  vehicle_name: 'VERSO Capital 2 SCSP Series 206',
  company_name: 'OpenAI',
  vehicle_registration_number: 'B271234',

  // === CERTIFICATION TEXT DATA ===
  investor_name: 'Capital Partners Fund',
  num_shares: 15000,
  structure: 'Shares of Series C Preferred Stock of OpenAI',

  // === SIGNATURE TABLE DATA ===
  vehicle_address: '2, Avenue Charles de Gaulle, L-1653 Luxembourg',
  signatory_1_name: 'Mr Julien Machot',
  signatory_1_title: 'Managing Partner',
  signatory_1_signature_url: '',
  signatory_2_name: 'Mr Frederic Dupont',
  signatory_2_title: 'General Counsel',
  signatory_2_signature_url: '',

  // === METADATA ===
  subscription_id: 'b524e205-e546-4219-b416-1a73a5053a33',
  investor_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
  vehicle_id: '5fd92c13-2d82-4ee5-b4b5-5f532decfe85',
  deal_id: '5f8c1d8a-960f-4f14-97f3-67e03b346aa4',
  commitment_amount: 1500000,
  funded_amount: 1500000,
  price_per_share: 100.00,
  certificate_date: '2026-01-07',
  include_watermark: false
}

// Full payload structure matching triggerWorkflow()
const TEST_PAYLOAD = {
  workflow_run_id: 'test-run-' + Date.now(),
  workflow_key: 'generate-investment-certificate',
  triggered_by: {
    id: 'test-user-id',
    email: 'test@verso.capital',
    display_name: 'Test User',
    role: 'staff_admin',
    title: 'Test'
  },
  payload: CERTIFICATE_DATA,  // <-- n8n accesses via $json.body.payload.*
  entity_type: 'subscription'
}

async function testCertificateWebhook() {
  const webhookUrl = 'https://n8n.srv967106.hstgr.cloud/webhook/CERTIFICATE'

  console.log('🚀 Testing Certificate Webhook')
  console.log('📍 URL:', webhookUrl)
  console.log('📦 Payload:', JSON.stringify(TEST_PAYLOAD, null, 2))
  console.log('')

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_PAYLOAD)
    })

    console.log('📬 Response Status:', response.status, response.statusText)
    console.log('📬 Response Headers:')
    response.headers.forEach((value, key) => {
      console.log(`   ${key}: ${value}`)
    })

    const contentType = response.headers.get('content-type') || ''
    console.log('')
    console.log('📄 Content-Type:', contentType)

    if (contentType.includes('application/pdf') || contentType.includes('application/octet-stream')) {
      // Binary PDF response
      const buffer = await response.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      const signature = Array.from(bytes.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('')

      console.log('✅ Received binary response!')
      console.log('   Size:', buffer.byteLength, 'bytes')
      console.log('   File signature:', signature)

      // Check for PDF signature (%PDF = 25504446)
      if (signature === '25504446') {
        console.log('   ✅ Valid PDF file!')
      } else {
        console.log('   ⚠️ Not a PDF signature, might be DOCX (504b0304) or other format')
      }

      // Save to file for inspection
      const fs = await import('fs')
      const outputPath = './test-certificate-output.pdf'
      fs.writeFileSync(outputPath, Buffer.from(buffer))
      console.log('   💾 Saved to:', outputPath)
    } else if (contentType.includes('application/json')) {
      const text = await response.text()
      console.log('📄 Raw Response Length:', text.length, 'chars')
      if (text.length === 0) {
        console.log('⚠️ Empty response body - n8n workflow may not be returning data')
      } else {
        try {
          const json = JSON.parse(text)
          console.log('📄 JSON Response:', JSON.stringify(json, null, 2))
        } catch {
          console.log('📄 Raw Response:', text.substring(0, 500))
        }
      }
    } else {
      const text = await response.text()
      console.log('📄 Text Response Length:', text.length, 'chars')
      console.log('📄 Text Response:', text.substring(0, 500))

      // Check if it's binary disguised as text
      if (text.startsWith('%PDF')) {
        console.log('⚠️ Response is PDF but sent as text!')
      }
    }

    console.log('')
    console.log('✅ Test completed!')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testCertificateWebhook()
