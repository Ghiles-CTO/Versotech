"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { ReactNode, createContext, useContext, useState } from "react";
import { Button } from "@/components/ui/button";

export type { ColumnDef };

interface TableContextType<T> {
  table: ReturnType<typeof useReactTable<T>>;
}

const TableContext = createContext<TableContextType<any> | undefined>(
  undefined
);

function useTableContext<T>() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTableContext must be used within TableProvider");
  }
  return context as TableContextType<T>;
}

interface TableProviderProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  children: ReactNode;
}

export function TableProvider<T>({
  columns,
  data,
  children,
}: TableProviderProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <TableContext.Provider value={{ table }}>
      <div className="w-full overflow-auto">
        <table className="w-full">{children}</table>
      </div>
    </TableContext.Provider>
  );
}

interface TableHeaderProps<T> {
  children: (context: {
    headerGroup: ReturnType<typeof useReactTable<T>>["getHeaderGroups"][number];
  }) => ReactNode;
}

export function TableHeader<T>({ children }: TableHeaderProps<T>) {
  const { table } = useTableContext<T>();

  return (
    <thead className="border-b border-white/10 bg-white/5">
      {table.getHeaderGroups().map((headerGroup) =>
        children({ headerGroup })
      )}
    </thead>
  );
}

interface TableHeaderGroupProps<T> {
  headerGroup: ReturnType<typeof useReactTable<T>>["getHeaderGroups"][number];
  children: (context: {
    header: ReturnType<typeof useReactTable<T>>["getHeaderGroups"][number]["headers"][number];
  }) => ReactNode;
}

export function TableHeaderGroup<T>({
  headerGroup,
  children,
}: TableHeaderGroupProps<T>) {
  return <tr>{headerGroup.headers.map((header) => children({ header }))}</tr>;
}

interface TableHeadProps<T> {
  header: ReturnType<
    typeof useReactTable<T>
  >["getHeaderGroups"][number]["headers"][number];
}

export function TableHead<T>({ header }: TableHeadProps<T>) {
  return (
    <th
      key={header.id}
      className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
    >
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext())}
    </th>
  );
}

interface TableColumnHeaderProps {
  column: any;
  title: string;
}

export function TableColumnHeader({ column, title }: TableColumnHeaderProps) {
  if (!column.getCanSort()) {
    return <span>{title}</span>;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <span>{title}</span>
      {column.getIsSorted() === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}

interface TableBodyProps<T> {
  children: (context: {
    row: ReturnType<typeof useReactTable<T>>["getRowModel"]["rows"][number];
  }) => ReactNode;
}

export function TableBody<T>({ children }: TableBodyProps<T>) {
  const { table } = useTableContext<T>();

  return (
    <tbody>
      {table.getRowModel().rows.length ? (
        table.getRowModel().rows.map((row) => children({ row }))
      ) : (
        <tr>
          <td
            colSpan={table.getAllColumns().length}
            className="h-24 text-center text-muted-foreground"
          >
            No results.
          </td>
        </tr>
      )}
    </tbody>
  );
}

interface TableRowProps<T> {
  row: ReturnType<typeof useReactTable<T>>["getRowModel"]["rows"][number];
  children: (context: {
    cell: ReturnType<
      typeof useReactTable<T>
    >["getRowModel"]["rows"][number]["getVisibleCells"][number];
  }) => ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow<T>({ row, children, className, onClick }: TableRowProps<T>) {
  return (
    <tr
      data-state={row.getIsSelected() && "selected"}
      className={className}
      onClick={onClick}
    >
      {row.getVisibleCells().map((cell) => children({ cell }))}
    </tr>
  );
}

interface TableCellProps<T> {
  cell: ReturnType<
    typeof useReactTable<T>
  >["getRowModel"]["rows"][number]["getVisibleCells"][number];
}

export function TableCell<T>({ cell }: TableCellProps<T>) {
  return (
    <td className="px-4 py-3 text-sm text-foreground">
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
}
