import { orpc } from "@/lib/orpc/client";

type EntityActions = {
  update: (id: string, data: Record<string, unknown>) => Promise<unknown>;
  delete: (id: string) => Promise<unknown>;
  create: (data: Record<string, unknown>) => Promise<unknown>;
};

const actionsMap: Record<string, Partial<EntityActions>> = {
  posts: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: (id, data) => (orpc.posts.update as any)({ id, ...data }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete: (id) => (orpc.posts.delete as any)({ id }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: (data) => (orpc.posts.create as any)(data),
  },
};

export function getEntityActions(slug: string): Partial<EntityActions> {
  return actionsMap[slug] ?? {};
}
