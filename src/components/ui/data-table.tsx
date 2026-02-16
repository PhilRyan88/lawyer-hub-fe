import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
  onLimitChange,
}: DataTableProps<TData, TValue> & {
    pageCount?: number;
    pageIndex?: number; // 0-indexed for Tanstack? Our API is 1-indexed. Let's stick to 1-indexed props for simplicity or map it.
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onLimitChange?: (limit: number) => void;
}) {
  // Tanstack Table State
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(), // Disable client-side pagination if server-side is used
    manualPagination: true, // We are handling pagination manually (server-side)
    pageCount: pageCount || -1, 
  })

  return (
    <div>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => onRowClick && onRowClick(row.original)}
                className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    
    {/* Pagination Controls */}
    <div className="flex items-center justify-between py-4">
        {/* Rows per page */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page</span>
            <select 
                className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={pageSize}
                onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
            >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
            </select>
        </div>

        {/* Page Info & Nav */}
        <div className="flex items-center gap-4">
             <div className="text-sm font-medium">
                Page {pageIndex} of {pageCount}
            </div>
            <div className="flex items-center space-x-2">
                <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange && onPageChange((pageIndex || 1) - 1)}
                disabled={!pageIndex || pageIndex <= 1}
                >
                Previous
                </Button>
                <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange && onPageChange((pageIndex || 1) + 1)}
                disabled={!pageIndex || !pageCount || pageIndex >= pageCount}
                >
                Next
                </Button>
            </div>
        </div>
      </div>
    </div>
  )
}
