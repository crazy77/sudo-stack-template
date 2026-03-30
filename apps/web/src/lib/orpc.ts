"use client";

import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { AppRouter } from "@sudo/api/client";

import { createClient } from "./supabase/client";

const link = new RPCLink({
  url: `${process.env.NEXT_PUBLIC_API_URL}/rpc`,
  headers: async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

export const orpc = createORPCClient<AppRouter>(link);
