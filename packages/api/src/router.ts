import { os } from "@orpc/server";
import { postsRouter } from "./routers/posts.js";

export const appRouter = os.router({
  hello: os.handler(() => "Hello from SUDO Stack API!"),
  posts: postsRouter,
});

export type AppRouter = typeof appRouter;
