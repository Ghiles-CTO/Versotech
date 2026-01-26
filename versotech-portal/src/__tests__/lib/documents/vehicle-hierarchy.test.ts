import { describe, it, expect } from 'vitest'
import {
  parseVehicleHierarchy,
  isParentVehicle,
  extractSeriesParentName,
  extractCompartmentParentName,
  flattenVehicleHierarchy,
  findVehicleInHierarchy,
  Vehicle,
  VehicleNode,
} from '@/lib/documents/vehicle-hierarchy'

describe('Vehicle Hierarchy Parser', () => {
  describe('isParentVehicle', () => {
    it('returns true for fund type', () => {
      expect(isParentVehicle({ id: '1', name: 'Test Fund', type: 'fund' })).toBe(true)
    })

    it('returns true for securitization type', () => {
      expect(isParentVehicle({ id: '1', name: 'Test Sec', type: 'securitization' })).toBe(true)
    })

    it('returns false for other types', () => {
      expect(isParentVehicle({ id: '1', name: 'Test', type: 'spv' })).toBe(false)
      expect(isParentVehicle({ id: '1', name: 'Test', type: 'real_estate' })).toBe(false)
      expect(isParentVehicle({ id: '1', name: 'Test', type: 'venture_capital' })).toBe(false)
      expect(isParentVehicle({ id: '1', name: 'Test', type: 'other' })).toBe(false)
    })
  })

  describe('extractSeriesParentName', () => {
    it('extracts SCSP parent name from Series vehicle', () => {
      expect(extractSeriesParentName('VERSO Capital 1 SCSP Series 101')).toBe('VERSO Capital 1 SCSP')
      expect(extractSeriesParentName('VERSO Capital 2 SCSP Series 201')).toBe('VERSO Capital 2 SCSP')
      expect(extractSeriesParentName('VERSO Capital LLC Series 001')).toBe('VERSO Capital LLC')
    })

    it('handles Series IN pattern', () => {
      expect(extractSeriesParentName('VERSO Capital 1 SCSP Series IN101')).toBe('VERSO Capital 1 SCSP')
    })

    it('returns null for non-Series vehicles', () => {
      expect(extractSeriesParentName('REAL Empire Fund')).toBeNull()
      expect(extractSeriesParentName('Real Empire Capital Compartment 1')).toBeNull()
      expect(extractSeriesParentName('SPV Delta')).toBeNull()
    })
  })

  describe('extractCompartmentParentName', () => {
    it('extracts parent name from Compartment vehicle', () => {
      expect(extractCompartmentParentName('Real Empire Capital Compartment 1')).toBe('Real Empire Capital')
      expect(extractCompartmentParentName('Real Empire Capital Compartment 11')).toBe('Real Empire Capital')
      expect(extractCompartmentParentName('Test Fund Compartment 99')).toBe('Test Fund')
    })

    it('returns null for non-Compartment vehicles', () => {
      expect(extractCompartmentParentName('REAL Empire Fund')).toBeNull()
      expect(extractCompartmentParentName('VERSO Capital 1 SCSP Series 101')).toBeNull()
      expect(extractCompartmentParentName('SPV Delta')).toBeNull()
    })
  })

  describe('parseVehicleHierarchy', () => {
    it('returns empty array for empty input', () => {
      expect(parseVehicleHierarchy([])).toEqual([])
    })

    it('returns empty array for null/undefined input', () => {
      expect(parseVehicleHierarchy(null as unknown as Vehicle[])).toEqual([])
      expect(parseVehicleHierarchy(undefined as unknown as Vehicle[])).toEqual([])
    })

    it('identifies fund vehicles as parents', () => {
      const vehicles: Vehicle[] = [
        { id: '1', name: 'VERSO FUND', type: 'fund' },
      ]

      const result = parseVehicleHierarchy(vehicles)
      expect(result).toHaveLength(1)
      expect(result[0].isParent).toBe(true)
      expect(result[0].children).toEqual([])
    })

    it('identifies securitization vehicles as parents', () => {
      const vehicles: Vehicle[] = [
        { id: '1', name: 'REAL Empire', type: 'securitization' },
      ]

      const result = parseVehicleHierarchy(vehicles)
      expect(result).toHaveLength(1)
      expect(result[0].isParent).toBe(true)
    })

    it('groups compartments under their parent securitization', () => {
      const vehicles: Vehicle[] = [
        { id: '1', name: 'REAL Empire', type: 'securitization' },
        { id: '2', name: 'Real Empire Capital Compartment 1', type: 'real_estate' },
        { id: '3', name: 'Real Empire Capital Compartment 2', type: 'real_estate' },
      ]

      const result = parseVehicleHierarchy(vehicles)

      // Should have 1 parent with 2 children
      const realEmpire = result.find(v => v.name === 'REAL Empire')
      expect(realEmpire).toBeDefined()
      expect(realEmpire!.children).toHaveLength(2)
      expect(realEmpire!.children[0].name).toBe('Real Empire Capital Compartment 1')
      expect(realEmpire!.children[1].name).toBe('Real Empire Capital Compartment 2')
    })

    it('groups series vehicles under virtual SCSP parent', () => {
      const vehicles: Vehicle[] = [
        { id: '1', name: 'VERSO Capital 1 SCSP Series 101', type: 'venture_capital' },
        { id: '2', name: 'VERSO Capital 1 SCSP Series 102', type: 'venture_capital' },
        { id: '3', name: 'VERSO Capital 1 SCSP Series 103', type: 'real_estate' },
      ]

      const result = parseVehicleHierarchy(vehicles)

      // Should have 1 virtual parent
      const scspParent = result.find(v => v.name === 'VERSO Capital 1 SCSP')
      expect(scspParent).toBeDefined()
      expect(scspParent!.isVirtual).toBe(true)
      expect(scspParent!.isParent).toBe(true)
      expect(scspParent!.children).toHaveLength(3)
    })

    it('sorts series children numerically', () => {
      const vehicles: Vehicle[] = [
        { id: '3', name: 'VERSO Capital 1 SCSP Series 103', type: 'venture_capital' },
        { id: '1', name: 'VERSO Capital 1 SCSP Series 101', type: 'venture_capital' },
        { id: '2', name: 'VERSO Capital 1 SCSP Series 102', type: 'venture_capital' },
      ]

      const result = parseVehicleHierarchy(vehicles)
      const scspParent = result.find(v => v.name === 'VERSO Capital 1 SCSP')

      expect(scspParent!.children[0].name).toContain('101')
      expect(scspParent!.children[1].name).toContain('102')
      expect(scspParent!.children[2].name).toContain('103')
    })

    it('groups standalone vehicles under Other', () => {
      const vehicles: Vehicle[] = [
        { id: '1', name: 'SPV Delta', type: 'spv' },
        { id: '2', name: 'SPV Alpha', type: 'spv' },
      ]

      const result = parseVehicleHierarchy(vehicles)

      const otherGroup = result.find(v => v.name === 'Other')
      expect(otherGroup).toBeDefined()
      expect(otherGroup!.isVirtual).toBe(true)
      expect(otherGroup!.children).toHaveLength(2)
    })

    it('handles mixed hierarchy with all patterns', () => {
      const vehicles: Vehicle[] = [
        // Fund parent
        { id: '1', name: 'VERSO FUND', type: 'fund' },
        // Securitization with compartments
        { id: '2', name: 'REAL Empire', type: 'securitization' },
        { id: '3', name: 'Real Empire Capital Compartment 1', type: 'real_estate' },
        // SCSP Series
        { id: '4', name: 'VERSO Capital 1 SCSP Series 101', type: 'venture_capital' },
        { id: '5', name: 'VERSO Capital 1 SCSP Series 102', type: 'venture_capital' },
        // Standalone
        { id: '6', name: 'SPV Delta', type: 'spv' },
      ]

      const result = parseVehicleHierarchy(vehicles)

      // Real parents first (alphabetically), then virtual groups
      const parentNames = result.map(r => r.name)

      // Should have: REAL Empire, VERSO FUND (real), then VERSO Capital 1 SCSP, Other (virtual)
      expect(parentNames).toContain('REAL Empire')
      expect(parentNames).toContain('VERSO FUND')
      expect(parentNames).toContain('VERSO Capital 1 SCSP')
      expect(parentNames).toContain('Other')

      // Check Real Empire has its compartment
      const realEmpire = result.find(v => v.name === 'REAL Empire')
      expect(realEmpire!.children).toHaveLength(1)

      // Check SCSP group has its series
      const scsp = result.find(v => v.name === 'VERSO Capital 1 SCSP')
      expect(scsp!.children).toHaveLength(2)

      // Check Other has standalone
      const other = result.find(v => v.name === 'Other')
      expect(other!.children).toHaveLength(1)
    })

    it('creates separate virtual parents for different SCSP groups', () => {
      const vehicles: Vehicle[] = [
        { id: '1', name: 'VERSO Capital 1 SCSP Series 101', type: 'venture_capital' },
        { id: '2', name: 'VERSO Capital 2 SCSP Series 201', type: 'venture_capital' },
      ]

      const result = parseVehicleHierarchy(vehicles)

      expect(result).toHaveLength(2)
      expect(result.find(v => v.name === 'VERSO Capital 1 SCSP')).toBeDefined()
      expect(result.find(v => v.name === 'VERSO Capital 2 SCSP')).toBeDefined()
    })

    it('places real parents before virtual groups in sort order', () => {
      const vehicles: Vehicle[] = [
        { id: '1', name: 'VERSO FUND', type: 'fund' },
        { id: '2', name: 'VERSO Capital 1 SCSP Series 101', type: 'venture_capital' },
        { id: '3', name: 'SPV Delta', type: 'spv' },
      ]

      const result = parseVehicleHierarchy(vehicles)

      // First should be real parent (VERSO FUND)
      expect(result[0].name).toBe('VERSO FUND')
      expect(result[0].isVirtual).toBeUndefined()

      // Virtual groups after
      const virtualGroups = result.filter(v => v.isVirtual)
      expect(virtualGroups.length).toBe(2) // SCSP and Other
    })
  })

  describe('flattenVehicleHierarchy', () => {
    it('flattens hierarchy back to flat array', () => {
      const hierarchy: VehicleNode[] = [
        {
          id: '1',
          name: 'VERSO FUND',
          type: 'fund',
          isParent: true,
          children: [],
        },
        {
          id: 'virtual-scsp',
          name: 'VERSO Capital 1 SCSP',
          type: 'scsp',
          isParent: true,
          isVirtual: true,
          children: [
            { id: '2', name: 'Series 101', type: 'venture_capital', isParent: false, children: [] },
            { id: '3', name: 'Series 102', type: 'venture_capital', isParent: false, children: [] },
          ],
        },
      ]

      const result = flattenVehicleHierarchy(hierarchy)

      // Should include real vehicles only, not virtual parents
      expect(result).toHaveLength(3)
      expect(result.find(v => v.id === '1')).toBeDefined()
      expect(result.find(v => v.id === '2')).toBeDefined()
      expect(result.find(v => v.id === '3')).toBeDefined()
      expect(result.find(v => v.id === 'virtual-scsp')).toBeUndefined()
    })

    it('returns empty array for empty hierarchy', () => {
      expect(flattenVehicleHierarchy([])).toEqual([])
    })
  })

  describe('findVehicleInHierarchy', () => {
    const hierarchy: VehicleNode[] = [
      {
        id: '1',
        name: 'VERSO FUND',
        type: 'fund',
        isParent: true,
        children: [
          { id: '2', name: 'Child 1', type: 'spv', isParent: false, children: [] },
        ],
      },
      {
        id: 'virtual-scsp',
        name: 'VERSO Capital 1 SCSP',
        type: 'scsp',
        isParent: true,
        isVirtual: true,
        children: [
          { id: '3', name: 'Series 101', type: 'venture_capital', isParent: false, children: [] },
        ],
      },
    ]

    it('finds top-level node', () => {
      const result = findVehicleInHierarchy(hierarchy, '1')
      expect(result).toBeDefined()
      expect(result!.name).toBe('VERSO FUND')
    })

    it('finds nested node', () => {
      const result = findVehicleInHierarchy(hierarchy, '2')
      expect(result).toBeDefined()
      expect(result!.name).toBe('Child 1')
    })

    it('finds deeply nested node', () => {
      const result = findVehicleInHierarchy(hierarchy, '3')
      expect(result).toBeDefined()
      expect(result!.name).toBe('Series 101')
    })

    it('returns null for non-existent ID', () => {
      const result = findVehicleInHierarchy(hierarchy, 'non-existent')
      expect(result).toBeNull()
    })

    it('returns null for empty hierarchy', () => {
      const result = findVehicleInHierarchy([], '1')
      expect(result).toBeNull()
    })
  })
})
