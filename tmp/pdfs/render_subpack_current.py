from pathlib import Path
import re
from urllib.parse import quote

ROOT = Path('/Users/ghilesmoussaoui/Desktop/Versotech')
TEMPLATE = ROOT / 'VERSO/VERSOsign/subscription_pack_template.html'
OUT_HTML = ROOT / 'tmp/pdfs/subpack_current_vc215_render.html'

logo_path = ROOT / 'tmp/pdfs/anthropic_logo_mock.png'
if not logo_path.exists():
    try:
        from PIL import Image, ImageDraw
        img = Image.new('RGB', (640, 240), 'white')
        d = ImageDraw.Draw(img)
        d.rectangle([140, 55, 500, 185], fill='black')
        d.text((250, 102), 'AI', fill='white')
        img.save(logo_path)
    except Exception:
        pass
logo_url = f"file://{quote(str(logo_path))}"

values = {
    'series_number': '215',
    'series_cover_subtitle': 'ANTHROPIC AI PREFERED STOCK',
    'ultimate_investment': 'ANTHROPIC',
    'investment_logo_url': logo_url,
    'issuer_website': 'www.versoholdings.com',
    'series_summary_heading': 'VERSO CAPITAL 2 SCSP SERIES "VERSO Capital 2 SCSp Series 600"',
    'subscriber_name': 'RAJAGOPALAN MADHUSUDAN',
    'agreement_date': 'September 9, 2025',
    'currency_code': 'USD',
    'subscription_amount_display': '23000.00',
    'certificates_count_display': '163',
    'price_per_share_display': '141.00',
    'price_per_share_marker': '*',
    'total_subscription_price_display': '25875.00',
    'subscription_fee_text': 'Subscription Fee (one-off): 2.50%',
    'management_fee_text': 'Management Fee (upfront one-off): 10.00% (instead of 2.00% no cap 20.00% over SPV lifetime)',
    'performance_fee_text': 'Performance Fee: 20.00%',
    'escrow_fee_text': 'None (cost covered by VERSO Capital 2 SCSP)',
    'issuer_name': 'Julien Machot',
    'issuer_title': 'Manager and authorized representative',
    'arranger_name': 'Julien MACHOT',
    'arranger_title': 'Director',
    'wire_escrow_agent': 'Dupont & Partners',
    'wire_arranger': 'VERSO Management Ltd',
    'wire_contact_email': 'jmachot@versoholdings.com',
    'wire_bank_name': 'ING Luxembourg S.A.',
    'wire_bank_address': "ING Luxembourg SA, 52, route d'Esch, L-2965 Luxembourg",
    'wire_account_holder': 'Dupont Partners',
    'wire_law_firm_address': '2 Avenue Charles de Gaulle, L-1653 Luxembourg',
    'wire_description': 'Escrow account for VERSO Capital 2 SCSP Series 215',
    'wire_iban': 'LU71 0141 8595 5133 3010',
    'wire_bic': 'CELLLULLXXX',
    'wire_reference_display': 'Agency VERSO Capital 2 SCSP Series 215',
    'currency_long': 'United States, Dollars',
    'subscriber_clause_text': 'RAJAGOPALAN MADHUSUDAN',
    'issuer_rcc_number_display': 'B290857',
    'issuer_gp_name': 'VERSO Capital 2 GP SARL',
    'issuer_gp_rcc_number_display': 'B290857',
    'payment_deadline_date': 'September 11, 2025',
    'subscription_fee_rate': '2.50%',
    'management_fee_clause': '',
    'performance_fee_clause': '',
    'recital_b_html': '',
    'lpa_date': 'September 9, 2025',
    'max_aggregate_amount': '100,000,000',
}

values['signatories_form_html'] = (
    '<div class="signature-block-inline" style="position:relative;margin-bottom: 0.5cm;">'
    '<div class="signature-line" style="position:relative;">'
    '<span style="position:absolute;left:0;top:0;font-size:1px;line-height:1px;color:#ffffff;opacity:0.01;">SIG_ANCHOR:party_a_form</span>'
    '</div>'
    'Name: RAJAGOPALAN MADHUSUDAN<br>Title: Authorized Signatory'
    '</div>'
)

values['price_per_share_notice_html'] = (
    '<p class="small" style="margin-top:0.35cm;"><em>* IMPORTANT NOTICE: The Price per Share may be amended by the Issuer prior any Capital Call or Funding to reflect the exact Price per Share of the recent Qualified Financing. The Issuer shall then issue a Side Letter to provide confirmation of the new Price per Share and as a result of the exact total Number of Shares corresponding to the present Subscription.</em></p>'
)

values['signatories_signature_html'] = (
    '<div class="signature-block" style="position:relative;margin-bottom: 1.5cm; min-height: 4cm;">'
    '<p><strong>The Subscriber</strong>, represented by Authorized Signatory 1</p>'
    '<div class="signature-line main-line" style="margin-top: 3cm; position:relative;">'
    '<span style="position:absolute;left:0;top:0;font-size:1px;line-height:1px;color:#ffffff;opacity:0.01;">SIG_ANCHOR:party_a</span>'
    '</div>'
    '<p style="margin-top: 0.3cm;">Name: RAJAGOPALAN MADHUSUDAN<br>Title: Authorized Signatory</p>'
    '</div>'
)
values['issuer_signature_html'] = (
    '<div class="signature-block" style="position:relative;margin-bottom: 1.5cm; min-height: 4cm;">'
    '<p><strong>The Issuer, VERSO Capital 2 SCSP</strong>, duly represented by its general partner <strong>VERSO Capital 2 GP SARL</strong></p>'
    '<div class="signature-line main-line" style="margin-top: 3cm; position:relative;">'
    '<span style="position:absolute;left:0;top:0;font-size:1px;line-height:1px;color:#ffffff;opacity:0.01;">SIG_ANCHOR:party_b</span>'
    '</div>'
    '<p style="margin-top: 0.3cm;">Name: Julien MACHOT<br>Title: Manager and authorized representative</p>'
    '</div>'
)
values['arranger_signature_html'] = (
    '<div class="signature-block" style="position:relative;margin-bottom: 1.5cm; min-height: 4cm;">'
    '<p><strong>The Attorney, Verso Management Ltd.</strong>, for the purpose of the powers granted under Clause 6</p>'
    '<div class="signature-line main-line" style="margin-top: 3cm; position:relative;">'
    '<span style="position:absolute;left:0;top:0;font-size:1px;line-height:1px;color:#ffffff;opacity:0.01;">SIG_ANCHOR:party_c</span>'
    '</div>'
    '<p style="margin-top: 0.3cm;">Name: Julien MACHOT<br>Title: Director and authorized representative</p>'
    '</div>'
)

s = TEMPLATE.read_text(encoding='utf-8')

def repl_default(m):
    key = m.group(1)
    default = m.group(2)
    v = values.get(key)
    if v is None or v == '':
        return default
    return str(v)

s = re.sub(r"\{\{\s*\$json\.([a-zA-Z0-9_]+)\s*\|\|\s*'([^']*)'\s*\}\}", repl_default, s)

def repl_plain(m):
    key = m.group(1)
    return str(values.get(key, ''))

s = re.sub(r"\{\{\s*\$json\.([a-zA-Z0-9_]+)\s*\}\}", repl_plain, s)

OUT_HTML.write_text(s, encoding='utf-8')
print(f'Wrote {OUT_HTML}')
