import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { AppRouterClient } from "@sudo/api/client";

import { supabase } from "./supabase";

const link = new RPCLink({
  url: `${process.env.EXPO_PUBLIC_API_URL}/rpc`,
  headers: async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

export const orpc = createORPCClient<AppRouterClient>(link);
