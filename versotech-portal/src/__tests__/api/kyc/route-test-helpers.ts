import { NextRequest } from 'next/server'

type TableRows = Record<string, Array<Record<string, any>>>

type OrderConfig = {
  column: string
  ascending: boolean
} | null

export function createMultipartNextRequest(url: string, formData: FormData) {
  return new NextRequest(url, {
    method: 'POST',
    body: formData,
  })
}

export function createMockSupabase(seed: TableRows) {
  const db: TableRows = Object.fromEntries(
    Object.entries(seed).map(([table, rows]) => [table, rows.map((row) => ({ ...row }))])
  )

  const uploads: Array<{ bucket: string; path: string; contentType?: string | undefined }> = []
  const removals: Array<{ bucket: string; paths: string[] }> = []
  const idCounters = new Map<string, number>()

  function nextId(table: string) {
    const next = (idCounters.get(table) || 0) + 1
    idCounters.set(table, next)
    return `${table}-${next}`
  }

  class QueryBuilder {
    private filters: Array<(row: Record<string, any>) => boolean> = []
    private pendingInsert: Array<Record<string, any>> | null = null
    private pendingUpdate: Record<string, any> | null = null
    private pendingDelete = false
    private orderConfig: OrderConfig = null
    private limitCount: number | null = null
    private returnSingle = false

    constructor(private readonly table: string) {
      if (!db[this.table]) {
        db[this.table] = []
      }
    }

    select(_columns?: string) {
      return this
    }

    eq(column: string, value: unknown) {
      this.filters.push((row) => row[column] === value)
      return this
    }

    is(column: string, value: unknown) {
      this.filters.push((row) => row[column] === value)
      return this
    }

    in(column: string, values: unknown[]) {
      this.filters.push((row) => values.includes(row[column]))
      return this
    }

    order(column: string, options?: { ascending?: boolean }) {
      this.orderConfig = {
        column,
        ascending: options?.ascending !== false,
      }
      return this
    }

    limit(count: number) {
      this.limitCount = count
      return this
    }

    insert(payload: Record<string, any> | Array<Record<string, any>>) {
      const rows = (Array.isArray(payload) ? payload : [payload]).map((row) => ({
        id: row.id || nextId(this.table),
        created_at: row.created_at || '2026-04-03T08:00:00.000Z',
        ...row,
      }))
      db[this.table].push(...rows)
      this.pendingInsert = rows
      return this
    }

    update(payload: Record<string, any>) {
      this.pendingUpdate = payload
      return this
    }

    delete() {
      this.pendingDelete = true
      return this
    }

    maybeSingle() {
      this.returnSingle = true
      return Promise.resolve(this.execute())
    }

    single() {
      this.returnSingle = true
      return Promise.resolve(this.execute())
    }

    then(
      resolve: (value: { data: any; error: any }) => unknown,
      reject?: (reason: unknown) => unknown
    ) {
      return Promise.resolve(this.execute()).then(resolve, reject)
    }

    private execute() {
      if (this.pendingInsert) {
        return {
          data: this.returnSingle ? this.pendingInsert[0] ?? null : this.pendingInsert,
          error: null,
        }
      }

      const matches = db[this.table].filter((row) => this.filters.every((filter) => filter(row)))
      const sorted = this.orderConfig
        ? [...matches].sort((left, right) => {
            const leftValue = left[this.orderConfig!.column]
            const rightValue = right[this.orderConfig!.column]

            if (leftValue === rightValue) return 0
            if (leftValue == null) return this.orderConfig!.ascending ? -1 : 1
            if (rightValue == null) return this.orderConfig!.ascending ? 1 : -1

            if (leftValue < rightValue) return this.orderConfig!.ascending ? -1 : 1
            return this.orderConfig!.ascending ? 1 : -1
          })
        : matches

      const limited =
        typeof this.limitCount === 'number' ? sorted.slice(0, this.limitCount) : sorted

      if (this.pendingDelete) {
        db[this.table] = db[this.table].filter((row) => !limited.includes(row))
        return {
          data: this.returnSingle ? limited[0] ?? null : limited,
          error: null,
        }
      }

      if (this.pendingUpdate) {
        limited.forEach((row) => Object.assign(row, this.pendingUpdate))
        return {
          data: this.returnSingle ? limited[0] ?? null : limited,
          error: null,
        }
      }

      return {
        data: this.returnSingle ? limited[0] ?? null : limited,
        error: null,
      }
    }
  }

  return {
    from(table: string) {
      return new QueryBuilder(table)
    },
    storage: {
      from(bucket: string) {
        return {
          upload: async (path: string, _contents: ArrayBuffer, options?: { contentType?: string }) => {
            uploads.push({ bucket, path, contentType: options?.contentType })
            return { data: { path }, error: null }
          },
          remove: async (paths: string[]) => {
            removals.push({ bucket, paths: [...paths] })
            return { data: paths, error: null }
          },
        }
      },
    },
    _db: db,
    _uploads: uploads,
    _removals: removals,
  }
}
