"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  COMMON_ICONS,
  DRIZZLE_FIELD_DEFAULTS,
  DRIZZLE_TO_FIELD_KIND,
  type EntityDefinition,
  entityDefinitionSchema,
  type FieldDefinition,
  NAV_GROUPS,
} from "@/app/api/dev/generate-entity/schema";
import {
  generateDetailPage,
  generateDrizzleSchema,
  generateEntityConfig,
  generateListPage,
  generateORPCRouter,
} from "@/app/api/dev/generate-entity/templates";
import { SectionCard } from "@/components/admin-ui/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- 유틸리티 ---

function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");
}

function toPlural(str: string): string {
  const s = toSnakeCase(str);
  if (s.endsWith("s")) return s;
  if (s.endsWith("y")) return `${s.slice(0, -1)}ies`;
  return `${s}s`;
}

function toCamelCase(str: string): string {
  const plural = toPlural(str);
  return plural.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toKebabCase(str: string): string {
  return toPlural(str).replace(/_/g, "-");
}

// --- 기본값 ---

const defaultField: Omit<FieldDefinition, "name" | "columnName" | "label"> = {
  drizzleType: "text",
  fieldKind: "text",
  required: true,
  showInList: true,
  showInForm: true,
  readonly: false,
  searchable: true,
  filterable: false,
  sortable: true,
};

const defaultValues: EntityDefinition = {
  modelName: "",
  tableName: "",
  routerKey: "",
  slug: "",
  labelSingular: "",
  labelPlural: "",
  iconName: "FileText",
  navGroupId: "content",
  fields: [
    {
      name: "title",
      columnName: "title",
      label: "제목",
      ...defaultField,
    },
  ],
  listOptions: { showNewButton: true, clickable: true },
  detailOptions: { deletable: true, editable: true },
};

type GenerateResult = {
  success?: boolean;
  created?: string[];
  modified?: string[];
  nextSteps?: string[];
  error?: string;
  details?: string;
};

const DRIZZLE_TYPES: FieldDefinition["drizzleType"][] = [
  "text",
  "integer",
  "boolean",
  "timestamp",
  "uuid",
  "json",
];
const FIELD_KINDS: FieldDefinition["fieldKind"][] = [
  "text",
  "textarea",
  "number",
  "date",
  "datetime",
  "select",
  "checkbox",
  "image",
  "url",
  "email",
];

export function EntityGeneratorForm() {
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewTab, setPreviewTab] = useState(0);

  const form = useForm<EntityDefinition>({
    resolver: zodResolver(entityDefinitionSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  // modelName 변경 시 파생 필드 자동 설정
  const modelName = useWatch({ control: form.control, name: "modelName" });
  useEffect(() => {
    if (modelName && /^[A-Z][a-zA-Z]*$/.test(modelName)) {
      form.setValue("tableName", toPlural(modelName));
      form.setValue("routerKey", toCamelCase(modelName));
      form.setValue("slug", toKebabCase(modelName));
    }
  }, [modelName, form]);

  // 코드 미리보기
  const watchedValues = useWatch({ control: form.control });
  const previews = useMemo(() => {
    try {
      const def = watchedValues as EntityDefinition;
      if (!def.modelName || !def.tableName || !def.fields?.length) return null;
      return [
        { label: "Drizzle 스키마", code: generateDrizzleSchema(def) },
        { label: "oRPC 라우터", code: generateORPCRouter(def) },
        { label: "EntityConfig", code: generateEntityConfig(def) },
        { label: "목록 페이지", code: generateListPage(def) },
        { label: "상세 페이지", code: generateDetailPage(def) },
      ];
    } catch {
      return null;
    }
  }, [watchedValues]);

  const onSubmit = async (data: EntityDefinition) => {
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/dev/generate-entity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      setResult(json);
    } catch (err) {
      setResult({
        error: "네트워크 오류",
        details: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* 섹션 1: 기본 정보 */}
      <SectionCard title="기본 정보">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Model Name (PascalCase)"
            error={form.formState.errors.modelName?.message}
          >
            <Input placeholder="Announcement" {...form.register("modelName")} />
          </FormField>
          <FormField
            label="Table Name (snake_case)"
            error={form.formState.errors.tableName?.message}
          >
            <Input
              placeholder="announcements"
              {...form.register("tableName")}
            />
          </FormField>
          <FormField
            label="Router Key (camelCase)"
            error={form.formState.errors.routerKey?.message}
          >
            <Input
              placeholder="announcements"
              {...form.register("routerKey")}
            />
          </FormField>
          <FormField
            label="URL Slug (kebab-case)"
            error={form.formState.errors.slug?.message}
          >
            <Input placeholder="announcements" {...form.register("slug")} />
          </FormField>
          <FormField
            label="라벨 (단수)"
            error={form.formState.errors.labelSingular?.message}
          >
            <Input placeholder="공지" {...form.register("labelSingular")} />
          </FormField>
          <FormField
            label="라벨 (복수)"
            error={form.formState.errors.labelPlural?.message}
          >
            <Input placeholder="공지 목록" {...form.register("labelPlural")} />
          </FormField>
          <FormField label="아이콘">
            <select
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
              {...form.register("iconName")}
            >
              {COMMON_ICONS.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="네비게이션 그룹">
            <select
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
              {...form.register("navGroupId")}
            >
              {NAV_GROUPS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </SectionCard>

      {/* 섹션 2: 필드 빌더 */}
      <SectionCard
        title="필드 정의"
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                name: "",
                columnName: "",
                label: "",
                ...defaultField,
              })
            }
          >
            <Plus className="size-3.5" />
            필드 추가
          </Button>
        }
      >
        <div className="space-y-3">
          {/* 자동 포함 필드 안내 */}
          <p className="text-xs text-muted-foreground">
            id, createdAt, updatedAt는 자동 포함됩니다
          </p>

          {fields.map((field, index) => (
            <FieldRow
              key={field.id}
              index={index}
              form={form}
              onRemove={() => remove(index)}
            />
          ))}
        </div>
      </SectionCard>

      {/* 섹션 3+4: 옵션 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <SectionCard title="목록 옵션">
          <div className="space-y-2">
            <CheckboxField
              label="새로 만들기 버튼 표시"
              {...form.register("listOptions.showNewButton")}
            />
            <CheckboxField
              label="행 클릭 시 상세 이동"
              {...form.register("listOptions.clickable")}
            />
          </div>
        </SectionCard>
        <SectionCard title="상세 옵션">
          <div className="space-y-2">
            <CheckboxField
              label="삭제 가능"
              {...form.register("detailOptions.deletable")}
            />
            <CheckboxField
              label="수정 가능"
              {...form.register("detailOptions.editable")}
            />
          </div>
        </SectionCard>
      </div>

      {/* 섹션 5: 코드 미리보기 */}
      {previews && (
        <SectionCard title="코드 미리보기">
          <div className="flex gap-1 border-b border-border mb-3 overflow-x-auto">
            {previews.map((p, i) => (
              <button
                key={p.label}
                type="button"
                className={`px-3 py-1.5 text-xs whitespace-nowrap border-b-2 transition-colors ${
                  previewTab === i
                    ? "border-primary text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setPreviewTab(i)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <pre className="bg-muted/50 rounded-lg p-4 text-xs overflow-x-auto max-h-96">
            <code>{previews[previewTab]?.code ?? ""}</code>
          </pre>
        </SectionCard>
      )}

      {/* 섹션 6: 생성 버튼 + 결과 */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "생성 중..." : "엔티티 생성"}
        </Button>
        {form.formState.errors.fields && (
          <p className="text-sm text-destructive">
            {form.formState.errors.fields.message ??
              form.formState.errors.fields.root?.message}
          </p>
        )}
      </div>

      {result && <ResultPanel result={result} />}
    </form>
  );
}

// --- 서브 컴포넌트 ---

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function CheckboxField({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" className="rounded" {...props} />
      {label}
    </label>
  );
}

function FieldRow({
  index,
  form,
  onRemove,
}: {
  index: number;
  form: ReturnType<typeof useForm<EntityDefinition>>;
  onRemove: () => void;
}) {
  const drizzleType = useWatch({
    control: form.control,
    name: `fields.${index}.drizzleType`,
  });

  // name → columnName 자동 파생
  const fieldName = useWatch({
    control: form.control,
    name: `fields.${index}.name`,
  });
  useEffect(() => {
    if (fieldName) {
      const expected = toSnakeCase(fieldName);
      if (form.getValues(`fields.${index}.columnName`) !== expected) {
        form.setValue(`fields.${index}.columnName`, expected);
      }
    }
  }, [fieldName, form, index]);

  useEffect(() => {
    if (drizzleType) {
      const expectedKind = DRIZZLE_TO_FIELD_KIND[drizzleType];
      const defaults = DRIZZLE_FIELD_DEFAULTS[drizzleType];
      const prefix = `fields.${index}` as const;

      if (form.getValues(`${prefix}.fieldKind`) !== expectedKind)
        form.setValue(`${prefix}.fieldKind`, expectedKind);
      if (form.getValues(`${prefix}.searchable`) !== defaults.searchable)
        form.setValue(`${prefix}.searchable`, defaults.searchable);
      if (form.getValues(`${prefix}.filterable`) !== defaults.filterable)
        form.setValue(`${prefix}.filterable`, defaults.filterable);
      if (form.getValues(`${prefix}.sortable`) !== defaults.sortable)
        form.setValue(`${prefix}.sortable`, defaults.sortable);
    }
  }, [drizzleType, form, index]);

  return (
    <div className="rounded-lg border border-border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          필드 {index + 1}
        </span>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onRemove}>
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      </div>

      {/* 기본 필드 정보 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <span className="text-xs text-muted-foreground">name</span>
          <Input
            placeholder="title"
            className="mt-0.5"
            {...form.register(`fields.${index}.name`)}
          />
        </div>
        <div>
          <span className="text-xs text-muted-foreground">label</span>
          <Input
            placeholder="제목"
            className="mt-0.5"
            {...form.register(`fields.${index}.label`)}
          />
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Drizzle 타입</span>
          <select
            className="mt-0.5 h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
            {...form.register(`fields.${index}.drizzleType`)}
          >
            {DRIZZLE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">필드 타입</span>
          <select
            className="mt-0.5 h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
            {...form.register(`fields.${index}.fieldKind`)}
          >
            {FIELD_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 체크박스 옵션 */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <CheckboxField
          label="필수"
          {...form.register(`fields.${index}.required`)}
        />
        <CheckboxField
          label="목록"
          {...form.register(`fields.${index}.showInList`)}
        />
        <CheckboxField
          label="폼"
          {...form.register(`fields.${index}.showInForm`)}
        />
        <CheckboxField
          label="읽기전용"
          {...form.register(`fields.${index}.readonly`)}
        />
        <CheckboxField
          label="검색"
          {...form.register(`fields.${index}.searchable`)}
        />
        <CheckboxField
          label="필터"
          {...form.register(`fields.${index}.filterable`)}
        />
        <CheckboxField
          label="정렬"
          {...form.register(`fields.${index}.sortable`)}
        />
      </div>

      {/* Span 옵션 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Span:</span>
        <select
          className="h-7 rounded border border-input bg-transparent px-2 text-xs"
          {...form.register(`fields.${index}.span`, { valueAsNumber: true })}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
        </select>
      </div>
    </div>
  );
}

function ResultPanel({ result }: { result: GenerateResult }) {
  if (result.error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-2">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="size-4" />
          <span className="font-medium text-sm">{result.error}</span>
        </div>
        {result.details && (
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {result.details}
          </pre>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-green-500/50 bg-green-500/5 p-4 space-y-3">
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="size-4" />
        <span className="font-medium text-sm">엔티티 생성 완료!</span>
      </div>

      {result.created && result.created.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            생성된 파일:
          </p>
          <ul className="text-xs space-y-0.5">
            {result.created.map((f) => (
              <li key={f} className="font-mono text-green-600">
                + {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.modified && result.modified.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            수정된 파일:
          </p>
          <ul className="text-xs space-y-0.5">
            {result.modified.map((f) => (
              <li key={f} className="font-mono text-yellow-600">
                ~ {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.nextSteps && result.nextSteps.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            다음 단계:
          </p>
          <ol className="text-xs space-y-0.5 list-decimal list-inside">
            {result.nextSteps.map((step) => (
              <li key={step} className="font-mono">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
