import { pub } from "./middlewares/auth";
import { postsRouter } from "./routers/posts";
import { usersRouter } from "./routers/users";

export const appRouter = pub.router({
  hello: pub.handler(() => "Hello from SUDO Stack API!"),
  posts: postsRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
