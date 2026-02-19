# Subscription Pack Template Sync Checklist (Repo -> n8n)

Use this checklist whenever `VERSO/VERSOsign/subscription_pack_template.html` changes.

## 1) Copy template to n8n
- Source: `VERSO/VERSOsign/subscription_pack_template.html`
- Target: the `generate-subscription-pack` live n8n HTML template node.
- Verify no escaping/auto-format step removed hidden anchor spans.

## 2) Required anchor IDs (must exist in generated PDF text layer)
- Subscriber anchors (for each signatory):
- `party_a_form`, `party_a`
- `party_a_2_form`, `party_a_2`, `party_a_3_form`, `party_a_3`, ... when multi-signatory
- Issuer anchors:
- `party_b_form`, `party_b_wire`, `party_b`, `party_b_tcs`
- Arranger anchors:
- `party_c`, `party_c_tcs`

## 3) Payload keys that must remain mapped
- Financial:
- `subscription_amount`, `price_per_share`, `certificates_count`
- `subscription_fee_rate`, `subscription_fee_amount`, `total_subscription_price`
- Signature HTML blocks:
- `signatories_form_html`, `signatories_signature_html`, `issuer_signature_html`, `arranger_signature_html`
- Core identity fields:
- `series_number`, `series_title`, `subscriber_name`, `issuer_name`, `arranger_name`

## 4) Contract validation command
Run against an unsigned generated PDF before sending for signature:

```bash
npm run validate:subpack:anchors -- --pdf /absolute/path/to/subpack.pdf --subscribers 1
```

Increase `--subscribers` for entity subscriptions.

## 5) Gate
Do not mark document ready-for-signature if:
- any required anchor is missing, or
- the validator exits non-zero.
