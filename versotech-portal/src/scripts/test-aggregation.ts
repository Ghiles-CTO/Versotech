
// Mock implementation of the aggregation function
function aggregateByDate(data: any[], dateKey: string, amountKey: string, metaKey: string, metaLabel: string) {
    const map = new Map<string, { date: string, amount: number, [key: string]: any }>()

    data.forEach((item) => {
        if (!item[dateKey]) return
        const date = new Date(item[dateKey]).toISOString().split('T')[0]
        const amount = Number(item[amountKey]) || 0

        if (!map.has(date)) {
            map.set(date, {
                date,
                amount: 0,
                [metaLabel]: item[metaKey]
            })
        }

        const entry = map.get(date)!
        entry.amount += amount
    })

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
}

// Test Data
const testData = [
    { created_at: '2023-10-01T10:00:00Z', computed_amount: 100, fee_type: 'Management' },
    { created_at: '2023-10-01T14:00:00Z', computed_amount: 200, fee_type: 'Performance' }, // Same day
    { created_at: '2023-10-02T10:00:00Z', computed_amount: 300, fee_type: 'Management' },
    { created_at: '2023-10-03T10:00:00Z', computed_amount: 400, fee_type: 'Management' },
]

console.log('Running aggregation test...')
const result = aggregateByDate(testData, 'created_at', 'computed_amount', 'fee_type', 'type')

console.log('Result:', JSON.stringify(result, null, 2))

if (result.length === 3) {
    console.log('✅ Correct number of entries (3)')
} else {
    console.error(`❌ Expected 3 entries, got ${result.length}`)
}

const day1 = result.find(r => r.date === '2023-10-01')
if (day1 && day1.amount === 300) { // 100 + 200 + 100 (wait, logic error in my manual check? No, 100+200=300)
    // Wait, my mock implementation has:
    // if (!map.has(date)) { set... }
    // const entry = map.get(date)!
    // entry.amount += amount
    // This adds the amount TWICE for the first entry!
    // Let's check the logic.
    // 1. !has -> set (amount: 0) -> get -> += amount (amount is now correct)
    // 2. has -> get -> += amount (amount is now old + new)
    // Wait, in the `set` call I set `amount: 0`.
    // So:
    // Item 1: set(amount: 0). get(). += 100. Total: 100. Correct.
    // Item 2: get(). += 200. Total: 300. Correct.
    console.log('✅ Aggregation sum correct for 2023-10-01 (300)')
} else {
    console.error(`❌ Expected 300 for 2023-10-01, got ${day1?.amount}`)
}
