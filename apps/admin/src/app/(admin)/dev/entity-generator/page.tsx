import { Wrench } from "lucide-react";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/admin-ui/page-container";
import { PageHeader } from "@/components/admin-ui/page-header";
import { EntityGeneratorForm } from "./entity-generator-form";

export default function EntityGeneratorPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <PageContainer>
      <PageHeader
        icon={Wrench}
        title="엔티티 코드 생성기"
        description="새 엔티티를 정의하면 Drizzle 스키마부터 CRUD 페이지까지 자동 생성합니다"
      />
      <EntityGeneratorForm />
    </PageContainer>
  );
}
