
import { getStaffDashboardData } from '@/lib/staff/dashboard-data'

async function verify() {
    console.log('Fetching dashboard data...')
    try {
        const data = await getStaffDashboardData()

        console.log('--- KPIs ---')
        console.log(JSON.stringify(data.kpis, null, 2))

        console.log('--- Management ---')
        console.log(JSON.stringify(data.management, null, 2))

        console.log('--- Chart Data Verification ---')

        const feeDates = data.charts.fees.map(f => f.date)
        const uniqueFeeDates = new Set(feeDates)
        console.log(`Fees: ${feeDates.length} entries, ${uniqueFeeDates.size} unique dates`)
        if (feeDates.length !== uniqueFeeDates.size) {
            console.error('❌ Duplicate dates found in Fees chart!')
        } else {
            console.log('✅ Fees chart dates are unique.')
        }

        const subDates = data.charts.subscriptions.map(s => s.date)
        const uniqueSubDates = new Set(subDates)
        console.log(`Subscriptions: ${subDates.length} entries, ${uniqueSubDates.size} unique dates`)
        if (subDates.length !== uniqueSubDates.size) {
            console.error('❌ Duplicate dates found in Subscriptions chart!')
        } else {
            console.log('✅ Subscriptions chart dates are unique.')
        }

        console.log('--- Sample Chart Data ---')
        console.log('Fees (first 3):', data.charts.fees.slice(0, 3))
        console.log('Subscriptions (first 3):', data.charts.subscriptions.slice(0, 3))

        if (data.errors && data.errors.length > 0) {
            console.error('❌ Errors encountered:', data.errors)
        } else {
            console.log('✅ No errors reported.')
        }

    } catch (error) {
        console.error('Failed to fetch data:', error)
    }
}

verify()
