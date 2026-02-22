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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"

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
  pageIndex = 1,
  pageSize,
  onPageChange,
  onLimitChange,
}: DataTableProps<TData, TValue> & {
    pageCount?: number;
    pageIndex?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onLimitChange?: (limit: number) => void;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pageCount || -1, 
  })

  return (
    <div className="w-full space-y-4">
      <div className="rounded-[24px] border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-300 dark:border-slate-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-14 px-6 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className={cn(
                    "group transition-all duration-200 border-b border-slate-100 dark:border-slate-900 last:border-0",
                    onRowClick ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40" : ""
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center text-slate-400 italic">
                  No cases found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Premium Pagination Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-2">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">View</span>
                <select 
                    className="h-9 w-20 rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-2 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer hover:border-primary/50"
                    value={pageSize}
                    onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
                >
                    {[20, 50, 100].map(val => <option key={val} value={val}>{val}</option>)}
                </select>
            </div>
            <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Page <span className="text-primary">{pageIndex}</span> of {pageCount}
            </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onPageChange && onPageChange(1)}
                disabled={pageIndex <= 1}
                className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary transition-all shadow-sm"
            >
                <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onPageChange && onPageChange(pageIndex - 1)}
                disabled={pageIndex <= 1}
                className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary transition-all shadow-sm"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center px-4 font-bold text-sm min-w-[3rem] justify-center">
                {pageIndex}
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => onPageChange && onPageChange(pageIndex + 1)}
                disabled={!pageCount || pageIndex >= pageCount}
                className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary transition-all shadow-sm"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onPageChange && onPageChange(pageCount || 1)}
                disabled={!pageCount || pageIndex >= pageCount}
                className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary transition-all shadow-sm"
            >
                <ChevronsRight className="h-4 w-4" />
            </Button>
        </div>
      </div>
    </div>
  )
}
