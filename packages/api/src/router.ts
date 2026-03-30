import { os } from "@orpc/server";
import { postsRouter } from "./routers/posts";
import { usersRouter } from "./routers/users";

export const appRouter = os.router({
  hello: os.handler(() => "Hello from SUDO Stack API!"),
  posts: postsRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
