import { RPCHandler } from "@orpc/server/fetch";
import { appRouter } from "@sudo/api/router";
import { createClient } from "@supabase/supabase-js";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";

const apiEnv = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
    WEB_URL: z.string().url().optional(),
    ADMIN_URL: z.string().url().optional(),
  })
  .parse(process.env);

const rpcHandler = new RPCHandler(appRouter);

const app = new Hono();

app.use("*", logger());

app.use(
  "*",
  cors({
    origin: [
      apiEnv.WEB_URL ?? "http://localhost:3000",
      apiEnv.ADMIN_URL ?? "http://localhost:3001",
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  }),
);

app.get("/health", (c) => c.json({ status: "ok" }));

app.use("/rpc/*", async (c, next) => {
  let userId: string | undefined;

  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const supabase = createClient(
      apiEnv.NEXT_PUBLIC_SUPABASE_URL,
      apiEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
    const { data } = await supabase.auth.getUser(token);
    userId = data.user?.id;
  }

  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: { userId },
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

export default app;
