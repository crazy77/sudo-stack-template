import { os } from "@orpc/server";
import { db } from "@sudo/db/client";
import { users } from "@sudo/db/schema";

export const usersRouter = os.router({
  list: os.handler(async () => {
    return db.select().from(users);
  }),
});
