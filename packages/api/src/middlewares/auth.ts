import { ORPCError, os } from "@orpc/server";
import { db } from "@sudo/db/client";
import { managers } from "@sudo/db/schema";
import { eq } from "drizzle-orm";

interface AppContext {
  userId?: string;
}

/** 공개 프로시저 베이스 (인증 불필요) */
export const pub = os.$context<AppContext>();

/** 인증 필수 프로시저 베이스 */
export const authed = pub.use(async ({ context, next }) => {
  if (!context.userId)
    throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" });
  return next({ context: { ...context, userId: context.userId } });
});

/** managers 테이블 등록자만 접근 가능 */
export const managersOnly = authed.use(async ({ context, next }) => {
  const [manager] = await db
    .select({ role: managers.role })
    .from(managers)
    .where(eq(managers.id, context.userId))
    .limit(1);

  if (!manager)
    throw new ORPCError("FORBIDDEN", { message: "Manager access required" });

  return next({ context: { ...context, managerRole: manager.role } });
});
