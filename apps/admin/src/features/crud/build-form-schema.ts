import { z } from "zod";
import type { FieldConfig } from "@/entities/types";

export function buildFormSchema(
  fields: FieldConfig[],
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    if (field.readonly) continue;
    shape[field.name] = fieldToZod(field);
  }
  return z.object(shape);
}

function fieldToZod(field: FieldConfig): z.ZodTypeAny {
  switch (field.type.kind) {
    case "number":
      return z.coerce.number();
    case "checkbox":
      return z.boolean().default(false);
    case "date":
    case "datetime":
      return z.string().min(1, `${field.label}을(를) 입력해주세요`);
    default:
      return z.string().min(1, `${field.label}을(를) 입력해주세요`);
  }
}

export function buildUpdateSchema(
  fields: FieldConfig[],
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    if (field.readonly) continue;
    shape[field.name] = fieldToZod(field).optional();
  }
  return z.object(shape);
}
