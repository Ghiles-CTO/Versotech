# Rules Applied During Reconciliation

## Purpose

This document presents the full business rulebook used to validate and reconcile the data.

## Rulebook summary

- Total tracked rules: 85
- Fully applied: 67
- Applied with minor boundary items: 16
- One legacy formatting instruction is tracked separately

## Naming and identity rules

- Known name variants were mapped so the same investor or introducer matches correctly.
- Legal names and common short names were reconciled using approved mappings.
- Documented transfer mappings were applied where economics moved from one label to another.
- Duplicate investor identities were checked and handled.

## Subscription and position rules

- Dashboard rows with active ownership were validated against database subscription rows.
- Repeated dashboard rows were treated as separate records when they represented separate entries.
- Position totals were checked against dashboard ownership totals.
- Zero-ownership dashboard rows were treated as historical rows, not active subscription loads.

## Commission and introducer rules

- Partner and introducer columns were both included in introducer-side economics where applicable.
- Invested amount and spread commissions were validated line by line.
- Split commissions were validated against dashboard split logic.
- Duplicate commission rows were detected and removed where documented.
- Commission status consistency was enforced.

## Broker vs introducer governance rules

- Broker-only names were blocked from introducer-side allocation where documented.
- Context-specific cases (same name treated differently by vehicle) followed the approved vehicle rules.
- Documented special cases were enforced, including split and reassignment decisions.

## Vehicle-specific rule applications

### VC1

- VC1-specific name mappings and transfer cases were applied.
- VC1-specific fee format conventions were applied.
- VC1-specific corrections from documented checkpoints were enforced.

### VC2

- VC2 broker/introducer boundaries were enforced per approved policy.
- VC2 split scenarios, including paired introducer rules, were enforced.
- VC2 special-case rows were validated against approved outcomes.

### IN

- IN naming and introducer mappings were applied.
- IN-specific approved differences were applied where documented.

## Rule governance

- Latest approved rule wins when documents conflict.
- Rules were applied from documented sources in this order:
  1. Latest checkpoint and reconciliation updates
  2. Dashboard reconciliation documentation
  3. Migration and data-fixing documentation
- Any rule not suitable for automated checking is explicitly tracked and disclosed.

## Legacy instruction tracked separately

- One old Excel formatting instruction (strikethrough delete marker) is tracked as a historical pre-load instruction.
- This does not change the final value validation outcome for the reconciled run.

## Conclusion

The validation used the complete documented business rulebook for this reconciliation, with transparent disclosure of boundary items.
