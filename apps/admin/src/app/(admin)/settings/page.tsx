import { Settings } from "lucide-react";
import { PageContainer } from "@/components/admin-ui/page-container";
import { PageHeader } from "@/components/admin-ui/page-header";
import { SectionCard } from "@/components/admin-ui/section-card";

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        icon={Settings}
        title="설정"
        description="시스템 설정을 관리합니다."
      />
      <SectionCard title="일반">
        <p className="text-sm text-muted-foreground">
          설정 항목이 여기에 표시됩니다.
        </p>
      </SectionCard>
    </PageContainer>
  );
}
