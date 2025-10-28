"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode, createContext, useContext, useState } from "react";

export type { DragEndEvent };

interface ListContextType {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

const ListContext = createContext<ListContextType | undefined>(undefined);

function useList() {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error("useList must be used within ListProvider");
  }
  return context;
}

interface ListProviderProps {
  children: ReactNode;
  onDragEnd?: (event: DragEndEvent) => void;
}

export function ListProvider({ children, onDragEnd }: ListProviderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    onDragEnd?.(event);
  };

  return (
    <ListContext.Provider value={{ activeId, setActiveId }}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">{children}</div>
        <DragOverlay>
          {activeId ? (
            <div className="rounded-lg border border-white/20 bg-card p-3 shadow-lg opacity-80">
              Dragging...
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </ListContext.Provider>
  );
}

interface ListGroupProps {
  id: string;
  children: ReactNode;
}

export function ListGroup({ id, children }: ListGroupProps) {
  const { setNodeRef } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className="rounded-lg border border-white/10 bg-white/5"
    >
      {children}
    </div>
  );
}

interface ListHeaderProps {
  name: string;
  color?: string;
}

export function ListHeader({ name, color }: ListHeaderProps) {
  return (
    <div className="flex items-center gap-2 border-b border-white/10 p-4 font-semibold text-foreground">
      {color && (
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      <span>{name}</span>
    </div>
  );
}

interface ListItemsProps {
  children: ReactNode;
}

export function ListItems({ children }: ListItemsProps) {
  return <div className="space-y-2 p-4">{children}</div>;
}

interface ListItemProps {
  id: string;
  index: number;
  name: string;
  parent: string;
  children: ReactNode;
}

export function ListItem({ id, parent, children }: ListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: { parent } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
    >
      {children}
    </div>
  );
}
