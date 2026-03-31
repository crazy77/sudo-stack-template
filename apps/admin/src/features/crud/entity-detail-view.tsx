"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Pencil, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

interface EntityDetailViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: EntityConfig<any>;
  data: Record<string, unknown>;
}

export function EntityDetailView({ config, data }: EntityDetailViewProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const actions = getEntityActions(config.slug);
  const editable = config.detailOptions?.editable && !!actions.update;
  const deletable = config.detailOptions?.deletable && !!actions.delete;
  const editableFields = config.fields?.filter((f) => !f.readonly) ?? [];

  const schema =
    editableFields.length > 0 ? buildFormSchema(editableFields) : null;

  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: editableFields.reduce(
      (acc, field) => {
        acc[field.name] = data[field.name] ?? "";
        return acc;
      },
      {} as Record<string, unknown>,
    ),
  });

  const onSave = async (values: Record<string, unknown>) => {
    if (!actions.update) return;
    try {
      await actions.update(data.id as string, values);
      toast.success("저장되었습니다");
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "저장에 실패했습니다");
    }
  };

  const onDelete = async () => {
    if (!actions.delete) return;
    setIsDeleting(true);
    try {
      await actions.delete(data.id as string);
      toast.success("삭제되었습니다");
      router.push(`/${config.slug}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "삭제에 실패했습니다");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/${config.slug}`}>
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <PageHeader icon={config.icon} title={`${config.label} 상세`} />
        </div>

        <div className="flex items-center gap-2">
          {editable && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="size-3.5" />
              수정
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (
                    form.formState.isDirty &&
                    !window.confirm(
                      "저장하지 않은 변경사항이 있습니다. 취소하시겠습니까?",
                    )
                  )
                    return;
                  setIsEditing(false);
                  form.reset();
                }}
              >
                <X className="size-3.5" />
                취소
              </Button>
              <Button
                size="sm"
                onClick={form.handleSubmit(onSave)}
                disabled={form.formState.isSubmitting}
              >
                <Save className="size-3.5" />
                {form.formState.isSubmitting ? "저장 중..." : "저장"}
              </Button>
            </>
          )}
          {deletable && !isEditing && !showDeleteConfirm && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="size-3.5" />
              삭제
            </Button>
          )}
          {showDeleteConfirm && (
            <>
              <span className="text-xs text-destructive">
                정말 삭제하시겠습니까?
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "삭제 중..." : "확인"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                취소
              </Button>
            </>
          )}
        </div>
      </div>

      <SectionCard title="기본 정보">
        {isEditing && editableFields.length > 0 ? (
          <form
            onSubmit={form.handleSubmit(onSave)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4"
          >
            {editableFields.map((field) => (
              <EntityFormField
                key={field.name}
                field={field}
                register={form.register}
                error={form.formState.errors[field.name]?.message as string}
              />
            ))}
          </form>
        ) : config.fields && config.fields.length > 0 ? (
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
  if (typeof value === "boolean") return value ? "예" : "아니오";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
