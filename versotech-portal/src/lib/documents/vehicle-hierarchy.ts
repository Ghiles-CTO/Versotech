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

/**
 * Finds the best matching parent for a compartment vehicle
 */
function findCompartmentParent(
  compartmentBaseName: string,
  parentVehicles: Vehicle[]
): Vehicle | null {
  const normalizedBase = normalizeName(compartmentBaseName)

  // Try exact match first
  for (const parent of parentVehicles) {
    if (normalizeName(parent.name) === normalizedBase) {
      return parent
    }
  }

  // Try prefix match (e.g., "Real Empire Capital" matches "REAL Empire")
  for (const parent of parentVehicles) {
    const normalizedParent = normalizeName(parent.name)
    // Check if the compartment base starts with or contains the parent name
    if (normalizedBase.startsWith(normalizedParent) ||
        normalizedBase.includes(normalizedParent) ||
        normalizedParent.includes(normalizedBase.split(' ')[0])) {
      return parent
    }
  }

  // Try matching first two words
  const baseWords = normalizedBase.split(' ')
  for (const parent of parentVehicles) {
    const parentWords = normalizeName(parent.name).split(' ')
    if (baseWords.length >= 2 && parentWords.length >= 2 &&
        baseWords[0] === parentWords[0] && baseWords[1] === parentWords[1]) {
      return parent
    }
  }

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

  // Separate parent vehicles from potential children
  const parentVehicles = vehicles.filter(isParentVehicle)
  const childCandidates = vehicles.filter(v => !isParentVehicle(v))

  // Track which vehicles have been assigned to a parent
  const assignedVehicleIds = new Set<string>()

  // Map to collect series children by their SCSP/LLC parent name
  const seriesGroups = new Map<string, Vehicle[]>()

  // Map to collect compartment children by their parent vehicle ID
  const compartmentChildren = new Map<string, Vehicle[]>()

  // Process child candidates
  for (const vehicle of childCandidates) {
    // Check for Series pattern (e.g., "VERSO Capital 1 SCSP Series 101")
    const seriesParentName = extractSeriesParentName(vehicle.name)
    if (seriesParentName) {
      if (!seriesGroups.has(seriesParentName)) {
        seriesGroups.set(seriesParentName, [])
      }
      seriesGroups.get(seriesParentName)!.push(vehicle)
      assignedVehicleIds.add(vehicle.id)
      continue
    }

    // Check for Compartment pattern (e.g., "Real Empire Capital Compartment 1")
    const compartmentBaseName = extractCompartmentParentName(vehicle.name)
    if (compartmentBaseName) {
      const parent = findCompartmentParent(compartmentBaseName, parentVehicles)
      if (parent) {
        if (!compartmentChildren.has(parent.id)) {
          compartmentChildren.set(parent.id, [])
        }
        compartmentChildren.get(parent.id)!.push(vehicle)
        assignedVehicleIds.add(vehicle.id)
      }
    }
  }

  // Build the result hierarchy
  const result: VehicleNode[] = []

  // Add parent vehicles with their compartment children
  for (const parent of parentVehicles) {
    const children = compartmentChildren.get(parent.id) || []
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
  for (const [parentName, seriesVehicles] of seriesGroups) {
    // Sort series by extracting the series number
    const sortedSeries = [...seriesVehicles].sort((a, b) => {
      const aMatch = a.name.match(/Series\s+(\w+)$/i)
      const bMatch = b.name.match(/Series\s+(\w+)$/i)
      const aNum = aMatch ? aMatch[1] : ''
      const bNum = bMatch ? bMatch[1] : ''
      return aNum.localeCompare(bNum, undefined, { numeric: true })
    })

    result.push({
      id: `virtual-${parentName.replace(/\s+/g, '-').toLowerCase()}`,
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
  const standaloneVehicles = vehicles.filter(v => !assignedVehicleIds.has(v.id))

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

  // Sort result: real vehicles first (alphabetically), then virtual groups
  result.sort((a, b) => {
    // Virtual groups go last
    if (a.isVirtual && !b.isVirtual) return 1
    if (!a.isVirtual && b.isVirtual) return -1
    // Within same category, sort alphabetically
    return a.name.localeCompare(b.name)
  })

  return result
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
