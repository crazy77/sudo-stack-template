// Type-only export — safe to import in all client environments (web, mobile)
// No server-side code (DB, Node.js APIs) is included here
import type { RouterClient } from "@orpc/server";
import type { AppRouter } from "./router";

export type { AppRouter };
export type AppRouterClient = RouterClient<AppRouter>;
