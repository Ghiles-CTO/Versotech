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
import {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

interface Column {
  id: string;
  name: string;
  color?: string;
}

interface KanbanContextType<T> {
  columns: Column[];
  data: T[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  onDataChange: (data: T[]) => void;
}

const KanbanContext = createContext<KanbanContextType<any> | undefined>(
  undefined
);

function useKanban<T>() {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error("useKanban must be used within KanbanProvider");
  }
  return context as KanbanContextType<T>;
}

interface KanbanProviderProps<T> {
  columns: Column[];
  data: T[];
  onDataChange: (data: T[]) => void;
  children: (column: Column) => ReactNode;
}

export function KanbanProvider<T extends { id: string; status?: string | null }>({
  columns,
  data,
  onDataChange,
  children,
}: KanbanProviderProps<T>) {
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
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeItem = data.find((item) => item.id === active.id);
    const overColumn = columns.find((col) => col.id === over.id);

    if (activeItem && overColumn && activeItem.status !== overColumn.id) {
      const updatedData = data.map((item) =>
        item.id === active.id ? { ...item, status: overColumn.id } : item
      );
      onDataChange(updatedData);
    }

    setActiveId(null);
  };

  return (
    <KanbanContext.Provider
      value={{ columns, data, activeId, setActiveId, onDataChange }}
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => children(column))}
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="rounded-lg border border-white/20 bg-card p-3 shadow-lg opacity-80">
              Dragging...
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </KanbanContext.Provider>
  );
}

interface KanbanBoardProps {
  id: string;
  children: ReactNode;
}

export function KanbanBoard({ id, children }: KanbanBoardProps) {
  const { setNodeRef } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className="flex min-w-[300px] flex-1 flex-col rounded-lg border border-white/10 bg-white/5"
    >
      {children}
    </div>
  );
}

interface KanbanHeaderProps {
  children: ReactNode;
}

export function KanbanHeader({ children }: KanbanHeaderProps) {
  return (
    <div className="border-b border-white/10 p-4 font-semibold text-foreground">
      {children}
    </div>
  );
}

interface KanbanCardsProps<T> {
  id: string;
  children: (item: T) => ReactNode;
}

export function KanbanCards<T extends { id: string; status?: string | null }>({
  id,
  children,
}: KanbanCardsProps<T>) {
  const { data } = useKanban<T>();

  const items = useMemo(
    () => data.filter((item) => item.status === id),
    [data, id]
  );

  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  return (
    <SortableContext items={itemIds}>
      <div className="flex flex-col gap-2 p-4 min-h-[200px]">
        {items.map((item) => children(item))}
      </div>
    </SortableContext>
  );
}

interface KanbanCardProps {
  id: string;
  column: string;
  name: string;
  children: ReactNode;
  onClick?: () => void;
}

export function KanbanCard({ id, column, children, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: { column } });

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
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
    >
      {children}
    </div>
  );
}
