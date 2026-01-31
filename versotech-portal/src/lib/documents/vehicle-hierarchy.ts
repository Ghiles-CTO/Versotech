/**
 * Vehicle Hierarchy Parser
 *
 * Parses a flat list of vehicles into a nested hierarchy for display in folder trees.
 *
 * Hierarchy Rules:
 * 1. Vehicles with type='fund' or 'securitization' are treated as parents
 * 2. Vehicles with "Compartment X" in name are children of matching securitization
 * 3. Vehicles with "Series XXX" in name are children of their SCSP/LLC parent
 * 4. Standalone vehicles (no parent match) are grouped under "Other"
 */

export interface Vehicle {
  id: string
  name: string
  type: string
}

export interface VehicleNode extends Vehicle {
  children: VehicleNode[]
  isParent: boolean
  isVirtual?: boolean // For synthesized parent nodes (e.g., SCSP parents)
}

/**
 * Formats a virtual parent ID into a display name.
 * Example: "virtual-series-verso-capital-1-scsp" -> "Verso Capital 1 SCSP"
 */
export function getVirtualParentDisplayName(virtualId: string): string {
  const slug = virtualId.replace(/^virtual-/, '')
  const normalized = slug.replace(/^series-/, '')
  return normalized
    .split('-')
    .map(word => {
      const lower = word.toLowerCase()
      if (['scsp', 'llc', 'lp', 'ltd', 'sarl', 'spv'].includes(lower)) {
        return lower.toUpperCase()
      }
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

/**
 * Determines if a vehicle should be treated as a parent node
 */
export function isParentVehicle(vehicle: Vehicle): boolean {
  return vehicle.type === 'fund' || vehicle.type === 'securitization'
}

/**
 * Extracts the SCSP/LLC base name from a Series vehicle name
 * e.g., "VERSO Capital 1 SCSP Series 101" → "VERSO Capital 1 SCSP"
 * e.g., "VERSO Capital LLC Series 001" → "VERSO Capital LLC"
 */
export function extractSeriesParentName(vehicleName: string): string | null {
  // Match patterns like "VERSO Capital 1 SCSP Series XXX" or "VERSO Capital LLC Series XXX"
  const seriesMatch = vehicleName.match(/^(.+?)\s+Series\s+\w+$/i)
  if (seriesMatch) {
    return seriesMatch[1].trim()
  }
  return null
}

/**
 * Extracts the securitization base name from a Compartment vehicle name
 * e.g., "Real Empire Capital Compartment 1" → "Real Empire Capital"
 */
export function extractCompartmentParentName(vehicleName: string): string | null {
  const compartmentMatch = vehicleName.match(/^(.+?)\s+Compartment\s+\d+$/i)
  if (compartmentMatch) {
    return compartmentMatch[1].trim()
  }
  return null
}

/**
 * Normalizes a name for matching (lowercase, remove extra spaces)
 */
function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, ' ').trim()
}

function isSeriesVehicleName(name: string): boolean {
  return extractSeriesParentName(name) !== null
}

function isCompartmentVehicleName(name: string): boolean {
  return extractCompartmentParentName(name) !== null
}

function getParentScore(vehicle: Vehicle): number {
  // Prefer true parent vehicles; avoid choosing series/compartment children as parents.
  const isSeries = isSeriesVehicleName(vehicle.name)
  const isCompartment = isCompartmentVehicleName(vehicle.name)
  const isChild = isSeries || isCompartment
  return (isParentVehicle(vehicle) ? 2 : 0) + (isChild ? 0 : 1)
}

/**
 * Finds the best matching parent for a compartment vehicle
 */
function findCompartmentParent(
  compartmentBaseName: string,
  parentVehicles: Vehicle[]
): Vehicle | null {
  const normalizedBase = normalizeName(compartmentBaseName)

  // Try exact match first
  const exact = parentVehicles.find(
    (parent) => normalizeName(parent.name) === normalizedBase
  )
  if (exact) return exact

  // Try prefix match (e.g., "Real Empire Capital" matches "REAL Empire")
  const prefixCandidates = parentVehicles.filter((parent) => {
    const normalizedParent = normalizeName(parent.name)
    return (
      normalizedBase.startsWith(normalizedParent) ||
      normalizedBase.includes(normalizedParent) ||
      normalizedParent.startsWith(normalizedBase)
    )
  })
  if (prefixCandidates.length === 1) return prefixCandidates[0]

  // Try matching first two words
  const baseWords = normalizedBase.split(' ')
  const wordCandidates = parentVehicles.filter((parent) => {
    const parentWords = normalizeName(parent.name).split(' ')
    return (
      baseWords.length >= 2 &&
      parentWords.length >= 2 &&
      baseWords[0] === parentWords[0] &&
      baseWords[1] === parentWords[1]
    )
  })
  if (wordCandidates.length === 1) return wordCandidates[0]

  return null
}

/**
 * Parses a flat list of vehicles into a hierarchical structure
 *
 * @param vehicles - Flat array of vehicles from the database
 * @returns Nested array of VehicleNode with children
 */
export function parseVehicleHierarchy(vehicles: Vehicle[]): VehicleNode[] {
  if (!vehicles || vehicles.length === 0) {
    return []
  }

  const vehiclesByName = new Map<string, Vehicle>()
  vehicles.forEach((vehicle) => {
    const key = normalizeName(vehicle.name)
    const existing = vehiclesByName.get(key)
    if (!existing) {
      vehiclesByName.set(key, vehicle)
      return
    }
    const existingScore = getParentScore(existing)
    const nextScore = getParentScore(vehicle)
    if (nextScore > existingScore) {
      vehiclesByName.set(key, vehicle)
    }
  })

  // Track which vehicles have been assigned to a parent
  const assignedVehicleIds = new Set<string>()

  // Map to collect series children by their SCSP/LLC parent name (normalized key)
  const seriesGroups = new Map<string, { name: string; vehicles: Vehicle[] }>()
  const realSeriesChildren = new Map<string, Vehicle[]>()

  // Map to collect compartment children by their parent vehicle ID
  const compartmentChildren = new Map<string, Vehicle[]>()

  const compartmentParentCandidates = vehicles.filter(
    (vehicle) =>
      isParentVehicle(vehicle) &&
      !isSeriesVehicleName(vehicle.name) &&
      !isCompartmentVehicleName(vehicle.name)
  )

  // Process all vehicles for potential series/compartment grouping
  for (const vehicle of vehicles) {
    // Check for Series pattern (e.g., "VERSO Capital 1 SCSP Series 101")
    const seriesParentName = extractSeriesParentName(vehicle.name)
    if (seriesParentName) {
      const seriesKey = normalizeName(seriesParentName)
      const realParent = vehiclesByName.get(seriesKey)
      if (realParent && realParent.id !== vehicle.id) {
        if (!realSeriesChildren.has(realParent.id)) {
          realSeriesChildren.set(realParent.id, [])
        }
        realSeriesChildren.get(realParent.id)!.push(vehicle)
      } else {
        const displayName = realParent?.name || seriesParentName
        if (!seriesGroups.has(seriesKey)) {
          seriesGroups.set(seriesKey, { name: displayName, vehicles: [] })
        }
        seriesGroups.get(seriesKey)!.vehicles.push(vehicle)
      }
      assignedVehicleIds.add(vehicle.id)
      continue
    }

    // Check for Compartment pattern (e.g., "Real Empire Capital Compartment 1")
    const compartmentBaseName = extractCompartmentParentName(vehicle.name)
    if (compartmentBaseName) {
      const parent = findCompartmentParent(compartmentBaseName, compartmentParentCandidates)
      if (parent) {
        if (!compartmentChildren.has(parent.id)) {
          compartmentChildren.set(parent.id, [])
        }
        compartmentChildren.get(parent.id)!.push(vehicle)
        assignedVehicleIds.add(vehicle.id)
      }
    }
  }

  const childrenByParentId = new Map<string, Vehicle[]>()
  const addChildren = (parentId: string, children: Vehicle[]) => {
    if (!childrenByParentId.has(parentId)) {
      childrenByParentId.set(parentId, [])
    }
    childrenByParentId.get(parentId)!.push(...children)
  }

  for (const [parentId, children] of compartmentChildren.entries()) {
    addChildren(parentId, children)
  }

  for (const [parentId, children] of realSeriesChildren.entries()) {
    addChildren(parentId, children)
  }

  const hasChildren = (vehicleId: string) =>
    (childrenByParentId.get(vehicleId) || []).length > 0

  // Build the result hierarchy
  const result: VehicleNode[] = []

  // Add real parent vehicles (funds/securitizations or vehicles with children)
  const topLevelParents = vehicles.filter((vehicle) => {
    if (assignedVehicleIds.has(vehicle.id)) return false
    return isParentVehicle(vehicle) || hasChildren(vehicle.id)
  })

  for (const parent of topLevelParents) {
    const children = childrenByParentId.get(parent.id) || []
    result.push({
      ...parent,
      isParent: true,
      children: children.map(child => ({
        ...child,
        isParent: false,
        children: []
      }))
    })
    assignedVehicleIds.add(parent.id)
  }

  // Add virtual SCSP/LLC parent nodes with their series children
  for (const [seriesKey, group] of seriesGroups) {
    const parentName = group.name
    const seriesVehicles = group.vehicles
    // Sort series by extracting the series number
    const sortedSeries = [...seriesVehicles].sort((a, b) => {
      const aMatch = a.name.match(/Series\s+(\w+)$/i)
      const bMatch = b.name.match(/Series\s+(\w+)$/i)
      const aNum = aMatch ? aMatch[1] : ''
      const bNum = bMatch ? bMatch[1] : ''
      return aNum.localeCompare(bNum, undefined, { numeric: true })
    })

    result.push({
      id: `virtual-series-${seriesKey.replace(/\s+/g, '-')}`,
      name: parentName,
      type: 'scsp', // Virtual type for SCSP parents
      isParent: true,
      isVirtual: true,
      children: sortedSeries.map(child => ({
        ...child,
        isParent: false,
        children: []
      }))
    })
  }

  // Collect standalone vehicles (not assigned to any parent)
  const standaloneVehicles = vehicles.filter(
    v => !assignedVehicleIds.has(v.id) && !hasChildren(v.id) && !isParentVehicle(v)
  )

  // Add "Other" group if there are standalone vehicles
  if (standaloneVehicles.length > 0) {
    result.push({
      id: 'virtual-other',
      name: 'Other',
      type: 'other',
      isParent: true,
      isVirtual: true,
      children: standaloneVehicles.map(v => ({
        ...v,
        isParent: false,
        children: []
      }))
    })
  }

  // Deduplicate any accidental ID collisions (prevents React key warnings)
  const uniqueMap = new Map<string, VehicleNode>()
  for (const node of result) {
    const existing = uniqueMap.get(node.id)
    if (!existing) {
      uniqueMap.set(node.id, { ...node, children: [...node.children] })
      continue
    }

    const mergedChildrenMap = new Map<string, VehicleNode>()
    for (const child of [...existing.children, ...node.children]) {
      if (!mergedChildrenMap.has(child.id)) {
        mergedChildrenMap.set(child.id, child)
      }
    }

    uniqueMap.set(node.id, {
      ...existing,
      name: existing.name || node.name,
      type: existing.type || node.type,
      isParent: existing.isParent || node.isParent,
      isVirtual: existing.isVirtual || node.isVirtual,
      children: Array.from(mergedChildrenMap.values()),
    })
  }

  const uniqueResult = Array.from(uniqueMap.values())

  // Sort result: real vehicles first (alphabetically), then virtual groups
  uniqueResult.sort((a, b) => {
    // Virtual groups go last
    if (a.isVirtual && !b.isVirtual) return 1
    if (!a.isVirtual && b.isVirtual) return -1
    // Within same category, sort alphabetically
    return a.name.localeCompare(b.name)
  })

  return uniqueResult
}

/**
 * Flattens a vehicle hierarchy back to a flat array
 * Useful for searching/filtering
 */
export function flattenVehicleHierarchy(nodes: VehicleNode[]): Vehicle[] {
  const result: Vehicle[] = []

  function traverse(node: VehicleNode) {
    // Skip virtual nodes when flattening
    if (!node.isVirtual) {
      result.push({
        id: node.id,
        name: node.name,
        type: node.type
      })
    }
    for (const child of node.children) {
      traverse(child)
    }
  }

  for (const node of nodes) {
    traverse(node)
  }

  return result
}

/**
 * Finds a vehicle node by ID in the hierarchy
 */
export function findVehicleInHierarchy(
  nodes: VehicleNode[],
  vehicleId: string
): VehicleNode | null {
  for (const node of nodes) {
    if (node.id === vehicleId) {
      return node
    }
    const found = findVehicleInHierarchy(node.children, vehicleId)
    if (found) {
      return found
    }
  }
  return null
}
