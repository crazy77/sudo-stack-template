"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  onRowClick?: (row: T) => void;
  pageSize?: number;
  /** 서버사이드 소팅 모드 (클라이언트 소팅 비활성화) */
  manualSorting?: boolean;
  /** 서버사이드 페이지네이션 모드 (내장 페이지네이션 비활성화) */
  manualPagination?: boolean;
  /** 외부 제어 소팅 상태 */
  sorting?: SortingState;
  /** 소팅 변경 콜백 */
  onSortingChange?: (sorting: SortingState) => void;
  /** 총 데이터 수 (서버사이드일 때 표시용) */
  totalLabel?: string;
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  pageSize = 20,
  manualSorting = false,
  manualPagination = false,
  sorting: externalSorting,
  onSortingChange: onExternalSortingChange,
  totalLabel,
}: DataTableProps<T>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const sorting = externalSorting ?? internalSorting;
  const setSorting = (
    updater: SortingState | ((prev: SortingState) => SortingState),
  ) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    if (onExternalSortingChange) onExternalSortingChange(next);
    else setInternalSorting(next);
  };

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting as never,
    manualSorting,
    manualPagination,
    getCoreRowModel: getCoreRowModel(),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    ...(manualPagination
      ? {}
      : { getPaginationRowModel: getPaginationRowModel() }),
    initialState: {
      pagination: { pageSize },
    },
  });

  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className={cn(
                          "flex items-center gap-1",
                          header.column.getCanSort() &&
                            "cursor-pointer hover:text-foreground transition-colors",
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() &&
                          ({
                            asc: <ChevronUp className="size-3.5" />,
                            desc: <ChevronDown className="size-3.5" />,
                          }[header.column.getIsSorted() as string] ?? (
                            <ChevronsUpDown className="size-3.5 opacity-40" />
                          ))}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-16 text-center text-muted-foreground"
                >
                  데이터가 없습니다
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "hover:bg-muted/30 transition-colors",
                    onRowClick && "cursor-pointer",
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with pagination */}
      {!manualPagination && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/30">
          <span className="text-xs text-muted-foreground">
            {totalLabel ?? `총 ${data.length}개`}
            {pageCount > 1 && ` · ${currentPage + 1} / ${pageCount} 페이지`}
          </span>

          {pageCount > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
