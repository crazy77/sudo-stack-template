import { postsConfig } from "@/entities/posts/config";
import { EntityCreateView } from "@/features/crud/entity-create-view";

export default function NewPostPage() {
  return <EntityCreateView config={postsConfig} />;
}
