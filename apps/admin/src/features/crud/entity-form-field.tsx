import type { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { FieldConfig } from "@/entities/types";

interface EntityFormFieldProps {
  field: FieldConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  error?: string;
}

export function EntityFormField({
  field,
  register,
  error,
}: EntityFormFieldProps) {
  const isCheckbox = field.type.kind === "checkbox";

  return (
    <div className={field.span === 2 ? "sm:col-span-2" : ""}>
      {!isCheckbox && (
        <label
          htmlFor={field.name}
          className="text-xs font-medium text-muted-foreground mb-1 block"
        >
          {field.label}
        </label>
      )}
      {renderInput(field, register)}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function renderInput(
  field: FieldConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>,
) {
  const { kind } = field.type;
  const commonClass =
    "w-full rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

  switch (kind) {
    case "textarea":
      return (
        <textarea
          id={field.name}
          className={`${commonClass} h-24 py-1.5 resize-y text-base md:text-sm`}
          placeholder={field.placeholder}
          {...register(field.name)}
        />
      );
    case "number":
      return (
        <Input
          id={field.name}
          type="number"
          placeholder={field.placeholder}
          {...register(field.name, { valueAsNumber: true })}
        />
      );
    case "checkbox":
      return (
        <label
          htmlFor={field.name}
          className="flex items-center gap-2 text-sm cursor-pointer"
        >
          <input
            id={field.name}
            type="checkbox"
            className="rounded"
            {...register(field.name)}
          />
          {field.label}
        </label>
      );
    case "select": {
      const options = field.type.kind === "select" ? field.type.options : [];
      return (
        <select
          id={field.name}
          className={`${commonClass} h-8`}
          {...register(field.name)}
        >
          <option value="">선택하세요</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }
    case "date":
      return (
        <Input
          id={field.name}
          type="date"
          placeholder={field.placeholder}
          {...register(field.name)}
        />
      );
    case "datetime":
      return (
        <Input
          id={field.name}
          type="datetime-local"
          placeholder={field.placeholder}
          {...register(field.name)}
        />
      );
    case "url":
      return (
        <Input
          id={field.name}
          type="url"
          placeholder={field.placeholder ?? "https://..."}
          {...register(field.name)}
        />
      );
    case "email":
      return (
        <Input
          id={field.name}
          type="email"
          placeholder={field.placeholder ?? "email@example.com"}
          {...register(field.name)}
        />
      );
    case "image":
      return (
        <Input
          id={field.name}
          type="url"
          placeholder={field.placeholder ?? "이미지 URL"}
          {...register(field.name)}
        />
      );
    default:
      return (
        <Input
          id={field.name}
          type="text"
          placeholder={field.placeholder}
          {...register(field.name)}
        />
      );
  }
}
