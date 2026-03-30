import { EntityListView } from "@/features/crud/entity-list-view";
import { createServerClient } from "@/lib/orpc/server";

export default async function PostsPage() {
  const client = await createServerClient();
  const posts = await client.posts.list();

  return <EntityListView entity="posts" initialData={posts} />;
}
