type HomeTableName =
  | 'home_items'
  | 'home_interest_submissions'
  | 'investors'
  | 'profiles'
  | 'ceo_users'

type HomeRow = Record<string, any>

type OrderConfig = {
  field: string
  ascending: boolean
  nullsFirst?: boolean
}

export type HomeTestState = Record<HomeTableName, HomeRow[]>

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function compareNullable(left: any, right: any, options: OrderConfig) {
  const leftNull = left == null
  const rightNull = right == null

  if (leftNull || rightNull) {
    if (leftNull && rightNull) return 0
    if (options.nullsFirst) {
      return leftNull ? -1 : 1
    }
    return leftNull ? 1 : -1
  }

  if (left < right) return options.ascending ? -1 : 1
  if (left > right) return options.ascending ? 1 : -1
  return 0
}

class HomeQueryBuilder {
  private filters: Array<(row: HomeRow) => boolean> = []
  private orders: OrderConfig[] = []
  private limitCount: number | null = null
  private selection = '*'
  private mode: 'select' | 'insert' | 'update' = 'select'
  private returning = false
  private insertPayload: HomeRow[] = []
  private updatePayload: HomeRow = {}

  constructor(
    private readonly state: HomeTestState,
    private readonly table: HomeTableName
  ) {}

  select(selection = '*') {
    this.selection = selection
    this.returning = true
    return this
  }

  insert(payload: HomeRow | HomeRow[]) {
    this.mode = 'insert'
    this.insertPayload = Array.isArray(payload) ? payload.map(clone) : [clone(payload)]
    return this
  }

  update(payload: HomeRow) {
    this.mode = 'update'
    this.updatePayload = clone(payload)
    return this
  }

  eq(field: string, value: any) {
    this.filters.push((row) => row[field] === value)
    return this
  }

  neq(field: string, value: any) {
    this.filters.push((row) => row[field] !== value)
    return this
  }

  in(field: string, values: any[]) {
    this.filters.push((row) => values.includes(row[field]))
    return this
  }

  not(field: string, operator: string, value: any) {
    if (operator === 'is') {
      this.filters.push((row) => row[field] !== value)
    }
    return this
  }

  order(field: string, options?: { ascending?: boolean; nullsFirst?: boolean }) {
    this.orders.push({
      field,
      ascending: options?.ascending !== false,
      nullsFirst: options?.nullsFirst,
    })
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  async single() {
    const result = await this.execute()
    if (result.error) return result
    const rows = Array.isArray(result.data) ? result.data : []
    return { data: rows[0] ?? null, error: rows[0] ? null : { message: 'No rows found' } }
  }

  async maybeSingle() {
    const result = await this.execute()
    if (result.error) return result
    const rows = Array.isArray(result.data) ? result.data : []
    return { data: rows[0] ?? null, error: null }
  }

  then(resolve: (value: any) => any, reject?: (reason: any) => any) {
    return this.execute().then(resolve, reject)
  }

  private nextId() {
    return `${this.table}-${this.state[this.table].length + 1}`
  }

  private withOrders(rows: HomeRow[]) {
    if (!this.orders.length) return rows

    return [...rows].sort((left, right) => {
      for (const order of this.orders) {
        const comparison = compareNullable(left[order.field], right[order.field], order)
        if (comparison !== 0) {
          return comparison
        }
      }
      return 0
    })
  }

  private withFilters(rows: HomeRow[]) {
    return this.filters.reduce((acc, filter) => acc.filter(filter), rows)
  }

  private withSelection(rows: HomeRow[]) {
    if (
      this.table === 'home_interest_submissions' &&
      this.selection.includes('home_item:home_items')
    ) {
      return rows.map((row) => ({
        ...row,
        home_item: this.state.home_items.find((item) => item.id === row.home_item_id) ?? null,
        investor: this.state.investors.find((investor) => investor.id === row.investor_id) ?? null,
        user_profile: this.state.profiles.find((profile) => profile.id === row.user_id) ?? null,
      }))
    }

    return rows
  }

  private finalize(rows: HomeRow[]) {
    let next = this.withSelection(this.withOrders(this.withFilters(rows))).map(clone)

    if (this.limitCount != null) {
      next = next.slice(0, this.limitCount)
    }

    return next
  }

  private async runSelect() {
    return { data: this.finalize(this.state[this.table]), error: null }
  }

  private async runInsert() {
    if (this.table === 'home_interest_submissions') {
      for (const row of this.insertPayload) {
        const duplicate = this.state.home_interest_submissions.find(
          (existing) =>
            existing.home_item_id === row.home_item_id && existing.user_id === row.user_id
        )

        if (duplicate) {
          return {
            data: null,
            error: { code: '23505', message: 'duplicate key value violates unique constraint' },
          }
        }
      }
    }

    const insertedRows = this.insertPayload.map((row) => ({
      id: row.id ?? this.nextId(),
      created_at: row.created_at ?? new Date().toISOString(),
      updated_at: row.updated_at ?? new Date().toISOString(),
      ...row,
    }))

    this.state[this.table].push(...insertedRows)

    return {
      data: this.returning ? insertedRows.map(clone) : null,
      error: null,
    }
  }

  private async runUpdate() {
    const rows = this.withFilters(this.state[this.table])

    for (const row of rows) {
      Object.assign(row, this.updatePayload, { updated_at: new Date().toISOString() })
    }

    return {
      data: this.returning ? rows.map(clone) : null,
      error: null,
    }
  }

  private async execute() {
    if (this.mode === 'insert') {
      return this.runInsert()
    }

    if (this.mode === 'update') {
      return this.runUpdate()
    }

    return this.runSelect()
  }
}

export function createHomeTestSupabase(seed?: Partial<HomeTestState>) {
  const state: HomeTestState = {
    home_items: clone(seed?.home_items ?? []),
    home_interest_submissions: clone(seed?.home_interest_submissions ?? []),
    investors: clone(seed?.investors ?? []),
    profiles: clone(seed?.profiles ?? []),
    ceo_users: clone(seed?.ceo_users ?? []),
  }

  return {
    state,
    from(table: HomeTableName) {
      return new HomeQueryBuilder(state, table)
    },
  }
}

export function makeHomeItem(overrides: HomeRow = {}) {
  return {
    id: overrides.id ?? `item-${Math.random().toString(36).slice(2, 10)}`,
    kind: 'opportunity_teaser',
    status: 'draft',
    title: 'Test item',
    eyebrow: null,
    summary: 'Test summary',
    body: null,
    image_url: null,
    link_url: null,
    cta_label: null,
    cta_action: 'interest_capture',
    source_url: null,
    source_name: null,
    source_domain: null,
    source_published_at: null,
    metadata_json: null,
    linked_deal_id: null,
    featured_slot: null,
    sort_order: 0,
    starts_at: null,
    ends_at: null,
    is_pinned: false,
    created_by: null,
    updated_by: null,
    created_at: '2026-03-10T10:00:00.000Z',
    updated_at: '2026-03-10T10:00:00.000Z',
    ...overrides,
  }
}

export function makeHomeInterest(overrides: HomeRow = {}) {
  return {
    id: overrides.id ?? `interest-${Math.random().toString(36).slice(2, 10)}`,
    home_item_id: 'item-1',
    user_id: 'investor-user-1',
    investor_id: 'investor-1',
    note: null,
    admin_note: null,
    status: 'new',
    created_at: '2026-03-10T10:00:00.000Z',
    updated_at: '2026-03-10T10:00:00.000Z',
    ...overrides,
  }
}
