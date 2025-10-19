'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Building2, Eye, Pencil } from 'lucide-react'
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider
} from '@/components/kibo-ui/kanban'
import type { DragEndEvent } from '@/components/kibo-ui/list'
import {
  ListGroup,
  ListHeader,
  ListItem,
  ListItems,
  ListProvider
} from '@/components/kibo-ui/list'
import type { ColumnDef } from '@/components/kibo-ui/table'
import {
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow
} from '@/components/kibo-ui/table'

export interface Entity {
  id: string
  name: string
  entity_code: string | null
  platform: string | null
  investment_name: string | null
  former_entity: string | null
  status: string | null
  type: string
  domicile: string | null
  currency: string
  formation_date?: string | null
  legal_jurisdiction?: string | null
  registration_number?: string | null
  reporting_type?: string | null
  requires_reporting?: boolean
  notes?: string | null
  created_at: string
  logo_url?: string | null
  website_url?: string | null
}

interface EntitiesViewProps {
  entities: Entity[]
  onEntityClick: (id: string) => void
  onEntityEdit: (entity: Entity) => void
  onStatusChange?: (entityId: string, newStatus: string) => void
}

const entityTypeLabels: Record<string, string> = {
  fund: 'Fund',
  spv: 'SPV',
  securitization: 'Securitization',
  note: 'Note',
  venture_capital: 'Venture Capital',
  private_equity: 'Private Equity',
  real_estate: 'Real Estate',
  other: 'Other'
}

const statusConfig = [
  { id: 'LIVE', name: 'LIVE', color: '#10B981' },
  { id: 'CLOSED', name: 'CLOSED', color: '#EF4444' },
  { id: 'TBD', name: 'TBD', color: '#F59E0B' }
]

const getStatusColor = (status: string | null) => {
  if (status === 'LIVE') return 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
  if (status === 'CLOSED') return 'bg-red-500/20 border-red-400/40 text-red-100'
  if (status === 'TBD') return 'bg-amber-500/20 border-amber-400/40 text-amber-100'
  return 'bg-white/10 border-white/10 text-foreground'
}

// Table View Component
export function EntitiesTableView({ entities, onEntityClick, onEntityEdit }: EntitiesViewProps) {
  const columns: ColumnDef<Entity>[] = [
    {
      accessorKey: 'entity_code',
      header: ({ column }) => <TableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => (
        <div className="font-mono text-xs">
          {row.original.entity_code ? (
            <Badge variant="outline" className="border-emerald-400/40 text-emerald-100">
              {row.original.entity_code}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      )
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <TableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 min-w-[200px]">
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <div className="font-medium text-foreground">{row.original.name}</div>
            {row.original.former_entity && (
              <div className="text-xs text-muted-foreground">
                Formerly: {row.original.former_entity}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'investment_name',
      header: ({ column }) => <TableColumnHeader column={column} title="Investment" />,
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.investment_name || '—'}
        </span>
      )
    },
    {
      accessorKey: 'platform',
      header: ({ column }) => <TableColumnHeader column={column} title="Platform" />,
      cell: ({ row }) =>
        row.original.platform ? (
          <Badge className="bg-white/10 border-white/10 text-foreground">
            {row.original.platform}
          </Badge>
        ) : (
          '—'
        )
    },
    {
      accessorKey: 'type',
      header: ({ column }) => <TableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => (
        <Badge className="bg-white/10 border-white/10 text-foreground">
          {entityTypeLabels[row.original.type] || row.original.type}
        </Badge>
      )
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <TableColumnHeader column={column} title="Status" />,
      cell: ({ row }) =>
        row.original.status ? (
          <Badge className={getStatusColor(row.original.status)}>
            {row.original.status}
          </Badge>
        ) : (
          '—'
        )
    },
    {
      accessorKey: 'currency',
      header: ({ column }) => <TableColumnHeader column={column} title="Currency" />,
      cell: ({ row }) => <span className="text-foreground">{row.original.currency}</span>
    },
    {
      accessorKey: 'reporting_type',
      header: ({ column }) => <TableColumnHeader column={column} title="Reporting" />,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.reporting_type || '—'}
        </span>
      )
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation()
              onEntityClick(row.original.id)
            }}
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation()
              onEntityEdit(row.original)
            }}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <TableProvider columns={columns} data={entities}>
        <TableHeader>
          {({ headerGroup }) => (
            <TableHeaderGroup headerGroup={headerGroup} key={headerGroup.id}>
              {({ header }) => <TableHead header={header} key={header.id} />}
            </TableHeaderGroup>
          )}
        </TableHeader>
        <TableBody>
          {({ row }) => (
            <TableRow
              key={row.id}
              row={row}
              className="cursor-pointer hover:bg-white/10"
              onClick={() => onEntityClick(row.original.id)}
            >
              {({ cell }) => <TableCell cell={cell} key={cell.id} />}
            </TableRow>
          )}
        </TableBody>
      </TableProvider>
    </div>
  )
}

