"use client";

import type { SortingState } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import { PageContainer } from "@/components/admin-ui/page-container";
import { PageHeader } from "@/components/admin-ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { entityConfigs } from "@/entities/registry";
import type { EntityConfig } from "@/entities/types";

import { DataTable } from "./data-table";

interface EntityListViewProps {
  entity: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: any[];
  pagination?: {
    nextCursor?: string;
    hasMore: boolean;
  };
}

export function EntityListView({
  entity,
  initialData,
  pagination,
}: EntityListViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const config = entityConfigs[entity];

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      if (!("cursor" in updates)) {
        params.delete("cursor");
      }
      startTransition(() => {
        router.replace(`/${entity}?${params.toString()}`);
      });
    },
    [searchParams, router, entity],
  );

  if (!config) {
    return (
      <p className="text-sm text-muted-foreground">
        알 수 없는 엔티티: {entity}
      </p>
    );
  }

  const hasPagination = !!pagination;
  const clickable = config.listOptions?.clickable !== false;
  const listMeta = config.listMeta;

  return (
    <PageContainer>
      <PageHeader
        icon={config.icon}
        title={config.labelPlural}
        actions={
          config.listOptions?.showNewButton && (
            <Link href={`/${config.slug}/new`}>
              <Button size="sm">
                <Plus className="size-4" data-icon="inline-start" />
                {config.label} 추가
              </Button>
            </Link>
          )
        }
      />

      {hasPagination && listMeta && (
        <ServerToolbar
          listMeta={listMeta}
          searchParams={searchParams}
          updateParams={updateParams}
        />
      )}

      <div
        className={
          isPending ? "opacity-60 pointer-events-none transition-opacity" : ""
        }
      >
        <DataTable
          columns={config.columns}
          data={initialData}
          manualSorting={hasPagination}
          manualPagination={hasPagination}
          sorting={
            hasPagination && searchParams.get("sortBy")
              ? [
                  {
                    id: searchParams.get("sortBy") ?? "",
                    desc: searchParams.get("sortOrder") !== "asc",
                  },
                ]
              : undefined
          }
          onSortingChange={
            hasPagination
              ? (sorting: SortingState) => {
                  const sort = sorting[0];
                  if (sort) {
                    updateParams({
                      sortBy: sort.id,
                      sortOrder: sort.desc ? "desc" : "asc",
                    });
                  } else {
                    updateParams({ sortBy: undefined, sortOrder: undefined });
                  }
                }
              : undefined
          }
          onRowClick={
            clickable
              ? (row) => {
                  const id = (row as Record<string, unknown>).id;
                  if (id) router.push(`/${config.slug}/${id}`);
                }
              : undefined
          }
        />
      </div>

      {hasPagination && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {initialData.length}개 표시
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={!searchParams.get("cursor")}
              onClick={() => updateParams({ cursor: undefined })}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={!pagination.hasMore}
              onClick={() => {
                if (pagination.nextCursor) {
                  updateParams({ cursor: pagination.nextCursor });
                }
              }}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

// --- 서버사이드 툴바 ---

function ServerToolbar({
  listMeta,
  searchParams,
  updateParams,
}: {
  listMeta: NonNullable<EntityConfig["listMeta"]>;
  searchParams: ReturnType<typeof useSearchParams>;
  updateParams: (updates: Record<string, string | undefined>) => void;
}) {
  const hasSearch =
    listMeta.searchableFields && listMeta.searchableFields.length > 0;
  const hasFilters =
    listMeta.filterableFields && listMeta.filterableFields.length > 0;
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? "",
  );

  if (!hasSearch && !hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {hasSearch && (
        <form
          className="relative flex-1 min-w-[200px] max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            updateParams({ search: searchInput || undefined });
          }}
        >
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8 pr-8"
          />
          {searchInput && (
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearchInput("");
                updateParams({ search: undefined });
              }}
            >
              <X className="size-3.5" />
            </button>
          )}
        </form>
      )}

      {hasFilters &&
        listMeta.filterableFields?.map((filter) => {
          const filterId = `filter-${filter.name}`;
          return (
            <div key={filter.name} className="flex items-center gap-1.5">
              <label
                htmlFor={filterId}
                className="text-xs text-muted-foreground whitespace-nowrap"
              >
                {filter.label}
              </label>
              {filter.type === "boolean" ? (
                <select
                  id={filterId}
                  className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
                  value={searchParams.get(filter.name) ?? ""}
                  onChange={(e) =>
                    updateParams({
                      [filter.name]: e.target.value || undefined,
                    })
                  }
                >
                  <option value="">전체</option>
                  <option value="true">예</option>
                  <option value="false">아니오</option>
                </select>
              ) : filter.type === "select" && filter.options ? (
                <select
                  id={filterId}
                  className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
                  value={searchParams.get(filter.name) ?? ""}
                  onChange={(e) =>
                    updateParams({
                      [filter.name]: e.target.value || undefined,
                    })
                  }
                >
                  <option value="">전체</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={filterId}
                  className="h-8 w-32"
                  placeholder={filter.label}
                  value={searchParams.get(filter.name) ?? ""}
                  onChange={(e) =>
                    updateParams({
                      [filter.name]: e.target.value || undefined,
                    })
                  }
                />
              )}
            </div>
          );
        })}
    </div>
  );
}
