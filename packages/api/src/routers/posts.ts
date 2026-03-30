import { os } from "@orpc/server";
import { db } from "@sudo/db/client";
import { posts } from "@sudo/db/schema";
import { z } from "zod";

export const postsRouter = os.router({
  list: os.handler(async () => {
    return db.select().from(posts);
  }),
  create: os
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        authorId: z.string().uuid(),
      }),
    )
    .handler(async ({ input }) => {
      const [newPost] = await db
        .insert(posts)
        .values({
          title: input.title,
          content: input.content,
          authorId: input.authorId,
        })
        .returning();
      return newPost;
    }),
});