// List View Component
export function EntitiesListView({ entities, onEntityClick, onStatusChange }: EntitiesViewProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || !onStatusChange) return

    const newStatus = over.id as string
    const statusExists = statusConfig.find((s) => s.name === newStatus)

    if (statusExists) {
      onStatusChange(active.id as string, newStatus)
    }
  }

  return (
    <ListProvider onDragEnd={handleDragEnd}>
      {statusConfig.map((status) => (
        <ListGroup id={status.name} key={status.name}>
          <ListHeader color={status.color} name={status.name} />
          <ListItems>
            {entities
              .filter((entity) => entity.status === status.name)
              .map((entity, index) => (
                <ListItem
                  id={entity.id}
                  index={index}
                  key={entity.id}
                  name={entity.name}
                  parent={status.name}
                >
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <div className="flex-1 min-w-0">
                    {entity.entity_code && (
                      <Badge
                        variant="outline"
                        className="font-mono text-xs border-emerald-400/40 text-emerald-100 mb-1"
                      >
                        {entity.entity_code}
                      </Badge>
                    )}
                    <p className="m-0 font-medium text-sm truncate">{entity.name}</p>
                    <p className="m-0 text-xs text-muted-foreground truncate">
                      {entity.investment_name || entity.platform || '—'}
                    </p>
                  </div>
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarFallback className="text-xs bg-white/10">
                      {entity.platform?.slice(0, 2) || entity.entity_code?.slice(0, 2) || '—'}
                    </AvatarFallback>
                  </Avatar>
                </ListItem>
              ))}
          </ListItems>
        </ListGroup>
      ))}
    </ListProvider>
  )
}

// Kanban View Component
export function EntitiesKanbanView({ entities, onEntityClick, onStatusChange }: EntitiesViewProps) {
  const [localEntities, setLocalEntities] = useState(entities)

  useEffect(() => {
    setLocalEntities(entities)
  }, [entities])

  const handleDataChange = (newData: Entity[]) => {
    setLocalEntities(newData)

    // Find the entity that changed status
    const changedEntity = newData.find((newEntity) => {
      const oldEntity = entities.find((e) => e.id === newEntity.id)
      return oldEntity && oldEntity.status !== newEntity.status
    })

    if (changedEntity && onStatusChange) {
      onStatusChange(changedEntity.id, changedEntity.status || 'TBD')
    }
  }

  return (
    <KanbanProvider columns={statusConfig} data={localEntities} onDataChange={handleDataChange}>
      {(column) => (
        <KanbanBoard id={column.id} key={column.id}>
          <KanbanHeader>
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <span>{column.name}</span>
              <Badge variant="outline" className="ml-auto">
                {localEntities.filter((e) => e.status === column.name).length}
              </Badge>
            </div>
          </KanbanHeader>
          <KanbanCards id={column.id}>
            {(entity: Entity) => (
              <KanbanCard
                column={column.id}
                id={entity.id}
                key={entity.id}
                name={entity.name}
                onClick={() => onEntityClick(entity.id)}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {entity.entity_code && (
                        <Badge
                          variant="outline"
                          className="font-mono text-xs border-emerald-400/40 text-emerald-100 mb-1"
                        >
                          {entity.entity_code}
                        </Badge>
                      )}
                      <p className="m-0 font-medium text-sm">{entity.name}</p>
                    </div>
                    <Avatar className="h-5 w-5 shrink-0">
                      <AvatarFallback className="text-xs bg-white/10">
                        {entity.platform?.slice(0, 2) ||
                          entity.entity_code?.slice(0, 2) ||
                          '—'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {entity.investment_name && (
                    <p className="m-0 text-xs text-muted-foreground font-medium">
                      {entity.investment_name}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    {entity.platform && (
                      <Badge className="bg-white/10 border-white/10 text-foreground text-xs">
                        {entity.platform}
                      </Badge>
                    )}
                    {entity.reporting_type && (
                      <span className="text-xs text-muted-foreground">
                        {entity.reporting_type}
                      </span>
                    )}
                  </div>
                </div>
              </KanbanCard>
            )}
          </KanbanCards>
        </KanbanBoard>
      )}
    </KanbanProvider>
  )
}
