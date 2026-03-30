import "server-only";

import { createRouterClient } from "@orpc/server";
import { appRouter } from "@sudo/api/router";
import { createClient } from "@/lib/supabase/server";

export async function createServerClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return createRouterClient(appRouter, {
    context: { userId: user?.id },
  });
}
