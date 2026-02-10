# Full Currency Static Analysis
Date: 2026-02-07

## 1) formatCurrency called without explicit currency arg
src/__tests__/lib/fees/calculations.test.ts:569:      expect(formatCurrency(1000)).toBe('$1,000.00')
src/__tests__/lib/fees/calculations.test.ts:570:      expect(formatCurrency(1234.56)).toBe('$1,234.56')
src/__tests__/lib/fees/calculations.test.ts:571:      expect(formatCurrency(0)).toBe('$0.00')
src/lib/fees/calculations.ts:537:          `Line for fee event ${line.fee_event_id}: line amount ${formatCurrency(lineAmount)} differs from fee event computed_amount ${formatCurrency(eventAmount)}`
src/lib/fees/calculations.ts:560:      `Invoice total (${formatCurrency(invoiceTotal)}) does not match sum of line items (${formatCurrency(expectedTotal)}). Discrepancy: ${formatCurrency(discrepancyAmount)} (${discrepancyPercent.toFixed(2)}%)`
src/lib/fees/calculations.ts:567:      `Invoice total (${formatCurrency(invoiceTotal)}) differs from subtotal (${formatCurrency(invoiceSubtotal)}) - verify tax calculation if applicable`
src/app/(staff)/versotech/staff/subscriptions/components/subscription-health-cards.tsx:53:            {formatCurrency(totalCommitment)}
src/app/(staff)/versotech/staff/subscriptions/vehicle-summary/page.tsx:165:                    {formatCurrency(data.grand_totals.total_commitment)}
src/app/(staff)/versotech/staff/subscriptions/vehicle-summary/page.tsx:168:                    Outstanding: {formatCurrency(data.grand_totals.total_outstanding)}
src/app/(staff)/versotech/staff/subscriptions/vehicle-summary/page.tsx:184:                    {formatCurrency(data.grand_totals.total_funded)}
src/app/(staff)/versotech/staff/subscriptions/vehicle-summary/page.tsx:230:                    {formatCurrency(data.grand_totals.total_capital_calls || 0)}
src/app/(staff)/versotech/staff/subscriptions/vehicle-summary/page.tsx:249:                    {formatCurrency(data.grand_totals.total_distributions || 0)}
src/app/(staff)/versotech/staff/subscriptions/vehicle-summary/page.tsx:268:                    {formatCurrency(data.grand_totals.total_nav || 0)}
src/app/(staff)/versotech/staff/admin/components/financial-overview.tsx:102:            {formatCurrency(metrics.aum?.total || 0)}
src/app/(staff)/versotech/staff/admin/components/financial-overview.tsx:121:                  {formatCurrency(metrics.commitments?.total || 0)}
src/app/(staff)/versotech/staff/admin/components/financial-overview.tsx:127:                  {formatCurrency(metrics.commitments?.funded || 0)}
src/app/(staff)/versotech/staff/admin/components/financial-overview.tsx:159:                    {formatCurrency(metrics.revenue?.revenue_mtd || 0)}
src/app/(staff)/versotech/staff/admin/components/financial-overview.tsx:165:                    {formatCurrency(metrics.revenue?.revenue_ytd || 0)}
src/app/(staff)/versotech/staff/admin/components/financial-overview.tsx:175:                      ({formatCurrency(metrics.revenue?.pending_invoices?.amount || 0)})
src/app/(staff)/versotech/staff/admin/components/financial-overview.tsx:185:                      ({formatCurrency(metrics.revenue?.overdue_invoices?.amount || 0)})
src/app/(staff)/versotech/staff/admin/components/financial-overview.tsx:210:                    {formatCurrency(metrics.deal_pipeline?.total_pipeline_value || 0)}
src/app/(staff)/versotech/staff/admin/components/financial-overview.tsx:226:                  {formatCurrency(metrics.deal_pipeline?.average_deal_size || 0)}
src/app/(staff)/versotech/staff/admin/components/financial-overview.tsx:319:                {formatCurrency(metrics.summary?.total_portfolio_value || 0)}
src/app/(staff)/versotech/staff/admin/components/financial-overview.tsx:328:                {formatCurrency(metrics.summary?.total_distributions_ytd || 0)}
src/app/(investor)/versoholdings/vehicle/[id]/page.tsx:298:                  {formatCurrency(positionData.currentValue)}
src/app/(investor)/versoholdings/vehicle/[id]/page.tsx:339:                  {formatCurrency(positionData.costBasis)}
src/app/(investor)/versoholdings/vehicle/[id]/page.tsx:357:                  {formatCurrency(positionData.unrealizedGain)}
src/app/(investor)/versoholdings/vehicle/[id]/page.tsx:394:                        {formatCurrency(subscriptionData.commitment)}
src/app/(investor)/versoholdings/vehicle/[id]/page.tsx:402:                            {formatCurrency(cashflowData.totalContributions)}
src/app/(investor)/versoholdings/vehicle/[id]/page.tsx:408:                            {formatCurrency(cashflowData.totalDistributions)}
src/app/(investor)/versoholdings/vehicle/[id]/page.tsx:414:                            {formatCurrency(cashflowData.unfundedCommitment)}
src/app/(investor)/versoholdings/vehicle/[id]/page.tsx:468:                            {formatCurrency(Math.abs(flow.amount))}
src/app/(investor)/versoholdings/vehicle/[id]/page.tsx:512:                                ? formatCurrency(feeStructure.subscriptionFeeAmount)
src/app/(investor)/versoholdings/vehicle/[id]/page.tsx:517:                                ({formatCurrency((feeStructure.subscriptionFeePercent / 100) * subscriptionData.commitment)})
src/app/(investor)/versoholdings/vehicle/[id]/page.tsx:527:                          <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(feeStructure.spreadFeeAmount)}</span>
src/app/(investor)/versoholdings/vehicle/[id]/page.tsx:534:                          <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(feeStructure.bdFeeAmount)}</span>
src/app/(investor)/versoholdings/vehicle/[id]/page.tsx:541:                          <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(feeStructure.finraFeeAmount)}</span>
src/app/(investor)/versoholdings/vehicle/[id]/page.tsx:548:                          <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{formatCurrency(feeStructure.totalUpfrontFees)}</span>
src/app/(investor)/versoholdings/vehicle/[id]/page.tsx:564:                                ? formatCurrency(feeStructure.managementFeeAmount)
src/app/(investor)/versoholdings/vehicle/[id]/page.tsx:692:                            {formatCurrency(Math.abs(flow.amount))}
src/app/(investor)/versoholdings/vehicle/[id]/page.tsx:745:                              Total NAV: {formatCurrency(valuation.nav_total)}
src/app/(staff)/versotech/staff/reconciliation/[id]/transaction-detail-client.tsx:290:              {formatCurrency(toNumber(match.matched_amount), currency)}
src/app/(staff)/versotech/staff/reconciliation/[id]/transaction-detail-client.tsx:296:              {formatCurrency(toNumber(invoice?.total), currency)}
src/app/(staff)/versotech/staff/reconciliation/[id]/transaction-detail-client.tsx:352:                {formatCurrency(toNumber(invoice?.total), currency)}
src/app/(main)/versotech_main/subscription-packs/subscription-packs-client.tsx:770:                                    @ {formatCurrency(Number(subscription.price_per_share), subscription.currency)}
src/app/(staff)/versotech/staff/reconciliation/components/reconciliation-page-client.tsx:318:                <div className="text-lg font-bold text-amber-600 dark:text-amber-200">{formatCurrency(filteredSummary.outstandingAmount)}</div>
src/app/(staff)/versotech/staff/reconciliation/components/reconciliation-page-client.tsx:329:                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-200">{formatCurrency(filteredSummary.matchedAmount)}</div>
src/app/(staff)/versotech/staff/reconciliation/components/reconciliation-page-client.tsx:340:                <div className="text-lg font-bold text-rose-600 dark:text-rose-200">{formatCurrency(filteredSummary.unmatchedAmount)}</div>
src/app/(staff)/versotech/staff/reconciliation/components/reconciliation-page-client.tsx:392:              {formatCurrency(stats?.matchedAmount || 0)}
src/app/(staff)/versotech/staff/reconciliation/components/reconciliation-page-client.tsx:407:              {formatCurrency(partialRemainingAmount || 0)}
src/app/(staff)/versotech/staff/reconciliation/components/reconciliation-page-client.tsx:422:              {formatCurrency(stats?.unmatchedAmount || 0)}
src/app/api/staff/investors/export/route.ts:144:      formatCurrency(inv.total_commitment),
src/app/api/staff/investors/export/route.ts:145:      formatCurrency(inv.total_contributed),
src/app/api/staff/investors/export/route.ts:146:      formatCurrency(inv.unfunded_commitment),
src/app/api/staff/investors/export/route.ts:147:      formatCurrency(inv.total_distributed),
src/app/api/staff/investors/export/route.ts:148:      formatCurrency(inv.current_nav),
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:464:                {formatCurrency(0)}
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:491:                {formatCurrency(0)}
src/components/lawyer/lawyer-deal-client.tsx:535:                    {deal.target_amount ? formatCurrency(Number(deal.target_amount), deal.currency) : 'N/A'}
src/components/lawyer/lawyer-deal-client.tsx:541:                    {deal.raised_amount ? formatCurrency(Number(deal.raised_amount), deal.currency) : '$0'}
src/components/lawyer/lawyer-deal-client.tsx:547:                    {deal.minimum_investment ? formatCurrency(Number(deal.minimum_investment), deal.currency) : 'N/A'}
src/components/lawyer/lawyer-deal-client.tsx:553:                    {deal.maximum_investment ? formatCurrency(Number(deal.maximum_investment), deal.currency) : 'N/A'}
src/components/lawyer/lawyer-deal-client.tsx:559:                    {deal.offer_unit_price ? formatCurrency(Number(deal.offer_unit_price), deal.currency) : 'N/A'}
src/components/lawyer/lawyer-deal-client.tsx:642:                <span>Target: {deal.target_amount ? formatCurrency(Number(deal.target_amount), deal.currency) : 'N/A'}</span>
src/components/lawyer/lawyer-reconciliation-client.tsx:482:                {formatCurrency(0)}
src/components/lawyer/lawyer-reconciliation-client.tsx:509:                {formatCurrency(0)}
src/components/lawyer/lawyer-reconciliation-client.tsx:536:                {formatCurrency(0)}
src/components/lawyer/lawyer-reconciliation-client.tsx:542:                : formatCurrency(0)})
src/components/subscriptions/capital-activity-table.tsx:305:                        {formatCurrency(cf.amount)}
src/components/subscriptions/capital-activity-table.tsx:450:                        {formatCurrency(dist.amount)}
src/app/api/subscriptions/export/route.ts:148:      `Total Commitment,${formatCurrency(totalCommitment)}`,
src/components/subscriptions/subscription-quick-stats.tsx:84:      value: formatCurrency(metrics.totalCommitment),
src/components/subscriptions/subscription-quick-stats.tsx:85:      subValue: `Avg: ${formatCurrency(avgCommitment)}`,
src/components/subscriptions/subscription-quick-stats.tsx:92:      value: formatCurrency(metrics.totalFunded),
src/components/subscriptions/subscription-quick-stats.tsx:100:      value: formatCurrency(metrics.totalOutstanding),
src/components/subscriptions/subscription-quick-stats.tsx:108:      value: formatCurrency(metrics.totalNAV),
src/components/subscriptions/subscription-bulk-actions.tsx:122:                  <span className="text-foreground font-medium">{formatCurrency(totals.commitment)}</span>
src/components/subscriptions/subscription-bulk-actions.tsx:126:                  <span className="text-green-400 font-medium">{formatCurrency(totals.funded)}</span>
src/components/subscriptions/subscription-bulk-actions.tsx:131:                    <span className="text-yellow-400 font-medium">{formatCurrency(totals.outstanding)}</span>
src/components/subscriptions/subscription-detail-client.tsx:128:              {formatCurrency(metrics.total_commitment)}
src/components/subscriptions/subscription-detail-client.tsx:143:              {formatCurrency(metrics.total_contributed)}
src/components/subscriptions/subscription-detail-client.tsx:160:              {formatCurrency(metrics.unfunded_commitment)}
src/components/subscriptions/subscription-detail-client.tsx:175:              {formatCurrency(metrics.current_nav)}
src/components/subscriptions/subscription-detail-client.tsx:179:              Distributed: {formatCurrency(metrics.total_distributed)}
src/components/subscriptions/subscription-detail-client.tsx:449:                    {formatCurrency(subscription.capital_calls_total || 0)}
src/components/subscriptions/subscription-detail-client.tsx:458:                    {formatCurrency(subscription.distributions_total || 0)}
src/components/subscriptions/subscription-detail-client.tsx:468:                        {formatCurrency(subscription.outstanding_amount)}
src/components/subscriptions/subscription-detail-client.tsx:500:                          {formatCurrency(subscription.price_per_share)}
src/components/subscriptions/subscription-detail-client.tsx:512:                          {formatCurrency(subscription.cost_per_share)}
src/components/subscriptions/subscription-detail-client.tsx:524:                          {formatCurrency(subscription.spread_per_share)}
src/components/subscriptions/subscription-detail-client.tsx:535:                        {formatCurrency(subscription.spread_fee_amount)}
src/components/subscriptions/subscription-detail-client.tsx:556:                            {formatCurrency(subscription.subscription_fee_amount || 0)}
src/components/subscriptions/subscription-detail-client.tsx:573:                            {formatCurrency(subscription.bd_fee_amount || 0)}
src/components/subscriptions/subscription-detail-client.tsx:588:                        {formatCurrency(subscription.finra_fee_amount)}
src/components/subscriptions/subscription-detail-client.tsx:613:                              Threshold: {formatCurrency(subscription.performance_fee_tier1_threshold)}
src/components/subscriptions/subscription-detail-client.tsx:631:                            Threshold: {formatCurrency(subscription.performance_fee_tier2_threshold)}
src/components/subscriptions/vehicle-summary-table.tsx:303:                        {formatCurrency(vehicle.total_commitment)}
src/components/subscriptions/vehicle-summary-table.tsx:306:                        Avg: {formatCurrency(vehicle.avg_commitment)}
src/components/subscriptions/vehicle-summary-table.tsx:311:                        {formatCurrency(vehicle.total_funded)}
src/components/subscriptions/vehicle-summary-table.tsx:319:                        {formatCurrency(vehicle.total_nav)}
src/components/subscriptions/vehicle-summary-table.tsx:337:                        Sub: {formatCurrency(vehicle.total_subscription_fees)}
src/components/subscriptions/vehicle-summary-table.tsx:342:                        {formatCurrency(vehicle.total_capital_calls)}
src/components/subscriptions/vehicle-summary-table.tsx:347:                        {formatCurrency(vehicle.total_distributions)}
src/components/subscriptions/vehicle-summary-table.tsx:353:                          {formatCurrency(vehicle.total_outstanding)}
src/components/investor/sell-position-form.tsx:68:      setError(`Amount cannot exceed your position value of ${formatCurrency(fundedAmount)}`)
src/components/investor/sell-position-form.tsx:130:              {formatCurrency(fundedAmount)}
src/components/investor/sell-position-form.tsx:272:              <span className="font-semibold tabular-nums">{formatCurrency(amountValue)}</span>
src/components/investor/sale-status-tracker.tsx:301:                        {formatCurrency(Number(request.amount_to_sell), currency)}
src/components/investor/sale-status-tracker.tsx:308:                          {formatCurrency(Number(request.asking_price_per_unit), currency)}/unit
src/components/investor/sale-status-tracker.tsx:433:                          {formatCurrency(Number(request.amount_to_sell), currency)} · {config.label}
src/components/commercial-partners/record-cp-commission-dialog.tsx:299:                {formatCurrency(parseFloat(accrualAmount), currency)}
src/components/introducers/record-commission-dialog.tsx:299:                {formatCurrency(parseFloat(accrualAmount), currency)}
src/components/holdings/position-detail-modal.tsx:350:                                  {formatCurrency(Math.abs(cf.amount))}
src/components/holdings/position-detail-modal.tsx:392:                                <div className="font-semibold text-lg">{formatCurrency(fee.amount)}</div>
src/components/holdings/position-detail-modal.tsx:436:                        <div className="text-2xl font-bold text-foreground tabular-nums">{formatCurrency(totalLotValue)}</div>
src/components/holdings/position-detail-modal.tsx:445:                          {totalUnrealizedGain >= 0 ? '+' : ''}{formatCurrency(totalUnrealizedGain)}
src/components/holdings/position-detail-modal.tsx:475:                                <div className="font-semibold text-lg tabular-nums">{formatCurrency(lot.currentValue)}</div>
src/components/holdings/position-detail-modal.tsx:480:                                  {lot.unrealizedGain >= 0 ? '+' : ''}{formatCurrency(lot.unrealizedGain)}
src/components/holdings/position-detail-modal.tsx:491:                                <div className="font-medium tabular-nums">{formatCurrency(lot.unitCost)}</div>
src/components/holdings/position-detail-modal.tsx:495:                                <div className="font-medium tabular-nums">{formatCurrency(lot.units * lot.unitCost)}</div>
src/components/partners/record-commission-dialog.tsx:299:                {formatCurrency(parseFloat(accrualAmount), currency)}
src/components/holdings/deal-holding-card.tsx:178:                {formatCurrency(feesSummary.totalAccrued)} fees
src/components/holdings/deal-holding-card.tsx:190:              {formatCurrency(deal.allocation.totalValue)}
src/components/holdings/deal-holding-card.tsx:208:              {formatCurrency(deal.allocation.unitPrice)}
src/components/holdings/deal-holding-card.tsx:216:                +{formatCurrency(deal.spread.markupPerUnit)}/unit
src/components/holdings/deal-holding-card.tsx:225:                +{formatCurrency(deal.spread.totalMarkup)}
src/components/holdings/vehicle-holding-card.tsx:180:                {formatCurrency(feesSummary.totalAccrued)} fees
src/components/holdings/vehicle-holding-card.tsx:193:                ? formatCurrency(holding.position.currentValue)
src/components/holdings/vehicle-holding-card.tsx:203:                ? formatCurrency(holding.subscription.commitment)
src/components/holdings/vehicle-holding-card.tsx:223:                {formatCurrency(holding.position.costBasis)}
src/components/holdings/vehicle-holding-card.tsx:242:                  {formatCurrency(holding.position.unrealizedGain)}
src/components/staff/arrangers/arrangers-dashboard.tsx:155:          primary={formatCurrency(summary.totalAum)}
src/components/staff/arrangers/arrangers-dashboard.tsx:365:            <Stat label="AUM" value={formatCurrency(arranger.totalAum)} />
src/components/staff/arrangers/arranger-detail-client.tsx:519:                              {formatCurrency(deal.target_amount)}
src/components/staff/introducers/introducers-dashboard.tsx:190:          primary={formatCurrency(summary.totalCommissionPaid)}
src/components/staff/introducers/introducers-dashboard.tsx:196:          primary={formatCurrency(summary.pendingCommission)}
src/components/staff/introducers/introducers-dashboard.tsx:433:                <span>Cap: {formatCurrency(introducer.commissionCapAmount)}</span>
src/components/staff/introducers/introducers-dashboard.tsx:458:          <Stat label="Paid" value={formatCurrency(introducer.totalCommissionPaid)} />
src/components/staff/introducers/introducers-dashboard.tsx:459:          <Stat label="Pending" value={formatCurrency(introducer.pendingCommission)} className="text-orange-500" />
src/components/staff/introducers/introducers-dashboard.tsx:553:            {introduction.commissionAmount ? formatCurrency(introduction.commissionAmount) : 'Commission TBD'}
src/components/staff/partners/partners-dashboard.tsx:297:                            {formatCurrency(partner.typicalInvestmentMin)} - {formatCurrency(partner.typicalInvestmentMax)}
src/components/staff/introducers/introducer-detail-client.tsx:623:              {formatCurrency(metrics.totalCommissionPaid)}
src/components/staff/introducers/introducer-detail-client.tsx:638:              {formatCurrency(metrics.pendingCommission)}
src/components/staff/introducers/introducer-detail-client.tsx:657:                Cap: {formatCurrency(introducer.commission_cap_amount)}
src/components/staff/introducers/introducer-detail-client.tsx:1152:                            {formatCurrency(refInvestor.subscription.amount)}
src/components/staff/introducers/introducer-detail-client.tsx:1406:                          {formatCurrency(comm.accrual_amount)}
src/components/staff/partners/partner-detail-client.tsx:324:                  {formatCurrency(partner.typical_investment_min)} - {formatCurrency(partner.typical_investment_max)}
src/components/staff/partners/partner-detail-client.tsx:522:                        {formatCurrency(partner.typical_investment_min)} - {formatCurrency(partner.typical_investment_max)}
src/components/staff/partners/partner-detail-client.tsx:778:                            {formatCurrency(refInvestor.subscription.amount)}
src/app/api/staff/fees/plans/[id]/generate-agreement/route.ts:35:function formatCurrency(amount: number | null | undefined): string {
src/app/api/staff/fees/plans/[id]/generate-agreement/route.ts:249:        <td>${formatCurrency(s.commitment)}</td>
src/app/api/staff/fees/plans/[id]/generate-agreement/route.ts:252:        <td>${formatCurrency(s.bd_fee_amount)}</td>
src/app/api/staff/fees/plans/[id]/generate-agreement/route.ts:264:        <td><strong>${formatCurrency(totalCapital)}</strong></td>
src/app/api/staff/fees/plans/[id]/generate-agreement/route.ts:267:        <td><strong>${formatCurrency(totalFee)}</strong></td>
src/app/api/staff/fees/plans/[id]/generate-agreement/route.ts:587:        schedule_total_capital: formatCurrency(totalCapital),
src/app/api/staff/fees/plans/[id]/generate-agreement/route.ts:588:        schedule_total_fee: formatCurrency(totalFee),
src/app/api/staff/fees/invoices/generate/route.ts:229:        `[Invoice Generate API] Invoice total mismatch! Invoice total: ${formatCurrency(total)}, Expected: ${formatCurrency(expectedTotal)}`

## 2) USD literals/fallback candidates
src/lib/staff/dashboard-data.ts:325:    const currency = fee.currency || 'USD'
src/lib/staff/dashboard-data.ts:340:    const currency = sub.currency || 'USD'
src/hooks/use-entity-form.ts:33:      currency: 'USD',
src/lib/format.ts:1:export const formatCurrency = (value: number | null | undefined, currency: string = 'USD') => {
src/lib/signature/client.ts:328:          currency: subscription.currency || 'USD',
src/lib/signature/client.ts:528:          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: subscriptionDetails.currency || 'USD', maximumFractionDigits: 0 }).format(subscriptionDetails.commitment)
src/lib/signature/client.ts:620:        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: subscriptionDetails.currency || 'USD', maximumFractionDigits: 0 }).format(subscriptionDetails.commitment)
src/components/investors/add-subscription-dialog.tsx:40:    currency: 'USD',
src/components/investors/add-subscription-dialog.tsx:55:        currency: 'USD',
src/components/investors/add-subscription-dialog.tsx:88:      currency: vehicle?.currency || 'USD'
src/__tests__/utils/test-utils.tsx:162:      currency: 'USD'
src/hooks/use-subscription-form.ts:26:      currency: 'USD',
src/lib/deals/deal-close-handler.ts:64:        currency: params.currency || 'USD',
src/lib/deals/deal-close-handler.ts:361:              const currency = sub.currency || deal.currency || 'USD'
src/lib/deals/deal-close-handler.ts:987:                  const currency = sub.currency || deal.currency || 'USD'
src/components/commercial-partners/commercial-partner-detail-drawer.tsx:515:                                      : formatCurrency(comp.flat_amount || 0, 'USD')}
src/components/commercial-partners/commercial-partner-detail-drawer.tsx:664:                                  {formatCurrency(agreement.commission_cap_amount, 'USD')}
src/lib/currency-totals.ts:5:export function normalizeCurrencyCode(currency: string | null | undefined, fallback = 'USD'): string {
src/lib/currency-totals.ts:46:      if (a === 'USD') return -1
src/lib/currency-totals.ts:47:      if (b === 'USD') return 1
src/components/investors/investor-columns.tsx:193:              currency: 'USD',
src/components/commercial-partners/record-cp-commission-dialog.tsx:75:  const [currency, setCurrency] = useState<string>('USD')
src/components/commercial-partners/record-cp-commission-dialog.tsx:88:      setCurrency('USD')
src/__tests__/mocks/handlers.ts:22:      currency: 'USD'
src/lib/fees/calculations.ts:454:export function formatCurrency(amount: number, currency: string = 'USD'): string {
src/lib/fees/subscription-fee-calculator.ts:301:    const currency = subscription?.currency || 'USD';
src/components/investors/investor-detail-client.tsx:163:                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.total_commitment)
src/components/investors/investor-detail-client.tsx:187:                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.total_contributed)
src/components/investors/investor-detail-client.tsx:192:                ? <>Unfunded: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.unfunded_commitment)}</>
src/components/investors/investor-detail-client.tsx:205:                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.current_nav)
src/components/investors/investor-detail-client.tsx:210:                ? <>Distributed: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(capitalMetrics.total_distributed)}</>
src/__tests__/components/deals/investor-deals-list-client.test.tsx:22:  currency: 'USD',
src/lib/fees/validation.ts:207:  currency: z.string().length(3).default('USD'),
src/lib/fees/validation.ts:279:  currency: z.string().length(3).default('USD'),
src/components/holdings/nav-performance-chart.tsx:19:const formatCurrency = (value: number, currency: string = 'USD') => {
src/components/holdings/nav-performance-chart.tsx:30:export function NAVPerformanceChart({ data, currency = 'USD' }: NAVPerformanceChartProps) {
src/components/investors/subscriptions-tab.tsx:130:      currency: currency || 'USD',
src/components/partners/record-commission-dialog.tsx:75:  const [currency, setCurrency] = useState<string>('USD')
src/components/partners/record-commission-dialog.tsx:88:      setCurrency('USD')
src/components/commissions/submit-invoice-dialog.tsx:133:    commission.currency || 'USD'
src/components/holdings/cash-flow-chart.tsx:19:const formatCurrency = (value: number, currency: string = 'USD') => {
src/components/holdings/cash-flow-chart.tsx:30:export function CashFlowChart({ data, currency = 'USD' }: CashFlowChartProps) {
src/components/entities/edit-entity-modal-refactored.tsx:63:const CURRENCIES = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'AUD', 'CAD']
src/components/entities/edit-entity-modal-refactored.tsx:157:      currency: entity.currency || 'USD',
src/components/entities/edit-entity-modal-refactored.tsx:197:        currency: entity.currency || 'USD',
src/components/holdings/kpi-details-modal.tsx:94:      currency: 'USD',
src/components/holdings/kpi-details-modal.tsx:105:      currency: 'USD',
src/components/holdings/kpi-details-modal.tsx:116:      currency: 'USD',
src/components/holdings/kpi-details-modal.tsx:127:      currency: 'USD',
src/components/holdings/kpi-details-modal.tsx:228:                <span>{metadata.currency || 'USD'} {metadata.nav_per_unit.toFixed(3)}/unit</span>
src/components/holdings/kpi-details-modal.tsx:231:                <span>{metadata.currency || 'USD'} {metadata.unit_price.toFixed(2)}/unit</span>
src/components/holdings/position-detail-modal.tsx:217:    currency: 'USD',
src/components/holdings/vehicle-holding-card.tsx:99:    currency: holding.currency || 'USD',
src/components/holdings/vehicle-holding-card.tsx:150:                {holding.domicile} • {holding.currency || 'USD'}
src/components/holdings/vehicle-holding-card.tsx:230:                  {holding.currency || 'USD'} {holding.valuation.navPerUnit?.toFixed(3)}
src/components/holdings/portfolio-allocation-chart.tsx:32:const formatCurrency = (value: number, currency: string = 'USD') => {
src/components/holdings/portfolio-allocation-chart.tsx:46:  currency = 'USD'
src/components/holdings/portfolio-dashboard.tsx:100:const formatCurrency = (value: number, currency: string = 'USD') => {
src/components/holdings/portfolio-dashboard.tsx:196:  const activeCurrency = selectedCurrency || (currencyBreakdown[0]?.currency ?? 'USD')
src/components/holdings/deal-holding-card.tsx:90:    currency: deal.currency || 'USD',
src/components/deals/create-deal-form.tsx:57:    currency: 'USD',
src/app/(main)/versotech_main/my-mandates/page.tsx:129:    currency: 'USD',
src/app/(main)/versotech_main/my-mandates/page.tsx:295:          currency: deal.currency || 'USD',
src/app/(main)/versotech_main/my-mandates/page.tsx:328:          currency: 'USD',
src/app/(main)/versotech_main/my-mandates/page.tsx:391:        currency: deal.currency || 'USD',
src/app/(main)/versotech_main/my-mandates/page.tsx:423:        currency: 'USD',
src/components/entities/edit-entity-modal.tsx:73:const CURRENCIES = ['USD', 'EUR', 'GBP', 'CHF']
src/components/entities/edit-entity-modal.tsx:114:    currency: 'USD',
src/components/entities/edit-entity-modal.tsx:171:      currency: entity.currency || 'USD',
src/components/entities/edit-entity-modal.tsx:278:        currency: formData.currency.trim().toUpperCase() || 'USD',
src/components/deals/deal-inventory-panel.tsx:46:  currency = 'USD' 
src/components/deals/investor-deals-list-client.tsx:452:  if (!code) return 'USD'
src/components/shared/bank-details-tab.tsx:41:  { value: 'USD', label: 'USD - US Dollar' },
src/components/shared/bank-details-tab.tsx:59:  currency: 'USD',
src/components/entities/create-entity-modal.tsx:65:const CURRENCIES = ['USD', 'EUR', 'GBP', 'CHF']
src/components/entities/create-entity-modal.tsx:76:  currency: 'USD',
src/components/entities/create-entity-modal.tsx:218:        currency: formData.currency.trim().toUpperCase() || 'USD',
src/components/deals/deals-list-client.tsx:351:                            ? `${deal.currency || 'USD'} ${deal.fee_structure.price_per_share.toFixed(2)}/unit`
src/components/deals/deals-list-client.tsx:353:                              ? `${deal.currency || 'USD'} ${deal.fee_structure.price_per_share_text}/unit`
src/components/entities/link-entity-investor-modal.tsx:84:  const [currency, setCurrency] = useState<string>('USD')
src/components/entities/link-entity-investor-modal.tsx:112:      setCurrency('USD')
src/components/entities/link-entity-investor-modal.tsx:208:      if (Object.keys(subscriptionPayload).length > 0 || effectiveDate || fundingDueAt || acknowledgementNotes || subscriptionStatus !== 'pending' || currency !== 'USD') {
src/components/deals/deal-subscriptions-tab.tsx:100:    const currency = subscription.payload_json?.currency || 'USD'
src/components/introducers/introducer-detail-drawer.tsx:304:                          {formatCurrency(data.introducer.commission_cap_amount, 'USD')}
src/components/deals/deal-details-modal.tsx:139:  if (!currency) return 'USD'
src/components/deals/add-share-lot-modal.tsx:29:    currency: 'USD',
src/components/deals/add-share-lot-modal.tsx:75:        currency: 'USD',
src/components/introducers/record-commission-dialog.tsx:75:  const [currency, setCurrency] = useState<string>('USD')
src/components/introducers/record-commission-dialog.tsx:88:      setCurrency('USD')
src/components/deals/subscription-status-card.tsx:79:function formatCurrency(amount: number | null, currency: string = 'USD'): string {
src/components/deals/subscription-status-card.tsx:204:  const currency = subscription.currency || dealCurrency || 'USD'
src/components/introducers/submit-invoice-dialog.tsx:160:    commission.currency || 'USD'
src/components/deals/deal-detail-client.tsx:112:    currency: deal?.currency || 'USD',
src/components/subscriptions/subscription-list-view.tsx:36:      currency: currency || 'USD',
src/components/subscriptions/subscription-quick-stats.tsx:30:    const currency = sub.currency || 'USD'
src/components/subscriptions/subscription-quick-stats.tsx:63:  const formatCurrency = (amount: number, currency = 'USD') => {
src/components/introducers/request-payment-dialog.tsx:115:    commission.currency || 'USD'
src/components/subscriptions/subscription-bulk-actions.tsx:100:      currency: 'USD',
src/components/subscriptions/quick-add-subscription-modal.tsx:46:  const [currency, setCurrency] = useState('USD')
src/components/subscriptions/quick-add-subscription-modal.tsx:105:      setCurrency('USD')
src/components/subscriptions/capital-activity-table.tsx:116:      currency: currency || 'USD',
src/components/subscriptions/vehicle-summary-table.tsx:74:  const formatCurrency = (amount: number, currency: string = 'USD') => {
src/components/introducers/request-invoice-dialog.tsx:80:    commission.currency || 'USD'
src/components/subscriptions/advanced-subscription-filters.tsx:96:const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'AUD', 'CAD']
src/app/(staff)/versotech/staff/subscriptions/components/subscription-columns.tsx:105:    currency: currency || 'USD',
src/app/(staff)/versotech/staff/subscriptions/components/subscription-columns.tsx:114:    currency: currency || 'USD',
src/components/subscriptions/subscription-detail-client.tsx:47:      currency: subscription.currency || 'USD',
src/components/subscriptions/subscription-kanban-view.tsx:49:      currency: currency || 'USD',
src/components/subscriptions/subscription-edit-dialog.tsx:54:    currency: subscription.currency || 'USD',
src/components/subscriptions/new-subscription-dialog.tsx:33:    currency: 'USD',
src/components/subscriptions/new-subscription-dialog.tsx:75:        currency: 'USD',
src/app/(main)/versotech_main/my-commissions/page.tsx:170:    currency: 'USD',
src/app/(main)/versotech_main/my-commissions/page.tsx:278:        currency: 'USD',
src/app/(staff)/versotech/staff/subscriptions/components/subscription-health-cards.tsx:24:  const formatCurrency = (amount: number, currency: string = 'USD') => {
src/components/investor/sell-position-form.tsx:46:      currency: currency || 'USD',
src/components/investor/sell-position-form.tsx:161:              {currency || 'USD'}
src/app/(staff)/versotech/staff/subscriptions/vehicle-summary/page.tsx:52:      currency: 'USD',
src/components/approvals/views/approvals-kanban-view.tsx:79:                          {approval.entity_metadata.indicative_currency || 'USD'}{' '}
src/components/lawyer/lawyer-reconciliation-client.tsx:171:function formatCurrency(amount: number, currency: string = 'USD'): string {
src/components/lawyer/lawyer-reconciliation-client.tsx:267:      const currency = s.currency || 'USD'
src/components/lawyer/lawyer-reconciliation-client.tsx:281:      const currency = f.currency || 'USD'
src/components/lawyer/lawyer-reconciliation-client.tsx:292:      if (a[0] === 'USD') return -1
src/components/lawyer/lawyer-reconciliation-client.tsx:293:      if (b[0] === 'USD') return 1
src/components/approvals/approval-detail-drawer.tsx:325:                      <p className="font-medium text-foreground">{(approval.related_deal as any).currency || 'USD'}</p>
src/components/approvals/approval-detail-drawer.tsx:639:                      {approval.entity_metadata.payload?.currency || 'USD'}{' '}
src/components/approvals/approval-detail-drawer.tsx:650:                      {approval.entity_metadata.indicative_currency || 'USD'}{' '}
src/components/investor/sale-status-tracker.tsx:157:  const formatCurrency = (value: number, currency: string = 'USD') => {
src/components/investor/sale-status-tracker.tsx:217:            const currency = request.subscription?.currency || 'USD'
src/components/investor/sale-status-tracker.tsx:413:            const currency = request.subscription?.currency || 'USD'
src/components/approvals/views/approvals-database-view.tsx:444:                              {approval.entity_metadata.indicative_currency || 'USD'}{' '}
src/components/approvals/approvals-page-client.tsx:594:                                        const currency = approval.entity_metadata?.payload?.currency || 'USD'
src/components/approvals/views/approvals-list-view.tsx:134:                          {approval.entity_metadata.indicative_currency || 'USD'}{' '}
src/app/(staff)/versotech/staff/reconciliation/[id]/page.tsx:104:  const transactionCurrency = transaction.currency || 'USD'
src/app/(staff)/versotech/staff/reconciliation/components/verifications-tab.tsx:362:                    const currency = bankTx?.currency || v.subscriptions?.currency || 'USD'
src/components/dashboard/enhanced-kpi-cards.tsx:103:  const currency = data.currency || 'USD'
src/app/(staff)/versotech/staff/reconciliation/[id]/transaction-detail-client.tsx:59:const formatCurrency = (amount: number, currency: string = 'USD') =>
src/app/(staff)/versotech/staff/reconciliation/[id]/transaction-detail-client.tsx:258:    const currency = invoice?.currency || transaction.currency || 'USD'
src/app/(staff)/versotech/staff/reconciliation/[id]/transaction-detail-client.tsx:318:    const currency = invoice?.currency || transaction.currency || 'USD'
src/app/(staff)/versotech/staff/reconciliation/[id]/transaction-detail-client.tsx:577:                      const currency = invoice.currency || transaction.currency || 'USD'
src/components/dashboard/kpi-detail-modal.tsx:93:                        currency: 'USD',
src/components/dashboard/kpi-detail-modal.tsx:165:                              currency: 'USD',
src/components/dashboard/featured-deals-section.tsx:122:      currency: currency ?? 'USD',
src/components/dashboard/featured-deals-section.tsx:126:    return `${currency ?? 'USD'} ${amount.toLocaleString()}`
src/components/dashboard/featured-deals-section.tsx:221:              ? `${deal.currency || 'USD'} ${priceFromFeeStructure.toFixed(2)}`
src/components/dashboard/featured-deals-section.tsx:223:                ? `${deal.currency || 'USD'} ${priceFromFeeStructureText}`
src/app/(staff)/versotech/staff/reconciliation/components/reconciliation-page-client.tsx:222:      currency: 'USD',
src/app/(staff)/versotech/staff/reconciliation/components/invoice-columns.tsx:67:    currency: currency || 'USD',
src/app/(staff)/versotech/staff/reconciliation/components/transaction-columns.tsx:107:    currency: currency || 'USD',
src/app/(staff)/versotech/staff/reconciliation/components/transaction-columns.tsx:142:        <span>{formatCurrency(match.matched_amount, invoice?.currency || 'USD')}</span>
src/app/(main)/versotech_main/partner-transactions/page.tsx:142:  const currency = transactions.find(t => t.subscription?.currency)?.subscription?.currency || 'USD'
src/app/(main)/versotech_main/partner-transactions/page.tsx:187:    currency: 'USD',
src/app/(main)/versotech_main/partner-transactions/page.tsx:305:                currency: subForDeal?.currency || 'USD',
src/app/(main)/versotech_main/partner-transactions/page.tsx:359:            currency: subscription.currency || 'USD',
src/app/(main)/versotech_main/lawyer-reconciliation/page.tsx:338:    currency: deal.currency || 'USD',
src/app/(main)/versotech_main/lawyer-reconciliation/page.tsx:355:      currency: sub.currency || 'USD',
src/app/(main)/versotech_main/lawyer-reconciliation/page.tsx:380:      currency: fee.currency || 'USD',
src/app/(main)/versotech_main/lawyer-reconciliation/page.tsx:405:      currency: ic.currency || 'USD',
src/app/(main)/versotech_main/lawyer-reconciliation/page.tsx:422:      currency: pc.currency || 'USD',
src/app/(main)/versotech_main/lawyer-reconciliation/page.tsx:439:      currency: cpc.currency || 'USD',
src/app/(main)/versotech_main/lawyer-reconciliation/page.tsx:476:      currency: ic.currency || 'USD',
src/app/(main)/versotech_main/lawyer-reconciliation/page.tsx:497:      currency: pc.currency || 'USD',
src/app/(main)/versotech_main/lawyer-reconciliation/page.tsx:518:      currency: cpc.currency || 'USD',
src/app/(main)/versotech_main/reconciliation/[id]/page.tsx:104:  const transactionCurrency = transaction.currency || 'USD'
src/app/(main)/versotech_main/arranger-reconciliation/page.tsx:237:    currency: deal.currency || 'USD',
src/app/api/subscriptions/create/route.ts:44:        currency: currency || 'USD',
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:274:function formatCurrency(amount: number | null, currency: string = 'USD'): string {
src/app/(main)/versotech_main/subscription-packs/page.tsx:287:      currency: sub.currency || 'USD',
src/app/(main)/versotech_main/subscription-packs/subscription-packs-client.tsx:123:// Note: The shared utility handles null/undefined values and defaults to 'USD'
src/app/(main)/versotech_main/assigned-deals/page.tsx:186:            currency: deal.currency || 'USD',
src/app/(main)/versotech_main/assigned-deals/page.tsx:216:              currency: deal.currency || 'USD',
src/app/(main)/versotech_main/assigned-deals/page.tsx:273:        currency: deal.currency || 'USD',
src/app/(main)/versotech_main/dashboard/partner-dashboard.tsx:137:  const commitmentCurrency = metrics?.commitmentCurrency || 'USD'
src/app/(main)/versotech_main/dashboard/partner-dashboard.tsx:138:  const pendingCurrency = metrics?.pendingCommissionCurrency || 'USD'
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:134:            currency: d.currency || 'USD',
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:189:            const currency = s.currency || 'USD'
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:196:            if (a.currency === 'USD') return -1
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:197:            if (b.currency === 'USD') return 1
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:232:              currency: sub.currency || 'USD',
src/app/api/investors/me/portfolio/route.ts:129:        currency: vehicle?.currency || 'USD',
src/app/api/subscriptions/[id]/regenerate/route.ts:490:      currency_code: subscription.currency || dealData?.currency || 'USD',
src/app/api/subscriptions/[id]/regenerate/route.ts:491:      currency_long: (subscription.currency || dealData?.currency) === 'USD' ? 'United States Dollars' : (subscription.currency || dealData?.currency),
src/app/api/subscriptions/vehicle-summary/route.ts:41:      const code = (currency || 'USD').toUpperCase()
src/app/api/subscriptions/vehicle-summary/route.ts:136:      const currency = sub.currency || 'USD'
src/app/api/subscriptions/export/route.ts:73:      currency: sub.currency || 'USD',
src/app/api/subscriptions/export/route.ts:101:    const formatCurrency = (val: number, currency: string = 'USD') =>
src/app/api/lawyers/me/introducer-commissions/[id]/confirm-payment/route.ts:142:      currency: commission.currency || 'USD',
src/app/api/subscriptions/route.ts:111:        acc[sub.currency || 'USD'] = (acc[sub.currency || 'USD'] || 0) + (sub.commitment || 0)
src/app/api/payments/ingest-bank/route.ts:11:  currency: z.string().default('USD'),
src/app/api/lawyers/me/deals/[id]/route.ts:138:      currency: deal.currency || 'USD'
src/app/api/lawyers/me/deals/[id]/route.ts:164:        currency: sub.currency || deal.currency || 'USD',
src/app/api/lawyers/me/commercial-partner-commissions/[id]/confirm-payment/route.ts:132:      currency: commission.currency || 'USD',
src/app/(main)/versotech_main/opportunities/page.tsx:316:    currency: 'USD'
src/app/(main)/versotech_main/opportunities/page.tsx:400:      let detectedCurrency = 'USD'
src/app/api/fees/route.ts:141:          currency: 'USD',
src/app/api/fees/route.ts:169:          currency: 'USD',
src/app/api/deals/route.ts:15:  currency: z.string().default('USD'),
src/app/api/deals/[id]/fee-structures/[structureId]/generate/route.ts:325:      currency: deal?.currency || 'USD',
src/app/api/portfolio/kpi-details/route.ts:210:              currency: 'USD'
src/app/api/portfolio/kpi-details/route.ts:284:                currency: 'USD',
src/app/api/portfolio/kpi-details/route.ts:324:                  currency: 'USD',
src/app/api/portfolio/kpi-details/route.ts:366:              currency: 'USD',
src/app/api/portfolio/kpi-details/route.ts:437:              currency: 'USD'
src/app/api/portfolio/kpi-details/route.ts:484:              currency: 'USD'
src/app/api/lawyers/me/partner-commissions/[id]/confirm-payment/route.ts:130:      currency: commission.currency || 'USD',
src/app/api/portfolio/route.ts:159:        if (v.id) vehicleCurrency.set(v.id, v.currency || 'USD')
src/app/api/portfolio/route.ts:205:        const currency = vehicleCurrency.get(p.vehicle_id) || 'USD'
src/app/api/portfolio/route.ts:216:        const currency = s.currency || vehicleCurrency.get(s.vehicle_id) || 'USD'
src/app/api/portfolio/route.ts:222:        const currency = vehicleCurrency.get(cf.vehicle_id) || 'USD'
src/app/api/portfolio/route.ts:405:                if (v.id) currencyMap[v.id] = v.currency || 'USD'
src/app/api/investors/me/opportunities/[id]/route.ts:536:      currency: deal.currency || 'USD',
src/app/api/investors/me/opportunities/[id]/route.ts:610:        currency: subscription.currency || deal.currency || 'USD',
src/app/api/automation/subscription-complete/route.ts:188:      derivedCurrency = dealRow?.currency ?? 'USD'
src/app/api/automation/subscription-complete/route.ts:200:        currency: derivedCurrency ?? 'USD',
src/app/(investor)/versoholdings/data-rooms/[dealId]/page.tsx:53:function formatCurrency(amount: number | string | null, currency: string = 'USD'): string {
src/app/(investor)/versoholdings/data-rooms/[dealId]/page.tsx:318:                    {formatCurrency(deal.minimum_investment, deal.currency || 'USD')}
src/app/(investor)/versoholdings/data-rooms/[dealId]/page.tsx:324:                    {formatCurrency(deal.maximum_investment, deal.currency || 'USD')}
src/app/(investor)/versoholdings/data-rooms/[dealId]/page.tsx:331:                      ? formatCurrency(deal.offer_unit_price, deal.currency || 'USD') + ' per share'
src/app/(investor)/versoholdings/data-rooms/[dealId]/page.tsx:344:                    {formatCurrency(deal.target_amount, deal.currency || 'USD')}
src/app/(investor)/versoholdings/data-rooms/[dealId]/page.tsx:414:                  currency={deal.currency ?? 'USD'}
src/app/api/arrangers/me/reports/introducer-reconciliation/route.ts:188:      currency: 'USD',
src/app/api/arrangers/me/reports/commercial-partner-reconciliation/route.ts:188:      currency: 'USD',
src/app/api/arrangers/me/reports/partner-reconciliation/route.ts:191:      currency: 'USD',
src/app/api/deals/[id]/inventory/route.ts:14:  currency: z.string().default('USD'),
src/app/(investor)/versoholdings/vehicle/[id]/page.tsx:226:    currency: vehicle.currency || 'USD',
src/app/api/deals/[id]/capacity/route.ts:88:      currency: deal.currency || 'USD',
src/app/api/arrangers/me/payment-requests/route.ts:173:    const currencies = [...new Set(feeEvents.map((event) => (event.currency || 'USD').toUpperCase()))]
src/app/api/arrangers/me/payment-requests/route.ts:180:    const invoiceCurrency = currencies[0] || 'USD'
src/app/api/staff/investors/export/route.ts:127:      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val)
src/app/api/admin/bank-details/route.ts:89:      currency = 'USD',
src/app/(investor)/versoholdings/deal/[id]/page.tsx:188:        currency: currency || 'USD',
src/app/api/introducers/me/commissions/[id]/submit-invoice/route.ts:144:      currency: commission.currency || 'USD',
src/app/api/admin/metrics/dashboard/route.ts:157:    ) || aumCurrencyEntries[0]?.[0] || 'USD'
src/app/api/admin/metrics/dashboard/route.ts:193:    ) || revenueCurrencyEntries[0]?.[0] || 'USD'
src/app/api/investors/me/opportunities/route.ts:169:        currency: deal.currency || 'USD',
src/app/api/introducers/me/introductions/export/route.ts:132:              currency: comm.currency || 'USD',
src/app/api/introducers/me/introductions/export/route.ts:177:        comm?.currency || 'USD',
src/app/api/arrangers/me/partner-commissions/route.ts:22:  currency: z.string().default('USD'),
src/app/api/arrangers/me/commercial-partners/[cpId]/route.ts:126:      currency: 'USD',
src/app/api/arrangers/me/partner-commissions/[id]/request-invoice/route.ts:108:        currency: commission.currency || 'USD',
src/app/api/commercial-partners/me/client-transactions/route.ts:46:  return 'USD'
src/app/api/arrangers/me/partner-commissions/[id]/request-payment/route.ts:90:      currency: commission.currency || 'USD',
src/app/api/arrangers/me/introducer-commissions/[id]/request-invoice/route.ts:103:        currency: commission.currency || 'USD',
src/app/api/arrangers/me/introducer-commissions/[id]/request-invoice/route.ts:130:          currency: commission.currency || 'USD',
src/app/api/arrangers/me/partners/[partnerId]/route.ts:122:      currency: 'USD',
src/app/api/partners/me/dashboard/route.ts:155:    const commitmentCurrency = matchedSubscriptions.find(sub => sub.currency)?.currency || 'USD'
src/app/api/partners/me/dashboard/route.ts:158:    let pendingCommissionCurrency = 'USD'
src/app/api/arrangers/me/introducer-commissions/[id]/request-payment/route.ts:90:      currency: commission.currency || 'USD',
src/app/api/investors/[investorId]/subscriptions/route.ts:161:      const currency = sub.currency || 'USD'
src/app/api/arrangers/me/introducer-commissions/route.ts:23:  currency: z.string().default('USD'),
src/app/api/arrangers/me/commercial-partner-commissions/route.ts:22:  currency: z.string().default('USD'),
src/app/api/arrangers/me/commercial-partner-commissions/[id]/request-invoice/route.ts:104:        currency: commission.currency || 'USD',
src/app/api/arrangers/me/commercial-partner-commissions/[id]/request-payment/route.ts:86:      currency: commission.currency || 'USD',
src/app/api/arrangers/me/introducers/[introducerId]/route.ts:122:      currency: 'USD',
src/app/api/staff/reconciliation/upload/route.ts:59:        currency: row.currency || 'USD',
src/app/api/staff/reconciliation/match/manual/route.ts:112:    if ((transaction.currency || 'USD') !== (invoice.currency || 'USD')) {
src/app/api/cashflows/route.ts:155:      currency: cf.vehicles?.currency || 'USD',
src/app/api/vehicles/route.ts:40:      currency: body.currency || 'USD',
src/app/api/staff/reconciliation/match/accept/route.ts:104:    if ((transaction.currency || 'USD') !== (invoice.currency || 'USD')) {
src/app/api/staff/fees/commissions/[id]/mark-paid/route.ts:269:      currency: commissionData.currency || 'USD',
src/app/api/escrow/[id]/confirm-funding/route.ts:119:        error: `Amount would exceed commitment. Maximum additional funding allowed: ${remaining.toLocaleString()} ${subscription.currency || 'USD'}`,
src/app/api/escrow/[id]/confirm-funding/route.ts:209:        message: `Lawyer confirmed ${amount.toLocaleString()} ${subscription.currency || 'USD'} received for ${dealName}. Status: ${newStatus}`,
src/app/api/escrow/[id]/confirm-funding/route.ts:236:          message: `${amount.toLocaleString()} ${subscription.currency || 'USD'} confirmed for ${dealName}. Status: ${newStatus}`,
src/app/api/approvals/[id]/action/route.ts:1057:              'USD'
src/app/api/approvals/[id]/action/route.ts:1362:                  currency_code: submission.deal.currency || 'USD',
src/app/api/approvals/[id]/action/route.ts:1363:                  currency_long: submission.deal.currency === 'USD' ? 'United States Dollars' : submission.deal.currency,
src/app/api/approvals/[id]/action/route.ts:1620:                                currency: submission.deal.currency || 'USD',
src/app/api/cron/fees/generate-scheduled/route.ts:122:            currency: 'USD',
src/app/api/staff/fees/invoices/generate-simple/route.ts:69:      currency: 'USD'
src/app/api/staff/fees/invoices/generate/route.ts:246:      currency: 'USD',
src/app/api/entities/[id]/investors/route.ts:354:          currency: subInput.currency ? subInput.currency.toUpperCase() : 'USD',
src/app/api/entities/[id]/investors/route.ts:410:        const holdingCurrency = subInput.currency?.toUpperCase() || (activeDeal as any).currency || 'USD'
src/app/api/entities/[id]/investors/route.ts:564:                  currency: payload.subscription?.currency?.toUpperCase() ?? 'USD',
src/components/investors/add-subscription-dialog.tsx:208:                  <SelectItem value="USD">USD</SelectItem>
src/components/investors/edit-subscription-dialog.tsx:166:                  <SelectItem value="USD" className="text-white">USD</SelectItem>
src/components/subscriptions/quick-add-subscription-modal.tsx:301:                      <SelectItem value="USD">USD</SelectItem>
src/components/subscriptions/subscription-edit-dialog.tsx:325:                        <SelectItem value="USD" className="text-foreground">USD</SelectItem>
src/components/subscriptions/new-subscription-dialog.tsx:180:                  <SelectItem value="USD" className="text-foreground">USD</SelectItem>
src/components/entities/subscription-edit-modal.tsx:106:                        placeholder="USD"
src/components/deals/add-share-lot-modal.tsx:175:                  <SelectItem value="USD">USD</SelectItem>
src/components/deals/create-deal-form.tsx:480:                      <SelectItem value="USD">USD</SelectItem>
src/components/deals/deal-detail-client.tsx:564:                    <SelectItem value="USD">USD</SelectItem>

## 3) Hardcoded $ candidates in route/component files
src/components/investors/edit-investor-modal.tsx:156:      const response = await fetch(`/api/staff/investors/${investor.id}`, {
src/app/(admin)/versotech_admin/users/investors/page.tsx:183:          <CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
src/app/(admin)/versotech_admin/users/investors/page.tsx:313:              href={`/versotech_admin/users/${user.id}`}
src/app/(admin)/versotech_admin/users/investors/page.tsx:435:              <Link href={`/versotech_admin/users/${user.id}`}>
src/app/(admin)/versotech_admin/users/investors/page.tsx:609:      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
src/app/(admin)/versotech_admin/users/investors/page.tsx:616:    link.setAttribute('download', `investors-export-${format(new Date(), 'yyyy-MM-dd')}.csv`)
src/app/(admin)/versotech_admin/users/investors/page.tsx:688:    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
src/app/(admin)/versotech_admin/users/investors/page.tsx:714:      const response = await fetch(`/api/admin/users?${params}`)
src/app/(admin)/versotech_admin/users/investors/page.tsx:770:    window.location.href = `/versotech_admin/users/${user.id}`
src/app/(admin)/versotech_admin/users/investors/page.tsx:793:      const response = await fetch(`/api/admin/users/${userToAction.id}/toggle-lock`, {
src/app/(admin)/versotech_admin/users/investors/page.tsx:799:        description: `${userToAction.displayName}'s account has been locked.`,
src/app/(admin)/versotech_admin/users/investors/page.tsx:818:      const response = await fetch(`/api/admin/users/${userToAction.id}/reset-password`, {
src/app/(admin)/versotech_admin/users/investors/page.tsx:824:        description: `A password reset link has been sent to ${userToAction.email}.`,
src/app/(admin)/versotech_admin/users/investors/page.tsx:842:      const response = await fetch(`/api/admin/users/${userToAction.id}/deactivate`, {
src/app/(admin)/versotech_admin/users/investors/page.tsx:848:        description: `${userToAction.displayName} has been deactivated.`,
src/app/(main)/versotech_main/investors/page.tsx:191:    query = query.or(`legal_name.ilike.%${params.q}%,email.ilike.%${params.q}%`)
src/components/investors/add-subscription-dialog.tsx:109:      const res = await fetch(`/api/investors/${investorId}/subscriptions`, {
src/components/investors/add-subscription-dialog.tsx:173:                    {vehicle.name} {vehicle.type ? `(${vehicle.type})` : ''}
src/components/investors/add-user-to-investor-modal.tsx:94:      const response = await fetch(`/api/staff/investors/${investorId}/users`, {
src/components/investors/add-user-to-investor-modal.tsx:111:        toast.success(`Invitation sent to ${submitEmail}. They will receive an email to set up their account.`)
src/components/investors/add-user-to-investor-modal.tsx:113:        toast.success(`User ${submitEmail} has been linked to this investor.`)
src/app/(admin)/versotech_admin/users/entities/page.tsx:179:          <CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
src/app/(admin)/versotech_admin/users/entities/page.tsx:349:                            href={`/versotech_admin/users/${user.id}`}
src/app/(admin)/versotech_admin/users/entities/page.tsx:371:                          <Link href={`/versotech_admin/users/${user.id}`}>
src/app/(admin)/versotech_admin/users/entities/page.tsx:433:    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
src/app/(admin)/versotech_admin/users/entities/page.tsx:451:      const response = await fetch(`/api/admin/entities/users?${params}`)
src/app/(admin)/versotech_admin/users/entities/page.tsx:634:            <EntityCard key={`${entity.type}-${entity.id}`} entity={entity} />
src/components/investors/investor-columns.tsx:289:                <Link href={`/versotech_main/investors/${investor.id}`}>
src/app/(admin)/versotech_admin/users/page.tsx:196:          <CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
src/app/(admin)/versotech_admin/users/page.tsx:355:              href={`/versotech_admin/users/${user.id}`}
src/app/(admin)/versotech_admin/users/page.tsx:492:              <Link href={`/versotech_admin/users/${user.id}`}>
src/app/(admin)/versotech_admin/users/page.tsx:674:      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
src/app/(admin)/versotech_admin/users/page.tsx:681:    link.setAttribute('download', `users-export-${format(new Date(), 'yyyy-MM-dd')}.csv`)
src/app/(admin)/versotech_admin/users/page.tsx:760:    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
src/app/(admin)/versotech_admin/users/page.tsx:790:      const response = await fetch(`/api/admin/users?${params}`)
src/app/(admin)/versotech_admin/users/page.tsx:826:        description: `${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} deactivated successfully.`,
src/app/(admin)/versotech_admin/users/page.tsx:852:    router.push(`/versotech_admin/users/${user.id}`)
src/app/(admin)/versotech_admin/users/page.tsx:875:      const response = await fetch(`/api/admin/users/${userToAction.id}/toggle-lock`, {
src/app/(admin)/versotech_admin/users/page.tsx:881:        description: `${userToAction.displayName}'s account has been locked.`,
src/app/(admin)/versotech_admin/users/page.tsx:900:      const response = await fetch(`/api/admin/users/${userToAction.id}/reset-password`, {
src/app/(admin)/versotech_admin/users/page.tsx:906:        description: `A password reset link has been sent to ${userToAction.email}.`,
src/app/(admin)/versotech_admin/users/page.tsx:924:      const response = await fetch(`/api/admin/users/${userToAction.id}/deactivate`, {
src/app/(admin)/versotech_admin/users/page.tsx:930:        description: `${userToAction.displayName} has been deactivated.`,
src/components/investors/portal-users-list.tsx:27:    if (!confirm(`Remove ${userName} from the investor portal?`)) {
src/components/investors/portal-users-list.tsx:32:      const response = await fetch(`/api/staff/investors/${investorId}/users/${userId}`, {
src/app/(main)/versotech_main/entities/page.tsx:117:          set.add(`entity-link-${row.vehicle_id}-${set.size}`)
src/components/investors/investor-detail-actions.tsx:33:    `Investor ${investor.id.slice(0, 8)}`
src/components/investors/investor-detail-actions.tsx:40:  const ofacHref = `/versotech_admin/agents?${ofacParams.toString()}`
src/app/(admin)/versotech_admin/users/[id]/page.tsx:296:      const response = await fetch(`/api/admin/users/${userId}`)
src/app/(admin)/versotech_admin/users/[id]/page.tsx:322:      const filterParam = activityFilter !== 'all' ? `&action=${encodeURIComponent(activityFilter)}` : ''
src/app/(admin)/versotech_admin/users/[id]/page.tsx:325:        `/api/admin/users/${userId}/activity?offset=${currentOffset}&limit=20${filterParam}`
src/app/(admin)/versotech_admin/users/[id]/page.tsx:382:      return `${mappedVerb} ${log.entity_type.replace(/_/g, ' ')}`
src/app/(admin)/versotech_admin/users/[id]/page.tsx:385:    return subject ? `${mappedVerb} ${subject}` : mappedVerb
src/app/(admin)/versotech_admin/users/[id]/page.tsx:403:      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
src/app/(admin)/versotech_admin/users/[id]/page.tsx:410:    link.download = `${user?.displayName || 'user'}_activity_${new Date().toISOString().split('T')[0]}.csv`
src/app/(admin)/versotech_admin/users/[id]/page.tsx:417:      description: `${activityLogs.length} activities exported to CSV`,
src/app/(admin)/versotech_admin/users/[id]/page.tsx:436:        `/api/admin/users/${userId}/activity?limit=1000&action=LOGIN`
src/app/(admin)/versotech_admin/users/[id]/page.tsx:451:        `/api/admin/users/${userId}/activity?limit=100&action=LOGIN_FAILED`
src/app/(admin)/versotech_admin/users/[id]/page.tsx:466:        `/api/admin/users/${userId}/activity?limit=1&action=PASSWORD_CHANGED`
src/app/(admin)/versotech_admin/users/[id]/page.tsx:488:        ? `/api/admin/users/${userId}/reactivate`
src/app/(admin)/versotech_admin/users/[id]/page.tsx:489:        : `/api/admin/users/${userId}/deactivate`
src/app/(admin)/versotech_admin/users/[id]/page.tsx:500:          ? `${user.displayName} can now access the platform.`
src/app/(admin)/versotech_admin/users/[id]/page.tsx:501:          : `${user.displayName} can no longer access the platform.`,
src/app/(admin)/versotech_admin/users/[id]/page.tsx:518:      const response = await fetch(`/api/admin/users/${userId}/toggle-lock`, {
src/app/(admin)/versotech_admin/users/[id]/page.tsx:530:          ? `${user.displayName}'s account has been locked.`
src/app/(admin)/versotech_admin/users/[id]/page.tsx:531:          : `${user.displayName}'s account has been unlocked.`,
src/app/(admin)/versotech_admin/users/[id]/page.tsx:548:      const response = await fetch(`/api/admin/users/${userId}/revoke-sessions`, {
src/app/(admin)/versotech_admin/users/[id]/page.tsx:559:        description: `All active sessions for ${user.displayName} have been terminated.`,
src/app/(admin)/versotech_admin/users/[id]/page.tsx:600:      const response = await fetch(`/api/admin/users/${userId}/deactivate`, {
src/app/(admin)/versotech_admin/users/[id]/page.tsx:610:        description: `${user.displayName} has been deactivated and can no longer access the platform.`,
src/app/(admin)/versotech_admin/users/[id]/page.tsx:627:      const response = await fetch(`/api/admin/users/${userId}/reactivate`, {
src/app/(admin)/versotech_admin/users/[id]/page.tsx:637:        description: `${user.displayName} has been reactivated and can now access the platform.`,
src/app/(admin)/versotech_admin/users/[id]/page.tsx:654:      const response = await fetch(`/api/admin/users/${userId}/toggle-lock`, {
src/app/(admin)/versotech_admin/users/[id]/page.tsx:666:          ? `${user.displayName} has been locked and cannot access the platform.`
src/app/(admin)/versotech_admin/users/[id]/page.tsx:667:          : `${user.displayName} has been unlocked and can now access the platform.`,
src/app/(admin)/versotech_admin/users/[id]/page.tsx:684:      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
src/app/(admin)/versotech_admin/users/[id]/page.tsx:694:        description: `A password reset link has been sent to ${user.email}.`,
src/app/(admin)/versotech_admin/users/[id]/page.tsx:723:      const response = await fetch(`/api/admin/users/${userId}`, {
src/app/(admin)/versotech_admin/users/[id]/page.tsx:759:        `/api/admin/users/${userId}/entities/${entityToRemove.id}?type=${entityToRemove.type}`,
src/app/(admin)/versotech_admin/users/[id]/page.tsx:769:        description: `${entityToRemove.name} has been unlinked from ${user.displayName}.`,
src/app/(admin)/versotech_admin/users/[id]/page.tsx:1134:                            <TableRow key={`${entity.type}-${entity.id}`}>
src/app/(admin)/versotech_admin/users/[id]/page.tsx:1265:                        ? `No "${activityFilter.replace(/_/g, ' ')}" actions found. Try selecting a different filter.`
src/app/(admin)/versotech_admin/users/[id]/page.tsx:1581:                          : `failed attempt${failedLoginCount !== 1 ? 's' : ''} recorded`}
src/components/investors/investor-filters.tsx:41:    router.push(`/versotech_main/investors?${params.toString()}`)
src/components/investors/investor-filters.tsx:53:    router.push(`/versotech_main/investors?${params.toString()}`)
src/app/(main)/versotech_main/my-mandates/page.tsx:276:                  signing_url: `/versotech_main/versosign/sign/${sig.signing_token}`
src/app/(main)/versotech_main/my-mandates/page.tsx:493:              ? `Manage deals and placement activities as ${arrangerInfo.legal_name}`
src/app/(main)/versotech_main/my-mandates/page.tsx:746:                                {mandate.sector && ` • ${mandate.sector}`}
src/app/(main)/versotech_main/my-mandates/page.tsx:812:                          <Link href={`/versotech_main/my-mandates/${mandate.id}`}>
src/app/(admin)/versotech_admin/users/staff/page.tsx:145:  return displayPermissions.slice(0, 3).join(', ') + (displayPermissions.length > 3 ? ` +${displayPermissions.length - 3}` : '')
src/app/(admin)/versotech_admin/users/staff/page.tsx:188:              href={`/versotech_admin/users/${staff.id}`}
src/app/(admin)/versotech_admin/users/staff/page.tsx:320:              <Link href={`/versotech_admin/users/${staff.id}`}>
src/app/(admin)/versotech_admin/users/staff/page.tsx:456:      const response = await fetch(`/api/admin/staff/${staffMember.id}/assigned-investors`)
src/app/(admin)/versotech_admin/users/staff/page.tsx:500:        description: `Investors reassigned from ${selectedStaff.display_name} successfully.`,
src/components/investors/investor-detail-client.tsx:219:      <Tabs defaultValue="overview" className="space-y-6" id={`investor-tabs-${investor.id}`}>
src/components/investors/investor-detail-client.tsx:442:          apiEndpoint={`/api/staff/investors/${investor.id}`}
src/components/investors/add-investor-modal.tsx:180:            const fallbackResponse = await fetch(`/api/staff/investors/${createdInvestorId}/users`, {
src/components/investors/investor-search.tsx:31:    router.push(`${pathname}?${params.toString()}`)
src/components/investors/export-investors-button.tsx:63:        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
src/components/investors/export-investors-button.tsx:72:      link.setAttribute('download', `investors_export_${new Date().toISOString().split('T')[0]}.csv`)
src/components/investors/export-investors-button.tsx:79:      toast.success(`Exported ${investors.length} investors to CSV`)
src/components/profile/gdpr-controls.tsx:88:      a.download = `verso-data-export-${new Date().toISOString().split('T')[0]}.json`
src/app/(admin)/versotech_admin/settings/page.tsx:98:    toast.success(`${label} copied to clipboard`)
src/components/investors/subscriptions-tab.tsx:93:      const res = await fetch(`/api/investors/${investorId}/subscriptions`)
src/components/investors/subscriptions-tab.tsx:96:        let message = `Failed to fetch subscriptions (status ${res.status})`
src/components/investors/subscriptions-tab.tsx:102:              ? `${errorBody.error}: ${errorBody.details}`
src/components/investors/subscriptions-tab.tsx:210:            <Card key={group.vehicle?.id ?? `no-vehicle-${index}`}>
src/components/investors/subscriptions-tab.tsx:346:                              <p className={`text-xs font-medium mt-1 ${moic >= 1 ? 'text-green-600' : 'text-red-600'}`}>
src/components/investors/subscriptions-tab.tsx:371:                                <p className={`font-medium ${moic && moic >= 1 ? 'text-green-600' : 'text-red-600'}`}>
src/app/(admin)/versotech_admin/agents/page.tsx:336:  return `~${numeric.toFixed(2)}`
src/app/(admin)/versotech_admin/agents/page.tsx:342:  return `${Math.round(clamped * 100)}%`
src/app/(admin)/versotech_admin/agents/page.tsx:487:    const fromDate = new Date(`${activityFromFilter}T00:00:00Z`)
src/app/(admin)/versotech_admin/agents/page.tsx:494:    const toDate = new Date(`${activityToFilter}T23:59:59Z`)
src/app/(admin)/versotech_admin/agents/page.tsx:860:    subjectDirectory.set(`${record.type}:${record.id}`, record)
src/app/(admin)/versotech_admin/agents/page.tsx:1086:        ? `${data.kyc_subject_type}:${data.kyc_subject_id}`
src/app/(admin)/versotech_admin/agents/page.tsx:1102:          ? `${metadata.survey_subject_type}:${metadata.survey_subject_id}`
src/app/(admin)/versotech_admin/agents/page.tsx:1168:    const key = `${subjectInfo.type}:${subjectInfo.id}`
src/app/(admin)/versotech_admin/agents/page.tsx:1232:      const key = `${subjectInfo.type}:${subjectInfo.id}`
src/app/(admin)/versotech_admin/agents/page.tsx:1245:        /^\d{4}-\d{2}-\d{2}$/.test(aiSuggestion.suggested_expiry_date)
src/app/(admin)/versotech_admin/agents/page.tsx:1506:      (log.created_by ? `User ${log.created_by.slice(0, 6)}` : 'System')
src/app/(admin)/versotech_admin/agents/page.tsx:1627:  const baseHref = baseQueryString ? `/versotech_admin/agents?${baseQueryString}` : '/versotech_admin/agents'
src/app/(admin)/versotech_admin/agents/page.tsx:1630:  const activityBaseHref = `/versotech_admin/agents?${activityParams.toString()}`
src/app/(admin)/versotech_admin/agents/page.tsx:1631:  const blacklistModalHref = `${baseHref}${baseQueryString ? '&' : '?'}mode=new`
src/app/(admin)/versotech_admin/agents/page.tsx:1632:  const ofacModalHref = `${baseHref}${baseQueryString ? '&' : '?'}mode=ofac`
src/app/(admin)/versotech_admin/agents/page.tsx:1641:    return queryString ? `/versotech_admin/agents?${queryString}` : '/versotech_admin/agents'
src/app/(admin)/versotech_admin/agents/page.tsx:1683:      const haystack = `${row.subject_name} ${row.document_label}`.toLowerCase()
src/app/(admin)/versotech_admin/agents/page.tsx:1741:      redirect(`${redirectTarget}${separator}error=${encodeURIComponent('Failed to create blacklist entry')}`)
src/app/(admin)/versotech_admin/agents/page.tsx:1765:    redirect(`${redirectTarget}${separator}success=Blacklist%20entry%20created`)
src/app/(admin)/versotech_admin/agents/page.tsx:1817:      redirect(`${redirectTarget}${separator}error=${encodeURIComponent('Failed to update blacklist entry')}`)
src/app/(admin)/versotech_admin/agents/page.tsx:1820:    redirect(`${redirectTarget}${separator}success=Blacklist%20entry%20updated`)
src/app/(admin)/versotech_admin/agents/page.tsx:1854:        `${redirectTarget}${separator}error=${encodeURIComponent(
src/app/(admin)/versotech_admin/agents/page.tsx:1864:        description: `Risk recalculated (${riskType})`,
src/app/(admin)/versotech_admin/agents/page.tsx:1899:          title: `High risk ${riskType} detected`,
src/app/(admin)/versotech_admin/agents/page.tsx:1900:          message: `A ${riskType} was recalculated at grade ${riskGrade}. Review the risk profile for next steps.`,
src/app/(admin)/versotech_admin/agents/page.tsx:1901:          link: `/versotech_admin/agents?tab=risk&risk=${riskType}:${targetId}`,
src/app/(admin)/versotech_admin/agents/page.tsx:1919:    redirect(`${redirectTarget}${separator}success=Risk%20recalculated`)
src/app/(admin)/versotech_admin/agents/page.tsx:1974:        kyc_subject_key: `${target.subjectType}:${target.subjectId}`,
src/app/(admin)/versotech_admin/agents/page.tsx:1995:      redirect(`${redirectTarget}${separator}error=Failed%20to%20send%20reminders`)
src/app/(admin)/versotech_admin/agents/page.tsx:2002:        description: `KYC reminders sent (${parsedTargets.length})`,
src/app/(admin)/versotech_admin/agents/page.tsx:2014:    redirect(`${redirectTarget}${separator}success=KYC%20reminders%20sent`)
src/app/(admin)/versotech_admin/agents/page.tsx:2069:        survey_subject_key: `${target.subjectType}:${target.subjectId}`,
src/app/(admin)/versotech_admin/agents/page.tsx:2092:      redirect(`${redirectTarget}${separator}error=Failed%20to%20send%20survey%20requests`)
src/app/(admin)/versotech_admin/agents/page.tsx:2104:          survey_subject_key: `${target.subjectType}:${target.subjectId}`,
src/app/(admin)/versotech_admin/agents/page.tsx:2114:    redirect(`${redirectTarget}${separator}success=Annual%20survey%20sent`)
src/app/(admin)/versotech_admin/agents/page.tsx:2135:      redirect(`${redirectTarget}${separator}error=Invalid%20KYC%20submission`)
src/app/(admin)/versotech_admin/agents/page.tsx:2146:      redirect(`${redirectTarget}${separator}error=KYC%20submission%20not%20found`)
src/app/(admin)/versotech_admin/agents/page.tsx:2150:      redirect(`${redirectTarget}${separator}error=No%20document%20linked%20to%20submission`)
src/app/(admin)/versotech_admin/agents/page.tsx:2160:      redirect(`${redirectTarget}${separator}error=Unable%20to%20load%20document`)
src/app/(admin)/versotech_admin/agents/page.tsx:2173:      redirect(`${redirectTarget}${separator}error=Unable%20to%20read%20document%20file`)
src/app/(admin)/versotech_admin/agents/page.tsx:2213:      redirect(`${redirectTarget}${separator}error=Failed%20to%20store%20AI%20suggestion`)
src/app/(admin)/versotech_admin/agents/page.tsx:2221:          ? `AI suggested expiry ${suggestion.suggestedExpiryDate}`
src/app/(admin)/versotech_admin/agents/page.tsx:2239:      redirect(`${redirectTarget}${separator}success=AI%20suggested%20an%20expiry%20date`)
src/app/(admin)/versotech_admin/agents/page.tsx:2241:    redirect(`${redirectTarget}${separator}error=${encodeURIComponent(suggestion.error || 'AI could not find an expiry date')}`)
src/app/(admin)/versotech_admin/agents/page.tsx:2262:      redirect(`${redirectTarget}${separator}error=Invalid%20KYC%20submission`)
src/app/(admin)/versotech_admin/agents/page.tsx:2273:      redirect(`${redirectTarget}${separator}error=KYC%20submission%20not%20found`)
src/app/(admin)/versotech_admin/agents/page.tsx:2287:      /^\d{4}-\d{2}-\d{2}$/.test(aiSuggestion.suggested_expiry_date)
src/app/(admin)/versotech_admin/agents/page.tsx:2292:      redirect(`${redirectTarget}${separator}error=No%20AI%20suggested%20date%20to%20confirm`)
src/app/(admin)/versotech_admin/agents/page.tsx:2315:      redirect(`${redirectTarget}${separator}error=Failed%20to%20confirm%20expiry%20date`)
src/app/(admin)/versotech_admin/agents/page.tsx:2329:        description: `KYC expiry confirmed at ${suggestedExpiryDate}`,
src/app/(admin)/versotech_admin/agents/page.tsx:2343:    redirect(`${redirectTarget}${separator}success=KYC%20expiry%20date%20updated`)
src/app/(admin)/versotech_admin/agents/page.tsx:2432:      redirect(`${redirectTarget}${separator}error=Failed%20to%20log%20event`)
src/app/(admin)/versotech_admin/agents/page.tsx:2457:    redirect(`${redirectTarget}${separator}success=Compliance%20event%20logged`)
src/app/(admin)/versotech_admin/agents/page.tsx:2513:      redirect(`${redirectTarget}${separator}error=Failed%20to%20log%20OFAC%20screening`)
src/app/(admin)/versotech_admin/agents/page.tsx:2521:        const storagePath = `compliance/ofac/${newScreening.id}/${timestamp}-${safeName}`
src/app/(admin)/versotech_admin/agents/page.tsx:2562:        description: `OFAC screening (${result}) - ${screenedName}`,
src/app/(admin)/versotech_admin/agents/page.tsx:2591:          description: `Auto-blocked from OFAC match: ${screenedName}`,
src/app/(admin)/versotech_admin/agents/page.tsx:2605:          message: `${screenedName} matched the OFAC list and was added to the blacklist.`,
src/app/(admin)/versotech_admin/agents/page.tsx:2623:    redirect(`${redirectTarget}${separator}success=OFAC%20screening%20logged`)
src/app/(admin)/versotech_admin/agents/page.tsx:2666:          description: `Assignment updated for ${existingAssignment?.task_name || taskCode}`,
src/app/(admin)/versotech_admin/agents/page.tsx:2686:    redirect(`${redirectTarget}${separator}success=Assignment%20updated`)
src/app/(admin)/versotech_admin/agents/page.tsx:3279:                      {grade.code} {grade.label ? `- ${grade.label}` : ''}
src/app/(admin)/versotech_admin/agents/page.tsx:3437:                          ? `/versotech_main/investors/${row.id}`
src/app/(admin)/versotech_admin/agents/page.tsx:3438:                          : `/versotech_main/deals/${row.id}`
src/app/(admin)/versotech_admin/agents/page.tsx:3439:                      const breakdownHref = `${baseHref}${baseQueryString ? '&' : '?'}risk=${row.risk_type}:${row.id}`
src/app/(admin)/versotech_admin/agents/page.tsx:3442:                        <tr key={`${row.risk_type}-${row.id}`} className="border-t">
src/app/(admin)/versotech_admin/agents/page.tsx:3674:                            {confidenceLabel ? ` • ${confidenceLabel}` : ''}
src/app/(admin)/versotech_admin/agents/page.tsx:3849:                                href={`${baseHref}${baseQueryString ? '&' : '?'}edit=${entry.id}`}
src/app/(admin)/versotech_admin/agents/page.tsx:3855:                                href={`${baseHref}${baseQueryString ? '&' : '?'}entry=${entry.id}`}
src/app/(admin)/versotech_admin/agents/page.tsx:4058:                          ? `${row.user_id}|${row.subject_type}|${row.subject_id}|${row.submission_id}`
src/app/(admin)/versotech_admin/agents/page.tsx:4067:                        const reminderFormId = `kyc-reminder-${row.submission_id}`
src/app/(admin)/versotech_admin/agents/page.tsx:4068:                        const surveyFormId = `kyc-survey-${row.submission_id}`
src/app/(admin)/versotech_admin/agents/page.tsx:4069:                        const aiSuggestFormId = `kyc-ai-suggest-${row.submission_id}`
src/app/(admin)/versotech_admin/agents/page.tsx:4070:                        const aiConfirmFormId = `kyc-ai-confirm-${row.submission_id}`
src/app/(admin)/versotech_admin/agents/page.tsx:4105:                                    {aiConfidenceLabel ? ` (${aiConfidenceLabel})` : ''}
src/app/(admin)/versotech_admin/agents/page.tsx:4111:                              {expiryDays === null ? '—' : `${expiryDays}d`}
src/app/(admin)/versotech_admin/agents/page.tsx:4184:                  ? `${row.user_id}|${row.subject_type}|${row.subject_id}|${row.submission_id}`
src/app/(admin)/versotech_admin/agents/page.tsx:4186:                const reminderFormId = `kyc-reminder-${row.submission_id}`
src/app/(admin)/versotech_admin/agents/page.tsx:4187:                const surveyFormId = `kyc-survey-${row.submission_id}`
src/app/(admin)/versotech_admin/agents/page.tsx:4188:                const aiSuggestFormId = `kyc-ai-suggest-${row.submission_id}`
src/app/(admin)/versotech_admin/agents/page.tsx:4189:                const aiConfirmFormId = `kyc-ai-confirm-${row.submission_id}`
src/app/(admin)/versotech_admin/agents/page.tsx:4193:                  <div key={`kyc-action-forms-${row.submission_id}`}>
src/app/(admin)/versotech_admin/components/admin-layout-content.tsx:47:  if (pathname.match(/^\/versotech_admin\/users\/[^/]+$/)) {
src/app/(admin)/versotech_admin/components/admin-layout-content.tsx:100:          className={`${isDark ? 'text-zinc-300 focus:text-white focus:bg-white/10' : ''} ${preference === 'light' ? 'font-medium' : ''}`}
src/app/(admin)/versotech_admin/components/admin-layout-content.tsx:108:          className={`${isDark ? 'text-zinc-300 focus:text-white focus:bg-white/10' : ''} ${preference === 'dark' ? 'font-medium' : ''}`}
src/app/(admin)/versotech_admin/components/admin-layout-content.tsx:116:          className={`${isDark ? 'text-zinc-300 focus:text-white focus:bg-white/10' : ''} ${preference === 'auto' ? 'font-medium' : ''}`}
src/app/(admin)/versotech_admin/components/admin-layout-content.tsx:155:          ${isDark
src/app/(admin)/versotech_admin/components/admin-layout-content.tsx:162:            <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(admin)/versotech_admin/components/admin-layout-content.tsx:178:          ${isDark ? 'bg-zinc-900' : 'bg-gray-50'}
src/components/messaging/investor/contacts.tsx:64:          Unread {filters.unreadOnly ? '' : `(${unreadTotal})`}
src/components/messaging/investor/contacts.tsx:79:              const additionalParticipants = conversation.participants.length > 2 ? ` +${conversation.participants.length - 2}` : ''
src/components/investors/activity-timeline.tsx:89:        const response = await fetch(`/api/staff/investors/${investorId}/activity?type=${filter}`)
src/components/investors/activity-timeline.tsx:125:      const response = await fetch(`/api/staff/investors/${investorId}/activity/export`)
src/components/investors/activity-timeline.tsx:130:      a.download = `investor-${investorId}-activity-${format(new Date(), 'yyyy-MM-dd')}.csv`
src/components/investors/activity-timeline.tsx:238:                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${bgColor} flex items-center justify-center relative z-10`}>
src/components/investors/activity-timeline.tsx:239:                        <Icon className={`h-5 w-5 ${iconColor}`} />
src/components/investors/edit-subscription-dialog.tsx:79:      const res = await fetch(`/api/investors/${investorId}/subscriptions/${subscription.id}`, {
src/app/(main)/versotech_main/arranger-profile/arranger-profile-client.tsx:182:            placeholder={`Enter ${label.toLowerCase()}`}
src/app/(main)/versotech_main/arranger-profile/arranger-profile-client.tsx:192:            placeholder={`Enter ${label.toLowerCase()}`}
src/app/(admin)/versotech_admin/dashboard/page.tsx:43:    router.push(`${pathname}?${params.toString()}`)
src/components/messaging/investor/messaging-client.tsx:164:      style={containerHeight ? { height: `${containerHeight}px` } : undefined}
src/components/reports/active-requests-list.tsx:71:                <div className={`flex items-center gap-1 ${overdueStatus ? 'text-red-600 font-medium' : ''}`}>
src/components/profile/preferences-editor.tsx:112:      a.download = `verso-data-export-${new Date().toISOString().split('T')[0]}.json`
src/app/(admin)/versotech_admin/dashboard/components/dashboard-compliance-alerts.tsx:166:        const response = await fetch(`/api/admin/compliance/alerts?days=${days}`)
src/app/(main)/versotech_main/admin/admin-dashboard-client.tsx:102:      <div className={`min-h-screen ${isDark ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
src/app/(main)/versotech_main/admin/admin-dashboard-client.tsx:104:          <div className={`h-12 w-64 ${isDark ? 'bg-zinc-800' : 'bg-gray-200'} rounded animate-pulse`} />
src/app/(main)/versotech_main/admin/admin-dashboard-client.tsx:106:            <div className={`h-64 ${isDark ? 'bg-zinc-800' : 'bg-gray-200'} rounded-xl animate-pulse`} />
src/app/(main)/versotech_main/admin/admin-dashboard-client.tsx:107:            <div className={`h-64 ${isDark ? 'bg-zinc-800' : 'bg-gray-200'} rounded-xl animate-pulse`} />
src/app/(main)/versotech_main/admin/admin-dashboard-client.tsx:115:    <div className={`min-h-screen ${isDark ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
src/app/(main)/versotech_main/admin/admin-dashboard-client.tsx:120:            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Super Admin Dashboard</h1>
src/app/(main)/versotech_main/admin/admin-dashboard-client.tsx:130:              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
src/app/(main)/versotech_main/admin/admin-dashboard-client.tsx:153:        <div className={`rounded-xl border p-1 ${isDark ? 'border-white/10 bg-zinc-900/50' : 'border-gray-200 bg-white shadow-sm'}`}>
src/app/(main)/versotech_main/admin/admin-dashboard-client.tsx:226:        <div className={`text-center py-6 border-t ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
src/app/(main)/versotech_main/admin/admin-dashboard-client.tsx:227:          <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>
src/app/(admin)/versotech_admin/growth/components/growth-kpi-cards.tsx:55:    format: (v) => `${v.toFixed(1)}%`,
src/app/(admin)/versotech_admin/growth/components/growth-kpi-cards.tsx:62:    format: (v) => `${v} min`,
src/app/(admin)/versotech_admin/growth/components/growth-kpi-cards.tsx:94:        const response = await fetch(`/api/admin/growth/overview?days=${days}`)
src/components/profile/partner-kyc-documents-tab.tsx:116:      formData.append('name', file.name.replace(/\.[^/.]+$/, ''))
src/components/profile/partner-kyc-documents-tab.tsx:129:      toast.success(`${docTypeLabel} uploaded successfully`)
src/components/profile/partner-kyc-documents-tab.tsx:145:      const response = await fetch(`/api/documents/${doc.id}/download`)
src/components/profile/partner-kyc-documents-tab.tsx:170:    if (bytes < 1024) return `${bytes} B`
src/components/profile/partner-kyc-documents-tab.tsx:171:    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
src/components/profile/partner-kyc-documents-tab.tsx:172:    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
src/components/profile/partner-kyc-documents-tab.tsx:217:                  {partnerName ? `Compliance documents for ${partnerName}` : 'Upload required compliance documents'}
src/components/profile/partner-kyc-documents-tab.tsx:246:              style={{ width: `${completionPercentage}%` }}
src/app/(admin)/versotech_admin/dashboard/components/dashboard-approval-queue.tsx:71:        const response = await fetch(`/api/admin/metrics/dashboard?days=${days}`)
src/components/auth-handler.tsx:37:          router.push(`/versotech_main/login?error=${errorMessage}`)
src/components/messaging/staff/sidebar.tsx:167:            Unread {filters.unreadOnly ? '' : `(${unreadTotals.all})`}
src/components/messaging/staff/sidebar.tsx:175:            Compliance {filters.complianceOnly ? '' : `(${complianceCount})`}
src/app/(main)/versotech_main/approvals/page.tsx:96:    .or(`status.eq.pending,and(status.in.(approved,rejected),resolved_at.gte.${thirtyDaysAgo.toISOString()})`)
src/app/(main)/versotech_main/tasks/page.tsx:99:      `owner_user_id.eq.${user.id},owner_investor_id.in.(${investorIds.join(',')})`
src/app/(admin)/versotech_admin/growth/components/growth-overview-skeleton.tsx:72:                <Skeleton className="h-6 flex-1" style={{ width: `${100 - i * 10}%` }} />
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:306:  return `${datePart} ${timePart}`
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:313:  if (trimmed.includes(`("${identifier}")`)) return trimmed
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:314:  return `${trimmed} ("${identifier}")`
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:325:  if (type === 'management') return `${percent.toFixed(2)}% per annum`
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:326:  if (type === 'carry') return `${percent.toFixed(2)}% (no hurdle rate)`
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:327:  return `${percent.toFixed(2)}%`
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:331:  if (bytes < 1024) return `${bytes} B`
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:332:  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:333:  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:384:        console.log(`[OpportunityDetail] Starting fetch for dealId: ${dealId}`)
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:387:        fetch(`/api/investors/me/opportunities/${dealId}`, {
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:397:          ? `&client_investor_id=${selectedClient.id}`
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:399:        const response = await fetch(`/api/investors/me/opportunities/${dealId}?_t=${timestamp}${proxyParam}`, {
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:410:          console.log(`[OpportunityDetail] Fetch for ${dealId} was cancelled (user navigated away)`)
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:416:          throw new Error(data.error || `Failed to fetch opportunity (${response.status})`)
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:421:          console.log(`[OpportunityDetail] Ignoring response for ${dealId} - request was cancelled`)
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:425:        console.log(`[OpportunityDetail] ✅ Setting state for: "${data.opportunity?.name}" (ID: ${data.opportunity?.id})`)
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:428:          console.error(`[OpportunityDetail] ⚠️ MISMATCH! URL has ${dealId} but API returned ${data.opportunity?.id}`)
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:439:          console.log(`[OpportunityDetail] Fetch aborted for ${dealId}`)
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:459:      console.log(`[OpportunityDetail] Cleanup: Cancelling fetch for ${dealId}`)
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:468:      const response = await fetch(`/api/deals/${dealId}/interests`, {
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:481:        ? `?client_investor_id=${selectedClient.id}`
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:483:      const refreshResponse = await fetch(`/api/investors/me/opportunities/${dealId}${proxyParam}`)
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:519:        response = await fetch(`/api/deals/${dealId}/subscriptions`, {
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:542:        ? `?client_investor_id=${selectedClient.id}`
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:544:      const refreshResponse = await fetch(`/api/investors/me/opportunities/${dealId}${proxyParam}`)
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:562:      setNdaRequestSubject(`NDA modification request - ${dealLabel}`)
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:806:                {kycStatusLabel ? ` KYC status: ${kycStatusLabel}.` : ''}
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:889:            onClick={() => router.push(`/versotech_main/inbox?deal=${opportunity.id}&deal_name=${encodeURIComponent(opportunity.name)}`)}
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:940:                    ? `Submitted on ${formatDate(opportunity.subscription_submission.submitted_at)}.`
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:1038:                const response = await fetch(`/api/deals/${opportunity.id}/fee-structures/${termSheet.id}/attachment`)
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:1065:              (opportunity.vehicle?.series_number ? `VC${opportunity.vehicle.series_number}` : 'Vehicle')
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:1167:                                ? `${opportunity.currency} ${termSheet.price_per_share.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:1352:                    <AccordionItem key={faq.id} value={`faq-${index}`}>
src/app/(main)/versotech_main/opportunities/[id]/page.tsx:1528:                placeholder={`Min: ${formatCurrency(opportunity.minimum_investment, opportunity.currency)}`}
src/components/messaging/staff/messaging-client.tsx:323:      style={containerHeight ? { height: `${containerHeight}px` } : undefined}
src/components/profile/arranger-kyc-documents-tab.tsx:140:    const uploadKey = memberId ? `${documentType}_${memberId}` : documentType
src/components/profile/arranger-kyc-documents-tab.tsx:147:      formData.append('name', file.name.replace(/\.[^/.]+$/, ''))
src/components/profile/arranger-kyc-documents-tab.tsx:163:      toast.success(`${docTypeLabel} uploaded successfully`)
src/components/profile/arranger-kyc-documents-tab.tsx:171:      const inputKey = memberId ? `${documentType}_${memberId}` : documentType
src/components/profile/arranger-kyc-documents-tab.tsx:179:    if (!confirm(`Delete "${document.name}"? This action cannot be undone.`)) {
src/components/profile/arranger-kyc-documents-tab.tsx:186:      const response = await fetch(`/api/arrangers/me/documents/${document.id}`, {
src/components/profile/arranger-kyc-documents-tab.tsx:207:      const response = await fetch(`/api/documents/${doc.id}/download`)
src/components/profile/arranger-kyc-documents-tab.tsx:232:    if (bytes < 1024) return `${bytes} B`
src/components/profile/arranger-kyc-documents-tab.tsx:233:    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
src/components/profile/arranger-kyc-documents-tab.tsx:234:    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
src/components/profile/arranger-kyc-documents-tab.tsx:272:          toast.error(`Missing documents: ${data.details.missing.join(', ')}`)
src/components/profile/arranger-kyc-documents-tab.tsx:312:                  {arrangerName ? `Compliance documents for ${arrangerName}` : 'Upload required compliance documents'}
src/components/profile/arranger-kyc-documents-tab.tsx:342:              style={{ width: `${completionPercentage}%` }}
src/components/profile/arranger-kyc-documents-tab.tsx:529:                    const uploadKey = `${docType.value}_${member.id}`
src/app/(admin)/versotech_admin/growth/funnel/components/funnel-skeleton.tsx:29:                  style={{ width: `${width}%` }}
src/app/(admin)/versotech_admin/growth/funnel/components/funnel-skeleton.tsx:59:                  style={{ width: `${width}%` }}
src/app/(admin)/versotech_admin/growth/components/feature-usage-chart.tsx:63:                style={{ width: `${100 - i * 10}%` }}
src/app/(admin)/versotech_admin/growth/components/feature-usage-chart.tsx:108:        const response = await fetch(`/api/admin/growth/overview?days=${days}`)
src/app/(admin)/versotech_admin/growth/components/feature-usage-chart.tsx:217:                  key={`cell-${index}`}
src/components/entities/add-entity-flag-modal.tsx:80:      const response = await fetch(`/api/entities/${entityId}/flags`, {
src/components/messaging/staff/composer.tsx:27:      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
src/app/(main)/versotech_main/ceo-profile/ceo-profile-client.tsx:171:            placeholder={`Enter ${label.toLowerCase()}`}
src/app/(main)/versotech_main/ceo-profile/ceo-profile-client.tsx:181:            placeholder={`Enter ${label.toLowerCase()}`}
src/app/(main)/versotech_main/ceo-profile/ceo-profile-client.tsx:368:      const response = await fetch(`/api/profiles/${userId}`, {
src/app/(main)/versotech_main/ceo-profile/ceo-profile-client.tsx:521:      toast.success(`Invitation sent to ${inviteEmail}`)
src/app/(main)/versotech_main/ceo-profile/ceo-profile-client.tsx:649:        ? `${member.displayName} is no longer a signatory`
src/app/(main)/versotech_main/ceo-profile/ceo-profile-client.tsx:650:        : `${member.displayName} is now an authorized signatory`
src/components/profile/entity-kyc-documents.tsx:70:      const response = await fetch(`/api/investors/me/counterparty-entities/${entityId}/kyc-submissions`)
src/components/profile/entity-kyc-documents.tsx:96:      const response = await fetch(`/api/documents/${documentId}/download`)
src/app/(main)/versotech_main/accounts/unified-accounts-content.tsx:172:    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
src/app/(main)/versotech_main/accounts/unified-accounts-content.tsx:177:    a.download = `all-accounts-${new Date().toISOString().split('T')[0]}.csv`
src/app/(main)/versotech_main/accounts/unified-accounts-content.tsx:425:                              window.location.href = `/versotech_main/${typeRoutes[account.entityType]}/${account.entityId}`
src/app/(main)/versotech_main/accounts/unified-accounts-content.tsx:431:                              <DropdownMenuItem onClick={() => window.location.href = `mailto:${account.userEmail}`}>
src/app/(main)/versotech_main/client-transactions/page.tsx:207:      a.download = `client-transactions-${new Date().toISOString().split('T')[0]}.csv`
src/app/(main)/versotech_main/client-transactions/page.tsx:275:              ? `Manage clients you've introduced as ${partnerInfo.name}`
src/app/(main)/versotech_main/client-transactions/page.tsx:571:                                <Link href={`/versotech_main/opportunities/${client.deal_id}`}>
src/app/(main)/versotech_main/client-transactions/page.tsx:578:                                <Link href={`/versotech_main/opportunities/${client.deal_id}?tab=data-room${client.investor_id ? `&client_investor_id=${client.investor_id}` : ''}`}>
src/app/(main)/versotech_main/client-transactions/page.tsx:667:                              <Link href={`/versotech_main/opportunities/${client.deal_id}`}>
src/app/(main)/versotech_main/client-transactions/page.tsx:673:                              <Link href={`/versotech_main/opportunities/${client.deal_id}?tab=data-room${client.investor_id ? `&client_investor_id=${client.investor_id}` : ''}`}>
src/app/(admin)/versotech_admin/growth/funnel/components/onboarding-funnel.tsx:159:                      style={{ width: `${widthPercent}%` }}
src/app/(main)/versotech_main/inbox/page.tsx:122:          .or(`assigned_to.eq.${user.id},assigned_to.is.null`)
src/app/(main)/versotech_main/inbox/page.tsx:129:          .or(`assigned_to.eq.${user.id},assigned_to.is.null`)
src/app/(main)/versotech_main/inbox/page.tsx:149:    router.push(`/versotech_main/inbox?${params.toString()}`, { scroll: false })
src/app/(main)/versotech_main/inbox/page.tsx:184:          <TabsList className={`grid w-full ${gridColsClass} lg:w-auto lg:inline-grid`}>
src/app/(admin)/versotech_admin/dashboard/components/dashboard-kpi-cards.tsx:102:        const response = await fetch(`/api/admin/metrics/dashboard?days=${days}`)
src/app/(admin)/versotech_admin/dashboard/components/dashboard-kpi-cards.tsx:175:        subtitle={`${formatNumber(kpis.investors.new_mtd)} new this month`}
src/app/(admin)/versotech_admin/dashboard/components/dashboard-kpi-cards.tsx:184:        subtitle={`${kpis.deals.open} open deals`}
src/app/(admin)/versotech_admin/dashboard/components/dashboard-kpi-cards.tsx:195:            ? `Mixed currencies (${aumEntries.map(([currency]) => currency).join(', ')})`
src/app/(admin)/versotech_admin/dashboard/components/dashboard-kpi-cards.tsx:196:            : `${activeAum.funding_rate}% funding rate`
src/app/(admin)/versotech_admin/dashboard/components/dashboard-kpi-cards.tsx:229:        subtitle={`${kpis.pending.kyc} KYC reviews pending`}
src/components/messaging/staff/conversation-view.tsx:72:      const response = await fetch(`/api/conversations/${conversation.id}`, {
src/components/messaging/staff/conversation-view.tsx:89:      const response = await fetch(`/api/conversations/${conversation.id}/messages/${messageId}`, {
src/components/messaging/staff/conversation-view.tsx:115:      const response = await fetch(`/api/conversations/${conversation.id}/compliance`, {
src/components/messaging/staff/conversation-view.tsx:248:      const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
src/components/profile/lawyer-kyc-documents-tab.tsx:114:      formData.append('name', file.name.replace(/\.[^/.]+$/, ''))
src/components/profile/lawyer-kyc-documents-tab.tsx:127:      toast.success(`${docTypeLabel} uploaded successfully`)
src/components/profile/lawyer-kyc-documents-tab.tsx:143:      const response = await fetch(`/api/documents/${doc.id}/download`)
src/components/profile/lawyer-kyc-documents-tab.tsx:168:    if (bytes < 1024) return `${bytes} B`
src/components/profile/lawyer-kyc-documents-tab.tsx:169:    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
src/components/profile/lawyer-kyc-documents-tab.tsx:170:    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
src/components/profile/lawyer-kyc-documents-tab.tsx:215:                  {lawyerName ? `Compliance documents for ${lawyerName}` : 'Upload required compliance documents'}
src/components/profile/lawyer-kyc-documents-tab.tsx:244:              style={{ width: `${completionPercentage}%` }}
src/app/(admin)/versotech_admin/growth/components/active-users-trend-chart.tsx:88:        const response = await fetch(`/api/admin/growth/overview?days=${days}`)
src/app/(admin)/versotech_admin/growth/funnel/components/investment-funnel.tsx:159:                      style={{ width: `${widthPercent}%` }}
src/components/messaging/staff/new-conversation-dialog.tsx:332:                        <div key={`${item.kind}-${item.title}-${index}`} className="flex items-center justify-between">
src/components/messaging/staff/new-conversation-dialog.tsx:344:                        <div key={`group-${item.title}-${index}`} className="pt-3 text-xs font-semibold uppercase tracking-wider text-slate-300">
src/components/messaging/staff/new-conversation-dialog.tsx:350:                        <p key={`empty-${item.message}-${index}`} className="py-6 text-center text-sm text-slate-400">
src/components/messaging/staff/new-conversation-dialog.tsx:359:                          key={`staff-${entry.id}-${index}`}
src/components/messaging/staff/new-conversation-dialog.tsx:405:                          key={`investor-${entry.id}-${index}`}
src/components/messaging/staff/new-conversation-dialog.tsx:458:                    ? `Ready to message ${selectedPerson?.display_name || selectedPerson?.email}`
src/components/messaging/staff/new-conversation-dialog.tsx:461:                  `${totalSelected} participant${totalSelected === 1 ? '' : 's'} selected`
src/app/(main)/versotech_main/payment-requests/page.tsx:186:  return entries.map(([currency, amount]) => `${currency} ${formatCurrency(amount, currency)}`).join(' / ')
src/app/(main)/versotech_main/payment-requests/page.tsx:700:              ? `Manage fees for ${arrangerInfo.legal_name}`
src/app/(main)/versotech_main/payment-requests/page.tsx:1147:                        <TableRow key={`${commission.type}-${commission.id}`}>
src/components/entities/entity-detail-client.tsx:138:      const response = await fetch(`/api/documents?entity_id=${entity.id}`)
src/components/entities/entity-detail-client.tsx:154:      const response = await fetch(`/api/entities/${entity.id}`)
src/components/entities/entity-detail-client.tsx:169:      const response = await fetch(`/api/entities/${entity.id}/events`)
src/components/entities/entity-detail-client.tsx:261:              {entity.updated_at && ` • Updated ${new Date(entity.updated_at).toLocaleString()}`}
src/components/entities/entity-detail-client.tsx:413:                        <Link href={`/versotech_main/deals/${deal.id}`}>View Deal</Link>
src/components/entities/entity-detail-client.tsx:460:                          {doc.created_by && ` • ${doc.created_by}`}
src/components/entities/entity-detail-client.tsx:468:                          <Link href={`/api/documents/${doc.id}/download`} target="_blank">
src/components/entities/entity-detail-client.tsx:506:                            {director.email && ` • ${director.email}`}
src/components/entities/entity-detail-client.tsx:515:                        {director.effective_to && ` • Ended ${new Date(director.effective_to).toLocaleDateString()}`}
src/components/entities/entity-detail-client.tsx:548:                        <Link href={`/versotech_main/deals/${deal.id}`}>Open Deal</Link>
src/components/entities/entity-detail-client.tsx:582:                          {event.changed_by_profile?.display_name && ` • ${event.changed_by_profile.display_name}`}
src/app/(admin)/versotech_admin/dashboard/components/dashboard-activity-feed.tsx:96:  return `${readableVerb} ${readableEntity}`
src/app/(admin)/versotech_admin/growth/page.tsx:36:    router.push(`${pathname}?${params.toString()}`)
src/app/(admin)/versotech_admin/growth/components/user-segments-chart.tsx:66:        const response = await fetch(`/api/admin/growth/overview?days=${days}`)
src/app/(admin)/versotech_admin/growth/components/user-segments-chart.tsx:196:                    key={`${item.segment}-${index}`}
src/app/(admin)/versotech_admin/growth/components/user-segments-chart.tsx:203:                    strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
src/app/(admin)/versotech_admin/growth/components/user-segments-chart.tsx:241:                key={`legend-${item.segment}-${index}`}
src/app/(admin)/versotech_admin/growth/components/user-segments-chart.tsx:242:                className={`flex items-center justify-between py-1.5 px-2 rounded-md transition-colors cursor-pointer ${
src/app/(admin)/versotech_admin/growth/components/user-segments-chart.tsx:262:                      backgroundColor: `${item.color}15`,
src/components/profile/password-change-form.tsx:37:      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
src/app/(main)/versotech_main/inbox/approvals-content.tsx:69:          .or(`status.eq.pending,and(status.in.(approved,rejected),resolved_at.gte.${thirtyDaysAgo.toISOString()})`)
src/app/(admin)/versotech_admin/dashboard/components/dashboard-activity-chart.tsx:85:        const response = await fetch(`/api/admin/metrics/dashboard?days=${days}`)
src/app/(main)/versotech_main/audit/page.tsx:87:    auditQuery = auditQuery.or(`actor_email.ilike.%${search}%,action.ilike.%${search}%,entity_type.ilike.%${search}%`)
src/app/(main)/versotech_main/my-commissions/page.tsx:639:                            {commission.rate_bps != null ? `${(commission.rate_bps / 100).toFixed(2)}%` : '—'}
src/app/(main)/versotech_main/my-commissions/page.tsx:693:                                  ? `${commission.rejection_reason.slice(0, 50)}...`
src/app/(main)/versotech_main/fee-plans/page.tsx:400:        ? `/api/arrangers/me/fee-plans/${selectedPlan.id}`
src/app/(main)/versotech_main/fee-plans/page.tsx:418:        description: `"${formName}" has been saved successfully.`,
src/app/(main)/versotech_main/fee-plans/page.tsx:433:      const res = await fetch(`/api/arrangers/me/fee-plans/${selectedPlan.id}`, {
src/app/(main)/versotech_main/fee-plans/page.tsx:443:        description: `"${planName}" has been removed.`,
src/app/(main)/versotech_main/fee-plans/page.tsx:463:      const res = await fetch(`/api/arrangers/me/fee-plans/${plan.id}/send`, {
src/app/(main)/versotech_main/fee-plans/page.tsx:478:          description: `"${plan.name}" was marked as sent, but there are no users to notify.`,
src/app/(main)/versotech_main/fee-plans/page.tsx:482:          description: `"${plan.name}" was sent, but notifications could not be delivered.`,
src/app/(main)/versotech_main/fee-plans/page.tsx:486:          description: `"${plan.name}" has been sent to ${result.notified_users} user(s).`,
src/app/(main)/versotech_main/fee-plans/page.tsx:509:  const formatBps = (bps: number) => `${(bps / 100).toFixed(2)}%`
src/app/(main)/versotech_main/fee-plans/page.tsx:546:            aria-label={`${deal.name} - ${dealPlans.length} fee plan${dealPlans.length !== 1 ? 's' : ''}`}
src/app/(main)/versotech_main/fee-plans/page.tsx:559:                    {deal.status && ` • ${deal.status}`}
src/app/(main)/versotech_main/fee-plans/page.tsx:600:                            comp.flat_amount ? `$${comp.flat_amount}` : 'N/A'}
src/app/(main)/versotech_main/fee-plans/page.tsx:781:                                comp.flat_amount ? `$${comp.flat_amount}` : 'N/A'}
src/app/(main)/versotech_main/fee-plans/page.tsx:820:                              aria-label={`Send fee plan "${plan.name}" to entity`}
src/app/(main)/versotech_main/fee-plans/page.tsx:840:                              aria-label={`Edit fee plan "${plan.name}"`}
src/app/(main)/versotech_main/fee-plans/page.tsx:849:                            aria-label={`Delete fee plan "${plan.name}"`}
src/app/(main)/versotech_main/fee-plans/page.tsx:1038:                            <Label>Flat Amount ($)</Label>
src/components/profile/entity-form-dialog.tsx:149:        ? `/api/investors/me/counterparty-entities/${entity.id}`
src/components/entities/import-positions-dialog.tsx:34:      const response = await fetch(`/api/staff/vehicles/${vehicleId}/positions/import`, {
src/components/entities/import-positions-dialog.tsx:45:      toast.success(data.message || `Imported ${data.imported} position(s)`)
src/components/lawyer/lawyer-deal-client.tsx:219:  if (bytes < 1024) return `${bytes} B`
src/components/lawyer/lawyer-deal-client.tsx:220:  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
src/components/lawyer/lawyer-deal-client.tsx:221:  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
src/components/lawyer/lawyer-deal-client.tsx:247:      const response = await fetch(`/api/documents/${docId}/download`)
src/components/lawyer/lawyer-deal-client.tsx:541:                    {deal.raised_amount ? formatCurrency(Number(deal.raised_amount), deal.currency) : '$0'}
src/components/lawyer/lawyer-deal-client.tsx:637:                  style={{ width: `${Math.min(targetPercentage, 100)}%` }}
src/app/(admin)/versotech_admin/growth/engagement/page.tsx:36:    router.push(`${pathname}?${params.toString()}`)
src/components/profile/commercial-partner-kyc-documents-tab.tsx:116:      formData.append('name', file.name.replace(/\.[^/.]+$/, ''))
src/components/profile/commercial-partner-kyc-documents-tab.tsx:129:      toast.success(`${docTypeLabel} uploaded successfully`)
src/components/profile/commercial-partner-kyc-documents-tab.tsx:145:      const response = await fetch(`/api/documents/${doc.id}/download`)
src/components/profile/commercial-partner-kyc-documents-tab.tsx:170:    if (bytes < 1024) return `${bytes} B`
src/components/profile/commercial-partner-kyc-documents-tab.tsx:171:    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
src/components/profile/commercial-partner-kyc-documents-tab.tsx:172:    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
src/components/profile/commercial-partner-kyc-documents-tab.tsx:217:                  {commercialPartnerName ? `Compliance documents for ${commercialPartnerName}` : 'Upload required compliance documents'}
src/components/profile/commercial-partner-kyc-documents-tab.tsx:246:              style={{ width: `${completionPercentage}%` }}
src/app/(main)/versotech_main/partner-transactions/page.tsx:121:  return `${investorId}:${dealId}`
src/app/(main)/versotech_main/partner-transactions/page.tsx:221:      a.download = `partner-transactions-${new Date().toISOString().split('T')[0]}.csv`
src/app/(main)/versotech_main/partner-transactions/page.tsx:301:              const subForDeal = subscriptionMap.get(`${plan.deal_id}`) || Array.from(subscriptionMap.values()).find(s => s.deal_id === plan.deal_id)
src/app/(main)/versotech_main/partner-transactions/page.tsx:321:        const syntheticId = `${membership.deal_id || 'no-deal'}-${membership.investor_id || 'no-investor'}`
src/app/(main)/versotech_main/partner-transactions/page.tsx:521:              ? `Track referrals and investments as ${partnerInfo.name}`
src/app/(main)/versotech_main/partner-transactions/page.tsx:733:                                ? `${(tx.feeModel.rate_bps / 100).toFixed(2)}%`
src/app/(main)/versotech_main/partner-transactions/page.tsx:786:                              <Link href={`/versotech_main/opportunities/${tx.deal.id}`}>
src/components/entities/edit-entity-modal-refactored.tsx:265:      const response = await fetch(`/api/entities/${entity.id}`, {
src/components/entities/edit-entity-modal-refactored.tsx:525:                            {lawyer.name} {lawyer.firm_name && lawyer.name !== lawyer.firm_name ? `(${lawyer.firm_name})` : ''}
src/components/lawyer/escrow-confirm-modal.tsx:93:      const response = await fetch(`/api/escrow/${subscriptionId}/confirm-funding`, {
src/components/lawyer/escrow-confirm-modal.tsx:157:      const response = await fetch(`/api/escrow/${subscriptionId}/confirm-payment`, {
src/components/lawyer/escrow-confirm-modal.tsx:263:              placeholder={mode === 'funding' ? `e.g., ${remainingAmount.toLocaleString()}` : 'Enter amount'}
src/app/(main)/versotech_main/my-commercial-partners/page.tsx:510:            {arrangerInfo ? `Commercial partners working with ${arrangerInfo.legal_name}` : 'View all commercial partners'}
src/app/(main)/versotech_main/calendar/page.tsx:140:      id: `task-${task.id}`,
src/app/(main)/versotech_main/calendar/page.tsx:145:      description: task.category ? `Category • ${sentenceCase(task.category)}` : undefined
src/app/(main)/versotech_main/calendar/page.tsx:165:      id: `deal-${deal.id}`,
src/app/(main)/versotech_main/calendar/page.tsx:166:      name: `Deal Close: ${deal.name}`,
src/app/(main)/versotech_main/calendar/page.tsx:170:      description: deal.vehicles?.[0]?.name ? `Vehicle • ${deal.vehicles[0].name}` : undefined
src/app/(main)/versotech_main/calendar/page.tsx:189:      id: `call-${call.id}`,
src/app/(main)/versotech_main/calendar/page.tsx:194:      description: call.vehicles?.[0]?.name ? `Vehicle • ${call.vehicles[0].name}` : undefined
src/app/(main)/versotech_main/calendar/page.tsx:210:      id: `dist-${dist.id}`,
src/app/(main)/versotech_main/calendar/page.tsx:215:      description: dist.vehicles?.[0]?.name ? `Vehicle • ${dist.vehicles[0].name}` : undefined
src/app/(main)/versotech_main/calendar/page.tsx:225:    .or(`kyc_expiry_date.lte.${ninetyDaysFromNow},accreditation_expiry.lte.${ninetyDaysFromNow}`)
src/app/(main)/versotech_main/calendar/page.tsx:236:        id: `kyc-${investor.id}`,
src/app/(main)/versotech_main/calendar/page.tsx:237:        name: `KYC Renewal: ${investor.legal_name}`,
src/app/(main)/versotech_main/calendar/page.tsx:250:        id: `accred-${investor.id}`,
src/app/(main)/versotech_main/calendar/page.tsx:251:        name: `Accreditation Renewal: ${investor.legal_name}`,
src/app/(main)/versotech_main/calendar/page.tsx:282:      id: `approval-${approval.id}`,
src/app/(main)/versotech_main/calendar/page.tsx:283:      name: `Approval: ${approvalType}`,
src/app/(main)/versotech_main/calendar/page.tsx:288:        ? `Requested by ${approval.requested_by[0].display_name}`
src/app/(main)/versotech_main/calendar/page.tsx:308:      id: `sub-${sub.id}`,
src/app/(main)/versotech_main/calendar/page.tsx:309:      name: `Funding Due: ${(Array.isArray(sub.investors) ? sub.investors[0]?.legal_name : null) || sub.subscription_number}`,
src/app/(main)/versotech_main/calendar/page.tsx:313:      description: sub.vehicles?.[0]?.name ? `Vehicle • ${sub.vehicles[0].name}` : undefined
src/app/(main)/versotech_main/calendar/page.tsx:338:      ? `Deal • ${dealName}`
src/app/(main)/versotech_main/calendar/page.tsx:340:      ? `Investor • ${investorName}`
src/app/(main)/versotech_main/calendar/page.tsx:344:      id: `fee-${fee.id}`,
src/app/(main)/versotech_main/calendar/page.tsx:345:      name: `Fee Event: ${sentenceCase(fee.fee_type)}`,
src/app/(main)/versotech_main/calendar/page.tsx:367:      id: `request-${request.id}`,
src/app/(main)/versotech_main/calendar/page.tsx:373:        ? `Investor • ${request.investors[0].legal_name}`
src/app/(main)/versotech_main/calendar/page.tsx:398:      id: `dataroom-${access.id}`,
src/app/(main)/versotech_main/calendar/page.tsx:399:      name: `Data Room Expiry: ${(Array.isArray(access.deals) ? access.deals[0]?.name : null) || 'Deal'}`,
src/app/(main)/versotech_main/calendar/page.tsx:403:      description: investorName ? `Investor • ${investorName}` : undefined
src/components/profile/profile-form.tsx:57:      const response = await fetch(`/api/profiles/${userId}`, {
src/components/lawyer/confirm-partner-payment-modal.tsx:58:        `/api/lawyers/me/partner-commissions/${commission.id}/confirm-payment`,
src/components/lawyer/confirm-partner-payment-modal.tsx:232:          documentName={`Invoice - ${commission.partner_name}`}
src/components/entities/folder-manager.tsx:164:      const response = await fetch(`/api/entities/${entityId}/folders`, {
src/components/entities/folder-manager.tsx:200:      const response = await fetch(`/api/entities/${entityId}/folders/${folderToEdit.id}`, {
src/components/entities/folder-manager.tsx:231:      const response = await fetch(`/api/entities/${entityId}/folders/${folderToDelete.id}`, {
src/components/entities/folder-manager.tsx:280:          className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
src/components/entities/folder-manager.tsx:285:          style={{ paddingLeft: `${depth * 16 + 8}px` }}
src/components/entities/folder-manager.tsx:311:            <span className={`text-sm truncate ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
src/components/entities/folder-manager.tsx:396:                ? `Creating subfolder in "${folders.find(f => f.id === parentFolderId)?.name}"`
src/app/(main)/versotech_main/shared-transactions/page.tsx:304:        const syntheticId = `${membership.deal_id || 'no-deal'}-${membership.investor_id || 'no-investor'}`
src/app/(main)/versotech_main/shared-transactions/page.tsx:317:          co_referrer_name: hasCoReferrer ? `Co-referrer (${coReferrer.referred_by_entity_type})` : null,
src/app/(main)/versotech_main/shared-transactions/page.tsx:383:              ? `View deals shared with other partners as ${partnerInfo.name}`
src/app/(main)/versotech_main/my-partners/page.tsx:485:              ? `Partners working with ${arrangerInfo.legal_name}`
src/components/profile/generic-entity-members-tab.tsx:179:      const response = await fetch(`${apiEndpoint}/${deletingMemberId}`, {
src/components/profile/generic-entity-members-tab.tsx:356:                      {member.ownership_percentage != null ? `${member.ownership_percentage}%` : 'N/A'}
src/components/lawyer/lawyer-reconciliation-client.tsx:432:              ? `Financial reconciliation for ${lawyerInfo.display_name}'s assigned deals`
src/components/lawyer/lawyer-reconciliation-client.tsx:475:                  <div key={c.currency} className={`${i === 0 ? 'text-2xl font-bold' : 'text-sm font-medium'} text-blue-600`}>
src/components/lawyer/lawyer-reconciliation-client.tsx:502:                  <div key={c.currency} className={`${i === 0 ? 'text-2xl font-bold' : 'text-sm font-medium'} text-emerald-600`}>
src/components/lawyer/lawyer-reconciliation-client.tsx:529:                  <div key={c.currency} className={`${i === 0 ? 'text-2xl font-bold' : 'text-sm font-medium'} text-purple-600`}>
src/components/lawyer/lawyer-reconciliation-client.tsx:865:                            <TableRow key={`${commission.entity_type}-${commission.id}`}>
src/app/(main)/versotech_main/my-lawyers/page.tsx:186:          .or(lawyerNames.map(n => `firm_name.ilike.%${n}%,display_name.ilike.%${n}%`).join(','))
src/app/(main)/versotech_main/my-lawyers/page.tsx:384:            {arrangerInfo ? `Legal counsel working with ${arrangerInfo.legal_name}` : 'View all registered law firms'}
src/app/(main)/versotech_main/my-lawyers/page.tsx:555:                        <Button variant="ghost" size="sm" asChild><a href={`/versotech_main/users?type=lawyer&id=${lawyer.id}`}><ExternalLink className="h-4 w-4" /></a></Button>
src/components/entities/entities-page-client.tsx:101:    setBannerMessage(`Vehicle "${entity.name}" created successfully.`)
src/components/entities/entities-page-client.tsx:110:    setBannerMessage(`Vehicle "${entity.name}" updated successfully.`)
src/components/entities/entities-page-client.tsx:140:          className={`rounded-lg border p-4 text-sm ${
src/components/entities/entities-page-client.tsx:252:                      onClick={() => router.push(`/versotech_main/entities/${entity.id}`)}
src/components/entities/entities-page-client.tsx:322:                              router.push(`/versotech_main/entities/${entity.id}`)
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:532:          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:535:          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:557:        <Card className={`border-amber-500/30 ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:564:                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:567:                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:580:        <Card className={`border-blue-500/30 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:588:                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:591:                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:616:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:619:            <Briefcase className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:622:            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:625:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:633:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:636:            <Users className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:639:            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:642:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:650:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:653:            <DollarSign className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:659:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:667:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:670:            <Scale className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:673:            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:676:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:688:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:691:            <Wallet className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:694:            <div className={`text-2xl font-bold ${(escrowMetrics?.fundingRate || 0) >= 75 ? 'text-green-500' : 'text-amber-500'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:697:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:701:            <div className={`mt-2 h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:704:                style={{ width: `${Math.min(escrowMetrics?.fundingRate || 0, 100)}%` }}
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:722:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:725:            <Receipt className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:731:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:760:            <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:762:              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Awaiting Investor</p>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:764:            <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:766:              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Awaiting Your Signature</p>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:768:            <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:770:              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Awaiting CEO</p>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:772:            <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:774:              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Signed This Month</p>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:779:            <Alert className={`mt-4 border-purple-500/30 ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:781:              <AlertDescription className={`flex items-center justify-between ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:801:                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:804:                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Partners</p>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:817:                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:820:                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Introducers</p>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:833:                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:836:                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Commercial Partners</p>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:862:                <Briefcase className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:863:                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:866:                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:876:                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:881:                      <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:884:                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:886:                          ? `${formatAmountWithCurrency(mandate.target_amount, mandate.currency)} target`
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:917:                <FileSignature className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:918:                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:921:                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:930:                    className={`flex items-center justify-between p-3 rounded-lg ${
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:935:                      <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/arranger-dashboard.tsx:938:                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/assigned-deals/page.tsx:340:              ? `Manage deal documentation and escrow as ${lawyerInfo.display_name}`
src/app/(main)/versotech_main/assigned-deals/page.tsx:540:                          <Link href={`/versotech_main/lawyer-deal/${deal.id}`}>
src/components/profile/entity-members-tab.tsx:107:      const response = await fetch(`/api/investors/me/counterparty-entities/${entityId}/members`)
src/components/profile/entity-members-tab.tsx:183:        ? `/api/investors/me/counterparty-entities/${entityId}/members/${editingMember.id}`
src/components/profile/entity-members-tab.tsx:184:        : `/api/investors/me/counterparty-entities/${entityId}/members`
src/components/profile/entity-members-tab.tsx:215:      const response = await fetch(`/api/investors/me/counterparty-entities/${entityId}/members/${memberId}`, {
src/components/profile/entity-members-tab.tsx:311:                  {member.ownership_percentage ? `${member.ownership_percentage}%` : '—'}
src/components/profile/entity-members-tab.tsx:345:              {editingMember ? 'Update member details' : `Add a member to ${entityName}`}
src/app/(main)/versotech_main/placement-agreements/page.tsx:130:      const response = await fetch(`/api/placement-agreements/${agreementId}/approve`, {
src/app/(main)/versotech_main/placement-agreements/page.tsx:158:      const response = await fetch(`/api/placement-agreements/${agreementId}/approve`, {
src/app/(main)/versotech_main/placement-agreements/page.tsx:345:    return `${(bps / 100).toFixed(2)}%`
src/app/(main)/versotech_main/placement-agreements/page.tsx:391:              ? `Manage your placement agreements as ${partnerInfo.name}`
src/app/(main)/versotech_main/placement-agreements/page.tsx:584:                            {agreement.deal_types.length > 2 && ` +${agreement.deal_types.length - 2}`}
src/app/(main)/versotech_main/placement-agreements/page.tsx:661:                              <Link href={`/versotech_main/versosign/sign/${agreement.signature_token}`}>
src/app/(main)/versotech_main/placement-agreements/page.tsx:676:                            <Link href={`/versotech_main/placement-agreements/${agreement.id}`}>
src/components/lawyer/confirm-commercial-partner-payment-modal.tsx:58:        `/api/lawyers/me/commercial-partner-commissions/${commission.id}/confirm-payment`,
src/components/lawyer/confirm-commercial-partner-payment-modal.tsx:232:          documentName={`Invoice - ${commission.commercial_partner_name}`}
src/app/(main)/versotech_main/my-introducers/page.tsx:208:            signingUrl = `/versotech_main/versosign/sign/${sigReq.signing_token}`
src/app/(main)/versotech_main/my-introducers/page.tsx:540:            {arrangerInfo ? `Introducers working with ${arrangerInfo.legal_name}` : 'View all registered introducers'}
src/app/(main)/versotech_main/my-introducers/page.tsx:588:                            const res = await fetch(`/api/introducer-agreements/${agreement.id}/sign`, {
src/app/(main)/versotech_main/my-introducers/page.tsx:608:                      <Link href={`/versotech_main/introducer-agreements/${agreement.id}`}>
src/app/(main)/versotech_main/introductions/page.tsx:287:      a.download = `introductions-${new Date().toISOString().split('T')[0]}.csv`
src/app/(main)/versotech_main/introductions/page.tsx:389:            const key = `${sub.investor_id}:${sub.deal_id}`
src/app/(main)/versotech_main/introductions/page.tsx:422:          const stageKey = investor?.id && deal?.id ? `${investor.id}:${deal.id}` : null
src/app/(main)/versotech_main/introductions/page.tsx:612:              ? `Track your introductions and commissions as ${introducerInfo.legal_name}`
src/app/(main)/versotech_main/introductions/page.tsx:1070:                      <Link href={`/versotech_main/opportunities/${selectedDeal.id}?from=introductions`}>
src/app/(admin)/versotech_admin/growth/engagement/components/engagement-skeleton.tsx:25:                    style={{ width: `${100 - i * 10}%` }}
src/app/(admin)/versotech_admin/growth/engagement/components/engagement-skeleton.tsx:48:                    style={{ height: `${40 + Math.random() * 100}px` }}
src/app/(admin)/versotech_admin/growth/engagement/components/engagement-skeleton.tsx:73:                  style={{ height: `${20 + Math.random() * 120}px` }}
src/app/(main)/versotech_main/subscription-packs/page.tsx:275:      console.warn(`Subscription ${sub.id} missing deal data (deal_id: ${sub.deal_id})`)
src/app/(main)/versotech_main/subscription-packs/page.tsx:278:      console.warn(`Subscription ${sub.id} missing investor data (investor_id: ${sub.investor_id})`)
src/app/(main)/versotech_main/subscription-packs/page.tsx:302:      deal_name: deal?.name || `Unknown (ID: ${sub.deal_id?.slice(0, 8) || 'N/A'})`,
src/app/(main)/versotech_main/subscription-packs/page.tsx:303:      investor_name: investor?.display_name || investor?.legal_name || `Unknown (ID: ${sub.investor_id?.slice(0, 8) || 'N/A'})`,
src/components/entities/entity-health-monitor.tsx:98:            <p className={`text-xs mt-0.5 ${check.status === 'pass' ? 'text-muted-foreground' : getStatusColor(check.status)}`}>
src/components/entities/entity-health-monitor.tsx:187:              <div className={`text-4xl font-bold ${getStatusColor(healthResult.overallStatus)}`}>
src/components/entities/entity-health-monitor.tsx:252:                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
src/components/entities/entity-health-monitor.tsx:259:                          <Icon className={`h-5 w-5 ${
src/app/(main)/versotech_main/dashboard/partner-dashboard.tsx:332:                      key={`${referral.deal_id}-${referral.investor_id || idx}`}
src/app/(main)/versotech_main/dashboard/partner-dashboard.tsx:336:                        <div className={`p-2 rounded-full ${
src/app/(main)/versotech_main/introducer-agreements/page.tsx:168:      const response = await fetch(`/api/storage/download?path=${encodeURIComponent(pdfUrl)}&bucket=deal-documents`)
src/app/(main)/versotech_main/introducer-agreements/page.tsx:177:      const actualFilename = pdfUrl.split('/').pop() || `${referenceNumber || 'Fee_Agreement'}.pdf`
src/app/(main)/versotech_main/introducer-agreements/page.tsx:322:    return `${(bps / 100).toFixed(2)}%`
src/app/(main)/versotech_main/introducer-agreements/page.tsx:368:              ? `Manage your commission agreements as ${introducerInfo.legal_name}`
src/app/(main)/versotech_main/introducer-agreements/page.tsx:604:                      onClick={() => router.push(`/versotech_main/introducer-agreements/${agreement.id}`)}
src/app/(main)/versotech_main/introducer-agreements/page.tsx:642:                            {agreement.deal_types.length > 2 && ` +${agreement.deal_types.length - 2}`}
src/components/lawyer/confirm-introducer-payment-modal.tsx:58:        `/api/lawyers/me/introducer-commissions/${commission.id}/confirm-payment`,
src/components/lawyer/confirm-introducer-payment-modal.tsx:242:          documentName={`Invoice - ${commission.introducer_name}`}
src/app/(main)/versotech_main/dashboard/investor-dashboard.tsx:63:  return `${typeLabel} • ${location}`
src/app/(main)/versotech_main/dashboard/investor-dashboard.tsx:143:                href={`/versotech_main/opportunities?vehicle=${vehicle.id}`}
src/app/(main)/versotech_main/dashboard/investor-dashboard.tsx:371:            .or(`owner_user_id.eq.${userId},owner_investor_id.in.(${investorIds.join(',')})`)
src/app/(main)/versotech_main/dashboard/investor-dashboard.tsx:421:            description: amountLabel ? `${dealName} - ${amountLabel}` : dealName,
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:336:          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:339:          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:354:        <Card className={`border-amber-500/30 ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:362:                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:369:                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:379:                <Link href={`/versotech_main/introducer-agreements/${pendingAgreement.id}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:393:        <Card className={`border-red-500/30 ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:400:                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:403:                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:417:              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:439:            <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:441:                ? `Showing data from ${format(dateRange.from, 'MMM dd, yyyy')} to ${format(dateRange.to, 'MMM dd, yyyy')}`
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:442:                : `Showing data from ${format(dateRange.from, 'MMM dd, yyyy')} onwards`
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:447:            <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:458:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:461:            <Users className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:464:            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:467:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:475:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:478:            <TrendingUp className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:481:            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:484:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:492:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:495:            <DollarSign className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:501:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:509:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:512:            <Clock className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:518:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:529:            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : ''}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:537:              <div className={`p-4 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-muted/30'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:538:                <div className={`flex items-center gap-2 text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:546:                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:549:                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-muted-foreground'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:557:              <div className={`p-4 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-muted/30'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:558:                <div className={`flex items-center gap-2 text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:562:                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:565:                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-muted-foreground'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:570:              <div className={`p-4 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-muted/30'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:571:                <div className={`flex items-center gap-2 text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:575:                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:578:                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-muted-foreground'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:606:                <UserPlus className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:607:                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:616:                    className={`flex items-center justify-between p-3 rounded-lg ${
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:621:                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:624:                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:649:                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:656:                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Commission Rate</p>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:657:                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:659:                        ? `${(activeAgreement.default_commission_bps / 100).toFixed(2)}%`
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:664:                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Effective Since</p>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:665:                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:672:                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Expires</p>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:673:                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:680:                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Signed</p>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:681:                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:690:                  <Link href={`/versotech_main/introducer-agreements/${activeAgreement.id}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:698:                <FileSignature className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:699:                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/introducer-dashboard.tsx:702:                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
src/app/(main)/versotech_main/lawyer-deal/[id]/page.tsx:31:    `${process.env.NEXT_PUBLIC_APP_URL}/api/lawyers/me/deals/${id}`,
src/components/profile/personal-kyc-section.tsx:420:        apiEndpoint={`/api/${entityType}s/me/members`}
src/components/entities/add-valuation-modal.tsx:39:      const response = await fetch(`/api/staff/vehicles/${vehicleId}/valuations`, {
src/app/(admin)/versotech_admin/growth/engagement/components/top-engaged-users-table.tsx:87:        const response = await fetch(`/api/admin/growth/engagement?days=${days}`)
src/app/(admin)/versotech_admin/growth/engagement/components/top-engaged-users-table.tsx:197:                      href={`/versotech_admin/users/${user.id}`}
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:408:          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:411:          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:440:        <Card className={`border-amber-500/30 ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:447:                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:450:                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:463:        <Card className={`border-orange-500/30 ${isDark ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:471:                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:474:                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:494:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:497:            <Users className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:500:            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:503:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:511:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:514:            <TrendingUp className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:517:            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:520:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:528:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:531:            <DollarSign className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:537:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:545:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:548:            <Briefcase className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:551:            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:554:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:577:              <div className={`p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-green-50'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:578:                <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Paid</p>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:583:              <div className={`p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-blue-50'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:584:                <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Accrued</p>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:589:              <div className={`p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-amber-50'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:590:                <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Pending</p>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:609:                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:612:                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:627:                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:630:                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:658:                <FileText className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:659:                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:662:                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:671:                    className={`flex items-center justify-between p-3 rounded-lg ${
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:677:                        <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:686:                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:717:                <FileSignature className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:718:                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:721:                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:730:                    href={`/versotech_main/placement-agreements/${agreement.id}`}
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:731:                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:736:                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:739:                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:793:      <Card className={`${isDark ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-cyan-50 border-cyan-200'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:800:              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/commercial-partner-dashboard.tsx:803:              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
src/app/(main)/versotech_main/subscription-packs/subscription-packs-client.tsx:343:      const response = await fetch(`/api/documents/${subscription.document_id}/download`)
src/app/(main)/versotech_main/subscription-packs/subscription-packs-client.tsx:360:      a.download = subscription.document_file_name || data.fileName || `subscription-pack-${subscription.id}.pdf`
src/app/(main)/versotech_main/subscription-packs/subscription-packs-client.tsx:412:              ? `Subscription packs for mandates managed by ${entityInfo?.display_name || 'your entity'}`
src/app/(main)/versotech_main/subscription-packs/subscription-packs-client.tsx:414:              ? `Subscription packs for deals assigned to ${entityInfo?.display_name || entityInfo?.firm_name || 'your firm'}`
src/app/(main)/versotech_main/subscription-packs/subscription-packs-client.tsx:647:              ? `Showing ${startIndex + 1}-${endIndex} of ${filteredSubscriptions.length} subscriptions`
src/app/(main)/versotech_main/subscription-packs/subscription-packs-client.tsx:648:              : `${filteredSubscriptions.length} subscription${filteredSubscriptions.length !== 1 ? 's' : ''}`}
src/app/(main)/versotech_main/subscription-packs/subscription-packs-client.tsx:649:            {hasActiveFilters && filteredSubscriptions.length > 0 && ` (filtered from ${subscriptions.length} total)`}
src/app/(main)/versotech_main/escrow/page.tsx:803:      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
src/app/(main)/versotech_main/escrow/page.tsx:810:    link.setAttribute('download', `escrow-settlements-${new Date().toISOString().split('T')[0]}.csv`)
src/app/(main)/versotech_main/escrow/page.tsx:844:              ? `Manage escrow accounts and settlements for ${lawyerInfo.display_name}`
src/app/(main)/versotech_main/escrow/page.tsx:846:                ? `View escrow status for deals managed by ${arrangerInfo.legal_name}`
src/app/(main)/versotech_main/escrow/page.tsx:1103:                              <a href={lawyerInfo ? `/versotech_main/lawyer-deal/${deal.deal_id}` : `/versotech_main/opportunities/${deal.deal_id}`}>
src/app/(main)/versotech_main/escrow/page.tsx:1166:                              href={lawyerInfo ? `/versotech_main/lawyer-deal/${settlement.deal_id}` : `/versotech_main/opportunities/${settlement.deal_id}`}
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:77:        .or(`investor_id.in.(select investor_id from investor_users where user_id=${userId})`)
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:174:            ${isDark
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:182:                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${isDark ? 'ffffff' : '000000'}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:192:                    ${isDark
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:197:                    <ArrowLeftRight className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`} />
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:200:                    <p className={`text-sm font-semibold tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-800'}`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:203:                    <p className={`text-[13px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:212:                  ${isDark
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:222:                      ${activeView === 'partner'
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:240:                      ${activeView === 'investor'
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:301:            ${isDark
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:309:                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${isDark ? 'ffffff' : '000000'}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:319:                    ${isDark
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:324:                    <ArrowLeftRight className={`h-5 w-5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`} />
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:327:                    <p className={`text-sm font-semibold tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-800'}`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:330:                    <p className={`text-[13px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:339:                  ${isDark
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:349:                      ${activeView === 'partner'
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:367:                      ${activeView === 'investor'
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:459:          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:462:          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:468:        <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'}`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:469:          <div className={`h-10 w-10 rounded-full ${PERSONA_COLORS[activePersona.persona_type]} flex items-center justify-center`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:473:            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:476:            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:494:              className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} ${isActive ? 'ring-2 ring-blue-500' : ''}`}
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:497:                <div className={`h-12 w-12 rounded-full ${PERSONA_COLORS[persona.persona_type]} flex items-center justify-center`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:501:                  <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:544:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:547:            <CheckSquare className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:550:            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>0</div>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:551:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:559:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:562:            <TrendingUp className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:565:            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>-</div>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:566:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:574:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:577:            <FileText className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:580:            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>-</div>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:581:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:590:        <Card className={`${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:597:                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/persona-dashboard.tsx:600:                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
src/app/(main)/versotech_main/introducer-agreements/[id]/agreement-status-timeline.tsx:121:      return `Signed by ${ceoSignature.signer_name}`
src/app/(main)/versotech_main/introducer-agreements/[id]/agreement-status-timeline.tsx:140:      return `Signed by ${introducerSignature.signer_name}`
src/app/(main)/versotech_main/placement-agreements/[id]/page.tsx:92:  return `${(bps / 100).toFixed(2)}%`
src/app/(main)/versotech_main/placement-agreements/[id]/page.tsx:117:        const response = await fetch(`/api/placement-agreements/${agreementId}`)
src/app/(main)/versotech_main/placement-agreements/[id]/page.tsx:142:      const response = await fetch(`/api/placement-agreements/${agreementId}/sign`, {
src/components/approvals/views/approvals-kanban-view.tsx:38:              <div className={`border-l-4 ${column.color} pl-4 ${column.bgColor} py-3 rounded-r-lg`}>
src/components/entities/add-director-modal-enhanced.tsx:65:        ? `/api/director-registry?search=${encodeURIComponent(searchQuery)}`
src/components/entities/add-director-modal-enhanced.tsx:244:                      className={`p-3 cursor-pointer transition-all ${
src/components/profile/notice-contacts-tab.tsx:189:        ? `${apiEndpoint}/${editingContact.id}`
src/components/profile/notice-contacts-tab.tsx:218:      const response = await fetch(`${apiEndpoint}/${contactId}`, {
src/components/profile/notice-contacts-tab.tsx:331:                            {contact.city}{contact.country ? `, ${contact.country}` : ''}
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:312:          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:315:          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:317:            {lawyerInfo?.firm_name && ` - ${lawyerInfo.firm_name}`}
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:333:        <Card className={`border-amber-500/30 ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:340:                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:343:                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:354:        <Card className={`border-blue-500/30 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:362:                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:365:                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:383:        <Card className={`border-purple-500/30 ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:391:                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:394:                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:414:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:417:            <Briefcase className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:420:            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:423:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:431:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:434:            <FileText className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:437:            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:440:            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:448:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:451:            <DollarSign className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:457:                  <div key={c.currency} className={`${i === 0 ? 'text-2xl font-bold' : 'text-sm font-medium'} text-blue-500`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:467:            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:475:            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:478:            <CheckCircle2 className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:484:                  <div key={c.currency} className={`${i === 0 ? 'text-2xl font-bold' : 'text-sm font-medium'} text-green-500`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:494:            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:520:                <FileText className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:521:                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:530:                    className={`flex items-center justify-between p-3 rounded-lg ${
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:535:                      <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:538:                      <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:541:                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:572:                <Briefcase className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:573:                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:576:                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:585:                    href={`/versotech_main/opportunities/${deal.id}`}
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:586:                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:591:                      <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:594:                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
src/app/(main)/versotech_main/dashboard/lawyer-dashboard.tsx:596:                          ? `${formatCurrency(deal.target_amount, deal.currency)} target`
src/app/(admin)/versotech_admin/growth/engagement/components/actions-type-chart.tsx:63:                style={{ width: `${100 - i * 10}%` }}
src/app/(admin)/versotech_admin/growth/engagement/components/actions-type-chart.tsx:107:        const response = await fetch(`/api/admin/growth/engagement?days=${days}`)
src/app/(admin)/versotech_admin/growth/engagement/components/actions-type-chart.tsx:216:                  key={`cell-${index}`}
src/components/entities/import-valuations-dialog.tsx:34:      const response = await fetch(`/api/staff/vehicles/${vehicleId}/valuations/import`, {
src/components/entities/import-valuations-dialog.tsx:45:      toast.success(data.message || `Imported ${data.imported} valuation(s)`)
src/app/(main)/versotech_main/versosign/page.tsx:240:      staffTasksQuery = staffTasksQuery.or(`owner_user_id.eq.${user.id},owner_ceo_entity_id.eq.${ceoEntityId}`)
src/app/(main)/versotech_main/versosign/page.tsx:278:      .or(`owner_user_id.eq.${user.id},owner_investor_id.in.(${investorIds.join(',')})`)
src/app/(main)/versotech_main/versosign/page.tsx:292:      .or(`owner_user_id.eq.${user.id},owner_introducer_id.in.(${introducerIds.join(',')})`)
src/app/(main)/versotech_main/versosign/page.tsx:338:      .or(`owner_user_id.eq.${user.id},owner_commercial_partner_id.in.(${commercialPartnerIds.join(',')})`)
src/app/(main)/versotech_main/introducer-agreements/[id]/agreement-detail-client.tsx:156:      const response = await fetch(`/api/storage/download?path=${encodeURIComponent(pdfPath)}&bucket=${bucket}`)
src/app/(main)/versotech_main/introducer-agreements/[id]/agreement-detail-client.tsx:164:      link.download = `${agreement.reference_number || 'Fee_Agreement'}.pdf`
src/app/(main)/versotech_main/introducer-agreements/[id]/agreement-detail-client.tsx:192:      const response = await fetch(`/api/storage/signed-url?path=${encodeURIComponent(pdfPath)}&bucket=${bucket}`)
src/app/(main)/versotech_main/introducer-agreements/[id]/agreement-detail-client.tsx:220:    return `${(bps / 100).toFixed(2)}%`
src/app/(main)/versotech_main/introducer-agreements/[id]/agreement-detail-client.tsx:226:      const response = await fetch(`/api/introducer-agreements/${agreement.id}/send`, {
src/app/(main)/versotech_main/introducer-agreements/[id]/agreement-detail-client.tsx:245:      const response = await fetch(`/api/introducer-agreements/${agreement.id}/approve`, {
src/app/(main)/versotech_main/introducer-agreements/[id]/agreement-detail-client.tsx:264:      const response = await fetch(`/api/introducer-agreements/${agreement.id}/reject`, {
src/app/(main)/versotech_main/introducer-agreements/[id]/agreement-detail-client.tsx:399:              <Link href={`/versotech_main/versosign?agreement=${agreement.id}`}>
src/app/(main)/versotech_main/introducer-agreements/[id]/agreement-detail-client.tsx:412:              <Link href={`/versotech_main/versosign?agreement=${agreement.id}`}>
src/app/(main)/versotech_main/introducer-agreements/[id]/agreement-detail-client.tsx:617:                    href={`mailto:${agreement.introducer.email}`}
src/app/(main)/versotech_main/introducer-agreements/[id]/agreement-detail-client.tsx:639:                  <Link href={`/versotech_main/introducers/${agreement.introducer_id}`}>
src/app/(main)/versotech_main/introducer-agreements/[id]/agreement-detail-client.tsx:655:          name: `${agreement.reference_number || 'Fee_Agreement'}.pdf`,
src/app/(main)/versotech_main/introducer-agreements/[id]/agreement-detail-client.tsx:656:          file_name: `${agreement.reference_number || 'Fee_Agreement'}.pdf`,
src/components/approvals/views/approvals-list-view.tsx:67:                    ? `Member Invitation: ${approval.entity_metadata?.email || 'Unknown'}`
src/app/(admin)/versotech_admin/growth/engagement/components/engagement-by-day-chart.tsx:56:                style={{ height: `${60 + Math.random() * 120}px` }}
src/app/(admin)/versotech_admin/growth/engagement/components/engagement-by-day-chart.tsx:105:        const response = await fetch(`/api/admin/growth/engagement?days=${days}`)
src/app/(admin)/versotech_admin/growth/engagement/components/engagement-by-day-chart.tsx:214:                <Cell key={`cell-${entry.day}`} fill={getBarColor(entry.day)} />
src/components/profile/introducer-kyc-documents-tab.tsx:115:      formData.append('name', file.name.replace(/\.[^/.]+$/, ''))
src/components/profile/introducer-kyc-documents-tab.tsx:128:      toast.success(`${docTypeLabel} uploaded successfully`)
src/components/profile/introducer-kyc-documents-tab.tsx:144:      const response = await fetch(`/api/documents/${doc.id}/download`)
src/components/profile/introducer-kyc-documents-tab.tsx:169:    if (bytes < 1024) return `${bytes} B`
src/components/profile/introducer-kyc-documents-tab.tsx:170:    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
src/components/profile/introducer-kyc-documents-tab.tsx:171:    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
src/components/profile/introducer-kyc-documents-tab.tsx:216:                  {introducerName ? `Compliance documents for ${introducerName}` : 'Upload required compliance documents'}
src/components/profile/introducer-kyc-documents-tab.tsx:245:              style={{ width: `${completionPercentage}%` }}
src/app/(main)/versotech_main/subscriptions/vehicle-summary/vehicle-summary-client.tsx:186:                      ? `${((data.grand_totals.total_funded / data.grand_totals.total_commitment) * 100).toFixed(1)}% funded`
src/app/(main)/versotech_main/versosign/introducer-agreement-signing-section.tsx:70:    return `${(bps / 100).toFixed(2)}%`
src/app/(main)/versotech_main/versosign/introducer-agreement-signing-section.tsx:78:      const response = await fetch(`/api/introducer-agreements/${agreement.id}/sign`, {
src/app/(main)/versotech_main/versosign/introducer-agreement-signing-section.tsx:172:                    documentName={`Introducer Agreement - ${signingMode.agreement.introducer?.legal_name}`}
src/app/(main)/versotech_main/versosign/introducer-agreement-signing-section.tsx:266:                        <Link href={`/versotech_main/introducer-agreements/${agreement.id}`}>
src/app/(main)/versotech_main/users/users-page-client.tsx:138:  if (days < 7) return `${days} days ago`
src/app/(main)/versotech_main/users/users-page-client.tsx:139:  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
src/app/(main)/versotech_main/users/users-page-client.tsx:140:  if (days < 365) return `${Math.floor(days / 30)} months ago`
src/app/(main)/versotech_main/users/users-page-client.tsx:141:  return `${Math.floor(days / 365)} years ago`
src/app/(main)/versotech_main/users/users-page-client.tsx:165:      <IconComponent className={`h-4 w-4 ${config.className}`} />
src/app/(main)/versotech_main/users/users-page-client.tsx:166:      <span className={`text-xs ${config.className}`}>{config.label}</span>
src/app/(main)/versotech_main/users/users-page-client.tsx:168:        <AlertTriangle className={`h-3 w-3 ${kyc.idExpiryWarning === 'expired' ? 'text-red-400' : 'text-orange-400'}`} />
src/app/(main)/versotech_main/users/users-page-client.tsx:196:              <div key={`${entity.type}-${entity.id}`} className="p-3 border-b last:border-0 hover:bg-muted/50">
src/app/(main)/versotech_main/users/users-page-client.tsx:199:                  <Badge variant="outline" className={`text-xs ${config?.className || ''}`}>
src/app/(main)/versotech_main/users/users-page-client.tsx:252:            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
src/app/(main)/versotech_main/users/users-page-client.tsx:320:      const response = await fetch(`/api/admin/users?${params}`)
src/app/(main)/versotech_main/users/users-page-client.tsx:380:      const response = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
src/app/(main)/versotech_main/users/users-page-client.tsx:404:      const response = await fetch(`/api/admin/users/${selectedUser.id}/deactivate`, {
src/app/(main)/versotech_main/users/users-page-client.tsx:429:      const response = await fetch(`/api/admin/users/${selectedUser.id}/reactivate`, {
src/app/(main)/versotech_main/users/users-page-client.tsx:456:    window.location.href = `mailto:?bcc=${encodeURIComponent(emails)}`
src/app/(main)/versotech_main/users/users-page-client.tsx:482:    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
src/app/(main)/versotech_main/users/users-page-client.tsx:487:    a.download = `users-selected-${new Date().toISOString().split('T')[0]}.csv`
src/app/(main)/versotech_main/users/users-page-client.tsx:751:              <DropdownMenuItem onClick={() => router.push(`/versotech_main/users/${user.id}`)}>
src/app/(main)/versotech_main/users/users-page-client.tsx:755:              <DropdownMenuItem onClick={() => window.location.href = `mailto:${user.email}`}>
src/app/(main)/versotech_main/users/users-page-client.tsx:836:    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
src/app/(main)/versotech_main/users/users-page-client.tsx:841:    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
src/app/(main)/versotech_main/users/users-page-client.tsx:990:                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
src/app/(main)/versotech_main/users/users-page-client.tsx:1159:                  key={`${entity.type}-${entity.id}`}
src/app/(main)/versotech_main/users/users-page-client.tsx:1165:                      <Badge variant="outline" className={`text-xs ${config?.className || ''}`}>
src/app/(main)/versotech_main/users/users-page-client.tsx:1187:                      onClick={() => router.push(`${entityRoute}/${entity.id}`)}
src/app/(admin)/versotech_admin/growth/engagement/components/peak-hours-chart.tsx:32:  if (hour < 12) return `${hour}am`
src/app/(admin)/versotech_admin/growth/engagement/components/peak-hours-chart.tsx:33:  return `${hour - 12}pm`
src/app/(admin)/versotech_admin/growth/engagement/components/peak-hours-chart.tsx:43:    return `hsl(var(--primary) / ${0.4 + intensity * 0.6})`
src/app/(admin)/versotech_admin/growth/engagement/components/peak-hours-chart.tsx:46:  return `hsl(var(--primary) / ${0.2 + intensity * 0.4})`
src/app/(admin)/versotech_admin/growth/engagement/components/peak-hours-chart.tsx:70:                style={{ height: `${20 + Math.random() * 120}px` }}
src/app/(admin)/versotech_admin/growth/engagement/components/peak-hours-chart.tsx:121:        const response = await fetch(`/api/admin/growth/engagement?days=${days}`)
src/app/(admin)/versotech_admin/growth/engagement/components/peak-hours-chart.tsx:247:                  key={`cell-${entry.hour}`}
src/components/approvals/approvals-page-client.tsx:53:      text: `${Math.abs(diffHours)}h overdue`,
src/components/approvals/approvals-page-client.tsx:60:      text: `${diffHours}h remaining`,
src/components/approvals/approvals-page-client.tsx:67:      text: `${diffHours}h remaining`,
src/components/approvals/approvals-page-client.tsx:74:      text: `${diffHours}h remaining`,
src/components/approvals/approvals-page-client.tsx:194:      const response = await fetch(`/api/approvals?${params.toString()}`, {
src/components/approvals/approvals-page-client.tsx:240:      const response = await fetch(`/api/approvals/${approvalId}/action`, {
src/components/approvals/approvals-page-client.tsx:260:      const response = await fetch(`/api/approvals/${approvalId}/action`, {
src/components/approvals/approvals-page-client.tsx:333:      if (!response.ok) throw new Error(`Bulk ${action} failed`)
src/components/approvals/approvals-page-client.tsx:338:        toast.success(`${data.successful_count} approval${data.successful_count > 1 ? 's' : ''} ${action}d successfully`)
src/components/approvals/approvals-page-client.tsx:341:        toast.error(`${data.failed_count} approval${data.failed_count > 1 ? 's' : ''} failed`)
src/components/approvals/approvals-page-client.tsx:347:      console.error(`Bulk ${action} error:`, error)
src/components/approvals/approvals-page-client.tsx:348:      toast.error(`Failed to ${action} selected approvals`)
src/components/approvals/approvals-page-client.tsx:363:      const filename = `approvals-export-${timestamp}.csv`
src/components/approvals/approvals-page-client.tsx:365:      toast.success(`Exported ${visibleApprovals.length} approvals to CSV`)
src/components/approvals/approvals-page-client.tsx:495:                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
src/components/approvals/approvals-page-client.tsx:546:                              className={`cursor-pointer hover:bg-white/5 transition-colors ${selectedIds.has(approval.id) ? 'bg-muted/50' : ''}`}
src/components/approvals/approvals-page-client.tsx:553:                                  aria-label={`Select approval ${approval.id}`}
src/components/approvals/approvals-page-client.tsx:615:                                        formattedAmount = `${indicativeCurrency} ${numeric.toLocaleString()}`.trim()
src/components/approvals/approvals-page-client.tsx:620:                                        formattedAmount = `$${numeric.toLocaleString()}`
src/components/holdings/vehicle-card.tsx:131:    router.push(`${detailsBasePath}/${holding.id}`)
src/components/holdings/vehicle-card.tsx:136:      const response = await fetch(`/api/documents/${doc.id}/download`)
src/app/(main)/versotech_main/versosign/placement-agreement-signing-section.tsx:72:    return `${(bps / 100).toFixed(2)}%`
src/app/(main)/versotech_main/versosign/placement-agreement-signing-section.tsx:84:      const response = await fetch(`/api/placement-agreements/${agreement.id}/sign`, {
src/app/(main)/versotech_main/versosign/placement-agreement-signing-section.tsx:178:                    documentName={`Placement Agreement - ${getPartnerDisplayName(signingMode.agreement.commercial_partner)}`}
src/app/(main)/versotech_main/versosign/placement-agreement-signing-section.tsx:272:                        <Link href={`/versotech_main/commercial-partner-agreements/${agreement.id}`}>
src/components/entities/entity-detail-enhanced.tsx:305:    return `${currencyCode} ${amount.toLocaleString()}`
src/components/entities/entity-detail-enhanced.tsx:382:                  key={`${sheet}-${row}-${index}`}
src/components/entities/entity-detail-enhanced.tsx:515:      const response = await fetch(`/api/entities/${entity.id}/folders`)
src/components/entities/entity-detail-enhanced.tsx:531:      const response = await fetch(`/api/documents?entity_id=${entity.id}`)
src/components/entities/entity-detail-enhanced.tsx:547:      const response = await fetch(`/api/entities/${entity.id}`)
src/components/entities/entity-detail-enhanced.tsx:637:      const response = await fetch(`/api/entities/${entity.id}/investors`)
src/components/entities/entity-detail-enhanced.tsx:655:      const response = await fetch(`/api/entities/${entity.id}/flags`)
src/components/entities/entity-detail-enhanced.tsx:672:      const response = await fetch(`/api/staff/vehicles/${entity.id}/valuations`)
src/components/entities/entity-detail-enhanced.tsx:686:      const response = await fetch(`/api/staff/vehicles/${entity.id}/positions`)
src/components/entities/entity-detail-enhanced.tsx:702:        description: `This will permanently remove the valuation dated ${new Date(valuation.as_of_date).toLocaleDateString()}.`,
src/components/entities/entity-detail-enhanced.tsx:710:            `/api/staff/vehicles/${entity.id}/valuations/${valuation.id}`,
src/components/entities/entity-detail-enhanced.tsx:739:            `/api/staff/vehicles/${entity.id}/positions/${position.id}`,
src/components/entities/entity-detail-enhanced.tsx:773:        const response = await fetch(`/api/entities/${entity.id}/investors/${linkId}`, {
src/components/entities/entity-detail-enhanced.tsx:845:      const response = await fetch(`/api/entities/${entity.id}/investors/${editingSubscription.investorId}`, {
src/components/entities/entity-detail-enhanced.tsx:879:          description: `Are you sure you want to unlink ${investorName} from this entity? This action cannot be undone. The entity-investor link data will be permanently deleted.`,
src/components/entities/entity-detail-enhanced.tsx:887:            const response = await fetch(`/api/entities/${entity.id}/investors/${linkId}`, {
src/components/entities/entity-detail-enhanced.tsx:914:      const response = await fetch(`/api/documents/${docId}/download`)
src/components/entities/entity-detail-enhanced.tsx:939:          description: `Are you sure you want to delete "${docName}"? This action cannot be undone and will permanently remove the document and all its versions.`,
src/components/entities/entity-detail-enhanced.tsx:945:            const response = await fetch(`/api/staff/documents/${docId}`, {
src/components/entities/entity-detail-enhanced.tsx:980:        const response = await fetch(`/api/entities/${entity.id}/flags/${flagId}`, {
src/components/entities/entity-detail-enhanced.tsx:1038:          description: `Are you sure you want to delete the flag "${flagTitle}"? This action cannot be undone.`,
src/components/entities/entity-detail-enhanced.tsx:1044:            const response = await fetch(`/api/entities/${entity.id}/flags/${flagId}`, {
src/components/entities/entity-detail-enhanced.tsx:1077:          description: `Are you sure you want to remove ${directorName} from this entity? This action cannot be undone.`,
src/components/entities/entity-detail-enhanced.tsx:1084:              `/api/entities/${entity.id}/directors/${directorId}`,
src/components/entities/entity-detail-enhanced.tsx:1118:          description: `Are you sure you want to remove ${stakeholderName} from this entity? This action cannot be undone.`,
src/components/entities/entity-detail-enhanced.tsx:1125:              `/api/entities/${entity.id}/stakeholders/${stakeholderId}`,
src/components/entities/entity-detail-enhanced.tsx:1182:    return `/versotech_admin/agents?${params.toString()}`
src/components/entities/entity-detail-enhanced.tsx:1245:              {entity.updated_at && ` • Updated ${new Date(entity.updated_at).toLocaleString()}`}
src/components/entities/entity-detail-enhanced.tsx:1255:                  alt={`${entity.name} logo`}
src/components/entities/entity-detail-enhanced.tsx:1965:                {activeFolder ? `${activeFolder.name} Documents` : 'All Documents'} ({filteredDocuments.length})
src/components/entities/entity-detail-enhanced.tsx:1969:                  ? `Showing files stored under ${activeFolder.path}`
src/components/entities/entity-detail-enhanced.tsx:1988:                      : `/api/documents/${doc.id}/download`
src/components/entities/entity-detail-enhanced.tsx:2017:                            {doc.created_by && ` • ${doc.created_by}`}
src/components/entities/entity-detail-enhanced.tsx:2159:                                : `Tracking ${group.length} relationship${group.length === 1 ? '' : 's'}.`}
src/components/entities/entity-detail-enhanced.tsx:2180:                                      {stakeholder.contact_person && `Contact: ${stakeholder.contact_person}`}
src/components/entities/entity-detail-enhanced.tsx:2181:                                      {stakeholder.email && ` • ${stakeholder.email}`}
src/components/entities/entity-detail-enhanced.tsx:2182:                                      {stakeholder.phone && ` • ${stakeholder.phone}`}
src/components/entities/entity-detail-enhanced.tsx:2217:                                    ` • Ended ${new Date(stakeholder.effective_to).toLocaleDateString()}`}
src/components/entities/entity-detail-enhanced.tsx:2273:                            {director.email && ` • ${director.email}`}
src/components/entities/entity-detail-enhanced.tsx:2304:                          ` • Ended ${new Date(director.effective_to).toLocaleDateString()}`}
src/components/entities/entity-detail-enhanced.tsx:2337:                      href={`/versotech_main/deals/${deal.id}`}
src/components/entities/entity-detail-enhanced.tsx:2455:                            ` • ${event.changed_by_profile.display_name}`}
src/components/approvals/approval-detail-drawer.tsx:140:      const subject = `${approvalType} - ${dealName}`
src/components/approvals/approval-detail-drawer.tsx:152:          initial_message: `Regarding your ${approvalType.toLowerCase()} for ${dealName}.`,
src/components/approvals/approval-detail-drawer.tsx:169:        description: `Opening conversation with ${approval.requested_by_profile.display_name || 'investor'}`
src/components/approvals/approval-detail-drawer.tsx:173:      router.push(`/versotech_main/messages?conversation=${data.conversation.id}`)
src/components/approvals/approval-detail-drawer.tsx:278:                  : `Message ${approval.requested_by_profile.display_name || 'Investor'}`}
src/components/approvals/approval-detail-drawer.tsx:286:        <Tabs defaultValue="overview" className="w-full" id={`approval-tabs-${approval?.id || 'new'}`}>
src/components/approvals/approval-detail-drawer.tsx:308:                        href={`/versotech_main/deals/${approval.related_deal.id}`}
src/components/approvals/approval-detail-drawer.tsx:863:    description: `Requested by ${approval.requested_by_profile?.display_name || 'Unknown'}`
src/components/approvals/approval-detail-drawer.tsx:874:      description: `Assigned to ${approval.assigned_to_profile.display_name}`
src/components/approvals/approval-detail-drawer.tsx:890:        ? `SLA deadline: ${format(new Date(approval.sla_breach_at), 'MMM dd, HH:mm')}`
src/components/approvals/approval-detail-drawer.tsx:902:        ? `Approved by ${approval.approved_by_profile.display_name}`
src/components/approvals/approval-detail-drawer.tsx:914:        ? `Rejected by ${approval.approved_by_profile.display_name}`
src/components/approvals/approval-detail-drawer.tsx:981:                className={`rounded-full p-2 ${
src/components/approvals/approval-detail-drawer.tsx:993:                  className={`w-0.5 h-12 ${event.completed ? 'bg-emerald-500/30' : 'bg-border'}`}
src/components/approvals/approval-detail-drawer.tsx:998:              <p className={`font-medium ${event.current ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
src/app/(main)/versotech_main/users/lawyers-content.tsx:107:  return `${specializations.slice(0, 2).join(', ')} +${specializations.length - 2}`
src/app/(main)/versotech_main/users/lawyers-content.tsx:447:                          <DropdownMenuItem onClick={() => router.push(`/versotech_main/lawyers/${lawyer.id}`)}>
src/app/(main)/versotech_main/users/lawyers-content.tsx:452:                            <DropdownMenuItem onClick={() => window.location.href = `mailto:${lawyer.primaryContactEmail}`}>
src/components/holdings/portfolio-dashboard.tsx:116:  return `${safeValue > 0 ? '+' : ''}${safeValue.toFixed(decimals)}%`
src/components/holdings/portfolio-dashboard.tsx:122:  return `${safeValue.toFixed(decimals)}x`
src/components/holdings/portfolio-dashboard.tsx:272:          subtitle={`${activeKpis.totalCommitment > 0 ? ((activeKpis.totalContributed / activeKpis.totalCommitment) * 100).toFixed(0) : 0}% deployed`}
src/components/holdings/portfolio-dashboard.tsx:278:          subtitle={`DPI: ${formatRatio(activeKpis.dpi)}`}
src/components/holdings/portfolio-dashboard.tsx:284:          subtitle={`${(activeKpis.unrealizedGainPct ?? 0).toFixed(1)}% return`}
src/app/(admin)/versotech_admin/growth/cohorts/page.tsx:33:    router.push(`${pathname}?${params.toString()}`)
src/app/(main)/versotech_main/users/unified-users-content.tsx:172:    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
src/app/(main)/versotech_main/users/unified-users-content.tsx:177:    a.download = `all-users-${new Date().toISOString().split('T')[0]}.csv`
src/app/(main)/versotech_main/users/unified-users-content.tsx:425:                              window.location.href = `/versotech_main/${typeRoutes[user.entityType]}/${user.entityId}`
src/app/(main)/versotech_main/users/unified-users-content.tsx:431:                              <DropdownMenuItem onClick={() => window.location.href = `mailto:${user.userEmail}`}>
src/components/entities/director-modal-refactored.tsx:139:        ? `/api/director-registry?search=${encodeURIComponent(searchQuery)}`
src/components/entities/director-modal-refactored.tsx:365:                      className={`p-3 cursor-pointer transition-all ${
src/app/(main)/versotech_main/users/partners-content.tsx:122:  const format = (n: number) => `${(n / 1000000).toFixed(1)}M`
src/app/(main)/versotech_main/users/partners-content.tsx:123:  if (min && max) return `${format(min)} - ${format(max)}`
src/app/(main)/versotech_main/users/partners-content.tsx:124:  if (min) return `${format(min)}+`
src/app/(main)/versotech_main/users/partners-content.tsx:125:  if (max) return `Up to ${format(max)}`
src/app/(main)/versotech_main/users/partners-content.tsx:167:    toast.info(`To dispatch an investor through ${partner.name}, go to a deal's Members tab and use "Add Participant"`)
src/app/(main)/versotech_main/users/partners-content.tsx:504:                          <DropdownMenuItem onClick={() => router.push(`/versotech_main/partners/${partner.id}`)}>
src/app/(main)/versotech_main/users/partners-content.tsx:509:                            <DropdownMenuItem onClick={() => window.location.href = `mailto:${partner.contactEmail}`}>
src/app/(main)/versotech_main/portfolio/[id]/page.tsx:331:                  <div className={`flex items-center gap-1 text-sm mt-2 ${positionData.unrealizedGainPct > 0 ? 'text-green-600' :
src/app/(main)/versotech_main/portfolio/[id]/page.tsx:383:                <div className={`text-3xl font-bold ${positionData.unrealizedGain > 0 ? 'text-green-600' :
src/app/(main)/versotech_main/portfolio/[id]/page.tsx:454:                      <Badge className={`${subscriptionData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
src/app/(main)/versotech_main/portfolio/[id]/page.tsx:486:                            <div className={`w-3 h-3 rounded-full ${flow.type === 'call' ? 'bg-red-500' : 'bg-green-500'
src/app/(main)/versotech_main/portfolio/[id]/page.tsx:495:                          <div className={`font-semibold ${flow.type === 'call' ? 'text-red-600' : 'text-green-600'
src/app/(main)/versotech_main/portfolio/[id]/page.tsx:540:                              ? `${feeStructure.subscriptionFeePercent}%`
src/app/(main)/versotech_main/portfolio/[id]/page.tsx:592:                              ? `${feeStructure.managementFeePercent}%`
src/app/(main)/versotech_main/portfolio/[id]/page.tsx:707:                          <div className={`w-4 h-4 rounded-full ${flow.type === 'call' ? 'bg-red-500' : 'bg-green-500'
src/app/(main)/versotech_main/portfolio/[id]/page.tsx:719:                          <div className={`font-semibold text-lg ${flow.type === 'call' ? 'text-red-600' : 'text-green-600'
src/components/approvals/approval-action-dialog.tsx:74:      const response = await fetch(`/api/approvals/${approval.id}/action`, {
src/components/approvals/approval-action-dialog.tsx:90:        throw new Error(data.error || `Failed to ${action} approval`)
src/components/approvals/approval-action-dialog.tsx:93:      toast.success(data.message || `Successfully ${action}d approval`)
src/components/approvals/approval-action-dialog.tsx:97:      console.error(`Error ${action}ing approval:`, error)
src/components/approvals/approval-action-dialog.tsx:98:      toast.error(error instanceof Error ? error.message : `Failed to ${action} approval`)
src/components/approvals/approval-action-dialog.tsx:155:                    ${parseFloat(entityAmount).toLocaleString()}
src/components/approvals/approval-action-dialog.tsx:185:                  This approval involves an amount greater than $50,000. Please ensure all
src/components/profile/kyc-documents-tab.tsx:92:      const response = await fetch(`/api/documents/${documentId}/download`)
src/components/holdings/cash-flow-chart.tsx:107:                          <span className={`text-sm font-semibold ${
src/app/(main)/versotech_main/users/commercial-partners-content.tsx:483:                          <DropdownMenuItem onClick={() => router.push(`/versotech_main/commercial-partners/${partner.id}`)}>
src/app/(main)/versotech_main/users/commercial-partners-content.tsx:488:                            <DropdownMenuItem onClick={() => window.location.href = `mailto:${partner.contactEmail}`}>
src/components/holdings/deal-holding-card.tsx:66:        const response = await fetch(`/api/fees?deal_id=${deal.dealId}`)
src/components/holdings/deal-holding-card.tsx:277:          <Link href={`/versotech_main/opportunities/${deal.dealId}`} className="flex-1">
src/components/entities/position-modal.tsx:87:        ? `/api/staff/vehicles/${vehicleId}/positions/${position.id}`
src/components/entities/position-modal.tsx:88:        : `/api/staff/vehicles/${vehicleId}/positions`
src/components/holdings/modern-holdings-filters.tsx:114:  { value: 'large', label: 'Large (>$1M)', icon: DollarSign },
src/components/holdings/modern-holdings-filters.tsx:115:  { value: 'medium', label: 'Medium ($100K-$1M)', icon: DollarSign },
src/components/holdings/modern-holdings-filters.tsx:116:  { value: 'small', label: 'Small (<$100K)', icon: DollarSign }
src/components/holdings/modern-holdings-filters.tsx:367:                  ${(valueRange[0] / 1000).toFixed(0)}K - ${(valueRange[1] / 1000).toFixed(0)}K
src/components/fees/EntitySelector.tsx:67:          endpoint = `/api/deals/${dId}/introducers`;
src/components/fees/EntitySelector.tsx:70:          endpoint = `/api/deals/${dId}/partners`;
src/components/fees/EntitySelector.tsx:73:          endpoint = `/api/deals/${dId}/commercial-partners`;
src/components/fees/EntitySelector.tsx:80:        console.warn(`Entity endpoint ${endpoint} not available, trying fallback`);
src/components/fees/EntitySelector.tsx:103:        console.log(`No ${type}s found for deal, loading all ${type}s from admin endpoint`);
src/components/fees/EntitySelector.tsx:141:        throw new Error(`Failed to load ${type}s`);
src/components/fees/EntitySelector.tsx:159:      setError(`Failed to load ${type}s`);
src/components/fees/EntitySelector.tsx:298:                <SelectValue placeholder={`Select ${getEntityTypeLabel(entityType)}`} />
src/app/(main)/versotech_main/users/[id]/user-detail-client.tsx:65:  if (hours < 24) return `${hours} hours ago`
src/app/(main)/versotech_main/users/[id]/user-detail-client.tsx:67:  if (days < 7) return `${days} days ago`
src/app/(main)/versotech_main/users/[id]/user-detail-client.tsx:68:  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
src/app/(main)/versotech_main/users/[id]/user-detail-client.tsx:69:  if (days < 365) return `${Math.floor(days / 30)} months ago`
src/app/(main)/versotech_main/users/[id]/user-detail-client.tsx:70:  return `${Math.floor(days / 365)} years ago`
src/app/(main)/versotech_main/users/[id]/user-detail-client.tsx:143:      const response = await fetch(`/api/admin/users/${user.id}/reset-password`, {
src/app/(main)/versotech_main/users/[id]/user-detail-client.tsx:165:      const response = await fetch(`/api/admin/users/${user.id}/deactivate`, {
src/app/(main)/versotech_main/users/[id]/user-detail-client.tsx:188:      const response = await fetch(`/api/admin/users/${user.id}/reactivate`, {
src/app/(main)/versotech_main/users/[id]/user-detail-client.tsx:258:              <Button variant="outline" size="sm" onClick={() => window.location.href = `mailto:${user.email}`}>
src/app/(main)/versotech_main/users/[id]/user-detail-client.tsx:331:                <Key className={`h-4 w-4 ${user.passwordSet ? 'text-green-400' : 'text-muted-foreground/30'}`} />
src/app/(main)/versotech_main/users/[id]/user-detail-client.tsx:337:                <PenTool className={`h-4 w-4 ${user.hasSignature ? 'text-green-400' : 'text-muted-foreground/30'}`} />
src/app/(main)/versotech_main/users/[id]/user-detail-client.tsx:380:                    key={`${entity.type}-${entity.id}`}
src/app/(main)/versotech_main/users/[id]/user-detail-client.tsx:387:                          <Badge variant="outline" className={`text-xs ${config?.className || ''}`}>
src/app/(main)/versotech_main/users/[id]/user-detail-client.tsx:406:                              className={`text-xs py-0 ${
src/app/(main)/versotech_main/users/[id]/user-detail-client.tsx:421:                      <Link href={`${entityRoute}/${entity.id}`}>
src/components/layout/notification-center.tsx:95:            taskQuery = taskQuery.or(`owner_user_id.eq.${userId},owner_investor_id.eq.${activePersona.entity_id}`)
src/components/layout/notification-center.tsx:105:                id: `task-${task.id}`,
src/components/layout/notification-center.tsx:161:                id: `msg-${conv.id}`,
src/components/layout/notification-center.tsx:186:              id: `notif-${notif.id}`,
src/components/layout/notification-center.tsx:210:                id: `lawyer-notif-${notif.id}`,
src/components/layout/notification-center.tsx:256:    if (diffMins < 60) return `${diffMins}m ago`
src/components/layout/notification-center.tsx:257:    if (diffHours < 24) return `${diffHours}h ago`
src/components/layout/notification-center.tsx:258:    if (diffDays < 7) return `${diffDays}d ago`
src/components/layout/notification-center.tsx:419:                        {item.deal_name && ` • ${item.deal_name}`}
src/components/investor/sell-position-form.tsx:68:      setError(`Amount cannot exceed your position value of ${formatCurrency(fundedAmount)}`)
src/components/holdings/holdings-page.tsx:167:      const response = await fetch(`/api/portfolio?${params.toString()}`, fetchOptions)
src/components/holdings/holdings-page.tsx:171:        throw new Error(`Failed to fetch portfolio data: ${errorText}`)
src/components/holdings/holdings-page.tsx:200:        throw new Error(`Failed to fetch holdings: ${errorText}`)
src/components/holdings/holdings-page.tsx:612:      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
src/components/holdings/holdings-page.tsx:620:    link.setAttribute('download', `portfolio-holdings-${new Date().toISOString().split('T')[0]}.csv`)
src/components/introducer-profile/introducer-profile-client.tsx:316:    return `${(bps / 100).toFixed(2)}%`
src/components/fees/FeePlanEditModal.tsx:275:    <div className={`border-2 rounded-2xl p-6 bg-card ${getBorderColor()} transition-all hover:bg-muted/60`}>
src/components/fees/FeePlanEditModal.tsx:279:          <div className={`w-12 h-12 rounded-xl ${getBadgeColor()} flex items-center justify-center font-bold text-lg`}>
src/components/fees/FeePlanEditModal.tsx:396:              className={`bg-muted/50 border-border text-foreground h-12 text-lg font-mono ${exceedsLimit ? 'border-red-500 bg-red-500/10' : ''}`}
src/components/fees/FeePlanEditModal.tsx:399:              <p className={`text-base font-semibold ${exceedsLimit ? 'text-red-500 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
src/components/fees/FeePlanEditModal.tsx:703:      setError(`Fee values exceed term sheet limits: ${validationErrors.join('; ')}`);
src/components/fees/FeePlanEditModal.tsx:778:      const url = feePlan ? `/api/staff/fees/plans/${feePlan.id}` : '/api/staff/fees/plans';
src/components/fees/FeePlanEditModal.tsx:786:        const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
src/components/fees/FeePlanEditModal.tsx:788:        const details = errorData.details ? `\n${errorData.details}` : '';
src/components/fees/FeePlanEditModal.tsx:789:        throw new Error(`${msg}${details}`);
src/components/fees/FeePlanEditModal.tsx:1000:            badge={`${components.length} component${components.length !== 1 ? 's' : ''}`}
src/components/entities/edit-entity-modal.tsx:292:      const response = await fetch(`/api/entities/${entity.id}`, {
src/components/entities/edit-entity-modal.tsx:563:                            {lawyer.name} {lawyer.firm_name && lawyer.name !== lawyer.firm_name ? `(${lawyer.firm_name})` : ''}
src/app/(admin)/versotech_admin/growth/cohorts/components/cohorts-data-table.tsx:55:    .map(([currency, amount]) => `${currency} ${formatCurrency(amount, currency)}`)
src/app/(admin)/versotech_admin/growth/cohorts/components/cohorts-data-table.tsx:77:  return `${value}%`
src/app/(admin)/versotech_admin/growth/cohorts/components/cohorts-data-table.tsx:91:        const response = await fetch(`/api/admin/growth/cohorts?groupBy=${groupBy}`)
src/app/(admin)/versotech_admin/growth/cohorts/components/cohorts-data-table.tsx:227:              <span>{value !== null ? `${value} days` : '-'}</span>
src/components/holdings/quick-actions-menu.tsx:82:        description: `Your ${reportType} for ${holdingName} has been queued for generation.`,
src/components/holdings/kpi-details-modal.tsx:154:      const response = await fetch(`/api/portfolio/kpi-details?type=${encodeURIComponent(kpiType)}`, {
src/components/holdings/kpi-details-modal.tsx:162:        throw new Error(`Failed to fetch KPI details: ${response.statusText}`)
src/components/holdings/kpi-details-modal.tsx:205:            `bg-${config.color}-100`
src/components/holdings/kpi-details-modal.tsx:207:            <Building2 className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", `text-${config.color}-600`)} />
src/components/holdings/kpi-details-modal.tsx:289:              `bg-${config?.color || 'blue'}-100`
src/components/holdings/kpi-details-modal.tsx:291:              <IconComponent className={cn("h-6 w-6", `text-${config?.color || 'blue'}-600`)} />
src/components/holdings/kpi-details-modal.tsx:371:                          Total: ${data.debug.totalValue?.toLocaleString()} • 
src/components/ui/form.tsx:61:    formItemId: `${id}-form-item`,
src/components/ui/form.tsx:62:    formDescriptionId: `${id}-form-item-description`,
src/components/ui/form.tsx:63:    formMessageId: `${id}-form-item-message`,
src/components/ui/form.tsx:116:          ? `${formDescriptionId}`
src/components/ui/form.tsx:117:          : `${formDescriptionId} ${formMessageId}`
src/components/investor/sale-status-tracker.tsx:169:      const response = await fetch(`/api/investor/sell-request/${requestId}`, {
src/components/investor/sale-status-tracker.tsx:238:                        style={{ width: `${((currentStep - 1) / (timelineSteps.length - 1)) * 100}%` }}
src/components/layout/sidebar.tsx:359:            : pathname === item.href || pathname.startsWith(`${item.href}/`)
src/components/layout/sidebar.tsx:364:          const tourId = `nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`
src/components/layout/sidebar.tsx:414:        <Link href={`/${brand}${brand === 'versotech' ? '/staff' : ''}/profile`} data-tour="nav-profile">
src/components/holdings/realtime-holdings-provider.tsx:124:        const investorFilter = `investor_id=in.(${investorIds.join(',')})`
src/components/holdings/realtime-holdings-provider.tsx:292:          console.log(`Attempting to reconnect... (attempt ${reconnectAttempts.current + 1})`)
src/components/holdings/realtime-holdings-provider.tsx:345:          className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${isConnected
src/components/holdings/realtime-holdings-provider.tsx:351:            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
src/components/layout/persona-sidebar.tsx:364:            : pathname === item.href || pathname.startsWith(`${item.href}/`)
src/components/layout/persona-sidebar.tsx:368:          const tourId = `nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`
src/components/layout/persona-sidebar.tsx:499:            : pathname === item.href || pathname.startsWith(`${item.href}/`)
src/components/layout/persona-sidebar.tsx:502:          const tourId = `nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`
src/components/fees/ScheduleTab.tsx:229:    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
src/components/fees/ScheduleTab.tsx:335:      const res = await fetch(`/api/staff/fees/schedules?days=${daysAhead}`);
src/components/fees/ScheduleTab.tsx:363:      const res = await fetch(`/api/staff/fees/events?${params.toString()}`);
src/components/fees/ScheduleTab.tsx:392:      const res = await fetch(`/api/staff/fees/commissions?${params.toString()}`);
src/components/fees/ScheduleTab.tsx:442:      const res = await fetch(`/api/staff/fees/commissions?${params.toString()}`);
src/components/fees/ScheduleTab.tsx:492:      const res = await fetch(`/api/staff/fees/commissions?${params.toString()}`);
src/components/fees/ScheduleTab.tsx:896:                        : `${selectedDealIds.length} deals selected`
src/components/fees/ScheduleTab.tsx:943:                        : `${selectedEntityIds.length} entities selected`
src/components/fees/ScheduleTab.tsx:970:                              value={`${entity.type}-${entity.name}`}
src/components/entities/create-entity-modal.tsx:502:                          {lawyer.name} {lawyer.firm_name && lawyer.name !== lawyer.firm_name ? `(${lawyer.firm_name})` : ''}
src/components/holdings/vehicle-holding-card.tsx:75:        const response = await fetch(`/api/fees?vehicle_id=${holding.id}`)
src/components/holdings/vehicle-holding-card.tsx:282:            <Link href={`/versotech_main/portfolio/${holding.id}`}>
src/components/profile/counterparty-entities-tab.tsx:90:      const response = await fetch(`/api/investors/me/counterparty-entities/${entityId}`, {
src/components/kyc/personal-info-form-section.tsx:31:    return (prefix ? `${prefix}${name}` : name) as Path<T>
src/components/layout/unified-app-layout.tsx:77:          className={`${isDark ? 'text-zinc-300 focus:text-white focus:bg-white/10' : ''} ${preference === 'light' ? 'font-medium' : ''}`}
src/components/layout/unified-app-layout.tsx:85:          className={`${isDark ? 'text-zinc-300 focus:text-white focus:bg-white/10' : ''} ${preference === 'dark' ? 'font-medium' : ''}`}
src/components/layout/unified-app-layout.tsx:93:          className={`${isDark ? 'text-zinc-300 focus:text-white focus:bg-white/10' : ''} ${preference === 'auto' ? 'font-medium' : ''}`}
src/components/layout/unified-app-layout.tsx:165:            className={`w-[calc(100%-1rem)] max-w-[280px] p-0 ${isDark ? 'bg-zinc-950 border-white/10' : 'bg-white border-gray-200'}`}
src/components/holdings/deal-card.tsx:62:    router.push(`/versotech_main/opportunities/${deal.dealId}`)
src/components/holdings/deal-card.tsx:66:    router.push(`/versotech_main/documents?deal=${deal.dealId}`)
src/components/fees/FeePlansTab.tsx:109:    ? `${currencyCode ? `${currencyCode} ` : ''}${Number(comp.flat_amount).toLocaleString()}`
src/components/fees/FeePlansTab.tsx:112:    return comp.flat_amount != null ? `${flatAmountDisplay} / share` : 'N/A';
src/components/fees/FeePlansTab.tsx:144:      message: `Exceeds term sheet limit (${termSheetLimit}%)`,
src/components/fees/FeePlansTab.tsx:291:    router.push(`/versotech_main/fees?${params.toString()}`);
src/components/fees/FeePlansTab.tsx:307:        ? `/api/staff/fees/plans?include_components=true&deal_id=${dealId}`
src/components/fees/FeePlansTab.tsx:353:      const res = await fetch(`/api/staff/fees/plans/${planToDuplicate.id}/duplicate`, {
src/components/fees/FeePlansTab.tsx:402:      const res = await fetch(`/api/staff/fees/plans/${planToDelete.id}`, {
src/components/fees/FeePlansTab.tsx:448:      const res = await fetch(`/api/staff/fees/plans/${plan.id}/generate-agreement`, {
src/components/fees/FeePlansTab.tsx:454:        toast.error(`Failed to generate agreement: ${data.error || 'Unknown error'}`);
src/components/fees/FeePlansTab.tsx:474:      const res = await fetch(`/api/staff/fees/plans/${plan.id}/generate-placement-agreement`, {
src/components/fees/FeePlansTab.tsx:480:        toast.error(`Failed to generate placement agreement: ${data.error || 'Unknown error'}`);
src/components/fees/FeePlansTab.tsx:524:      const response = await fetch(`/api/storage/download?path=${encodeURIComponent(pdfUrl)}&bucket=deal-documents`);
src/components/fees/FeePlansTab.tsx:533:      const actualFilename = pdfUrl.split('/').pop() || `${referenceNumber || 'agreement'}.pdf`;
src/components/fees/FeePlansTab.tsx:551:      const response = await fetch(`/api/storage/download?path=${encodeURIComponent(pdfUrl)}&bucket=deal-documents`);
src/components/fees/FeePlansTab.tsx:713:                            <GroupIcon className={`h-5 w-5 ${config.iconColor}`} />
src/components/fees/FeePlansTab.tsx:762:                                      <GroupIcon className={`h-4 w-4 ${config.iconColor}`} />
src/components/fees/FeePlansTab.tsx:797:                                                  className={`text-xs ${
src/components/fees/FeePlansTab.tsx:923:                                        <GroupIcon className={`h-4 w-4 ${config.iconColor}`} />
src/components/fees/FeePlansTab.tsx:994:                                            className={`text-sm flex justify-between items-center ${
src/components/holdings/position-detail-modal.tsx:118:        fetch(`/api/fees?${holdingType === 'vehicle' ? 'vehicle_id' : 'deal_id'}=${holdingId}`, {
src/components/holdings/position-detail-modal.tsx:121:          if (!r.ok) throw new Error(`Fees API returned ${r.status}`)
src/components/holdings/position-detail-modal.tsx:126:        fetch(`/api/cashflows?${holdingType === 'vehicle' ? 'vehicle_id' : 'deal_id'}=${holdingId}&limit=20`, {
src/components/holdings/position-detail-modal.tsx:129:          if (!r.ok) throw new Error(`Cashflows API returned ${r.status}`)
src/components/holdings/position-detail-modal.tsx:176:          description: fee.description || `${fee.type} fee`
src/components/holdings/position-detail-modal.tsx:190:          description: cf.description || `${cf.type === 'call' ? 'Capital Call' : 'Distribution'} - ${cf.vehicleName || ''}`
src/components/holdings/position-detail-modal.tsx:277:            <Tabs defaultValue="cashflows" className="h-full flex flex-col" id={`position-tabs-${holdingId}`}>
src/components/holdings/position-detail-modal.tsx:325:                                  <div className={`w-4 h-4 rounded-full ${
src/components/entities/link-entity-investor-modal.tsx:150:        ? `/api/staff/investors?search=${encodeURIComponent(searchQuery.trim())}`
src/components/entities/link-entity-investor-modal.tsx:232:      const response = await fetch(`/api/entities/${entityId}/investors`, {
src/components/entities/link-entity-investor-modal.tsx:351:                        className={`w-full px-4 py-3 text-left transition-all ${
src/components/entities/link-entity-investor-modal.tsx:362:                              {investor.email ? ` • ${investor.email}` : ''}
src/components/compliance/kyc-compliance-dashboard.tsx:132:      const entityParam = entityTypeFilter !== 'all' ? `&entity_type=${entityTypeFilter}` : ''
src/components/compliance/kyc-compliance-dashboard.tsx:135:        fetch(`/api/staff/compliance/expiring-documents?days=${daysWindow}&include_expired=true&include_stale=true${entityParam}`),
src/components/compliance/kyc-compliance-dashboard.tsx:365:              className={`h-4 rounded-full transition-all ${
src/components/compliance/kyc-compliance-dashboard.tsx:372:              style={{ width: `${overview.summary.completion_percentage}%` }}
src/components/compliance/kyc-compliance-dashboard.tsx:405:                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
src/components/compliance/kyc-compliance-dashboard.tsx:422:                      style={{ width: `${completionPct}%` }}
src/components/compliance/kyc-compliance-dashboard.tsx:561:    return `/versotech_main/users/${typeMap[doc.entity_type] || 'investors'}/${doc.entity_id}`
src/components/compliance/kyc-compliance-dashboard.tsx:580:      return `${months} months old`
src/components/compliance/kyc-compliance-dashboard.tsx:614:        <div className={`p-2 rounded-lg ${getIconBg()}`}>
src/components/compliance/kyc-compliance-dashboard.tsx:615:          <FileText className={`h-4 w-4 ${getIconColor()}`} />
src/app/(admin)/versotech_admin/growth/retention/page.tsx:35:    router.push(`${pathname}?${params.toString()}`)
src/components/layout/header-notifications.tsx:48:  if (diffMins < 60) return `${diffMins}m ago`
src/components/layout/header-notifications.tsx:49:  if (diffHours < 24) return `${diffHours}h ago`
src/components/layout/header-notifications.tsx:50:  if (diffDays < 7) return `${diffDays}d ago`
src/components/audit/compliance-alerts.tsx:23:    const response = await fetch(`/api/audit/compliance-alerts/${alertId}/review`, {
src/components/audit/compliance-alerts.tsx:60:              className={`flex items-center justify-between p-3 border rounded-lg ${
src/components/audit/compliance-alerts.tsx:68:                  className={`h-4 w-4 ${
src/components/layout/brand-header.tsx:13:    <div className={`flex items-center ${className}`}>
src/components/layout/brand-header.tsx:14:      <h1 className={`text-xl font-bold ${isStaff ? 'text-foreground' : 'text-black'}`}>
src/components/kibo-ui/gantt.tsx:64:      weekLabel: `${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
src/components/kibo-ui/gantt.tsx:131:      className={`w-64 flex-shrink-0 overflow-y-auto border-r ${isLight ? 'border-gray-200 bg-white' : 'border-border bg-card'}`}
src/components/kibo-ui/gantt.tsx:150:      <p className={`mb-3 text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-700' : 'text-foreground'}`}>
src/components/kibo-ui/gantt.tsx:174:      className={`group w-full rounded-lg border px-3 py-2 text-left text-sm transition-all hover:shadow-sm ${
src/components/kibo-ui/gantt.tsx:202:      className={`relative flex-1 overflow-auto ${isLight ? 'bg-white' : 'bg-background'}`}
src/components/kibo-ui/gantt.tsx:223:      const monthKey = `${segment.month}-${segment.year}`
src/components/kibo-ui/gantt.tsx:224:      const lastKey = lastGroup ? `${lastGroup.month}-${lastGroup.year}` : ''
src/components/kibo-ui/gantt.tsx:241:      className={`sticky top-0 z-20 border-b ${isLight ? 'border-gray-200 bg-white' : 'border-border bg-card'}`}
src/components/kibo-ui/gantt.tsx:247:            key={`${group.month}-${group.year}-${idx}`}
src/components/kibo-ui/gantt.tsx:248:            className={`flex-shrink-0 flex items-center justify-center border-r py-2.5 text-sm font-semibold ${
src/components/kibo-ui/gantt.tsx:253:            style={{ width: `${group.totalWidth}%`, minWidth: '80px' }}
src/components/kibo-ui/gantt.tsx:264:            key={`${segment.start.toISOString()}-${idx}`}
src/components/kibo-ui/gantt.tsx:265:            className={`flex-shrink-0 flex items-center justify-center border-r py-2 text-xs font-medium ${
src/components/kibo-ui/gantt.tsx:268:            style={{ width: `${segment.width}%`, minWidth: '60px' }}
src/components/kibo-ui/gantt.tsx:314:      className={`group relative flex h-14 items-center border-b ${isLight ? 'border-gray-100' : 'border-border/50'}`}
src/components/kibo-ui/gantt.tsx:319:          left: `${offset}%`,
src/components/kibo-ui/gantt.tsx:320:          width: `${width}%`,
src/components/kibo-ui/gantt.tsx:352:      style={{ left: `${offset}%` }}
src/components/kibo-ui/gantt.tsx:356:        className={`pointer-events-auto absolute top-4 -translate-x-1/2 rounded-md border px-2 py-1 text-xs font-medium shadow-sm ${
src/components/kibo-ui/gantt.tsx:404:      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`,
src/components/kibo-ui/gantt.tsx:405:      border: `2px solid rgba(${r}, ${g}, ${b}, 0.6)`,
src/components/kibo-ui/gantt.tsx:406:      color: `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`
src/components/kibo-ui/gantt.tsx:411:      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.3)`,
src/components/kibo-ui/gantt.tsx:412:      border: `2px solid rgba(${r}, ${g}, ${b}, 0.7)`,
src/components/kibo-ui/gantt.tsx:413:      color: `rgb(${Math.min(255, r + 100)}, ${Math.min(255, g + 100)}, ${Math.min(255, b + 100)})`
src/components/kyc/questionnaire-viewer.tsx:210:    .replace(/([A-Z])/g, ' $1')
src/components/kyc/questionnaire-viewer.tsx:303:                      {stepInfo?.title || `Step ${stepKey.replace('step', '')}`}
src/components/kyc/questionnaire-viewer.tsx:322:                            className={`flex flex-col gap-1 p-3 rounded-lg ${
src/components/kyc/questionnaire-viewer.tsx:343:                                    <CheckCircle className={`h-4 w-4 ${isHighRisk ? 'text-destructive' : 'text-emerald-500'}`} />
src/components/kyc/questionnaire-viewer.tsx:347:                                  <span className={`text-sm ${isHighRisk ? 'font-semibold text-destructive' : 'text-foreground'}`}>
src/components/fees/TermSheetSelector.tsx:60:      const res = await fetch(`/api/deals/${dId}/fee-structures?status=published`);
src/components/fees/TermSheetSelector.tsx:92:    return `${value}%`;
src/components/entities/edit-document-modal.tsx:60:      const response = await fetch(`/api/staff/documents/${document.id}`, {
src/components/holdings/portfolio-allocation-chart.tsx:160:                    key={`${item.name}-${index}`}
src/components/holdings/portfolio-allocation-chart.tsx:167:                    strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
src/components/holdings/portfolio-allocation-chart.tsx:203:                key={`legend-${item.name}-${index}`}
src/components/holdings/portfolio-allocation-chart.tsx:204:                className={`flex items-center justify-between py-1.5 px-2 rounded-md transition-colors cursor-pointer ${
src/components/holdings/portfolio-allocation-chart.tsx:224:                      backgroundColor: `${item.color}15`,
src/components/layout/user-menu.tsx:95:      <Button variant="ghost" className={`flex items-center gap-2 h-auto px-3 py-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
src/components/layout/user-menu.tsx:97:          <AvatarFallback className={`${isDark ? 'bg-white/20 text-white' : 'bg-black/10 text-black'} text-xs`}>
src/components/layout/user-menu.tsx:102:          <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-black'}`}>{profile.displayName}</div>
src/components/layout/user-menu.tsx:103:          <div className={`text-xs ${isDark ? 'text-white/70' : 'text-black/70'}`}>{getRoleDisplay(profile.role)}</div>
src/components/layout/user-menu.tsx:112:        <Button variant="ghost" className={`flex items-center gap-2 h-auto px-3 py-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
src/components/layout/user-menu.tsx:115:            <AvatarFallback className={`${isDark ? 'bg-white/20 text-white' : 'bg-black/10 text-black'} text-xs`}>
src/components/layout/user-menu.tsx:120:            <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-black'}`}>{profile.displayName}</div>
src/components/layout/user-menu.tsx:121:            <div className={`text-xs ${isDark ? 'text-white/70' : 'text-black/70'}`}>{getRoleDisplay(profile.role)}</div>
src/components/kibo-ui/calendar.tsx:146:      className={`rounded-md border px-3 py-2 text-sm font-medium shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary ${isLight ? 'border-gray-300 bg-white text-gray-900' : 'border-border bg-card text-foreground'}`}
src/components/kibo-ui/calendar.tsx:174:      className={`rounded-md border px-3 py-2 text-sm font-medium shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary ${isLight ? 'border-gray-300 bg-white text-gray-900' : 'border-border bg-card text-foreground'}`}
src/components/kibo-ui/calendar.tsx:194:        className={`rounded-md border px-3 py-2 text-sm font-medium transition hover:border-primary hover:bg-primary/10 hover:text-primary ${isLight ? 'border-gray-300 text-gray-700' : 'border-border text-foreground'}`}
src/components/kibo-ui/calendar.tsx:201:        className={`rounded-md border px-3 py-2 text-sm font-medium transition hover:border-primary hover:bg-primary/10 hover:text-primary ${isLight ? 'border-gray-300 text-gray-700' : 'border-border text-foreground'}`}
src/components/kibo-ui/calendar.tsx:208:        className={`rounded-md border px-3 py-2 text-sm font-medium transition hover:border-primary hover:bg-primary/10 hover:text-primary ${isLight ? 'border-gray-300 text-gray-700' : 'border-border text-foreground'}`}
src/components/kibo-ui/calendar.tsx:223:      <div className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-foreground'}`}>
src/components/kibo-ui/calendar.tsx:226:      <div className={`grid grid-cols-7 gap-2 text-[11px] font-semibold uppercase tracking-wide ${isLight ? 'text-gray-600' : 'text-muted-foreground'}`}>
src/components/kibo-ui/calendar.tsx:269:      className={`grid grid-cols-7 gap-2 rounded-2xl border p-2 md:gap-3 md:p-4 ${
src/components/kibo-ui/calendar.tsx:318:              <span className={`text-sm font-semibold leading-none ${isToday ? 'text-primary' : ''}`}>
src/components/kibo-ui/calendar.tsx:376:      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.25)`,
src/components/kibo-ui/calendar.tsx:377:      border: `1.5px solid rgba(${r}, ${g}, ${b}, 0.6)`,
src/components/kibo-ui/calendar.tsx:378:      color: `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`
src/components/kibo-ui/calendar.tsx:383:      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.35)`,
src/components/kibo-ui/calendar.tsx:384:      border: `1.5px solid rgba(${r}, ${g}, ${b}, 0.7)`,
src/components/kibo-ui/calendar.tsx:385:      color: `rgb(${Math.min(255, r + 80)}, ${Math.min(255, g + 80)}, ${Math.min(255, b + 80)})`
src/components/mandates/mandate-detail-client.tsx:180:      console.log(`[Document ${mode}] Fetching: ${fileKey}`)
src/components/mandates/mandate-detail-client.tsx:182:        `/api/storage/download?bucket=deal-documents&path=${encodeURIComponent(fileKey)}`
src/components/mandates/mandate-detail-client.tsx:188:        let errorMsg = `Failed to ${mode} document (${response.status})`
src/components/mandates/mandate-detail-client.tsx:349:                              ${isActive
src/components/mandates/mandate-detail-client.tsx:362:                            ${isActive ? 'text-foreground/70' : 'text-muted-foreground/50'}
src/components/mandates/mandate-detail-client.tsx:370:                              ${stage.count > 0 ? 'text-emerald-400/60' : 'text-muted-foreground/30'}
src/components/mandates/mandate-detail-client.tsx:441:                    {deal.sector || '—'} {deal.stage && `• ${deal.stage}`}
src/components/mandates/mandate-detail-client.tsx:532:                    <Card key={sheet.id} className={`border ${sheet.status === 'published' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/[0.02]'}`}>
src/components/mandates/mandate-detail-client.tsx:558:                              onClick={() => handleDocumentAction(sheet.term_sheet_attachment_key, `term-sheet-v${sheet.version || 1}.pdf`, 'preview')}
src/components/mandates/mandate-detail-client.tsx:608:                                {sheet.subscription_fee_percent === 0 ? 'Waived' : `${sheet.subscription_fee_percent}%`}
src/components/mandates/mandate-detail-client.tsx:616:                                {sheet.management_fee_percent === 0 ? 'Waived' : `${sheet.management_fee_percent}%`}
src/components/mandates/mandate-detail-client.tsx:624:                                {sheet.carried_interest_percent === 0 ? 'Waived' : `${sheet.carried_interest_percent}%`}
src/components/mandates/mandate-detail-client.tsx:710:                                {comp.rate_bps ? `${(comp.rate_bps / 100).toFixed(2)}%` :
src/components/mandates/mandate-detail-client.tsx:711:                                 comp.flat_amount ? `$${Number(comp.flat_amount).toLocaleString()}` : '—'}
src/components/mandates/mandate-detail-client.tsx:798:                      <TableRow key={`${member.deal_id}-${member.investor_id}`} className="border-white/10">
src/components/fees/GenerateInvoiceModal.tsx:94:      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
src/components/fees/GenerateInvoiceModal.tsx:100:        alert(`Invalid investor ID format: ${preselectedInvestorId}`);
src/components/fees/GenerateInvoiceModal.tsx:132:      const subsRes = await fetch(`/api/subscriptions?investor_id=${investorId}`);
src/components/fees/GenerateInvoiceModal.tsx:139:      const feeEventsRes = await fetch(`/api/staff/fees/events?status=accrued&investor_id=${investorId}&limit=500`);
src/components/fees/GenerateInvoiceModal.tsx:206:      const res = await fetch(`/api/staff/fees/events?${params}`);
src/components/fees/GenerateInvoiceModal.tsx:216:        let errorMessage = `Failed to load fee events: ${json.error || res.statusText}`;
src/components/fees/GenerateInvoiceModal.tsx:220:            errorMessage += `\n- Field: ${issue.path?.join('.')}, Error: ${issue.message}`;
src/components/fees/GenerateInvoiceModal.tsx:233:      alert(`Error loading fee events: ${error instanceof Error ? error.message : 'Unknown error'}`);
src/components/fees/GenerateInvoiceModal.tsx:540:                            {event.deal && ` • ${event.deal.name}`}
src/components/fees/GenerateInvoiceModal.tsx:626:                  {customLineItemsTotal !== 0 && !selectedCurrencyCode ? ` + ${customLineItemsTotal.toLocaleString()} custom` : ''}
src/components/fees/GenerateInvoiceModal.tsx:631:                {customLineItems.length > 0 && ` + ${customLineItems.length} custom item(s)`}
src/components/signature/inline-pdf-viewer.tsx:33:            src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
src/components/entities/entities-page-enhanced.tsx:119:    router.push(`/versotech_main/entities/${id}`)
src/components/entities/entities-page-enhanced.tsx:128:      const response = await fetch(`/api/entities/${entityId}`, {
src/components/entities/entities-page-enhanced.tsx:142:      setBannerMessage(`Entity status updated to ${newStatus}`)
src/components/entities/entities-page-enhanced.tsx:183:          className={`rounded-lg border p-4 text-sm ${
src/components/entities/entities-page-enhanced.tsx:418:          setBannerMessage(`Entity "${entity.name}" created successfully.`)
src/components/fees/OverviewTab.tsx:448:                  <div className={`p-4 rounded border ${
src/components/fees/OverviewTab.tsx:453:                    <p className={`text-xs mb-1 ${
src/components/fees/OverviewTab.tsx:460:                    <p className={`text-2xl font-bold ${
src/components/fees/OverviewTab.tsx:542:                            <span className={`font-semibold ${statusGroup.unrealized_gains >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
src/components/fees/OverviewTab.tsx:610:                        <div className={`p-3 rounded mb-4 ${
src/components/fees/OverviewTab.tsx:616:                            <span className={`text-sm ${
src/components/fees/OverviewTab.tsx:621:                            <span className={`text-lg font-bold ${
src/components/fees/OverviewTab.tsx:657:                                      <span className={`font-semibold ${status.unrealized_gains >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
src/components/dashboard/realtime-staff-dashboard.tsx:280:                key={`${update.table}-${update.timestamp}-${idx}`}
src/components/kyc/schemas/kyc-questionnaire-schema.ts:154:  { value: 'under_100k', label: 'Under $100,000' },
src/components/kyc/schemas/kyc-questionnaire-schema.ts:155:  { value: '100k_250k', label: '$100,000 - $250,000' },
src/components/kyc/schemas/kyc-questionnaire-schema.ts:156:  { value: '250k_500k', label: '$250,000 - $500,000' },
src/components/kyc/schemas/kyc-questionnaire-schema.ts:157:  { value: '500k_1m', label: '$500,000 - $1,000,000' },
src/components/kyc/schemas/kyc-questionnaire-schema.ts:158:  { value: '1m_plus', label: 'Over $1,000,000' },
src/components/kyc/schemas/kyc-questionnaire-schema.ts:162:  { value: 'under_500k', label: 'Under $500,000' },
src/components/kyc/schemas/kyc-questionnaire-schema.ts:163:  { value: '500k_1m', label: '$500,000 - $1,000,000' },
src/components/kyc/schemas/kyc-questionnaire-schema.ts:164:  { value: '1m_5m', label: '$1,000,000 - $5,000,000' },
src/components/kyc/schemas/kyc-questionnaire-schema.ts:165:  { value: '5m_10m', label: '$5,000,000 - $10,000,000' },
src/components/kyc/schemas/kyc-questionnaire-schema.ts:166:  { value: '10m_plus', label: 'Over $10,000,000' },
src/components/dashboard/realtime-dashboard.tsx:110:      .channel(`activity_updates_${userId}`)
src/components/dashboard/realtime-dashboard.tsx:143:        filter: `investor_id=in.(${investorIds.join(',')})`
src/components/dashboard/realtime-dashboard.tsx:191:            value: `${data.kpis.unrealizedGainPct > 0 ? '+' : ''}${data.kpis.unrealizedGainPct.toFixed(1)}%`,
src/components/dashboard/realtime-dashboard.tsx:211:            { name: 'Unrealized Gain', value: formatDashboardAmount(data.kpis.unrealizedGain), change: `${data.kpis.unrealizedGainPct > 0 ? '+' : ''}${data.kpis.unrealizedGainPct.toFixed(1)}%` },
src/components/dashboard/realtime-dashboard.tsx:219:          value: `${data.kpis.dpi.toFixed(2)}x`,
src/components/dashboard/realtime-dashboard.tsx:228:            { label: 'Return of Capital', value: `${(data.kpis.dpi * 0.7).toFixed(2)}x`, percentage: 70 },
src/components/dashboard/realtime-dashboard.tsx:229:            { label: 'Profit Distributions', value: `${(data.kpis.dpi * 0.3).toFixed(2)}x`, percentage: 30 },
src/components/dashboard/realtime-dashboard.tsx:230:            { label: 'Expected Next 12M', value: `+${(0.15).toFixed(2)}x`, percentage: 0, change: 'Projected' }
src/components/dashboard/realtime-dashboard.tsx:247:          value: `${data.kpis.tvpi.toFixed(2)}x`,
src/components/dashboard/realtime-dashboard.tsx:256:            { label: 'Realized Value (DPI)', value: `${data.kpis.dpi.toFixed(2)}x`, percentage: (data.kpis.dpi / data.kpis.tvpi) * 100 },
src/components/dashboard/realtime-dashboard.tsx:257:            { label: 'Unrealized Value (RVPI)', value: `${(data.kpis.tvpi - data.kpis.dpi).toFixed(2)}x`, percentage: ((data.kpis.tvpi - data.kpis.dpi) / data.kpis.tvpi) * 100 },
src/components/dashboard/realtime-dashboard.tsx:258:            { label: 'Portfolio NAV', value: data.kpis.currentNAV, change: `+${data.kpis.unrealizedGainPct.toFixed(1)}%` }
src/components/dashboard/realtime-dashboard.tsx:275:          value: `${(data.kpis.irr * 100).toFixed(1)}%`,
src/components/dashboard/realtime-dashboard.tsx:284:            { label: 'Gross IRR', value: `${((data.kpis.irr + 0.02) * 100).toFixed(1)}%`, change: 'Before fees' },
src/components/dashboard/realtime-dashboard.tsx:285:            { label: 'Net IRR', value: `${(data.kpis.irr * 100).toFixed(1)}%`, change: 'After fees' },
src/components/dashboard/realtime-dashboard.tsx:300:            { name: 'Money Multiple', value: `${data.kpis.tvpi.toFixed(1)}x`, change: 'TVPI' },
src/components/dashboard/realtime-dashboard.tsx:471:          trendValue={`${data.kpis.unrealizedGainPct > 0 ? '+' : ''}${data.kpis.unrealizedGainPct.toFixed(1)}%`}
src/components/dashboard/realtime-dashboard.tsx:477:              { label: 'VERSO FUND', value: `${((data.kpis.currentNAV * 0.6) / 1000).toFixed(0)}K` },
src/components/dashboard/realtime-dashboard.tsx:478:              { label: 'REAL Empire', value: `${((data.kpis.currentNAV * 0.3) / 1000).toFixed(0)}K` }
src/components/dashboard/realtime-dashboard.tsx:507:          value={`${data.kpis.dpi.toFixed(2)}x`}
src/components/dashboard/realtime-dashboard.tsx:517:              { label: 'Return of Capital', value: `${(data.kpis.dpi * 0.7).toFixed(2)}x` },
src/components/dashboard/realtime-dashboard.tsx:518:              { label: 'Profit Distributions', value: `${(data.kpis.dpi * 0.3).toFixed(2)}x` }
src/components/dashboard/realtime-dashboard.tsx:526:          value={`${data.kpis.tvpi.toFixed(2)}x`}
src/components/dashboard/realtime-dashboard.tsx:536:              { label: 'Realized (DPI)', value: `${data.kpis.dpi.toFixed(2)}x` },
src/components/dashboard/realtime-dashboard.tsx:537:              { label: 'Unrealized (RVPI)', value: `${(data.kpis.tvpi - data.kpis.dpi).toFixed(2)}x` }
src/components/dashboard/realtime-dashboard.tsx:545:          value={`${(data.kpis.irr * 100).toFixed(1)}%`}
src/components/dashboard/realtime-dashboard.tsx:555:              { label: 'Gross IRR', value: `${((data.kpis.irr + 0.02) * 100).toFixed(1)}%` },
src/components/dashboard/realtime-dashboard.tsx:556:              { label: 'Net IRR', value: `${(data.kpis.irr * 100).toFixed(1)}%` }
src/components/dashboard/realtime-dashboard.tsx:588:              <Link key={vehicle.id} href={`/versotech_main/portfolio/${vehicle.id}`}>
src/components/shared/individual-kyc-display.tsx:138:    <div className={`flex items-start gap-3 ${className}`}>
src/components/audit/audit-log-filters.tsx:29:    router.push(`?${params.toString()}`)
src/components/audit/audit-log-filters.tsx:39:    router.push(`?${params.toString()}`)
src/components/audit/audit-log-filters.tsx:49:    router.push(`?${params.toString()}`)
src/components/audit/audit-log-filters.tsx:54:    const response = await fetch(`/api/audit/export?${searchParams.toString()}`)
src/components/audit/audit-log-filters.tsx:59:    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
src/app/(admin)/versotech_admin/growth/retention/components/at-risk-users-table.tsx:49:    .map(([currency, amount]) => `${currency} ${formatCurrency(amount, currency)}`)
src/app/(admin)/versotech_admin/growth/retention/components/at-risk-users-table.tsx:73:        const response = await fetch(`/api/admin/growth/retention?days=${days}`)
src/app/(admin)/versotech_admin/growth/retention/components/at-risk-users-table.tsx:216:                          href={`/versotech_admin/users/${user.id}`}
src/app/(admin)/versotech_admin/growth/retention/components/at-risk-users-table.tsx:249:                        href={`mailto:${user.email}?subject=We miss you at VERSO!&body=Hi ${user.name.split(' ')[0]},%0D%0A%0D%0AWe noticed you haven't logged in recently and wanted to check in. Is there anything we can help you with?%0D%0A%0D%0ABest regards,%0D%0AThe VERSO Team`}
src/components/partner/FeeModelView.tsx:66:    `${currencyCode ? `${currencyCode} ` : ''}${value.toLocaleString()}`
src/components/partner/FeeModelView.tsx:72:      ? `${formatFlatAmount(flatAmount)} / share`
src/components/partner/FeeModelView.tsx:78:      return `${rateBps / 100}%`
src/components/partner/FeeModelView.tsx:135:      const response = await fetch(`/api/fee-plans/${planId}/${action}`, {
src/components/partner/FeeModelView.tsx:143:        throw new Error(data.error || `Failed to ${action} fee model`)
src/components/partner/FeeModelView.tsx:149:      console.error(`Error during ${action}:`, err)
src/components/partner/FeeModelView.tsx:150:      toast.error(err instanceof Error ? err.message : `Failed to ${action} fee model`)
src/components/partner/FeeModelView.tsx:197:                        {plan.deal?.name ? `Deal: ${plan.deal.name}` : plan.description || 'General fee model'}
src/components/entities/add-stakeholder-modal.tsx:62:      const response = await fetch(`/api/entities/${entityId}/stakeholders`, {
src/components/kyc/identification-form-section.tsx:53:    return (prefix ? `${prefix}${name}` : name) as Path<T>
src/components/fees/InvoicesTab.tsx:72:        : `/api/staff/fees/invoices?status=${filter}&limit=100&offset=0`;
src/components/fees/InvoicesTab.tsx:108:      const res = await fetch(`/api/staff/fees/invoices/${invoiceId}/send`, {
src/components/fees/InvoicesTab.tsx:121:        alert(data.error + (data.details ? `\n\n${data.details}` : ''));
src/components/fees/InvoicesTab.tsx:131:      const res = await fetch(`/api/staff/fees/invoices/${invoiceId}/mark-paid`, {
src/components/fees/InvoicesTab.tsx:158:        alert(`Backfill complete!\n\nProcessed: ${result.results.processed}\nSkipped: ${result.results.skipped}\nFailed: ${result.results.failed}\nTotal Fee Events Created: ${result.results.created_events}`);
src/components/fees/InvoicesTab.tsx:161:        alert(`Backfill failed: ${result.error}`);
src/components/fees/InvoicesTab.tsx:203:      ? `${event.subscription.subscription_number} - ${event.subscription.vehicle?.name || 'Unknown Vehicle'}`
src/components/fees/InvoicesTab.tsx:437:                              {invoice.deal && ` • ${invoice.deal.name}`}
src/components/dashboard/news-feed.tsx:47:    title: 'European VC Funding Reaches $12B in Q4',
src/components/dashboard/enhanced-staff-dashboard.tsx:174:                            tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
src/components/dashboard/enhanced-staff-dashboard.tsx:188:                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Fee Revenue']}
src/components/dashboard/enhanced-staff-dashboard.tsx:248:                            tickFormatter={(value) => `$${(value/1000000).toFixed(1)}M`}
src/components/dashboard/enhanced-staff-dashboard.tsx:263:                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Capital']}
src/components/dashboard/enhanced-staff-dashboard.tsx:390:        router.push(`/versotech_main/processes?workflow=${workflowKey}`)
src/components/dashboard/enhanced-staff-dashboard.tsx:392:            description: `Workflow sequence ${workflowKey} started.`
src/components/dashboard/enhanced-staff-dashboard.tsx:439:            change: initialData.kpis.highPriorityKyc && initialData.kpis.highPriorityKyc > 0 ? `${initialData.kpis.highPriorityKyc} High Priority` : 'Standard',
src/components/dashboard/enhanced-staff-dashboard.tsx:455:            value: initialData.kpis.complianceRate !== null ? `${initialData.kpis.complianceRate.toFixed(0)}%` : 'N/A',
src/components/audit/audit-log-table.tsx:134:                      className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
src/components/audit/audit-log-table.tsx:170:                            <Badge className={`${getRoleColor(log.actor_role)} text-xs`}>
src/components/deals/deal-term-sheet-tab.tsx:48:  const seriesMatch = rawName.match(/\bseries\s+(.+)$/i)
src/components/deals/deal-term-sheet-tab.tsx:55:    ? `${rawName} ("${entityCode}")`
src/components/deals/deal-term-sheet-tab.tsx:62:    ? (hasSarL ? baseName : `${baseName} S.à r.l.`)
src/components/deals/deal-term-sheet-tab.tsx:168:    ? `By ${format(new Date(termSheet.completion_date), 'MMMM d, yyyy')}`
src/components/deals/deal-term-sheet-tab.tsx:232:  if (code.length === 3) return `${code} ${numeric.toLocaleString()}`
src/components/deals/deal-term-sheet-tab.tsx:302:        const response = await fetch(`/api/deals/${dealId}`)
src/components/deals/deal-term-sheet-tab.tsx:342:      const response = await fetch(`/api/deals/${dealId}/fee-plans`)
src/components/deals/deal-term-sheet-tab.tsx:435:      const response = await fetch(`/api/deals/${dealId}/fee-structures/${termSheetId}/attachment`)
src/components/deals/deal-term-sheet-tab.tsx:469:        `/api/deals/${dealId}/fee-structures/${structureId}/generate`,
src/components/deals/deal-term-sheet-tab.tsx:491:        `/api/deals/${dealId}/fee-structures/${structureId}/request-close`,
src/components/deals/deal-term-sheet-tab.tsx:534:        `/api/deals/${dealId}/fee-structures/${structureId}/attachment`,
src/components/deals/deal-term-sheet-tab.tsx:599:    const response = await fetch(`/api/deals/${dealId}/fee-structures`)
src/components/deals/deal-term-sheet-tab.tsx:615:        response = await fetch(`/api/deals/${dealId}/fee-structures`, {
src/components/deals/deal-term-sheet-tab.tsx:622:        response = await fetch(`/api/deals/${dealId}/fee-structures`, {
src/components/deals/deal-term-sheet-tab.tsx:650:      const response = await fetch(`/api/deals/${dealId}/fee-structures`, {
src/components/deals/deal-term-sheet-tab.tsx:898:                      : `${published.subscription_fee_percent}%`}
src/components/deals/deal-term-sheet-tab.tsx:908:                      : `${published.management_fee_percent}% p.a.`}
src/components/deals/deal-term-sheet-tab.tsx:918:                      : `${published.carried_interest_percent}% (no hurdle rate)`}
src/components/deals/deal-term-sheet-tab.tsx:1025:                        <Badge className={`text-xs ${feePlanStatusClasses[fp.status] || feePlanStatusClasses.draft}`}>
src/components/deals/deal-term-sheet-tab.tsx:1056:                  {termSheet.term_sheet_date && ` • Term Sheet Date: ${format(new Date(termSheet.term_sheet_date), 'dd MMM yyyy')}`}
src/components/deals/deal-term-sheet-tab.tsx:1162:                        : `${termSheet.subscription_fee_percent}%`}
src/components/deals/deal-term-sheet-tab.tsx:1172:                        : `${termSheet.management_fee_percent}% p.a.`}
src/components/deals/deal-term-sheet-tab.tsx:1182:                        : `${termSheet.carried_interest_percent}% (no hurdle rate)`}
src/components/deals/deal-term-sheet-tab.tsx:1384:                              <Badge className={`text-[10px] h-5 shrink-0 ${feePlanStatusClasses[fp.status] || feePlanStatusClasses.draft}`}>
src/components/deals/deal-term-sheet-tab.tsx:1596:                        return `${spread.toFixed(2)}`
src/components/deals/deal-term-sheet-tab.tsx:1613:                        return `${margin.toFixed(1)}%`
src/components/shared/entity-address-edit-dialog.tsx:115:            {description || (entityName ? `Update address and contact for ${entityName}` : `Update ${entityType} address and contact information`)}
src/app/(admin)/versotech_admin/growth/retention/components/retention-kpi-cards.tsx:114:        const response = await fetch(`/api/admin/growth/retention?days=${days}`)
src/components/dashboard/enhanced-kpi-cards.tsx:33:    return `${currency} ${(value / 1000000).toFixed(1)}M`
src/components/dashboard/enhanced-kpi-cards.tsx:36:    return `${currency} ${(value / 1000).toFixed(0)}K`
src/components/dashboard/enhanced-kpi-cards.tsx:38:  return `${currency} ${value.toLocaleString()}`
src/components/dashboard/deal-context-selector.tsx:280:    <div className={`space-y-3 ${className}`}>
src/components/dashboard/deal-context-selector.tsx:314:                  <Badge variant="outline" className={`text-xs ${getStatusColor(selectedDeal.status)}`}>
src/components/dashboard/deal-context-selector.tsx:354:                  <Badge variant="outline" className={`text-xs ${getStatusColor(deal.status)}`}>
src/components/entities/delete-entity-dialog.tsx:52:        const response = await fetch(`/api/entities/${entityId}`, {
src/components/entities/delete-entity-dialog.tsx:100:      const response = await fetch(`/api/entities/${entityId}`, {
src/components/entities/delete-entity-dialog.tsx:114:      toast.success(`Entity "${entityName}" deleted successfully`)
src/components/fees/CommissionsTab.tsx:136:        ? `/api/staff/fees/commissions?${params.toString()}`
src/components/fees/CommissionsTab.tsx:155:      const res = await fetch(`/api/staff/fees/commissions/${commissionId}/mark-invoiced`, {
src/components/fees/CommissionsTab.tsx:164:        alert(`Failed to mark as invoiced: ${error.error}`);
src/components/fees/CommissionsTab.tsx:179:      const res = await fetch(`/api/staff/fees/commissions/${commissionId}/mark-paid`, {
src/components/fees/CommissionsTab.tsx:188:        alert(`Failed to mark as paid: ${error.error}`);
src/components/fees/CommissionsTab.tsx:351:                <Icon className={`h-3 w-3 ${entityTypeFilter === type ? '' : config.color}`} />
src/components/fees/CommissionsTab.tsx:378:              <Card key={`${group.entity_type}:${group.entity.id}`}>
src/components/fees/CommissionsTab.tsx:383:                        <EntityIcon className={`h-5 w-5 ${config.color}`} />
src/components/fees/CommissionsTab.tsx:385:                        <Badge variant="outline" className={`text-xs ${config.color}`}>
src/components/fees/CommissionsTab.tsx:388:                        <Link href={`${config.linkPath}/${group.entity.id}`}>
src/components/fees/CommissionsTab.tsx:397:                            ? `${group.entity.contact_name} • ${group.entity.email}`
src/components/fees/CommissionsTab.tsx:421:                          className={`p-4 rounded border ${
src/components/documents/document-viewer.tsx:34:      const response = await fetch(`/api/documents/${documentId}/download`)
src/components/alerts/subscription-health-alerts.tsx:66:      const response = await fetch(`/api/staff/health-alerts?dismissed=${showDismissed}`)
src/components/alerts/subscription-health-alerts.tsx:87:      const response = await fetch(`/api/staff/health-alerts/${alertId}/dismiss`, {
src/components/command-palette/command-palette.tsx:223:      shortcut: `${modKey}⇧S`,
src/components/command-palette/command-palette.tsx:338:                    value={`${command.label} ${command.description} ${command.keywords?.join(' ')}`}
src/components/command-palette/command-palette.tsx:371:                value={`${command.label} ${command.description} ${command.keywords?.join(' ')}`}
src/app/(admin)/versotech_admin/growth/retention/components/cohort-matrix.tsx:55:        const response = await fetch(`/api/admin/growth/retention?days=${days}`)
src/app/(admin)/versotech_admin/growth/retention/components/cohort-matrix.tsx:189:                              ? `${row.cohort_week} - Week ${weekIndex}: ${value}% retention`
src/app/(admin)/versotech_admin/growth/retention/components/cohort-matrix.tsx:193:                          {isAvailable ? `${value}%` : '-'}
src/components/dashboard/featured-deals-section.tsx:104:    return `Closed ${closeDate.toLocaleDateString()}`
src/components/dashboard/featured-deals-section.tsx:112:  if (diffDays <= 14) return `Closes in ${diffDays} days`
src/components/dashboard/featured-deals-section.tsx:114:  return `Closes ${closeDate.toLocaleDateString()}`
src/components/dashboard/featured-deals-section.tsx:126:    return `${currency ?? 'USD'} ${amount.toLocaleString()}`
src/components/dashboard/featured-deals-section.tsx:221:              ? `${deal.currency || 'USD'} ${priceFromFeeStructure.toFixed(2)}`
src/components/dashboard/featured-deals-section.tsx:223:                ? `${deal.currency || 'USD'} ${priceFromFeeStructureText}`
src/components/dashboard/featured-deals-section.tsx:380:                  <Link href={`/versotech_main/opportunities/${deal.id}`} className="w-full">
src/components/shared/member-kyc-edit-dialog.tsx:268:      const url = mode === 'create' ? apiEndpoint : `${apiEndpoint}/${memberId}`
src/components/shared/member-kyc-edit-dialog.tsx:282:        throw new Error(errorData.error || `Failed to ${mode} member`)
src/components/shared/member-kyc-edit-dialog.tsx:289:      console.error(`Error ${mode}ing member:`, error)
src/components/shared/member-kyc-edit-dialog.tsx:290:      toast.error(error instanceof Error ? error.message : `Failed to ${mode} member`)
src/components/shared/member-kyc-edit-dialog.tsx:317:              ? `Add a director, UBO, or authorized signatory to this ${getEntityTypeLabel()}`
src/components/shared/member-kyc-edit-dialog.tsx:319:                ? `Update KYC details for ${memberName}`
src/components/kyc/wizard/WizardContext.tsx:163:    const stepKey = `step${state.currentStep}` as keyof KYCQuestionnaireData
src/components/kyc/wizard/WizardContext.tsx:215:        response = await fetch(`/api/investors/me/kyc-submissions/${state.submissionId}`, {
src/components/kyc/wizard/WizardContext.tsx:272:      const errorSummary = errors.slice(0, 3).join(', ') + (errors.length > 3 ? ` (+${errors.length - 3} more)` : '')
src/components/kyc/wizard/WizardContext.tsx:335:      const stepKey = `step${step}` as keyof KYCQuestionnaireData
src/components/kyc/wizard/WizardContext.tsx:345:          const errorSummary = errorMessages.slice(0, 3).join(', ') + (errorMessages.length > 3 ? ` (+${errorMessages.length - 3} more)` : '')
src/components/kyc/wizard/WizardContext.tsx:347:          toast.error(`Please complete Step ${userFacingStepNumber}: ${STEP_CONFIG[step - 1].title}`, {
src/components/kyc/wizard/WizardContext.tsx:363:        const stepKey = `step${step}` as keyof KYCQuestionnaireData
src/components/kyc/wizard/WizardContext.tsx:384:        response = await fetch(`/api/investors/me/kyc-submissions/${state.submissionId}`, {
src/components/dashboard/performance-trends.tsx:174:  const formatPercentage = (value: number) => `${value.toFixed(1)}%`
src/components/dashboard/performance-trends.tsx:175:  const formatMultiple = (value: number) => `${value.toFixed(2)}x`
src/components/dashboard/performance-trends.tsx:432:                        <Cell key={`cell-${index}`} fill={entry.color} />
src/components/deals/interest-modal.tsx:92:      const response = await fetch(`/api/deals/${dealId}/interests`, {
src/components/deals/interest-modal.tsx:131:              ? `Let the VERSO team know you're interested in similar opportunities to ${dealName}. We'll notify you when comparable deals become available.`
src/components/deals/interest-modal.tsx:132:              : `Request access to the data room for ${dealName}. Once approved, you'll receive the NDA to sign.`
src/components/deals/interest-modal.tsx:155:                placeholder={`e.g. ${currency ?? ''} 250k`}
src/components/entities/edit-valuation-modal.tsx:66:      const response = await fetch(`/api/staff/vehicles/${vehicleId}/valuations/${valuation.id}`, {
src/components/documents/document-upload-dialog.tsx:90:        id: `${Date.now()}-${index}`,
src/components/documents/document-upload-dialog.tsx:101:      id: `${Date.now()}-${index}`,
src/components/documents/document-upload-dialog.tsx:142:      ? `/api/deals/${dataRoomDealId}/documents/upload`
src/components/documents/document-upload-dialog.tsx:193:          console.error(`Error uploading ${file.name}:`, error)
src/components/documents/document-upload-dialog.tsx:199:        const destination = isDataRoomUpload ? `Data Room (${dataRoomDealName})` : 'documents'
src/components/documents/document-upload-dialog.tsx:200:        toast.success(`Successfully uploaded ${totalFiles} file(s) to ${destination}`)
src/components/documents/document-upload-dialog.tsx:204:        toast.error(`${failedCount} file(s) failed to upload`)
src/components/documents/document-upload-dialog.tsx:367:                        <span className="flex items-center gap-2" style={{ paddingLeft: `${depth * 16}px` }}>
src/components/introducers/reconciliation-report.tsx:120:        `/api/arrangers/me/reports/introducer-reconciliation?${params.toString()}`
src/components/introducers/reconciliation-report.tsx:150:    link.href = `/api/arrangers/me/reports/introducer-reconciliation?${params.toString()}`
src/components/commercial-partner/proxy-mode-banner.tsx:66:      <div className={`bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between ${className}`}>
src/components/commercial-partner/proxy-mode-banner.tsx:108:      <div className={`bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between ${className}`}>
src/components/subscriptions/subscription-list-view.tsx:91:                      <Badge className={`${getStatusColor(sub.status)} flex items-center gap-1.5`} variant="outline">
src/components/subscriptions/subscription-list-view.tsx:169:                  <Link href={`/versotech_main/subscriptions/${sub.id}`}>
src/components/shared/activity-timeline-tab.tsx:72:    .replace(/([a-z])([A-Z])/g, '$1 $2')
src/components/shared/activity-timeline-tab.tsx:111:        `/api/admin/activity-logs?entityId=${entityId}&entityTypes=${entityTypes}&page=${pageNum}&pageSize=${pageSize}`
src/components/shared/activity-timeline-tab.tsx:200:            Recent activity and changes{entityName ? ` for ${entityName}` : ''}
src/components/shared/activity-timeline-tab.tsx:204:          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
src/components/dashboard/kpi-card.tsx:67:      aria-label={isClickable ? `${title}: ${displayValue}` : undefined}
src/components/dashboard/kpi-trend-charts.tsx:77:    return `${x},${y}`
src/components/dashboard/kpi-trend-charts.tsx:80:  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`
src/components/dashboard/kpi-trend-charts.tsx:98:        fill={`url(#${gradientId})`}
src/components/dashboard/kpi-trend-charts.tsx:99:        points={`${points} ${width},${height} 0,${height}`}
src/components/dashboard/kpi-trend-charts.tsx:150:    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
src/components/dashboard/kpi-trend-charts.tsx:154:    if (format === 'percent') return `${value}%`
src/components/dashboard/kpi-trend-charts.tsx:164:      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
src/components/dashboard/kpi-trend-charts.tsx:207:          d={`${pathData} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`}
src/components/dashboard/kpi-trend-charts.tsx:238:              <title>{`${p.date}: ${formatValue(p.value)}`}</title>
src/components/dashboard/kpi-trend-charts.tsx:262:    if (format === 'percent') return `${value}%`
src/components/introducers/introducer-detail-drawer.tsx:98:      const response = await fetch(`/api/arrangers/me/introducers/${introducerId}`)
src/components/introducers/introducer-detail-drawer.tsx:121:        `/api/arrangers/me/introducer-commissions?introducer_id=${introducerId}&limit=20`
src/components/introducers/introducer-detail-drawer.tsx:160:        name: `Invoice - ${commission.deal?.name || 'Commission'}`,
src/components/introducers/introducer-detail-drawer.tsx:278:                        <a href={`mailto:${data.introducer.email}`} className="text-primary hover:underline">
src/components/introducers/introducer-detail-drawer.tsx:343:                              <Link href={`/versotech_main/opportunities/${deal.id}`}>
src/components/introducers/introducer-detail-drawer.tsx:390:                                {comp.kind}: {comp.rate_bps ? `${(comp.rate_bps / 100).toFixed(2)}%` : comp.flat_amount ? `$${comp.flat_amount}` : 'N/A'}
src/components/introducers/introducer-detail-drawer.tsx:400:                            {plan.effective_until && ` to ${formatDate(plan.effective_until)}`}
src/components/introducers/introducer-detail-drawer.tsx:531:                                {referral.deal?.company_name && ` • ${referral.deal.company_name}`}
src/components/deals/deal-data-room-access-tab.tsx:140:    const response = await fetch(`/api/deals/${dealId}/data-room-access`)
src/components/deals/deal-data-room-access-tab.tsx:158:      const response = await fetch(`/api/deals/${dealId}/data-room-access`, {
src/components/deals/deal-data-room-access-tab.tsx:187:      const response = await fetch(`/api/deals/${dealId}/data-room-access`, {
src/components/deals/deal-data-room-access-tab.tsx:212:        const response = await fetch(`/api/deals/${dealId}/documents/${doc.id}/download`)
src/components/deals/deal-data-room-access-tab.tsx:242:      const response = await fetch(`/api/deals/${dealId}/documents/${editingDocId}`, {
src/components/deals/deal-data-room-access-tab.tsx:265:    if (!confirm(`Are you sure you want to delete "${doc.file_name}"? This action cannot be undone.`)) {
src/components/deals/deal-data-room-access-tab.tsx:271:      const response = await fetch(`/api/deals/${dealId}/documents/${doc.id}`, {
src/components/deals/deal-data-room-access-tab.tsx:335:                          ? `${format(new Date(record.expires_at), 'dd MMM yyyy HH:mm')} (${formatDistanceToNow(new Date(record.expires_at), { addSuffix: true })})`
src/components/documents/bulk-move-dialog.tsx:199:          const response = await fetch(`/api/staff/documents/${docId}`, {
src/components/documents/bulk-move-dialog.tsx:220:        toast.success(`Moved ${successCount} document${successCount !== 1 ? 's' : ''} to ${folderName}`)
src/components/documents/bulk-move-dialog.tsx:224:        toast.warning(`Moved ${successCount} document${successCount !== 1 ? 's' : ''}, ${failCount} failed`)
src/components/documents/bulk-move-dialog.tsx:251:          style={{ paddingLeft: `${level * 16 + 8}px` }}
src/components/documents/bulk-move-dialog.tsx:306:          style={{ paddingLeft: `${level * 16 + 8}px` }}
src/components/ui/auto-expand-textarea.tsx:16:        textarea.style.height = `${textarea.scrollHeight}px`
src/components/subscriptions/quick-add-subscription-modal.tsx:163:        description: `Created subscription for ${investors.find(i => i.id === investorId)?.legal_name}`,
src/components/shared/bank-details-tab.tsx:77:      const response = await fetch(`/api/admin/bank-details?entity_type=${entityType}&entity_id=${entityId}`)
src/components/shared/bank-details-tab.tsx:103:        ? `/api/admin/bank-details/${editingId}`
src/components/shared/bank-details-tab.tsx:156:      const response = await fetch(`/api/admin/bank-details/${id}`, {
src/components/shared/bank-details-tab.tsx:175:      const response = await fetch(`/api/admin/bank-details/${id}`, {
src/components/shared/bank-details-tab.tsx:211:                {entityName ? `Bank accounts for ${entityName}` : 'Manage bank account information for payments and distributions'}
src/components/shared/bank-details-tab.tsx:413:                  className={`flex items-start justify-between gap-4 p-4 rounded-lg border transition-colors ${
src/components/subscriptions/advanced-subscription-filters.tsx:240:              High Value ($1M+)
src/components/subscriptions/advanced-subscription-filters.tsx:296:                  id={`status-${status.value}`}
src/components/subscriptions/advanced-subscription-filters.tsx:302:                  htmlFor={`status-${status.value}`}
src/components/subscriptions/advanced-subscription-filters.tsx:305:                  <Badge className={`${status.color} border-0`}>
src/components/subscriptions/advanced-subscription-filters.tsx:342:                      id={`vehicle-${vehicle.id}`}
src/components/subscriptions/advanced-subscription-filters.tsx:348:                      htmlFor={`vehicle-${vehicle.id}`}
src/components/subscriptions/advanced-subscription-filters.tsx:365:                      id={`investor-type-${type}`}
src/components/subscriptions/advanced-subscription-filters.tsx:371:                      htmlFor={`investor-type-${type}`}
src/components/subscriptions/advanced-subscription-filters.tsx:605:                    className={`cursor-pointer ${
src/components/notifications/investor-notifications-client.tsx:173:  if (diffMins < 60) return `${diffMins}m ago`
src/components/notifications/investor-notifications-client.tsx:174:  if (diffHours < 24) return `${diffHours}h ago`
src/components/notifications/investor-notifications-client.tsx:175:  if (diffDays < 7) return `${diffDays}d ago`
src/components/notifications/investor-notifications-client.tsx:230:      const response = await fetch(`/api/notifications?${params.toString()}`)
src/components/dashboard/investor-action-center.tsx:151:  if (status === 'completed') return `Completed ${formatted}`
src/components/dashboard/investor-action-center.tsx:155:    return diffDays > 1 ? `${diffDays} days overdue` : 'Overdue'
src/components/dashboard/investor-action-center.tsx:160:  if (diffDays <= 3) return `Due in ${diffDays} days`
src/components/dashboard/investor-action-center.tsx:162:  return `Due ${formatted}`
src/components/dashboard/investor-action-center.tsx:330:                      <Link href={`/versotech_main/tasks?id=${task.id}`}>
src/components/introducers/request-payment-dialog.tsx:88:        `/api/arrangers/me/introducer-commissions/${commission.id}/request-payment`,
src/components/documents/rename-folder-dialog.tsx:52:      const response = await fetch(`/api/staff/documents/folders/${folderId}`, {
src/components/documents/rename-folder-dialog.tsx:66:        toast.error(`Failed to rename folder: ${errorMsg}`)
src/components/deals/faq-form-dialog.tsx:56:        ? `/api/deals/${dealId}/faqs/${faq.id}`
src/components/deals/faq-form-dialog.tsx:57:        : `/api/deals/${dealId}/faqs`
src/components/introducers/record-commission-dialog.tsx:210:                    {deal.name} {deal.company_name && `(${deal.company_name})`}
src/components/shared/kyc-documents-tab.tsx:186:      const paramName = paramMapping[entityType] || `${entityType}_id`
src/components/shared/kyc-documents-tab.tsx:187:      const response = await fetch(`/api/documents?${paramName}=${entityId}&limit=100`)
src/components/shared/kyc-documents-tab.tsx:270:      formData.append('name', file.name.replace(/\.[^/.]+$/, '')) // Remove extension
src/components/shared/kyc-documents-tab.tsx:273:      const paramName = entityType === 'arranger' ? 'arranger_entity_id' : `${entityType}_id`
src/components/shared/kyc-documents-tab.tsx:278:        const memberParamName = `${entityType}_member_id`
src/components/shared/kyc-documents-tab.tsx:316:      toast.success(`${docTypeLabel} uploaded successfully`)
src/components/shared/kyc-documents-tab.tsx:348:    if (!confirm(`Delete "${document.name}"? This action cannot be undone.`)) {
src/components/shared/kyc-documents-tab.tsx:353:      const response = await fetch(`/api/staff/documents/${document.id}`, {
src/components/shared/kyc-documents-tab.tsx:374:      const response = await fetch(`/api/documents/${doc.id}/download`)
src/components/shared/kyc-documents-tab.tsx:399:    if (bytes < 1024) return `${bytes} B`
src/components/shared/kyc-documents-tab.tsx:400:    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
src/components/shared/kyc-documents-tab.tsx:401:    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
src/components/shared/kyc-documents-tab.tsx:437:        <Badge className={`${getValidationStatusColor(doc.validation_status)} text-xs`}>
src/components/shared/kyc-documents-tab.tsx:449:    if (member.first_name && member.last_name) return `${member.first_name} ${member.last_name}`
src/components/shared/kyc-documents-tab.tsx:603:                {entityName ? `Compliance documents for ${entityName}` : 'Required compliance and verification documents'}
src/components/shared/kyc-documents-tab.tsx:620:              className={`h-2 rounded-full transition-all ${
src/components/shared/kyc-documents-tab.tsx:624:              style={{ width: `${completionPercentage}%` }}
src/components/kyc/wizard/steps/Step6OfferDetails.tsx:23:  { value: 'income', label: 'Annual income over $200K (or $300K joint)', icon: DollarSign },
src/components/kyc/wizard/steps/Step6OfferDetails.tsx:24:  { value: 'net_worth', label: 'Net worth over $1M (excluding primary residence)', icon: Building2 },
src/components/kyc/wizard/steps/Step6OfferDetails.tsx:26:  { value: 'entity', label: 'Entity with $5M+ in assets', icon: Building2 },
src/components/ui/chart.tsx:50:  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`
src/components/ui/chart.tsx:87:${prefix} [data-chart=${id}] {
src/components/ui/chart.tsx:88:${colorConfig
src/components/ui/chart.tsx:93:    return color ? `  --color-${key}: ${color};` : null
src/components/ui/chart.tsx:137:    const key = `${labelKey || item?.dataKey || item?.name || "value"}`
src/components/ui/chart.tsx:185:            const key = `${nameKey || item.name || item.dataKey || "value"}`
src/components/ui/chart.tsx:283:          const key = `${nameKey || item.dataKey || "value"}`
src/components/subscriptions/subscription-kanban-view.tsx:75:      toast.success(`Subscription moved to ${newStatus}`)
src/components/subscriptions/subscription-kanban-view.tsx:100:            <Card className={`bg-card border-2 ${column.color} ${column.bgColor} shadow-lg`}>
src/components/subscriptions/subscription-kanban-view.tsx:104:                  <Badge variant="outline" className={`ml-2 border-border ${column.iconColor} font-mono`}>
src/components/subscriptions/subscription-kanban-view.tsx:118:                  className={`bg-card border-border cursor-move hover:border-muted-foreground hover:shadow-xl transition-all duration-200 ${
src/components/subscriptions/subscription-kanban-view.tsx:161:                    <Link href={`/versotech_main/subscriptions/${sub.id}`}>
src/components/subscriptions/subscription-kanban-view.tsx:176:                <div className={`text-center py-12 rounded-lg border-2 border-dashed ${column.color} ${column.bgColor}`}>
src/components/subscriptions/subscription-detail-client.tsx:148:                ? `${((metrics.total_contributed / metrics.total_commitment) * 100).toFixed(1)}% funded`
src/components/subscriptions/subscription-detail-client.tsx:186:      <Tabs defaultValue="details" className="w-full" id={`subscription-tabs-${subscription.id}`}>
src/components/subscriptions/subscription-detail-client.tsx:291:                          href={`/versotech_main/investors/${subscription.investor.id}`}
src/components/subscriptions/subscription-detail-client.tsx:439:                      ? `${((metrics.total_contributed / metrics.total_commitment) * 100).toFixed(1)}%`
src/components/introducers/submit-invoice-dialog.tsx:74:      formData.append('description', `Invoice for commission ${commission?.id}`)
src/components/introducers/submit-invoice-dialog.tsx:119:        `/api/introducers/me/commissions/${commission.id}/submit-invoice`,
src/components/documents/document-card.tsx:158:      const response = await fetch(`/api/documents/${document.id}/download`)
src/components/documents/document-card.tsx:174:        toast.info(`Document will be watermarked with: ${watermark.downloaded_by}`, {
src/components/documents/document-card.tsx:182:        `Download link generated. Expires in ${Math.floor(expires_in_seconds / 60)} minutes`,
src/components/documents/document-card.tsx:264:                aria-label={`Select ${displayName}`}
src/components/documents/document-filters.tsx:107:                ${isActive
src/components/introducers/request-invoice-dialog.tsx:53:        `/api/arrangers/me/introducer-commissions/${commission.id}/request-invoice`,
src/components/ui/progress.tsx:22:      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
src/components/kyc/wizard/steps/Step3WellInformed.tsx:86:                              ? `border-${option.color}-500 bg-${option.color}-500/10`
src/components/commissions/submit-invoice-dialog.tsx:90:      const apiUrl = `/api/commissions/${commissionType}/${commission.id}/invoice`
src/components/shared/entity-kyc-edit-dialog.tsx:243:              ? `Update KYC details for ${entityName}`
src/components/documents/rename-document-dialog.tsx:52:      const response = await fetch(`/api/staff/documents/${documentId}`, {
src/components/documents/rename-document-dialog.tsx:66:        toast.error(`Failed to rename document: ${errorMsg}`)
src/components/deals/data-room-document-upload.tsx:58:      const response = await fetch(`/api/deals/${dealId}/folders`)
src/components/deals/data-room-document-upload.tsx:128:        const response = await fetch(`/api/deals/${dealId}/documents/link`, {
src/components/deals/data-room-document-upload.tsx:143:          toast.error(`Failed to add link: ${error.error}`)
src/components/deals/data-room-document-upload.tsx:164:          const response = await fetch(`/api/deals/${dealId}/documents/upload`, {
src/components/deals/data-room-document-upload.tsx:171:            toast.error(`Failed to upload ${file.name}: ${error.error}`)
src/components/deals/data-room-document-upload.tsx:179:        toast.success(`Successfully uploaded ${successCount} of ${files.length} files`)
src/components/deals/data-room-document-upload.tsx:240:                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
src/components/deals/data-room-document-upload.tsx:416:                {uploadMode === 'link' ? 'Add Link' : `Upload ${files.length > 0 ? `(${files.length})` : ''}`}
src/components/subscriptions/vehicle-summary-table.tsx:91:    return `${formatNumber(num, 1)}%`
src/components/subscriptions/vehicle-summary-table.tsx:130:    router.push(`/versotech_main/subscriptions?vehicle=${vehicleId}`)
src/components/subscriptions/vehicle-summary-table.tsx:323:                      <div className={`font-medium ${vehicle.moic >= 1 ? 'text-green-400' : 'text-red-400'}`}>
src/components/filters/saved-filter-views.tsx:134:        const response = await fetch(`/api/staff/filter-views?entity=${entity}`)
src/components/filters/saved-filter-views.tsx:181:        description: `"${viewName}" is now available in your saved views`
src/components/filters/saved-filter-views.tsx:196:      const response = await fetch(`/api/staff/filter-views/${viewId}`, {
src/components/filters/saved-filter-views.tsx:214:    toast.success(`Applied view: ${view.name}`)
src/components/documents/tag-management-popover.tsx:84:      const response = await fetch(`/api/staff/documents/${documentId}`, {
src/components/documents/tag-management-popover.tsx:112:      toast.info(`Tag "${trimmedTag}" already exists`)
src/components/documents/tag-management-popover.tsx:201:                    aria-label={`Remove tag ${tag}`}
src/components/documents/tag-management-popover.tsx:231:                      value={`create-${inputValue}`}
src/components/tour/tour-welcome-modal.tsx:127:              <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${gradient.from} ${gradient.to} shadow-lg flex items-center justify-center`}>
src/components/tour/tour-welcome-modal.tsx:203:            className={`w-full h-12 bg-gradient-to-r ${gradient.from} ${gradient.to} hover:opacity-90 text-white font-medium text-base shadow-lg shadow-blue-500/20`}
src/components/kyc/wizard/WizardProgress.tsx:46:            style={{ width: `${progress}%` }}
src/components/deals/data-room-documents-grouped.tsx:249:            className={`bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${isExpanded ? 'border-l-2 ' + style.accent : ''}`}
src/components/deals/data-room-documents-grouped.tsx:254:              className={`w-full px-5 py-4 flex items-center justify-between transition-all duration-200 ${isExpanded ? 'bg-muted/70' : 'hover:bg-muted/50'}`}
src/components/deals/data-room-documents-grouped.tsx:260:                    <FolderOpen className={`h-5 w-5 ${style.icon}`} />
src/components/deals/data-room-documents-grouped.tsx:265:                    <Folder className={`h-5 w-5 ${style.icon}`} />
src/components/subscriptions/subscription-documents-tab.tsx:91:      const response = await fetch(`/api/subscriptions/${subscriptionId}/documents`)
src/components/subscriptions/subscription-documents-tab.tsx:114:        `/api/storage/download?bucket=deal-documents&path=${encodeURIComponent(document.file_key)}`
src/components/subscriptions/subscription-documents-tab.tsx:164:      const response = await fetch(`/api/subscriptions/${subscriptionId}/documents/upload`, {
src/components/subscriptions/subscription-documents-tab.tsx:203:        `/api/subscriptions/${subscriptionId}/documents/${selectedDocumentForSignature.id}/ready-for-signature`,
src/components/subscriptions/subscription-documents-tab.tsx:222:        ? `arranger (${data.countersigner_name})`
src/components/subscriptions/subscription-documents-tab.tsx:224:      toast.success(`Document sent to ${data.total_signatories} signatories for signature. Countersigner: ${countersignerLabel}`)
src/components/subscriptions/subscription-documents-tab.tsx:240:      const response = await fetch(`/api/subscriptions/${subscriptionId}/regenerate`, {
src/components/subscriptions/subscription-documents-tab.tsx:253:      toast.success(`Subscription pack regenerated as ${format}`)
src/components/subscriptions/subscription-documents-tab.tsx:268:        `/api/subscriptions/${subscriptionId}/documents/${documentId}/mark-final`,
src/components/subscriptions/subscription-documents-tab.tsx:298:    if (bytes < 1024) return `${bytes} B`
src/components/subscriptions/subscription-documents-tab.tsx:299:    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
src/components/subscriptions/subscription-documents-tab.tsx:300:    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
src/components/subscriptions/subscription-documents-tab.tsx:472:                          {document.created_by_profile && ` by ${document.created_by_profile.display_name}`}
src/components/subscriptions/capital-activity-table.tsx:153:      toast.success(`${createDialog.type === 'cashflow' ? 'Cashflow' : createDialog.type === 'capitalCall' ? 'Capital call' : 'Distribution'} created successfully`)
src/components/subscriptions/capital-activity-table.tsx:172:          ? `/api/cashflows/${editDialog.data.id}`
src/components/subscriptions/capital-activity-table.tsx:174:          ? `/api/capital-calls/${editDialog.data.id}`
src/components/subscriptions/capital-activity-table.tsx:175:          : `/api/distributions/${editDialog.data.id}`
src/components/subscriptions/capital-activity-table.tsx:189:      toast.success(`${editDialog.type === 'cashflow' ? 'Cashflow' : editDialog.type === 'capitalCall' ? 'Capital call' : 'Distribution'} updated successfully`)
src/components/subscriptions/capital-activity-table.tsx:208:          ? `/api/cashflows/${deleteDialog.id}`
src/components/subscriptions/capital-activity-table.tsx:210:          ? `/api/capital-calls/${deleteDialog.id}`
src/components/subscriptions/capital-activity-table.tsx:211:          : `/api/distributions/${deleteDialog.id}`
src/components/subscriptions/capital-activity-table.tsx:223:      toast.success(`${deleteDialog.type === 'cashflow' ? 'Cashflow' : deleteDialog.type === 'capitalCall' ? 'Capital call' : 'Distribution'} deleted successfully`)
src/components/subscriptions/capital-activity-table.tsx:257:      <Tabs defaultValue="cashflows" className="w-full" id={`capital-activity-tabs-${vehicleId}-${investorId}`}>
src/components/tour/tour-tooltip.tsx:107:      viewBox={`0 0 ${width} ${height}`}
src/components/tour/tour-tooltip.tsx:108:      className={`${positionStyles[side]} ${className}`}
src/components/tour/tour-tooltip.tsx:283:              <div className={`${colors.bg} ${colors.border} border-b -mx-4 px-4 py-3 mb-4`}>
src/components/tour/tour-tooltip.tsx:285:                  <span className={`text-xs font-semibold ${colors.text} uppercase tracking-wider`}>
src/components/tour/tour-tooltip.tsx:291:                    className={`h-8 w-8 ${colors.text} hover:bg-black/5 dark:hover:bg-white/5`}
src/components/tour/tour-tooltip.tsx:301:                    animate={{ width: `${progress}%` }}
src/components/tour/tour-tooltip.tsx:303:                    className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
src/components/tour/tour-tooltip.tsx:310:                <ChevronRight className={`h-5 w-5 ${colors.text} flex-shrink-0`} />
src/components/tour/tour-tooltip.tsx:322:                    className={`text-sm ${colors.text} hover:opacity-80 flex items-center gap-1 font-medium transition-colors`}
src/components/tour/tour-tooltip.tsx:383:                    className={`bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white h-12 px-6`}
src/components/tour/tour-tooltip.tsx:421:            <div className={`${colors.bg} ${colors.border} border-b px-5 py-4`}>
src/components/tour/tour-tooltip.tsx:423:                <span className={`text-xs font-semibold ${colors.text} uppercase tracking-wider`}>
src/components/tour/tour-tooltip.tsx:429:                  className={`h-7 w-7 ${colors.text} hover:bg-black/5 dark:hover:bg-white/5 -mr-1`}
src/components/tour/tour-tooltip.tsx:439:                  animate={{ width: `${progress}%` }}
src/components/tour/tour-tooltip.tsx:441:                  className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
src/components/tour/tour-tooltip.tsx:449:                <ChevronRight className={`h-5 w-5 ${colors.text} flex-shrink-0`} />
src/components/tour/tour-tooltip.tsx:461:                    className={`text-sm ${colors.text} hover:opacity-80 flex items-center gap-1 font-medium transition-colors`}
src/components/tour/tour-tooltip.tsx:541:                    className={`bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white`}
src/components/commissions/request-payment-dialog.tsx:145:      const apiUrl = `/api/arrangers/me/${commissionType}-commissions/${commission.id}/request-payment`
src/components/documents/create-folder-dialog.tsx:71:          ? `${error.error}: ${JSON.stringify(error.details)}`
src/components/commercial-partners/commercial-partner-detail-drawer.tsx:189:      const response = await fetch(`/api/arrangers/me/commercial-partners/${commercialPartnerId}`)
src/components/commercial-partners/commercial-partner-detail-drawer.tsx:211:        `/api/arrangers/me/commercial-partner-commissions?commercial_partner_id=${commercialPartnerId}`
src/components/commercial-partners/commercial-partner-detail-drawer.tsx:243:        `/api/arrangers/me/commercial-partner-commissions/${commission.id}/request-invoice`,
src/components/commercial-partners/commercial-partner-detail-drawer.tsx:265:        `/api/arrangers/me/commercial-partner-commissions/${commission.id}/request-payment`,
src/components/commercial-partners/commercial-partner-detail-drawer.tsx:396:                            href={`mailto:${data.commercial_partner.contact_email}`}
src/components/commercial-partners/commercial-partner-detail-drawer.tsx:502:                            {plan.effective_until && ` - ${formatDate(plan.effective_until)}`}
src/components/commercial-partners/commercial-partner-detail-drawer.tsx:514:                                      ? `${(comp.rate_bps / 100).toFixed(2)}%`
src/components/commercial-partners/commercial-partner-detail-drawer.tsx:686:                              {agreement.expiry_date && ` - ${formatDate(agreement.expiry_date)}`}
src/components/commissions/view-invoice-dialog.tsx:71:        const apiUrl = `/api/commissions/${commissionType}/${commission.id}/invoice`
src/components/commissions/view-invoice-dialog.tsx:124:  const isImage = invoicePath?.match(/\.(png|jpg|jpeg)$/i)
src/components/commissions/view-invoice-dialog.tsx:136:            {commission.deal && ` - ${commission.deal.name}`}
src/components/subscriptions/subscription-quick-stats.tsx:77:      subValue: selectedCount > 0 ? `${selectedCount} selected` : null,
src/components/subscriptions/subscription-quick-stats.tsx:85:      subValue: `Avg: ${formatCurrency(avgCommitment)}`,
src/components/subscriptions/subscription-quick-stats.tsx:93:      subValue: `${fundingRate.toFixed(1)}% of commitment`,
src/components/subscriptions/subscription-quick-stats.tsx:101:      subValue: metrics.overdueCount > 0 ? `${metrics.overdueCount} overdue` : 'All current',
src/components/subscriptions/subscription-quick-stats.tsx:109:      subValue: moic > 0 ? `${moic.toFixed(2)}x MOIC` : 'N/A',
src/components/subscriptions/subscription-quick-stats.tsx:116:      value: `${fundingRate.toFixed(1)}%`,
src/components/subscriptions/subscription-quick-stats.tsx:117:      subValue: Object.keys(metrics.byCurrency).length > 1 ? `${Object.keys(metrics.byCurrency).length} currencies` : 'Single currency',
src/components/subscriptions/subscription-quick-stats.tsx:130:                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
src/components/subscriptions/subscription-quick-stats.tsx:131:                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
src/components/subscriptions/subscription-quick-stats.tsx:135:              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
src/components/deals/create-fee-plan-modal.tsx:39:      const response = await fetch(`/api/deals/${dealId}/fee-plans`, {
src/components/kyc/address-form-section.tsx:39:    return `${prefix}${name}` as Path<T>
src/components/subscriptions/signatory-selection-dialog.tsx:79:        fetch(`/api/subscriptions/${subscriptionId}/signatories`),
src/components/subscriptions/signatory-selection-dialog.tsx:80:        fetch(`/api/documents/${documentId}`)
src/components/common/commission-summary.tsx:175:                style={{ width: `${(paid / (paid + total_owed)) * 100}%` }}
src/components/documents/move-document-dialog.tsx:77:      const response = await fetch(`/api/staff/documents/${documentId}`, {
src/components/commercial-partners/record-cp-commission-dialog.tsx:210:                    {deal.name} {deal.company_name && `(${deal.company_name})`}
src/components/subscriptions/subscription-bulk-actions.tsx:74:      toast.success(`Updated ${selectedIds.length} subscription(s) to ${newStatus}`)
src/components/subscriptions/subscription-bulk-actions.tsx:189:                      if (confirm(`Archive ${selectedIds.length} subscription(s)?`)) {
src/components/subscriptions/subscription-bulk-actions.tsx:192:                          toast.success(`Archived ${selectedIds.length} subscription(s)`)
src/components/subscriptions/subscription-edit-dialog.tsx:160:      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
src/components/subscriptions/subscription-edit-dialog.tsx:193:          <Tabs defaultValue="basic" className="w-full" id={`subscription-edit-tabs-${subscription.id}`}>
src/components/kyc/tax-info-form-section.tsx:34:    return (prefix ? `${prefix}${name}` : name) as Path<T>
src/components/commissions/request-invoice-dialog.tsx:65:      const apiUrl = `/api/arrangers/me/${commissionType}-commissions/${commission.id}/request-invoice`
src/components/tour/platform-tour.tsx:143:      // console.log(`[Tour Analytics] Viewing step ${step}: ${stepId}`)
src/components/tour/platform-tour.tsx:146:      // console.log(`[Tour Analytics] Completed step ${step}: ${stepId} in ${durationMs}ms`)
src/components/tour/platform-tour.tsx:149:      // console.log(`[Tour Analytics] Tour completed in ${totalDurationMs}ms`)
src/components/tour/platform-tour.tsx:152:      // console.log(`[Tour Analytics] Tour skipped at step ${atStep}`)
src/components/documents/staff/content/ContentGrid.tsx:211:            ? `No documents match "${searchQuery}"`
src/components/deals/investor-journey-bar.tsx:322:      <Tooltip key={`flex-node-${stageDef.key}`}>
src/components/deals/data-room-documents.tsx:49:      const response = await fetch(`/api/deals/${doc.deal_id}/documents/${doc.id}/download`)
src/components/deals/data-room-documents.tsx:97:                    {doc.external_link ? 'External link' : `Uploaded ${new Date(doc.created_at).toLocaleDateString()}`}
src/components/documents/staff-documents-client.tsx:257:    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
src/components/documents/staff-documents-client.tsx:294:    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
src/components/documents/staff-documents-client.tsx:312:      const response = await fetch(`/api/staff/documents/search?${params.toString()}`)
src/components/documents/staff-documents-client.tsx:517:        toast.error(`${sizeErrors.length} file(s) exceed 50MB limit: ${sizeErrors.map(i => i.file.name).join(', ')}`)
src/components/documents/staff-documents-client.tsx:521:        toast.error(`Unsupported file type(s): ${typeErrors.map(i => i.file.name).join(', ')}. Allowed: PDF, DOCX, XLSX, TXT, JPG, PNG`)
src/components/documents/staff-documents-client.tsx:578:        const response = await fetch(`/api/staff/documents/${documentId}`, {
src/components/documents/staff-documents-client.tsx:585:          toast.success(`Moved "${documentName}" to ${folderName}`)
src/components/documents/staff-documents-client.tsx:588:          toast.error(`Failed to move document: ${errorData.error || 'Unknown error'}`)
src/components/documents/staff-documents-client.tsx:609:        toast.error(`${sizeErrors.length} file(s) exceed 50MB limit: ${sizeErrors.map(i => i.file.name).join(', ')}`)
src/components/documents/staff-documents-client.tsx:613:        toast.error(`Unsupported file type(s): ${typeErrors.map(i => i.file.name).join(', ')}. Allowed: PDF, DOCX, XLSX, TXT, JPG, PNG`)
src/components/documents/staff-documents-client.tsx:622:      toast.info(`Uploading to ${folderName}`)
src/components/documents/staff-documents-client.tsx:700:      toast.success(`Downloaded ${docCount} document(s) as ZIP`)
src/components/documents/staff-documents-client.tsx:921:        path: `/${doc.folder}`
src/components/documents/staff-documents-client.tsx:1217:      const response = await fetch(`/api/deals?vehicle_id=${vehicleId}`)
src/components/documents/staff-documents-client.tsx:1253:      const dealsNodeId = `deals-${vehicleId}`
src/components/documents/staff-documents-client.tsx:1273:    setExpandedDealsNodes(prev => new Set([...prev, `deals-${vehicleId}`]))
src/components/documents/staff-documents-client.tsx:1274:    toast.info(`Viewing documents for deal: ${dealName}`)
src/components/documents/staff-documents-client.tsx:1286:      const response = await fetch(`/api/staff/documents/data-room/${dealId}`)
src/components/documents/staff-documents-client.tsx:1314:    setExpandedDealsNodes(prev => new Set([...prev, `deals-${vehicleId}`]))
src/components/documents/staff-documents-client.tsx:1318:    toast.info(`Viewing Data Room for: ${dealName}`)
src/components/documents/staff-documents-client.tsx:1404:        toast.error(`Failed to load folders: ${errorMsg}`)
src/components/documents/staff-documents-client.tsx:1451:      const response = await fetch(`/api/staff/documents?${params.toString()}`)
src/components/documents/staff-documents-client.tsx:1459:        toast.error(`Failed to load documents: ${errorMsg}`)
src/components/documents/staff-documents-client.tsx:1513:        toast.success(`Default folders created for ${vehicle?.name || 'vehicle'}`)
src/components/documents/staff-documents-client.tsx:1535:      const response = await fetch(`/api/staff/documents/${documentId}`, {
src/components/documents/staff-documents-client.tsx:1614:    const toastId = toast.loading(`Uploading new version of "${uploadVersionDocName}"...`)
src/components/documents/staff-documents-client.tsx:1620:      const response = await fetch(`/api/staff/documents/${uploadVersionDocId}/versions`, {
src/components/documents/staff-documents-client.tsx:1634:      toast.success(`Uploaded version ${newVersionNumber}`)
src/components/documents/staff-documents-client.tsx:1666:      const response = await fetch(`/api/staff/documents/${documentId}/publish`, {
src/components/documents/staff-documents-client.tsx:1706:      const response = await fetch(`/api/documents/${documentId}/download`)
src/components/documents/staff-documents-client.tsx:1747:    if (!confirm(`Are you sure you want to delete "${folder.name}"? This will also delete all documents and subfolders within it.`)) {
src/components/documents/staff-documents-client.tsx:1752:      const response = await fetch(`/api/staff/documents/folders/${folderId}`, {
src/components/documents/staff-documents-client.tsx:1763:        toast.error(`Failed to delete folder: ${errorMsg}`)
src/components/documents/staff-documents-client.tsx:1804:    const dealsNodeId = `deals-${vehicleId}`
src/components/documents/staff-documents-client.tsx:1815:          style={{ paddingLeft: `${level * 16 + 8}px` }}
src/components/documents/staff-documents-client.tsx:1848:                style={{ paddingLeft: `${(level + 1) * 16 + 8 + 20}px` }}
src/components/documents/staff-documents-client.tsx:1867:                      style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
src/components/documents/staff-documents-client.tsx:1929:                        style={{ paddingLeft: `${(level + 2) * 16 + 8}px` }}
src/components/documents/staff-documents-client.tsx:1995:          style={{ paddingLeft: `${level * 16 + 8}px` }}
src/components/documents/staff-documents-client.tsx:2083:              style={{ paddingLeft: `${level * 16 + 8}px` }}
src/components/deals/deals-list-client.tsx:135:            <Link href={`${basePath}/deals/new`}>
src/components/deals/deals-list-client.tsx:141:            <Link href={`${basePath}/entities`}>
src/components/deals/deals-list-client.tsx:290:                  <Link href={`${basePath}/deals/new`}>
src/components/deals/deals-list-client.tsx:308:                        href={`${basePath}/deals/${deal.id}`}
src/components/deals/deals-list-client.tsx:327:                      <Link href={`${basePath}/deals/${deal.id}`}>View Details</Link>
src/components/deals/deals-list-client.tsx:351:                            ? `${deal.currency || 'USD'} ${deal.fee_structure.price_per_share.toFixed(2)}/unit`
src/components/deals/deals-list-client.tsx:353:                              ? `${deal.currency || 'USD'} ${deal.fee_structure.price_per_share_text}/unit`
src/components/deals/deals-list-client.tsx:354:                              : `${deal.currency} ${deal.offer_unit_price.toFixed(2)}/unit`}
src/components/deals/deals-list-client.tsx:445:              <Link href={`${basePath}/deals/new`}>Set Up New Deal</Link>
src/components/deals/deals-list-client.tsx:467:              <Link href={`${basePath}/subscriptions`}>View Inventory</Link>
src/components/deals/deals-list-client.tsx:489:              <Link href={`${basePath}/approvals`}>Review Approvals</Link>
src/components/deals/add-fee-component-modal.tsx:54:      const response = await fetch(`/api/deals/${dealId}/fee-plans/${feePlanId}/components`, {
src/components/deals/share-deal-dialog.tsx:243:                Your commission: {feeModel.percentage_rate ? `${feeModel.percentage_rate}%` : `${feeModel.currency} ${feeModel.flat_amount}`}
src/components/deals/share-deal-dialog.tsx:347:                      ? `${feeModel.percentage_rate}% of investment`
src/components/deals/share-deal-dialog.tsx:348:                      : `${feeModel.currency} ${feeModel.flat_amount} flat fee`}
src/components/deals/data-room-viewer.tsx:66:  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
src/components/deals/data-room-viewer.tsx:119:        `/api/deals/${dealId}/documents/${document.id}/download?mode=${mode}`
src/components/deals/data-room-viewer.tsx:152:            description: `Link expires in ${Math.floor(data.expires_in_seconds / 60)} minutes`,
src/components/calendar/calendar-day-modal.tsx:33:      <DialogContent className={`max-w-2xl ${isLight ? 'bg-white text-gray-900' : 'bg-card text-foreground'}`}>
src/components/calendar/calendar-day-modal.tsx:35:          <DialogTitle className={`text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-foreground'}`}>
src/components/calendar/calendar-day-modal.tsx:44:              <div className={`rounded-lg border border-dashed p-8 text-center ${isLight ? 'border-gray-300 bg-gray-50' : 'border-border bg-muted/30'}`}>
src/components/calendar/calendar-day-modal.tsx:45:                <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-muted-foreground'}`}>
src/components/calendar/calendar-day-modal.tsx:57:                    className={`rounded-lg border p-4 shadow-sm ${isLight ? 'border-gray-200 bg-white' : 'border-border bg-card'}`}
src/components/calendar/calendar-day-modal.tsx:66:                          <h3 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-foreground'}`}>
src/components/calendar/calendar-day-modal.tsx:73:                                backgroundColor: isLight ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)` : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
src/components/calendar/calendar-day-modal.tsx:74:                                color: isLight ? color : `rgb(${Math.min(255, rgb.r + 80)}, ${Math.min(255, rgb.g + 80)}, ${Math.min(255, rgb.b + 80)})`
src/components/calendar/calendar-day-modal.tsx:82:                        <div className={`text-sm ${isLight ? 'text-gray-600' : 'text-muted-foreground'}`}>
src/components/calendar/calendar-day-modal.tsx:92:                          <p className={`text-sm ${isLight ? 'text-gray-700' : 'text-foreground/80'}`}>
src/components/documents/staff/content/SearchResults.tsx:81:    if (bytes < 1024) return `${bytes} B`
src/components/documents/staff/content/SearchResults.tsx:82:    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
src/components/documents/staff/content/SearchResults.tsx:83:    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
src/components/deals/real-time-inventory.tsx:31:      const response = await fetch(`/api/deals/${dealId}/inventory`, {
src/components/deals/real-time-inventory.tsx:71:            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
src/components/deals/add-participant-modal.tsx:157:    ? `${currencyCode ? `${currencyCode} ` : ''}${Number(component.flat_amount).toLocaleString()}`
src/components/deals/add-participant-modal.tsx:160:    return component.flat_amount != null ? `${flatAmountDisplay} / share` : '-'
src/components/deals/add-participant-modal.tsx:163:    return `${(Number(component.rate_bps) / 100).toFixed(2)}%`
src/components/deals/add-participant-modal.tsx:277:      const response = await fetch(`/api/deals/${dealId}/fee-structures?status=published`)
src/components/deals/add-participant-modal.tsx:296:      let endpoint = `/api/deals/${dealId}/dispatch/fee-plans?entity_id=${selectedReferringEntity.id}&entity_type=${referrerEntityType}`
src/components/deals/add-participant-modal.tsx:298:        endpoint += `&term_sheet_id=${selectedTermSheetId}`
src/components/deals/add-participant-modal.tsx:326:      const response = await fetch(`/api/deals/${dealId}/active-agreements?introducer_id=${introducerId}`)
src/components/deals/add-participant-modal.tsx:344:      const response = await fetch(`/api/deals/${dealId}/linkable-investors?term_sheet_id=${termSheetId}`)
src/components/deals/add-participant-modal.tsx:487:      setFeePlanName(`${entityName} Fee Plan`)
src/components/deals/add-participant-modal.tsx:537:          setError(`Please select a ${entityLabel} for this investor role`)
src/components/deals/add-participant-modal.tsx:562:        setError(`Please select a ${category.replace('_', ' ')}`)
src/components/deals/add-participant-modal.tsx:589:        const response = await fetch(`/api/deals/${dealId}/members`, {
src/components/deals/add-participant-modal.tsx:606:        const response = await fetch(`/api/deals/${dealId}/members/${linkedInvestor.user_id}`, {
src/components/deals/add-participant-modal.tsx:623:        const response = await fetch(`/api/deals/${dealId}/partners`, {
src/components/deals/add-participant-modal.tsx:639:          throw new Error(data.error || `Failed to add ${category.replace('_', ' ')}`)
src/components/deals/add-participant-modal.tsx:758:                      <SelectValue placeholder={`Select a ${selectedCategoryInfo?.label.toLowerCase()}`} />
src/components/deals/add-participant-modal.tsx:840:                      <SelectValue placeholder={`Select ${referrerEntityType?.replace('_', ' ')}`} />
src/components/deals/add-participant-modal.tsx:995:                            placeholder="Flat $"
src/components/deals/add-participant-modal.tsx:1072:                              Term Sheet v{agreement.term_sheet_version} {agreement.reference_number ? `• ${agreement.reference_number}` : ''}
src/components/deals/add-participant-modal.tsx:1168:                `Add ${selectedCategoryInfo?.label || 'Participant'}`
src/components/deals/data-room-document-versions.tsx:64:      const response = await fetch(`/api/deals/${dealId}/documents/${documentId}/versions`, {
src/components/deals/data-room-document-versions.tsx:93:      const response = await fetch(`/api/deals/${dealId}/documents/${documentId}/versions`)
src/components/deals/data-room-document-versions.tsx:117:    if (bytes < 1024) return `${bytes} B`
src/components/deals/data-room-document-versions.tsx:118:    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
src/components/deals/data-room-document-versions.tsx:119:    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
src/components/members/members-management-tab.tsx:159:      const response = await fetch(`/api/members?entity_type=${entityType}&entity_id=${entityId}`)
src/components/members/members-management-tab.tsx:174:      const response = await fetch(`/api/members/invite?entity_type=${entityType}&entity_id=${entityId}`)
src/components/members/members-management-tab.tsx:201:      const response = await fetch(`/api/members/${editingMember.user_id}`, {
src/components/members/members-management-tab.tsx:238:        `/api/members/${memberId}?entity_type=${entityType}&entity_id=${entityId}`,
src/components/members/members-management-tab.tsx:287:        toast.success(`Invitation request created for ${inviteEmail}. Awaiting CEO approval.`, {
src/components/members/members-management-tab.tsx:292:        toast.success(`Invitation sent to ${inviteEmail}`)
src/components/members/members-management-tab.tsx:316:      const response = await fetch(`/api/members/invite?id=${invitationId}`, {
src/components/members/members-management-tab.tsx:336:    const url = `${window.location.origin}/invitation/accept?token=${token}`
src/components/deals/deal-faq-tab.tsx:28:      const res = await fetch(`/api/deals/${dealId}/faqs`)
src/components/deals/deal-faq-tab.tsx:45:      const res = await fetch(`/api/deals/${dealId}/faqs/${faqId}`, {
src/components/staff/reconciliation-client.tsx:42:      toast.success(data.message || `Imported ${data.imported} transactions`)
src/components/staff/reconciliation-client.tsx:109:      toast.success(data.message || `Found ${data.matches} suggested matches`)
src/components/staff/reconciliation-client.tsx:120:      <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
src/components/deals/create-deal-form.tsx:180:          throw new Error(`Server error: ${response.status} ${response.statusText}`)
src/components/deals/create-deal-form.tsx:185:          const errorMessages = data.details.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
src/components/deals/create-deal-form.tsx:186:          throw new Error(`Validation failed: ${errorMessages}`)
src/components/deals/create-deal-form.tsx:189:        throw new Error(data.error || data.details || `Failed to create deal (${response.status})`)
src/components/deals/create-deal-form.tsx:194:        ? `${basePath}/deals`
src/components/deals/create-deal-form.tsx:195:        : `${basePath}/deals/${deal.id}`
src/components/deals/create-deal-form.tsx:212:        <Link href={`${basePath}/deals`}>
src/components/deals/create-deal-form.tsx:225:              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
src/components/deals/create-deal-form.tsx:235:            <span className={`text-sm ${s === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
src/components/deals/create-deal-form.tsx:337:                    <Link href={`${basePath}/entities`} className="text-emerald-300 hover:text-emerald-200 underline">
src/components/deals/create-deal-form.tsx:383:                      alt={`${(selectedEntity?.name ?? formData.name) || 'Deal'} logo`}
src/components/deals/create-deal-form.tsx:458:                      ? `Prefilled from ${selectedEntity.name}. Replace if you need a different logo.`
src/components/deals/create-deal-form.tsx:489:                      ? `Inherited from ${selectedEntity.name}. You can change it if needed.`
src/components/calendar/calendar-split-view.tsx:45:    <div className={`h-96 w-full animate-pulse rounded-2xl border ${isLight ? 'border-slate-200/80 bg-slate-100/60' : 'border-border bg-muted/30'}`} />
src/components/deals/deal-overview-tab.tsx:117:                  key={`${title}-${stage.label}`}
src/components/deals/deal-overview-tab.tsx:125:                      ${isActive
src/components/deals/deal-overview-tab.tsx:139:                    ${isActive ? 'text-foreground/70' : 'text-muted-foreground/50'}
src/components/deals/deal-overview-tab.tsx:148:                      ${stage.count > 0 ? 'text-emerald-400/60' : 'text-muted-foreground/30'}
src/components/deals/deal-overview-tab.tsx:260:                {deal.sector || '—'} {deal.stage && `• ${deal.stage}`}
src/components/deals/deal-overview-tab.tsx:315:                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
src/components/arranger/reconciliation-tabs/commission-tab.tsx:180:      const response = await fetch(`${apiEndpoint}?${params.toString()}`)
src/components/arranger/reconciliation-tabs/commission-tab.tsx:192:        entity_id: c[`${type}_id`] || c.entity_id,
src/components/arranger/reconciliation-tabs/commission-tab.tsx:193:        entity_name: c[`${type}_name`] || c.entity_name || c.introducer_name || c.partner_name || c.commercial_partner_name,
src/components/arranger/reconciliation-tabs/commission-tab.tsx:194:        entity_email: c[`${type}_email`] || c.entity_email || c.introducer_email || c.partner_email || c.commercial_partner_email,
src/components/arranger/reconciliation-tabs/commission-tab.tsx:201:      console.error(`[CommissionTab:${type}] Error:`, err)
src/components/arranger/reconciliation-tabs/commission-tab.tsx:227:      link.href = `${apiEndpoint}?${params.toString()}`
src/components/arranger/reconciliation-tabs/commission-tab.tsx:228:      link.download = `${type}_reconciliation_${new Date().toISOString().split('T')[0]}.csv`
src/components/arranger/reconciliation-tabs/commission-tab.tsx:266:      const response = await fetch(`/api/staff/fees/commissions/${commission.id}/mark-paid`, {
src/components/arranger/reconciliation-tabs/commission-tab.tsx:376:                  <SelectValue placeholder={`All ${entityPlural.toLowerCase()}`} />
src/components/arranger/reconciliation-tabs/commission-tab.tsx:555:                {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
src/components/arranger/reconciliation-tabs/commission-tab.tsx:570:                  : `No ${entityPlural.toLowerCase()} commissions found yet.`}
src/components/deals/deal-inventory-panel.tsx:57:      const inventoryResponse = await fetch(`/api/deals/${dealId}/inventory`)
src/components/deals/deal-subscriptions-tab.tsx:76:      const response = await fetch(`/api/deals/${dealId}/subscriptions`)
src/components/deals/deal-subscriptions-tab.tsx:113:      window.open(`/versotech_main/subscriptions/${(subscription as any).subscription_id}`, '_blank')
src/components/deals/deal-subscriptions-tab.tsx:116:      window.open(`/api/documents/${subscription.pack_document_id}/download`, '_blank')
src/components/deals/investor-deals-list-client.tsx:467:    return `${currency ?? ''} ${amount.toLocaleString()}`
src/components/deals/investor-deals-list-client.tsx:499:    return `Closed ${closeDate.toLocaleDateString()}`
src/components/deals/investor-deals-list-client.tsx:514:    return `Closes in ${diffDays} days`
src/components/deals/investor-deals-list-client.tsx:517:  return `Closes ${closeDate.toLocaleDateString()}`
src/components/deals/investor-deals-list-client.tsx:971:              {kycStatusLabel ? ` KYC status: ${kycStatusLabel}.` : ''}
src/components/deals/investor-deals-list-client.tsx:1225:                          alt={`${deal.company_name ?? deal.name} logo`}
src/components/deals/investor-deals-list-client.tsx:1273:                      href={`${detailUrlBase}/${deal.id}`}
src/components/deals/investor-deals-list-client.tsx:1275:                      onClick={() => console.log(`[DealsList] CLICKED: "${deal.name}" → navigating to ${detailUrlBase}/${deal.id}`)}
src/components/deals/investor-deals-list-client.tsx:1331:            console.log(`[DealsList] Rendering card #${index}: "${deal.name}" (ID: ${deal.id})`)
src/components/deals/investor-deals-list-client.tsx:1368:                        alt={`${deal.company_name ?? deal.name} logo`}
src/components/deals/investor-deals-list-client.tsx:1449:                          ? `${formatCurrency(feeStructure.price_per_share, deal.currency)} per unit`
src/components/deals/investor-deals-list-client.tsx:1453:                              ? `${formatCurrency(deal.offer_unit_price, deal.currency)} per unit`
src/components/deals/investor-deals-list-client.tsx:1469:                      ? `${(dealCommissions[0].rate_bps / 100).toFixed(2)}%`
src/components/deals/investor-deals-list-client.tsx:1645:                        ? `Opened ${new Date(deal.open_at).toLocaleDateString()}`
src/components/deals/investor-deals-list-client.tsx:1655:                          const url = `${detailUrlBase}/${deal.id}`
src/components/deals/investor-deals-list-client.tsx:1656:                          console.log(`[DealsList] CLICKED: "${deal.name}" (ID: ${deal.id}) → HARD navigating to ${url}`)
src/components/calendar/calendar-view.tsx:84:      className={`overflow-hidden rounded-2xl border shadow-sm ${
src/components/calendar/calendar-view.tsx:89:        className={`space-y-1.5 border-b p-6 ${
src/components/calendar/calendar-view.tsx:93:        <CardTitle className={`text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-foreground'}`}>{title}</CardTitle>
src/components/calendar/calendar-view.tsx:94:        {description && <CardDescription className={`max-w-2xl text-sm ${isLight ? 'text-slate-600' : 'text-muted-foreground'}`}>{description}</CardDescription>}
src/components/calendar/calendar-view.tsx:99:            className={`rounded-2xl border border-dashed p-6 text-center text-sm ${
src/components/calendar/calendar-view.tsx:160:        className={`rounded-2xl border p-5 shadow-sm ${
src/components/calendar/calendar-view.tsx:179:              className={`gap-2 rounded-full px-3 py-1 text-xs ${
src/components/calendar/calendar-view.tsx:194:        className={`space-y-5 rounded-2xl border p-5 shadow-sm ${
src/components/users/add-lawyer-modal.tsx:368:                    id={`spec-${spec}`}
src/components/users/add-lawyer-modal.tsx:373:                    htmlFor={`spec-${spec}`}
src/components/staff/process-trigger.tsx:111:        const response = await fetch(`/api/workflows/${workflowKey}/recent`)
src/components/staff/process-trigger.tsx:134:        newErrors[key] = `${config.label || key} is required`
src/components/staff/process-trigger.tsx:143:        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
src/components/staff/process-trigger.tsx:145:          newErrors[key] = `${config.label || key} must be a valid email`
src/components/staff/process-trigger.tsx:151:          newErrors[key] = `${config.label || key} must be a number`
src/components/staff/process-trigger.tsx:169:      const response = await fetch(`/api/workflows/${workflowKey}/trigger`, {
src/components/staff/process-trigger.tsx:187:      toast.success(`${title} workflow triggered successfully`, {
src/components/staff/process-trigger.tsx:188:        description: `Workflow run ID: ${result.workflow_run_id}`,
src/components/staff/process-trigger.tsx:191:          onClick: () => window.open(`/versotech_main/workflows/${result.workflow_run_id}`, '_blank')
src/components/deals/interest-status-card.tsx:230:            {isApprovalBlocked ? 'Approval required' : `Stage ${currentStage}/10`}
src/components/deals/interest-status-card.tsx:255:              {kycStatusLabel ? ` KYC status: ${kycStatusLabel}.` : ''}
src/components/deals/add-member-modal.tsx:61:      const response = await fetch(`/api/deals/${dealId}/members`, {
src/components/deals/deal-details-modal.tsx:152:    return `${currency ?? ''} ${value.toLocaleString()}`
src/components/deals/deal-details-modal.tsx:279:          (deal.offer_unit_price ? `${formatCurrency(deal.offer_unit_price, deal.currency)} per unit` : '—')
src/components/deals/deal-details-modal.tsx:288:          ? `${termSheet.subscription_fee_percent.toFixed(2)}%`
src/components/deals/deal-details-modal.tsx:295:            ? `${termSheet.management_fee_percent.toFixed(2)}%`
src/components/deals/deal-details-modal.tsx:302:            ? `${termSheet.carried_interest_percent.toFixed(2)}%`
src/components/deals/deal-details-modal.tsx:330:                alt={`${deal.company_name ?? deal.name} logo`}
src/components/deals/deal-details-modal.tsx:534:                  href={`/versotech_main/messages?deal=${deal.id}`}
src/components/deals/submit-subscription-form.tsx:55:        const response = await fetch(`/api/deals/${dealId}/capacity`)
src/components/deals/submit-subscription-form.tsx:115:      const response = await fetch(`/api/deals/${dealId}/subscriptions`, {
src/components/deals/submit-subscription-form.tsx:172:      amountWarnings.push(`Below minimum investment of ${formatAmount(dealCapacity.min_ticket)}`)
src/components/deals/submit-subscription-form.tsx:175:      amountWarnings.push(`Above maximum investment of ${formatAmount(dealCapacity.max_ticket)}`)
src/components/deals/submit-subscription-form.tsx:229:        <Label htmlFor={`subscription-amount-${dealId}`} className="text-base font-semibold">
src/components/deals/submit-subscription-form.tsx:233:          id={`subscription-amount-${dealId}`}
src/components/deals/submit-subscription-form.tsx:258:            id={`bank-confirmation-${dealId}`}
src/components/deals/submit-subscription-form.tsx:263:          <Label htmlFor={`bank-confirmation-${dealId}`} className="text-sm text-foreground font-normal cursor-pointer leading-relaxed">
src/components/deals/submit-subscription-form.tsx:270:        <Label htmlFor={`subscription-notes-${dealId}`} className="text-base font-semibold">Additional Notes (optional)</Label>
src/components/deals/submit-subscription-form.tsx:272:          id={`subscription-notes-${dealId}`}
src/components/staff/requests/request-status-selector.tsx:85:      const response = await fetch(`/api/requests/${requestId}`, {
src/components/staff/requests/request-status-selector.tsx:96:      toast.success(`Status updated to ${REQUEST_STATUS_CONFIG[newStatus].label}`)
src/components/deals/data-room-document-editor.tsx:99:      const response = await fetch(`/api/deals/${dealId}/documents/${documentId}`, {
src/components/deals/request-extension-button.tsx:34:          reason: `Requesting additional time to review ${dealName} data room materials`
src/components/arranger/unified-reconciliation-client.tsx:92:    router.push(`?${params.toString()}`, { scroll: false })
src/components/deals/deal-documents-tab.tsx:47:      const response = await fetch(`/api/deals/${dealId}/documents/${documentId}/download`)
src/components/deals/deal-documents-tab.tsx:75:      const response = await fetch(`/api/deals/${dealId}/documents/${documentId}`, {
src/components/deals/deal-documents-tab.tsx:141:                        {doc.created_by_profile && ` by ${doc.created_by_profile.display_name}`}
src/components/staff/process-center-client.tsx:79:              {profile.title && ` • ${profile.title}`}
src/components/deals/data-room-preview-card.tsx:45:    <Link href={`/versotech_main/opportunities/${deal.id}?tab=data-room`}>
src/components/deals/data-room-preview-card.tsx:52:              alt={`${deal.company_name ?? deal.name} logo`}
src/components/deals/data-room-preview-card.tsx:112:                <span>{access.expires_at ? `Expires ${formatDate(access.expires_at)}` : 'No expiry'}</span>
src/components/documents/staff/cards/DocumentCard.tsx:94:    if (bytes < 1024) return `${bytes} B`
src/components/documents/staff/cards/DocumentCard.tsx:95:    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
src/components/documents/staff/cards/DocumentCard.tsx:96:    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
src/components/deals/reject-commitment-modal.tsx:38:      const response = await fetch(`/api/deals/${dealId}/commitments/${commitmentId}/reject`, {
src/components/deals/deal-detail-client.tsx:120:      const response = await fetch(`/api/deals/${deal.id}/inventory`)
src/components/deals/deal-detail-client.tsx:158:      const response = await fetch(`/api/deals/${deal.id}`, {
src/components/deals/deal-detail-client.tsx:239:              {deal.sector && ` • ${deal.sector}`}
src/components/deals/deal-detail-client.tsx:240:              {deal.location && ` • ${deal.location}`}
src/components/deals/deal-detail-client.tsx:300:              {publishedTermSheet ? `V${publishedTermSheet.version}` : '—'}
src/components/deals/deal-detail-client.tsx:304:                ? `Published ${publishedTermSheet.published_at ? new Date(publishedTermSheet.published_at).toLocaleDateString() : ''}`
src/components/deals/deal-detail-client.tsx:348:      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} id={`deal-tabs-${deal.id}`}>
src/components/deals/approve-commitment-modal.tsx:37:      const response = await fetch(`/api/deals/${dealId}/commitments/${commitmentId}/approve`, {
src/components/users/add-account-modal.tsx:429:              const path = `invite_${err.path.join('.')}`
src/components/users/add-account-modal.tsx:500:          throw new Error(errorData.error || `Failed to create ${config.label.toLowerCase()}`)
src/components/users/add-account-modal.tsx:543:            toast.warning(inviteResult.error || `${config.label} created, but invitation failed to send`)
src/components/users/add-account-modal.tsx:545:            toast.warning(`${config.label} created, but invitation email failed to send`)
src/components/users/add-account-modal.tsx:547:            toast.success(inviteResult.message || `${config.label} created and invitation sent!`)
src/components/users/add-account-modal.tsx:550:          toast.success(`${config.label} created successfully!`)
src/components/users/add-account-modal.tsx:558:          window.location.href = `${config.detailPath}/${createdEntityId}`
src/components/users/add-account-modal.tsx:590:            className={`cursor-pointer transition-all hover:border-primary/50 hover:shadow-md ${
src/components/users/add-account-modal.tsx:597:                <div className={`p-2 rounded-lg ${config.color}`}>
src/components/users/add-account-modal.tsx:632:            <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
src/components/users/add-account-modal.tsx:1065:                {step === 'type' ? 'Add Account' : `New ${entityType ? ENTITY_TYPES[entityType].label : ''}`}
src/components/users/add-account-modal.tsx:1070:                  : `Enter the details for the new ${entityType ? ENTITY_TYPES[entityType].label.toLowerCase() : 'account'}`}
src/components/users/add-account-modal.tsx:1075:            <Badge variant="outline" className={`w-fit ${ENTITY_TYPES[entityType].color}`}>
src/components/staff/requests/request-assignment-dialog.tsx:96:      const response = await fetch(`/api/staff/requests/${requestId}/assign`, {
src/components/staff/requests/request-assignment-dialog.tsx:111:      toast.success(`Request assigned to ${assignedStaff?.display_name || 'staff member'}`)
src/components/staff/requests/request-assignment-dialog.tsx:132:      const response = await fetch(`/api/staff/requests/${requestId}/assign`, {
src/components/deals/fee-management-panel.tsx:74:      const feePlansResponse = await fetch(`/api/deals/${dealId}`)
src/components/deals/fee-management-panel.tsx:82:      const feeEventsResponse = await fetch(`/api/deals/${dealId}/fees/compute`)
src/components/deals/fee-management-panel.tsx:89:      const invoicesResponse = await fetch(`/api/deals/${dealId}/invoices/generate`)
src/components/deals/fee-management-panel.tsx:111:      const response = await fetch(`/api/deals/${dealId}/fees/compute`, {
src/components/deals/fee-management-panel.tsx:124:        toast.success(`Computed ${result.events_created} fee events`)
src/components/deals/fee-management-panel.tsx:142:      const response = await fetch(`/api/deals/${dealId}/invoices/generate`, {
src/components/deals/deal-interest-tab.tsx:65:            href={`/versotech_main/approvals?entity=deal_interest&deal=${dealId}`}
src/components/deals/deal-interest-tab.tsx:92:            href={`/versotech_main/approvals?entity=deal_subscription&deal=${dealId}`}
src/components/deals/deal-interest-tab.tsx:118:                    ? `${currencyCode ? `${currencyCode} ` : ''}${numericAmount.toLocaleString()}`
src/components/deals/deal-interest-tab.tsx:202:                      ? `${interest.indicative_currency ?? ''} ${interest.indicative_amount.toLocaleString()}`
src/components/partners/record-commission-dialog.tsx:210:                    {deal.name} {deal.company_name && `(${deal.company_name})`}
src/components/deals/deal-activity-tab.tsx:92:      const categoryParam = filter !== 'all' ? `&category=${filter}` : ''
src/components/deals/deal-activity-tab.tsx:94:        `/api/deals/${dealId}/activity?limit=${limit}&offset=${currentOffset}${categoryParam}`
src/components/deals/deal-activity-tab.tsx:206:                  : `No ${categoryLabels[filter as keyof typeof categoryLabels]} activities found.`}
src/components/deals/deal-activity-tab.tsx:228:                        className={`flex-shrink-0 w-10 h-10 rounded-full ${bgColor} flex items-center justify-center relative z-10`}
src/components/deals/deal-activity-tab.tsx:230:                        <Icon className={`h-5 w-5 ${iconColor}`} />
src/components/deals/deal-activity-tab.tsx:284:                                    {activity.actor.role && ` (${activity.actor.role})`}
src/components/deals/deal-members-tab.tsx:139:            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
src/components/deals/deal-members-tab.tsx:146:            title={`${stage.label}${value ? ` - ${format(new Date(value), 'MMM d, yyyy')}` : ''}`}
src/components/deals/deal-members-tab.tsx:200:    return `${code ? `${code} ` : ''}${Number(amount).toLocaleString()}`
src/components/deals/deal-members-tab.tsx:213:      const response = await fetch(`/api/deals/${dealId}/partners`)
src/components/deals/deal-members-tab.tsx:239:      const response = await fetch(`/api/deals/${dealId}/partners?fee_plan_id=${feePlanId}`, {
src/components/deals/deal-members-tab.tsx:326:      const response = await fetch(`/api/deals/${dealId}/members`)
src/components/deals/deal-members-tab.tsx:342:      const response = await fetch(`/api/deals/${dealId}/members/${userId}`, {
src/components/deals/deal-members-tab.tsx:350:        alert(`Failed to remove member: ${data.error || 'Unknown error'}`)
src/components/deals/deal-members-tab.tsx:452:                Investors ({filteredMembers.length}{feePlanFilter !== 'all' ? ` of ${enhancedMembers.length}` : ''})
src/components/deals/deal-members-tab.tsx:515:                              className={`text-xs mt-1 ${
src/components/deals/deal-members-tab.tsx:547:                            <Badge className={`text-[10px] w-fit ${feePlanStatusClasses[feePlan.status] || 'bg-muted text-muted-foreground'}`}>
src/components/deals/deal-members-tab.tsx:573:                                <a href={`/versotech_main/investors/${investor.id}`}>
src/components/deals/deal-members-tab.tsx:580:                              <DropdownMenuItem onClick={() => window.location.href = `mailto:${profile.email}`}>
src/components/deals/deal-members-tab.tsx:653:                                  {feeKindLabels[fc.kind] || fc.kind}: {fc.rate_bps !== null && fc.rate_bps !== undefined ? `${fc.rate_bps / 100}%` : formatFlatAmount(fc.flat_amount, fc.currency)}
src/components/users/invite-user-dialog.tsx:165:      toast.success(result.message || `User invited to ${entityName}`)
src/components/staff/arrangers/arranger-kyc-dialog.tsx:40:        const response = await fetch(`/api/admin/arrangers/${arranger.id}`, {
src/components/staff/arrangers/arranger-kyc-dialog.tsx:94:              <Badge className={`capitalize ${currentConfig.color}`}>
src/components/deals/ask-question-button.tsx:40:          subject: `Question about ${dealName}`,
src/components/deals/ask-question-button.tsx:44:          initial_message: `Hi, I have a question about the ${dealName} deal.`
src/components/deals/ask-question-button.tsx:51:        throw new Error(errorData.error || `Failed to create conversation (${response.status})`)
src/components/deals/ask-question-button.tsx:57:      router.push(`/versotech_main/messages?conversation=${conversation.id}`)
src/components/documents/staff/layout/StaffDocumentsLayout.tsx:130:            `${sizeErrors.length} file(s) exceed 50MB limit: ${sizeErrors
src/components/documents/staff/layout/StaffDocumentsLayout.tsx:138:            `Unsupported file type(s): ${typeErrors
src/components/deals/deal-faq-section.tsx:21:      const res = await fetch(`/api/deals/${dealId}/faqs`)
src/components/deals/deal-faq-section.tsx:23:        throw new Error(`HTTP ${res.status}`)
src/components/deals/subscription-status-card.tsx:208:    dealName ? `Subscription pack clarification - ${dealName}` : 'Subscription pack clarification'
src/components/users/batch-invite-dialog.tsx:191:      toast.success(`Parsed ${newInvites.length} invites from CSV`)
src/components/users/batch-invite-dialog.tsx:217:        toast.success(`Successfully invited ${result.successful} users`)
src/components/users/batch-invite-dialog.tsx:219:        toast.warning(`Invited ${result.successful} users, ${result.failed} failed`)
src/components/users/batch-invite-dialog.tsx:279:                    className={`flex items-center justify-between p-3 rounded-lg ${
src/components/users/batch-invite-dialog.tsx:327:              ? `Invite multiple users to ${existingEntityName}`
src/components/users/batch-invite-dialog.tsx:421:                        aria-label={`Invite ${index + 1}`}
src/components/users/batch-invite-dialog.tsx:424:                          <label htmlFor={`invite-email-${index}`} className="sr-only">
src/components/users/batch-invite-dialog.tsx:428:                            id={`invite-email-${index}`}
src/components/users/batch-invite-dialog.tsx:430:                            {...register(`invites.${index}.email`)}
src/components/users/batch-invite-dialog.tsx:433:                            aria-describedby={errors.invites?.[index]?.email ? `email-error-${index}` : undefined}
src/components/users/batch-invite-dialog.tsx:436:                            <p id={`email-error-${index}`} className="text-xs text-red-500 mt-1" role="alert">
src/components/users/batch-invite-dialog.tsx:442:                          <label htmlFor={`invite-name-${index}`} className="sr-only">
src/components/users/batch-invite-dialog.tsx:446:                            id={`invite-name-${index}`}
src/components/users/batch-invite-dialog.tsx:448:                            {...register(`invites.${index}.display_name`)}
src/components/users/batch-invite-dialog.tsx:454:                          value={watch(`invites.${index}.role`) || 'member'}
src/components/users/batch-invite-dialog.tsx:455:                          onValueChange={(value) => setValue(`invites.${index}.role`, value)}
src/components/users/batch-invite-dialog.tsx:457:                          <SelectTrigger className="w-[100px]" aria-label={`Role for invite ${index + 1}`}>
src/components/users/batch-invite-dialog.tsx:474:                          aria-label={`Remove invite ${index + 1}`}
src/components/deals/deal-fee-plans-tab.tsx:28:      const response = await fetch(`/api/storage/download?path=${encodeURIComponent(pdfUrl)}&bucket=deal-documents`)
src/components/deals/deal-fee-plans-tab.tsx:37:      const actualFilename = pdfUrl.split('/').pop() || `${referenceNumber || 'agreement'}.pdf`
src/components/deals/deal-fee-plans-tab.tsx:55:      const response = await fetch(`/api/storage/download?path=${encodeURIComponent(pdfUrl)}&bucket=deal-documents`)
src/components/deals/deal-fee-plans-tab.tsx:98:      ? `${currencyCode ? `${currencyCode} ` : ''}${Number(component.flat_amount).toLocaleString()}`
src/components/deals/deal-fee-plans-tab.tsx:101:      return component.flat_amount != null ? `${flatAmountDisplay} / share` : '—'
src/components/deals/deal-fee-plans-tab.tsx:104:      return `${Number(component.rate_bps) / 100}%`
src/components/deals/deal-fee-plans-tab.tsx:208:      const res = await fetch(`/api/staff/fees/plans/${plan.id}/generate-agreement`, {
src/components/deals/deal-fee-plans-tab.tsx:214:        alert(`Failed to generate agreement: ${data.error || 'Unknown error'}`)
src/components/deals/deal-fee-plans-tab.tsx:234:      const res = await fetch(`/api/staff/fees/plans/${plan.id}/generate-placement-agreement`, {
src/components/deals/deal-fee-plans-tab.tsx:240:        alert(`Failed to generate placement agreement: ${data.error || 'Unknown error'}`)
src/components/staff/process-drawer.tsx:97:        const response = await fetch(`/api/workflows/${workflow.key}/recent`)
src/components/staff/process-drawer.tsx:133:        newErrors[key] = `${config.label || key} is required`
src/components/staff/process-drawer.tsx:142:        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
src/components/staff/process-drawer.tsx:144:          newErrors[key] = `${config.label || key} must be a valid email`
src/components/staff/process-drawer.tsx:150:          newErrors[key] = `${config.label || key} must be a number`
src/components/staff/process-drawer.tsx:168:      const response = await fetch(`/api/workflows/${workflow.key}/trigger`, {
src/components/staff/process-drawer.tsx:186:      toast.success(`${workflow.title} workflow triggered successfully`, {
src/components/staff/process-drawer.tsx:187:        description: `Workflow run ID: ${result.workflow_run_id}`,
src/components/staff/process-drawer.tsx:249:          description: `Response in ${result.duration_ms}ms`
src/components/staff/process-drawer.tsx:253:          description: `Status: ${result.status} ${result.status_text || ''}`
src/components/deals/add-share-lot-modal.tsx:49:      const response = await fetch(`/api/deals/${dealId}/inventory`, {
src/components/partners/partner-detail-drawer.tsx:128:      const response = await fetch(`/api/arrangers/me/partners/${partnerId}`)
src/components/partners/partner-detail-drawer.tsx:199:                    {data.partner.country && ` • ${data.partner.country}`}
src/components/partners/partner-detail-drawer.tsx:266:                        <a href={`mailto:${data.partner.contact_email}`} className="text-primary hover:underline">
src/components/partners/partner-detail-drawer.tsx:306:                              <Link href={`/versotech_main/opportunities/${deal.id}`}>
src/components/partners/partner-detail-drawer.tsx:353:                                {comp.kind}: {comp.rate_bps ? `${(comp.rate_bps / 100).toFixed(2)}%` : comp.flat_amount ? `$${comp.flat_amount}` : 'N/A'}
src/components/partners/partner-detail-drawer.tsx:363:                            {plan.effective_until && ` to ${formatDate(plan.effective_until)}`}
src/components/partners/partner-detail-drawer.tsx:421:                                {activity.deal?.company_name && `${activity.deal.company_name} • `}
src/components/staff/arrangers/edit-arranger-dialog.tsx:59:        const response = await fetch(`/api/admin/arrangers/${arranger.id}`, {
src/components/staff/requests/request-priority-selector.tsx:61:      const response = await fetch(`/api/requests/${requestId}`, {
src/components/staff/requests/request-priority-selector.tsx:73:      toast.success(`Priority updated to ${PRIORITY_CONFIG[newPriority].label}`)
src/components/staff/process-form-builder.tsx:304:                          {conversation.name || conversation.subject || `Conversation ${conversation.id.slice(0, 8)}`}
src/components/staff/requests/request-management-page.tsx:215:    router.replace(query ? `?${query}` : '?', { scroll: false })
src/components/staff/requests/request-management-page.tsx:235:      const response = await fetch(`/api/staff/requests${params.size ? `?${params.toString()}` : ''}`, {
src/components/staff/requests/request-management-page.tsx:251:            parts.push(`Hint: ${details.hint.trim()}`)
src/components/staff/requests/request-management-page.tsx:254:            parts.push(`Code: ${details.code.trim()}`)
src/components/staff/requests/request-management-page.tsx:278:        throw new Error(`${message} (status ${response.status})`)
src/components/staff/requests/request-management-page.tsx:985:          subject: `Request ${request.id}: ${request.subject}`,
src/components/staff/requests/request-management-page.tsx:988:          initial_message: `Context: request ${request.id} (${request.category || 'general'}) - ${request.subject}`,
src/components/staff/requests/request-management-page.tsx:996:          window.location.href = `/versotech_main/messages/${convId}`
src/components/staff/requests/request-management-page.tsx:1178:  return `${id.slice(0, 6)}…${id.slice(-4)}`
src/components/staff/lawyers/lawyer-detail-client.tsx:166:                  : `ID: ${lawyer.id.slice(0, 8)}`
src/components/staff/lawyers/lawyer-detail-client.tsx:248:      <Tabs defaultValue="overview" className="space-y-6" id={`lawyer-tabs-${lawyer.id}`}>
src/components/staff/lawyers/lawyer-detail-client.tsx:506:                      href={`/versotech_main/deals/${deal.id}`}
src/components/staff/lawyers/lawyer-detail-client.tsx:561:          apiEndpoint={`/api/admin/lawyers/${lawyer.id}`}
src/components/staff/lawyers/add-lawyer-dialog.tsx:249:                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
src/components/staff/arrangers/arranger-detail-client.tsx:170:                ? `${arranger.regulator}: ${arranger.license_number}`
src/components/staff/arrangers/arranger-detail-client.tsx:171:                : `Arranger ID: ${arranger.id.slice(0, 8)}`
src/components/staff/arrangers/arranger-detail-client.tsx:248:      <Tabs defaultValue="overview" className="space-y-6" id={`arranger-tabs-${arranger.id}`}>
src/components/staff/arrangers/arranger-detail-client.tsx:505:                      href={`/versotech_main/deals/${deal.id}`}
src/components/staff/arrangers/arranger-detail-client.tsx:603:          apiEndpoint={`/api/admin/arrangers/${arranger.id}`}
src/components/staff/shared/staff-entity-members-tab.tsx:154:  const apiEndpoint = `/api/staff/${apiPath}/${entityId}/members`
src/components/staff/shared/staff-entity-members-tab.tsx:202:      const response = await fetch(`${apiEndpoint}/${deletingMember.id}`, {
src/components/staff/shared/staff-entity-members-tab.tsx:425:              <div className={`text-2xl font-bold ${pendingKYC > 0 ? 'text-amber-500' : 'text-green-500'}`}>
src/components/staff/arrangers/arrangers-dashboard.tsx:137:          secondary={`${summary.totalEntities} total`}
src/components/staff/arrangers/arrangers-dashboard.tsx:143:          secondary={`${summary.totalEntities - summary.kycApproved} pending`}
src/components/staff/arrangers/arrangers-dashboard.tsx:156:          secondary={`${summary.totalVehicles} vehicles`}
src/components/staff/arrangers/arrangers-dashboard.tsx:363:            <Stat label="Deals" value={arranger.totalDeals} subtitle={`${arranger.activeDeals} active`} />
src/components/staff/commercial-partners/commercial-partner-detail-client.tsx:167:              {partner.jurisdiction && ` • ${partner.jurisdiction}`}
src/components/staff/commercial-partners/commercial-partner-detail-client.tsx:243:      <Tabs defaultValue="overview" className="space-y-6" id={`commercial-partner-tabs-${partner.id}`}>
src/components/staff/commercial-partners/commercial-partner-detail-client.tsx:331:                    <a href={`mailto:${partner.contact_email}`} className="text-primary hover:underline">
src/components/staff/commercial-partners/commercial-partner-detail-client.tsx:550:          apiEndpoint={`/api/admin/commercial-partners/${partner.id}`}
src/components/staff/arrangers/arranger-documents-dialog.tsx:52:      const response = await fetch(`/api/documents?arranger_entity_id=${arranger.id}&limit=100`)
src/components/staff/arrangers/arranger-documents-dialog.tsx:103:      formData.append('name', file.name.replace(/\.[^/.]+$/, '')) // Remove extension
src/components/staff/arrangers/arranger-documents-dialog.tsx:116:      toast.success(`${docTypeLabel} uploaded successfully`)
src/components/staff/arrangers/arranger-documents-dialog.tsx:133:    if (!confirm(`Delete "${document.name}"? This action cannot be undone.`)) {
src/components/staff/arrangers/arranger-documents-dialog.tsx:138:      const response = await fetch(`/api/staff/documents/${document.id}`, {
src/components/staff/arrangers/arranger-documents-dialog.tsx:159:      const response = await fetch(`/api/documents/${doc.id}/download`)
src/components/staff/arrangers/arranger-documents-dialog.tsx:184:    if (bytes < 1024) return `${bytes} B`
src/components/staff/arrangers/arranger-documents-dialog.tsx:185:    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
src/components/staff/arrangers/arranger-documents-dialog.tsx:186:    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
src/components/documents/staff/context/StaffDocumentsContext.tsx:1545:      const response = await fetch(`/api/staff/documents?${params.toString()}`)
src/components/documents/staff/context/StaffDocumentsContext.tsx:1565:      const response = await fetch(`/api/deals?vehicle_id=${vehicleId}`)
src/components/documents/staff/context/StaffDocumentsContext.tsx:1613:      const response = await fetch(`/api/deals/${dealId}/investors`)
src/components/documents/staff/context/StaffDocumentsContext.tsx:1674:      const response = await fetch(`${endpoint}?${params.toString()}`)
src/components/documents/staff/context/StaffDocumentsContext.tsx:1737:        fetch(`/api/staff/documents?${baseParams.toString()}`),
src/components/documents/staff/context/StaffDocumentsContext.tsx:1738:        dealId ? fetch(`/api/staff/documents?${accountParams.toString()}`) : Promise.resolve(null),
src/components/documents/staff/context/StaffDocumentsContext.tsx:1740:          ? fetch(`/api/introducer-agreements?introducer_id=${investorId}`)
src/components/documents/staff/context/StaffDocumentsContext.tsx:1776:            id: `introducer_agreement:${agreement.id}`,
src/components/documents/staff/context/StaffDocumentsContext.tsx:1806:      const key = `${investorType}:${investorId}:${dealId || 'all'}`
src/components/documents/staff/context/StaffDocumentsContext.tsx:1820:      const response = await fetch(`/api/staff/documents/data-room/${dealId}`)
src/components/documents/staff/context/StaffDocumentsContext.tsx:1847:      const response = await fetch(`/api/staff/documents/search?${params.toString()}`)
src/components/documents/staff/context/StaffDocumentsContext.tsx:1915:      const response = await fetch(`/api/staff/documents/${documentId}`, {
src/components/documents/staff/context/StaffDocumentsContext.tsx:1922:        toast.success(`Document moved to ${folderName}`)
src/components/documents/staff/context/StaffDocumentsContext.tsx:1926:        toast.error(`Failed to move document: ${errorData.error}`)
src/components/documents/staff/context/StaffDocumentsContext.tsx:1941:      const response = await fetch(`/api/staff/documents/${documentId}`, {
src/components/documents/staff/context/StaffDocumentsContext.tsx:1965:      const response = await fetch(`/api/staff/documents/${documentId}`, {
src/components/documents/staff/context/StaffDocumentsContext.tsx:2021:      const response = await fetch(`/api/staff/documents/folders/${folderId}`, {
src/components/documents/staff/context/StaffDocumentsContext.tsx:2044:      const response = await fetch(`/api/staff/documents/folders/${folderId}`, {
src/components/documents/staff/context/StaffDocumentsContext.tsx:2105:      toast.success(`Downloaded ${documentIds.length} document(s) as ZIP`)
src/components/staff/lawyers/lawyers-dashboard.tsx:232:                  href={`/versotech_main/lawyers/${lawyer.id}`}
src/components/staff/lawyers/lawyers-dashboard.tsx:244:                          {lawyer.country && ` • ${lawyer.country}`}
src/components/staff/lawyers/lawyers-dashboard.tsx:274:                          <Badge className={`ml-2 ${kycStyles[lawyer.kycStatus] || 'bg-gray-500/20 text-gray-400'}`}>
src/components/documents/folder-tree.tsx:97:          style={{ paddingLeft: `${level * 16 + 8}px` }}
src/components/staff/introducers/edit-introduction-dialog.tsx:95:        const response = await fetch(`/api/staff/introductions/${introduction.id}`, {
src/components/staff/introducers/edit-introduction-dialog.tsx:108:            toast.error(`Failed to update introduction: ${text || 'Unknown error'}`)
src/components/staff/introducers/edit-introduction-dialog.tsx:113:            toast.error(`Validation failed: ${JSON.stringify(data.details.fieldErrors || data.details)}`)
src/components/staff/introducers/edit-introduction-dialog.tsx:138:        const response = await fetch(`/api/staff/introductions/${introduction.id}`, {
src/components/staff/commercial-partners/edit-commercial-partner-dialog.tsx:145:        const response = await fetch(`/api/admin/commercial-partners/${partner.id}`, {
src/components/staff/partners/partner-detail-client.tsx:188:      const response = await fetch(`/api/partners/${partner.id}/fee-plans`)
src/components/staff/partners/partner-detail-client.tsx:204:      const response = await fetch(`/api/partners/${partner.id}/referred-investors`)
src/components/staff/partners/partner-detail-client.tsx:277:                {partner.country && ` • ${partner.country}`}
src/components/staff/partners/partner-detail-client.tsx:364:      <Tabs defaultValue="overview" className="space-y-6" id={`partner-tabs-${partner.id}`}>
src/components/staff/partners/partner-detail-client.tsx:679:                      onClick={() => feePlan.deal?.id && router.push(`/versotech_main/deals/${feePlan.deal.id}?tab=fees`)}
src/components/staff/partners/partner-detail-client.tsx:682:                        <div className={`p-2.5 rounded-lg ${feePlan.status === 'accepted' ? 'bg-green-500/20' : 'bg-slate-500/20'}`}>
src/components/staff/partners/partner-detail-client.tsx:683:                          <FileCheck className={`h-5 w-5 ${feePlan.status === 'accepted' ? 'text-green-400' : 'text-slate-400'}`} />
src/components/staff/partners/partner-detail-client.tsx:750:                        router.push(`/versotech_main/deals/${refInvestor.deal.id}?tab=members`)
src/components/staff/partners/partner-detail-client.tsx:752:                        router.push(`/versotech_main/investors/${refInvestor.investor.id}`)
src/components/staff/partners/partner-detail-client.tsx:851:          apiEndpoint={`/api/admin/partners/${partner.id}`}
src/components/staff/lawyers/edit-lawyer-dialog.tsx:142:        const response = await fetch(`/api/admin/lawyers/${lawyer.id}`, {
src/components/staff/lawyers/edit-lawyer-dialog.tsx:339:                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
src/components/documents/bulk-delete-dialog.tsx:53:          const response = await fetch(`/api/staff/documents/${docId}`, {
src/components/documents/bulk-delete-dialog.tsx:69:        toast.success(`Deleted ${successCount} document${successCount !== 1 ? 's' : ''}`)
src/components/documents/bulk-delete-dialog.tsx:73:        toast.warning(`Deleted ${successCount} document${successCount !== 1 ? 's' : ''}, ${failCount} failed`)
src/components/staff/commercial-partners/commercial-partners-dashboard.tsx:270:                  href={`/versotech_main/commercial-partners/${partner.id}`}
src/components/staff/commercial-partners/commercial-partners-dashboard.tsx:282:                          {partner.jurisdiction && ` • ${partner.jurisdiction}`}
src/components/staff/commercial-partners/commercial-partners-dashboard.tsx:304:                          <Badge className={`ml-2 ${kycStyles[partner.kycStatus] || 'bg-gray-500/20 text-gray-400'}`}>
src/components/staff/partners/add-partner-dialog.tsx:276:                <Label htmlFor="investmentMin">Min Investment ($)</Label>
src/components/staff/partners/add-partner-dialog.tsx:287:                <Label htmlFor="investmentMax">Max Investment ($)</Label>
src/components/staff/partners/add-partner-dialog.tsx:308:                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
src/components/staff/partners/edit-partner-dialog.tsx:161:        const response = await fetch(`/api/admin/partners/${partner.id}`, {
src/components/staff/partners/edit-partner-dialog.tsx:379:                <Label htmlFor="investmentMin">Min Investment ($)</Label>
src/components/staff/partners/edit-partner-dialog.tsx:389:                <Label htmlFor="investmentMax">Max Investment ($)</Label>
src/components/staff/partners/edit-partner-dialog.tsx:407:                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
src/components/staff/partners/dispatch-partner-investor-dialog.tsx:181:          `/api/deals/${dealId}/linkable-investors?term_sheet_id=${termSheetId}`,
src/components/staff/partners/dispatch-partner-investor-dialog.tsx:223:        `/api/deals/${selectedFeePlan.deal.id}/members/${selectedInvestorId}`,
src/components/documents/navigation/FolderTreeDrawer.tsx:228:        style={{ paddingLeft: `${level * 16 + 8}px` }}
src/components/staff/introducers/introducers-dashboard.tsx:138:    toast.info(`To dispatch an investor through ${introducer.legalName}, go to a deal's Members tab and use "Add Participant"`)
src/components/staff/introducers/introducers-dashboard.tsx:179:          secondary={`${summary.totalIntroducers} total`}
src/components/staff/introducers/introducers-dashboard.tsx:185:          secondary={`${summary.totalAllocations} allocated`}
src/components/staff/introducers/introducers-dashboard.tsx:393:              <Link href={`/versotech_main/introducers/${introducer.id}`}>
src/components/staff/introducers/introducers-dashboard.tsx:505:        const response = await fetch(`/api/staff/introductions/${introduction.id}`, {
src/components/staff/introducers/introducers-dashboard.tsx:556:            {introduction.commissionStatus ? `Status: ${introduction.commissionStatus}` : 'Awaiting accrual'}
src/components/documents/DocumentViewerFullscreen.tsx:59:  return `${url}#navpanes=0&view=FitH&pagemode=none`
src/components/documents/navigation/FolderCard.tsx:106:      aria-label={`Navigate to folder ${folder.name}`}
src/components/staff/introducers/add-introduction-dialog.tsx:55:          .or(`expiry_date.is.null,expiry_date.gte.${today}`)
src/components/staff/introducers/add-introduction-dialog.tsx:131:            toast.error(`Failed to create introduction: ${text || 'Unknown error'}`)
src/components/staff/introducers/add-introduction-dialog.tsx:136:            toast.error(`Validation failed: ${JSON.stringify(data.details.fieldErrors || data.details)}`)
src/components/staff/introducers/add-introduction-dialog.tsx:203:                    href={`/versotech_main/introducers/${introducerId}?tab=agreements`}
src/components/staff/partners/partners-dashboard.tsx:269:                  href={`/versotech_main/partners/${partner.id}`}
src/components/staff/partners/partners-dashboard.tsx:281:                          {partner.country && ` • ${partner.country}`}
src/components/staff/partners/partners-dashboard.tsx:320:                          <Badge className={`ml-2 ${kycStyles[partner.kycStatus] || 'bg-gray-500/20 text-gray-400'}`}>
src/components/documents/categorized-documents-client.tsx:323:                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getCategoryColor(category.color)}`}
src/components/documents/categorized-documents-client.tsx:325:                              <Icon className={`h-4 w-4 ${getCategoryIconColor(category.color)}`} />
src/components/documents/categorized-documents-client.tsx:453:          const categoryKey = `${selectedHolding}-${categoryId}`
src/components/documents/categorized-documents-client.tsx:468:                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(category.color)} border`}>
src/components/documents/categorized-documents-client.tsx:470:                      <FolderOpen className={`h-5 w-5 ${getCategoryIconColor(category.color)}`} />
src/components/documents/categorized-documents-client.tsx:472:                      <Icon className={`h-5 w-5 ${getCategoryIconColor(category.color)}`} />
src/components/documents/version-history-sheet.tsx:87:      const response = await fetch(`/api/staff/documents/${documentId}/versions`)
src/components/documents/version-history-sheet.tsx:108:      const response = await fetch(`/api/documents/${documentId}/download?file_key=${encodeURIComponent(version.file_key)}`)
src/components/documents/version-history-sheet.tsx:117:      toast.success(`Downloading version ${version.version_number}`)
src/components/documents/version-history-sheet.tsx:202:                      ${isCurrent
src/components/staff/introducers/introducer-detail-client.tsx:282:      const response = await fetch(`/api/storage/download?path=${encodeURIComponent(pdfUrl)}&bucket=deal-documents`)
src/components/staff/introducers/introducer-detail-client.tsx:293:      const actualFilename = pdfUrl.split('/').pop() || `${referenceNumber || 'agreement'}.pdf`
src/components/staff/introducers/introducer-detail-client.tsx:313:      const response = await fetch(`/api/storage/download?path=${encodeURIComponent(pdfUrl)}&bucket=deal-documents`)
src/components/staff/introducers/introducer-detail-client.tsx:347:      return component.flat_amount != null ? `$${Number(component.flat_amount).toLocaleString()} / share` : '—'
src/components/staff/introducers/introducer-detail-client.tsx:350:      return `${Number(component.rate_bps) / 100}%`
src/components/staff/introducers/introducer-detail-client.tsx:353:      return `$${Number(component.flat_amount).toLocaleString()}`
src/components/staff/introducers/introducer-detail-client.tsx:362:      const response = await fetch(`/api/introducers/${introducer.id}/fee-plans`)
src/components/staff/introducers/introducer-detail-client.tsx:378:      const response = await fetch(`/api/introducers/${introducer.id}/referred-investors`)
src/components/staff/introducers/introducer-detail-client.tsx:484:      const response = await fetch(`/api/introducer-agreements/${agreementId}/send`, {
src/components/staff/introducers/introducer-detail-client.tsx:665:      <Tabs defaultValue="overview" className="space-y-6" id={`introducer-tabs-${introducer.id}`}>
src/components/staff/introducers/introducer-detail-client.tsx:732:                      <a href={`mailto:${introducer.email}`} className="text-sm font-medium text-blue-400 hover:underline">
src/components/staff/introducers/introducer-detail-client.tsx:865:                        className={`rounded-xl border transition-all ${
src/components/staff/introducers/introducer-detail-client.tsx:877:                            <div className={`p-2.5 rounded-lg ${feePlan.status === 'accepted' ? 'bg-green-500/20' : 'bg-slate-500/20'}`}>
src/components/staff/introducers/introducer-detail-client.tsx:878:                              <FileCheck className={`h-5 w-5 ${feePlan.status === 'accepted' ? 'text-green-400' : 'text-slate-400'}`} />
src/components/staff/introducers/introducer-detail-client.tsx:998:                                            fetch(`/api/storage/download?path=${encodeURIComponent(feePlan.introducer_agreement!.pdf_url!)}&bucket=deal-documents`)
src/components/staff/introducers/introducer-detail-client.tsx:1060:                                    router.push(`/versotech_main/deals/${feePlan.deal?.id}?tab=fees`)
src/components/staff/introducers/introducer-detail-client.tsx:1128:                      onClick={() => router.push(`/versotech_main/deals/${refInvestor.deal?.id}?tab=members`)}
src/components/staff/introducers/introducer-detail-client.tsx:1219:                          ${isActive
src/components/staff/introducers/introducer-detail-client.tsx:1223:                        onClick={() => router.push(`/versotech_main/introducer-agreements/${agreement.id}`)}
src/components/staff/introducers/introducer-detail-client.tsx:1227:                          <div className={`p-2.5 rounded-lg ${statusStyle.bg}`}>
src/components/staff/introducers/introducer-detail-client.tsx:1228:                            <FileSignature className={`h-5 w-5 ${statusStyle.text}`} />
src/components/staff/introducers/introducer-detail-client.tsx:1233:                                {agreement.reference_number || `Agreement ${agreement.id.slice(0, 8)}`}
src/components/staff/introducers/introducer-detail-client.tsx:1287:                          <Badge className={`${statusStyle.bg} ${statusStyle.text} gap-1.5 font-medium`}>
src/components/staff/introducers/introducer-detail-client.tsx:1368:                          {intro.introduced_at && ` • ${formatDate(intro.introduced_at)}`}
src/components/staff/introducers/introducer-detail-client.tsx:1416:                          {comm.paid_at && ` • Paid ${formatDate(comm.paid_at)}`}
src/components/staff/introducers/introducer-detail-client.tsx:1496:          apiEndpoint={`/api/admin/introducers/${introducer.id}`}
src/components/documents/legacy/folder-tree.tsx:97:          style={{ paddingLeft: `${level * 16 + 8}px` }}
src/components/staff/introducers/dispatch-introducer-investor-dialog.tsx:191:          `/api/deals/${dealId}/linkable-investors?term_sheet_id=${termSheetId}`,
src/components/staff/introducers/dispatch-introducer-investor-dialog.tsx:237:        `/api/deals/${selectedFeePlan.deal.id}/members/${selectedInvestorId}`,
src/components/documents/navigation/StaffDocumentsBreadcrumb.tsx:152:          id: `deal-${deal.id}`,
src/components/documents/navigation/StaffDocumentsBreadcrumb.tsx:163:        id: `data-room-${navigation.dataRoomDealId}`,
src/components/documents/navigation/StaffDocumentsBreadcrumb.tsx:165:        name: `Data Room: ${navigation.dataRoomDealName}`,
src/components/documents/navigation/StaffDocumentsBreadcrumb.tsx:200:        id: `participant-${navigation.selectedInvestorId}`,
src/components/documents/navigation/StaffDocumentsBreadcrumb.tsx:211:          id: `participant-doc-${navigation.selectedInvestorDocType}`,
src/components/documents/navigation/FolderBreadcrumbs.tsx:56:      accumulatedPath += `/${segment}`
src/components/staff/introducers/edit-introducer-dialog.tsx:71:        const response = await fetch(`/api/staff/introducers/${introducer.id}`, {
src/components/staff/introducers/edit-introducer-dialog.tsx:110:        const response = await fetch(`/api/staff/introducers/${introducer.id}`, {
src/components/staff/introducers/edit-introducer-dialog.tsx:121:            toast.error(`Failed to delete introducer: ${text || 'Unknown error'}`)
src/components/documents/staff/sidebar/AccountsTree.tsx:147:            id={`account-group-${group.type}`}
src/components/documents/staff/sidebar/AccountsTree.tsx:166:                    const accountKey = `${account.entity_type}:${account.id}`
src/components/documents/staff/sidebar/AccountsTree.tsx:172:                    const docTypeKey = `${account.entity_type}:${account.id}:all`
src/components/documents/staff/sidebar/AccountsTree.tsx:201:                              key={`all-${accountKey}`}
src/components/documents/staff/sidebar/AccountsTree.tsx:203:                              id={`all-${accountKey}`}
src/components/documents/staff/sidebar/AccountsTree.tsx:211:                                key={`${accountKey}-${docType}`}
src/components/documents/staff/sidebar/AccountsTree.tsx:213:                                id={`${accountKey}-${docType}`}
src/components/documents/navigation/FolderNavigator.tsx:385:                {isSearching ? 'Searching...' : `${searchTotal} result${searchTotal !== 1 ? 's' : ''}`}
src/components/documents/navigation/FolderNavigator.tsx:1018:      const response = await fetch(`/api/documents/${document.id}/download`)
src/components/documents/navigation/FolderNavigator.tsx:1060:            aria-label={`Select ${displayName}`}
src/components/documents/staff/sidebar/DealTree.tsx:286:          ? `${deal.name} · ${deal.vehicle_name}`
src/components/documents/staff/sidebar/DealTree.tsx:307:                  key={`dataroom-${deal.id}`}
src/components/documents/staff/sidebar/DealTree.tsx:309:                  id={`dataroom-${deal.id}`}
src/components/documents/staff/sidebar/DealTree.tsx:327:                  key={`investors-${deal.id}`}
src/components/documents/staff/sidebar/DealTree.tsx:329:                  id={`investors-${deal.id}`}
src/components/documents/staff/sidebar/DealTree.tsx:351:                          const docTypeKey = `${investor.entity_type}:${investor.id}:${deal.id}`
src/components/documents/staff/sidebar/DealTree.tsx:361:                              key={`${investor.entity_type}-${investor.id}`}
src/components/documents/staff/sidebar/DealTree.tsx:363:                              id={`${investor.entity_type}-${investor.id}`}
src/components/documents/staff/sidebar/DealTree.tsx:381:                                    key={`all-${investor.entity_type}-${investor.id}`}
src/components/documents/staff/sidebar/DealTree.tsx:383:                                    id={`all-${investor.entity_type}-${investor.id}`}
src/components/documents/staff/sidebar/DealTree.tsx:391:                                      key={`${investor.entity_type}-${investor.id}-${docType}`}
src/components/documents/staff/sidebar/DealTree.tsx:393:                                      id={`${investor.entity_type}-${investor.id}-${docType}`}
src/components/documents/staff/sidebar/DealTree.tsx:411:                  key={`introducers-${deal.id}`}
src/components/documents/staff/sidebar/DealTree.tsx:413:                  id={`introducers-${deal.id}`}
src/components/documents/staff/sidebar/DealTree.tsx:435:                          const docTypeKey = `${introducer.entity_type}:${introducer.id}:${deal.id}`
src/components/documents/staff/sidebar/DealTree.tsx:445:                              key={`${introducer.entity_type}-${introducer.id}`}
src/components/documents/staff/sidebar/DealTree.tsx:447:                              id={`${introducer.entity_type}-${introducer.id}`}
src/components/documents/staff/sidebar/DealTree.tsx:465:                                    key={`all-${introducer.entity_type}-${introducer.id}`}
src/components/documents/staff/sidebar/DealTree.tsx:467:                                    id={`all-${introducer.entity_type}-${introducer.id}`}
src/components/documents/staff/sidebar/DealTree.tsx:475:                                      key={`${introducer.entity_type}-${introducer.id}-${docType}`}
src/components/documents/staff/sidebar/DealTree.tsx:477:                                      id={`${introducer.entity_type}-${introducer.id}-${docType}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:382:                  key={`deals-${node.id}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:384:                  id={`deals-${node.id}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:436:                                    key={`dataroom-${deal.id}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:438:                                    id={`dataroom-${deal.id}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:457:                                    key={`investors-${deal.id}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:459:                                    id={`investors-${deal.id}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:481:                                            const docTypeKey = `${investor.entity_type}:${investor.id}:${deal.id}`
src/components/documents/staff/sidebar/VehicleTree.tsx:491:                                                key={`${investor.entity_type}-${investor.id}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:493:                                                id={`${investor.entity_type}-${investor.id}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:511:                                                      key={`all-${investor.entity_type}-${investor.id}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:513:                                                      id={`all-${investor.entity_type}-${investor.id}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:521:                                                        key={`${investor.entity_type}-${investor.id}-${docType}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:523:                                                        id={`${investor.entity_type}-${investor.id}-${docType}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:541:                                    key={`introducers-${deal.id}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:543:                                    id={`introducers-${deal.id}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:565:                                            const docTypeKey = `${introducer.entity_type}:${introducer.id}:${deal.id}`
src/components/documents/staff/sidebar/VehicleTree.tsx:575:                                                key={`${introducer.entity_type}-${introducer.id}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:577:                                                id={`${introducer.entity_type}-${introducer.id}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:595:                                                      key={`all-${introducer.entity_type}-${introducer.id}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:597:                                                      id={`all-${introducer.entity_type}-${introducer.id}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:605:                                                        key={`${introducer.entity_type}-${introducer.id}-${docType}`}
src/components/documents/staff/sidebar/VehicleTree.tsx:607:                                                        id={`${introducer.entity_type}-${introducer.id}-${docType}`}
src/components/documents/README.md:174:const url = `/api/staff/documents?folder_id=${selectedFolderId}`
src/components/documents/README.md:177:const url = `/api/staff/documents?folder_id=${currentFolderId}`
src/components/documents/README.md:393:const url = `/api/staff/documents?folder_id=${currentFolderId || ''}`
src/components/documents/tag-badges.tsx:58:          key={`${tag}-${index}`}
src/components/documents/tag-badges.tsx:89:                    key={`tooltip-${tag}-${index}`}
src/components/documents/staff/sidebar/TreeNode.tsx:144:        style={{ paddingLeft: `${paddingLeft}px` }}
src/components/documents/staff/sidebar/TreeNode.tsx:218:            style={{ left: `${paddingLeft + 7}px` }}
