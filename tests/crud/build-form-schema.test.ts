import { describe, expect, it } from "vitest";
import type { FieldConfig } from "@/entities/types";
import {
  buildFormSchema,
  buildUpdateSchema,
} from "@/features/crud/build-form-schema";

const textField: FieldConfig = {
  name: "title",
  label: "제목",
  type: { kind: "text" },
};

const numberField: FieldConfig = {
  name: "price",
  label: "가격",
  type: { kind: "number" },
};

const checkboxField: FieldConfig = {
  name: "isPublished",
  label: "공개 여부",
  type: { kind: "checkbox" },
};

const readonlyField: FieldConfig = {
  name: "authorId",
  label: "작성자",
  type: { kind: "text" },
  readonly: true,
};

describe("buildFormSchema", () => {
  it("text 필드에 대한 string 스키마를 생성한다", () => {
    const schema = buildFormSchema([textField]);
    expect(schema.safeParse({ title: "테스트" }).success).toBe(true);
    expect(schema.safeParse({ title: "" }).success).toBe(false);
  });

  it("number 필드에 대한 coerce number 스키마를 생성한다", () => {
    const schema = buildFormSchema([numberField]);
    expect(schema.safeParse({ price: 100 }).success).toBe(true);
    expect(schema.safeParse({ price: "100" }).success).toBe(true);
  });

  it("checkbox 필드에 대한 boolean 스키마를 생성한다", () => {
    const schema = buildFormSchema([checkboxField]);
    expect(schema.safeParse({ isPublished: true }).success).toBe(true);
    expect(schema.safeParse({ isPublished: false }).success).toBe(true);
  });

  it("readonly 필드를 제외한다", () => {
    const schema = buildFormSchema([textField, readonlyField]);
    const shape = schema.shape;
    expect("title" in shape).toBe(true);
    expect("authorId" in shape).toBe(false);
  });

  it("여러 필드를 조합한 스키마를 생성한다", () => {
    const schema = buildFormSchema([textField, numberField, checkboxField]);
    const result = schema.safeParse({
      title: "테스트",
      price: 100,
      isPublished: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("buildUpdateSchema", () => {
  it("모든 필드가 optional이다", () => {
    const schema = buildUpdateSchema([textField, numberField]);
    expect(schema.safeParse({}).success).toBe(true);
    expect(schema.safeParse({ title: "수정" }).success).toBe(true);
  });

  it("readonly 필드를 제외한다", () => {
    const schema = buildUpdateSchema([textField, readonlyField]);
    const shape = schema.shape;
    expect("title" in shape).toBe(true);
    expect("authorId" in shape).toBe(false);
  });
});
