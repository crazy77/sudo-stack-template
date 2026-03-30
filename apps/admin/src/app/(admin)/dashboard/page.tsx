import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="size-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">대시보드</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        왼쪽 메뉴에서 관리할 항목을 선택하세요.
      </p>
    </div>
  );
}
