import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const managerRoleEnum = pgEnum("manager_role", ["admin", "staff"]);

// id는 Supabase auth.users(id)를 참조하는 미러 테이블 패턴.
// Google OAuth 로그인 후 admin이 수동으로 등록해줘야 접근 가능.
export const managers = pgTable("managers", {
  id: uuid("id").primaryKey(), // auth.users(id) 와 동일한 UUID
  email: text("email").notNull(),
  name: text("name"),
  role: managerRoleEnum("role").notNull().default("staff"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export type Manager = typeof managers.$inferSelect;
export type NewManager = typeof managers.$inferInsert;
