import { FileText, LayoutDashboard, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/admin-ui/page-container";
import { PageHeader } from "@/components/admin-ui/page-header";
import { SectionCard } from "@/components/admin-ui/section-card";
import { StatCard } from "@/components/admin-ui/stat-card";
import { createServerClient } from "@/lib/orpc/server";

export default async function DashboardPage() {
  const client = await createServerClient();

  let userCount = 0;
  let postCount = 0;
  let loadError = false;

  try {
    const [users, posts] = await Promise.all([
      client.users.list(),
      client.posts.list(),
    ]);
    userCount = users.length;
    postCount = posts.length;
  } catch {
    loadError = true;
  }

  return (
    <PageContainer>
      <PageHeader
        icon={LayoutDashboard}
        title="대시보드"
        description="서비스 현황을 한눈에 확인하세요."
      />

      {loadError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="전체 사용자"
          value={userCount.toLocaleString()}
          icon={Users}
        />
        <StatCard
          label="전체 게시글"
          value={postCount.toLocaleString()}
          icon={FileText}
        />
        <StatCard label="오늘 방문" value="—" icon={TrendingUp} />
        <StatCard label="활성 세션" value="—" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="최근 활동">
          <p className="text-sm text-muted-foreground">
            아직 활동 내역이 없습니다.
          </p>
        </SectionCard>
        <SectionCard title="빠른 링크">
          <div className="space-y-2">
            <Link
              href="/users"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <Users className="size-4 text-muted-foreground" />
              사용자 관리
            </Link>
            <Link
              href="/posts"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <FileText className="size-4 text-muted-foreground" />
              게시글 관리
            </Link>
          </div>
        </SectionCard>
      </div>
    </PageContainer>
  );
}
