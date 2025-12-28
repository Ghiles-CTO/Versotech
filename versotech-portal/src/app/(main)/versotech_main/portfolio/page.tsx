import { HoldingsPage } from '@/components/holdings/holdings-page'

export default function PortfolioPage() {
  return (
    <HoldingsPage
      positionsOnly
      detailsBasePath="/versotech_main/portfolio"
      holdingsPath="/versotech_main/portfolio"
      dealsPath="/versotech_main/opportunities"
    />
  )
}
