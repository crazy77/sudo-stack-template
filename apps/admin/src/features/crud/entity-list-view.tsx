"use client";

import { postsConfig } from "@/entities/posts/config";
import { usersConfig } from "@/entities/users/config";
import type { EntityConfig } from "@/entities/types";
import { DataTable } from "./data-table";

const entityConfigs: Record<string, EntityConfig<any>> = {
  posts: postsConfig,
  users: usersConfig,
};

interface EntityListViewProps {
  entity: string;
  initialData: any[];
}

export function EntityListView({ entity, initialData }: EntityListViewProps) {
  const config = entityConfigs[entity];

  if (!config) {
    return (
      <p className="text-sm text-muted-foreground">
        알 수 없는 엔티티: {entity}
      </p>
    );
  }

  const Icon = config.icon;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="size-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">{config.labelPlural}</h1>
      </div>
      <DataTable columns={config.columns} data={initialData} />
    </div>
  );
}
