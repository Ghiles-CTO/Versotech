export type FeeComponentInput = Record<string, unknown>

export const normalizeFeeComponentsForInsert = (
  components: FeeComponentInput[],
  feePlanId: string
) =>
  components.map((component) => {
    const { id, fee_plan_id, created_at, updated_at, ...rest } = component || {}

    const normalized: Record<string, unknown> = {
      ...rest,
      fee_plan_id: feePlanId,
    }

    if (typeof id === 'string' && id.length > 0) {
      normalized.id = id
    }

    return normalized
  })
