import { orpc } from "@/lib/orpc/client";

type EntityActions = {
  update: (id: string, data: Record<string, unknown>) => Promise<unknown>;
  delete: (id: string) => Promise<unknown>;
  create: (data: Record<string, unknown>) => Promise<unknown>;
};

function createActions(
  router: {
    update?: (input: Record<string, unknown>) => Promise<unknown>;
    delete?: (input: { id: string }) => Promise<unknown>;
    create?: (input: Record<string, unknown>) => Promise<unknown>;
  },
  options?: { hasUpdate?: boolean; hasDelete?: boolean; hasCreate?: boolean },
): Partial<EntityActions> {
  const actions: Partial<EntityActions> = {};
  if (options?.hasUpdate !== false && router.update) {
    const fn = router.update;
    actions.update = (id, data) => fn({ id, ...data });
  }
  if (options?.hasDelete !== false && router.delete) {
    const fn = router.delete;
    actions.delete = (id) => fn({ id });
  }
  if (options?.hasCreate !== false && router.create) {
    const fn = router.create;
    actions.create = (data) => fn(data);
  }
  return actions;
}

const actionsMap: Record<string, Partial<EntityActions>> = {
  posts: createActions(
    orpc.posts as unknown as {
      update: (input: Record<string, unknown>) => Promise<unknown>;
      delete: (input: { id: string }) => Promise<unknown>;
      create: (input: Record<string, unknown>) => Promise<unknown>;
    },
  ),
};

export function getEntityActions(slug: string): Partial<EntityActions> {
  return actionsMap[slug] ?? {};
}
