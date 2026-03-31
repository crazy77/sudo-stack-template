import { db } from "@sudo/db/client";
import { users } from "@sudo/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { managersOnly } from "../middlewares/auth";

export const usersRouter = managersOnly.router({
  list: managersOnly
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .default({}),
    )
    .handler(async ({ input }) => {
      return db.select().from(users).limit(input.limit).offset(input.offset);
    }),

  getById: managersOnly
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [item] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.id))
        .limit(1);
      return item ?? null;
    }),
});
