"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/admin-ui/page-container";
import { PageHeader } from "@/components/admin-ui/page-header";
import { SectionCard } from "@/components/admin-ui/section-card";
import { Button } from "@/components/ui/button";
import type { EntityConfig } from "@/entities/types";

interface EntityDetailViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: EntityConfig<any>;
  data: Record<string, unknown>;
}

export function EntityDetailView({ config, data }: EntityDetailViewProps) {
  return (
    <PageContainer>
      <div className="flex items-center gap-3">
        <Link href={`/${config.slug}`}>
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <PageHeader icon={config.icon} title={`${config.label} 상세`} />
      </div>

      <SectionCard title="기본 정보">
        {config.fields && config.fields.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {config.fields.map((field) => {
              const value = data[field.name];
              return (
                <div
                  key={field.name}
                  className={field.span === 2 ? "sm:col-span-2" : ""}
                >
                  <dt className="text-xs font-medium text-muted-foreground mb-1">
                    {field.label}
                  </dt>
                  <dd className="text-sm text-foreground">
                    {formatValue(value, field.type.kind)}
                  </dd>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {Object.entries(data).map(([key, value]) => (
              <div key={key}>
                <dt className="text-xs font-medium text-muted-foreground mb-1">
                  {key}
                </dt>
                <dd className="text-sm text-foreground">
                  {formatValue(value, "text")}
                </dd>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PageContainer>
  );
}

function formatValue(value: unknown, kind: string): string {
  if (value === null || value === undefined) return "—";
  if (kind === "date" || kind === "datetime") {
    return new Date(value as string).toLocaleString("ko-KR");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
