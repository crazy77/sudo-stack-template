"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PageContainer } from "@/components/admin-ui/page-container";
import { PageHeader } from "@/components/admin-ui/page-header";
import { SectionCard } from "@/components/admin-ui/section-card";
import { Button } from "@/components/ui/button";
import type { EntityConfig } from "@/entities/types";
import { buildFormSchema } from "./build-form-schema";
import { EntityFormField } from "./entity-form-field";
import { getEntityActions } from "./use-entity-actions";

interface EntityCreateViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: EntityConfig<any>;
}

export function EntityCreateView({ config }: EntityCreateViewProps) {
  const router = useRouter();
  const actions = getEntityActions(config.slug);
  const editableFields = config.fields?.filter((f) => !f.readonly) ?? [];
  const schema = buildFormSchema(editableFields);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: editableFields.reduce(
      (acc, field) => {
        acc[field.name] = field.type.kind === "checkbox" ? false : "";
        return acc;
      },
      {} as Record<string, unknown>,
    ),
  });

  const onSubmit = async (values: Record<string, unknown>) => {
    if (!actions.create) return;
    try {
      const created = (await actions.create(values)) as { id: string };
      toast.success("생성되었습니다");
      router.push(`/${config.slug}/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "생성에 실패했습니다");
    }
  };

  return (
    <PageContainer>
      <div className="flex items-center gap-3">
        <Link href={`/${config.slug}`}>
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <PageHeader icon={config.icon} title={`${config.label} 작성`} />
      </div>

      <SectionCard title="기본 정보">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {editableFields.map((field) => (
              <EntityFormField
                key={field.name}
                field={field}
                register={form.register}
                error={form.formState.errors[field.name]?.message as string}
              />
            ))}
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              <Plus className="size-3.5" />
              {form.formState.isSubmitting ? "생성 중..." : "생성"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </PageContainer>
  );
}
