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
  const item = await client.users.getById({ id });

  if (!item) notFound();

  return (
    <EntityDetailView
      config={usersConfig}
      data={item as unknown as Record<string, unknown>}
    />
  );
}
