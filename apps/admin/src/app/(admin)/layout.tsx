import { db } from "@sudo/db/client";
import { managers } from "@sudo/db/schema";
import { eq } from "drizzle-orm";
import { ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [manager] = await db
    .select()
    .from(managers)
    .where(eq(managers.id, user.id))
    .limit(1);

  if (!manager) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <ShieldAlert className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">접근 권한 없음</h2>
        <p className="text-sm text-muted-foreground">
          관리자 계정이 아닙니다. 최고 관리자에게 문의하세요.
        </p>
        <a
          href="/login"
          className="text-sm text-primary underline underline-offset-4"
        >
          로그아웃
        </a>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
