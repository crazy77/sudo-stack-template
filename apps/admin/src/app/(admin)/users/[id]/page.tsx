import { notFound } from "next/navigation";
import { usersConfig } from "@/entities/users/config";
import { EntityDetailView } from "@/features/crud/entity-detail-view";
import { createServerClient } from "@/lib/orpc/server";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await createServerClient();
  const users = await client.users.list();
  const user = users.find((u: { id: string }) => u.id === id);

  if (!user) notFound();

  return (
    <EntityDetailView
      config={usersConfig}
      data={user as unknown as Record<string, unknown>}
    />
  );
}
