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
  const posts = await client.posts.list();
  const post = posts.find((p: { id: string }) => p.id === id);

  if (!post) notFound();

  return (
    <EntityDetailView
      config={postsConfig}
      data={post as unknown as Record<string, unknown>}
    />
  );
}
