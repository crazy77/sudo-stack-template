import { EntityListView } from "@/features/crud/entity-list-view";
import { createServerClient } from "@/lib/orpc/server";

export default async function UsersPage() {
  const client = await createServerClient();
  const users = await client.users.list();

  return <EntityListView entity="users" initialData={users} />;
}
