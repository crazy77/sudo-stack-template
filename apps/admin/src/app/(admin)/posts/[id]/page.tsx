import { notFound } from "next/navigation";
import { postsConfig } from "@/entities/posts/config";
import { EntityDetailView } from "@/features/crud/entity-detail-view";
import { createServerClient } from "@/lib/orpc/server";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await createServerClient();
  const item = await client.posts.getById({ id });

  if (!item) notFound();

  return (
    <EntityDetailView
      config={postsConfig}
      data={item as unknown as Record<string, unknown>}
    />
  );
}
