import { ORPCError } from "@orpc/server";
import { db } from "@sudo/db/client";
import { posts } from "@sudo/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { authed } from "../middlewares/auth";

export const postsRouter = authed.router({
  list: authed.handler(async () => {
    return db.select().from(posts);
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
        content: z.string().min(1),
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
        content: z.string().min(1).optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const { id, ...data } = input;
      // ownerOnly 체크
      const [post] = await db
        .select()
        .from(posts)
        .where(eq(posts.id, id))
        .limit(1);
      if (!post)
        throw new ORPCError("NOT_FOUND", {
          message: "게시글을 찾을 수 없습니다",
        });
      if (post.authorId !== context.userId)
        throw new ORPCError("FORBIDDEN", {
          message: "본인 작성 글만 수정할 수 있습니다",
        });

      const [updated] = await db
        .update(posts)
        .set(data)
        .where(eq(posts.id, id))
        .returning();
      return updated;
    }),

  delete: authed
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      // ownerOnly 체크
      const [post] = await db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1);
      if (!post)
        throw new ORPCError("NOT_FOUND", {
          message: "게시글을 찾을 수 없습니다",
        });
      if (post.authorId !== context.userId)
        throw new ORPCError("FORBIDDEN", {
          message: "본인 작성 글만 삭제할 수 있습니다",
        });

      await db.delete(posts).where(eq(posts.id, input.id));
      return { success: true };
    }),
});
