import "server-only";

import { createRouterClient } from "@orpc/server";
import { appRouter } from "@sudo/api/router";

import { createClient } from "./supabase/server";

export async function createServerOrpc() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return createRouterClient(appRouter, {
    context: { userId: data.user?.id },
  });
}
