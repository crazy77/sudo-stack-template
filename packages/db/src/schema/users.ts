import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// id는 Supabase auth.users(id)를 참조하는 미러 테이블 패턴.
// 회원가입 시 auth.users에서 생성된 UUID를 그대로 사용하므로 defaultRandom() 없음.
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
