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
  return (
    <div className={field.span === 2 ? "sm:col-span-2" : ""}>
      <label
        htmlFor={field.name}
        className="text-xs font-medium text-muted-foreground mb-1 block"
      >
        {field.label}
      </label>
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
    "h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm";

  switch (kind) {
    case "textarea":
      return (
        <textarea
          className={`${commonClass} h-24 py-1.5 resize-y`}
          placeholder={field.placeholder}
          {...register(field.name)}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          placeholder={field.placeholder}
          {...register(field.name, { valueAsNumber: true })}
        />
      );
    case "checkbox":
      return (
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
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
        <select className={commonClass} {...register(field.name)}>
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
          type="date"
          placeholder={field.placeholder}
          {...register(field.name)}
        />
      );
    case "datetime":
      return (
        <Input
          type="datetime-local"
          placeholder={field.placeholder}
          {...register(field.name)}
        />
      );
    case "url":
      return (
        <Input
          type="url"
          placeholder={field.placeholder ?? "https://..."}
          {...register(field.name)}
        />
      );
    case "email":
      return (
        <Input
          type="email"
          placeholder={field.placeholder ?? "email@example.com"}
          {...register(field.name)}
        />
      );
    case "image":
      return (
        <Input
          type="url"
          placeholder={field.placeholder ?? "이미지 URL"}
          {...register(field.name)}
        />
      );
    default:
      return (
        <Input
          type="text"
          placeholder={field.placeholder}
          {...register(field.name)}
        />
      );
  }
}
