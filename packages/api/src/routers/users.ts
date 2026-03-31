import { db } from "@sudo/db/client";
import { users } from "@sudo/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { authed } from "../middlewares/auth";

export const usersRouter = authed.router({
  list: authed.handler(async () => {
    return db.select().from(users);
  }),

  getById: authed
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
