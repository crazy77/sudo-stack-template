import { postsConfig } from "./posts/config";
import type { EntityConfig } from "./types";
import { usersConfig } from "./users/config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const entityConfigs: Record<string, EntityConfig<any>> = {
  posts: postsConfig,
  users: usersConfig,
};
