import { ORPCError } from "@orpc/server";
import { db } from "@sudo/db/client";
import { managers, posts } from "@sudo/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { authed } from "../middlewares/auth";

async function isManager(userId: string): Promise<boolean> {
  const [m] = await db
    .select({ id: managers.id })
    .from(managers)
    .where(eq(managers.id, userId))
    .limit(1);
  return !!m;
}

export const postsRouter = authed.router({
  list: authed
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .default({}),
    )
    .handler(async ({ input }) => {
      return db.select().from(posts).limit(input.limit).offset(input.offset);
    }),

  getById: authed
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [item] = await db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1);
      return item ?? null;
    }),

  create: authed
    .input(
      z.object({
        title: z.string().min(1).max(500),
        content: z.string().min(1).max(50000),
      }),
    )
    .handler(async ({ input, context }) => {
      const [created] = await db
        .insert(posts)
        .values({
          title: input.title,
          content: input.content,
          authorId: context.userId,
        })
        .returning();
      return created;
    }),

  update: authed
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(500).optional(),
        content: z.string().min(1).max(50000).optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const { id, ...data } = input;
      // ownerOnly: 단일 쿼리로 소유권 검증 + 업데이트 (관리자는 우회)
      const managerBypass = await isManager(context.userId);
      const condition = managerBypass
        ? eq(posts.id, id)
        : and(eq(posts.id, id), eq(posts.authorId, context.userId));

      const [updated] = await db
        .update(posts)
        .set(data)
        .where(condition)
        .returning();

      if (!updated) {
        const [exists] = await db
          .select({ id: posts.id })
          .from(posts)
          .where(eq(posts.id, id))
          .limit(1);
        throw new ORPCError(exists ? "FORBIDDEN" : "NOT_FOUND", {
          message: exists
            ? "본인 작성 글만 수정할 수 있습니다"
            : "게시글을 찾을 수 없습니다",
        });
      }
      return updated;
    }),

  delete: authed
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      // ownerOnly: 단일 쿼리로 소유권 검증 + 삭제 (관리자는 우회)
      const managerBypass = await isManager(context.userId);
      const condition = managerBypass
        ? eq(posts.id, input.id)
        : and(eq(posts.id, input.id), eq(posts.authorId, context.userId));

      const deleted = await db
        .delete(posts)
        .where(condition)
        .returning({ id: posts.id });

      if (deleted.length === 0) {
        const [exists] = await db
          .select({ id: posts.id })
          .from(posts)
          .where(eq(posts.id, input.id))
          .limit(1);
        throw new ORPCError(exists ? "FORBIDDEN" : "NOT_FOUND", {
          message: exists
            ? "본인 작성 글만 삭제할 수 있습니다"
            : "게시글을 찾을 수 없습니다",
        });
      }
      return { success: true };
    }),
});
