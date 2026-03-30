import { Database, ShieldCheck, Zap } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans">
      <div className="max-w-3xl w-full bg-card rounded-3xl shadow-2xl p-10 border border-border">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-foreground tracking-tight mb-4">
            SUDO Stack <span className="text-primary">Admin</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Powered by Next.js{" "}
            <span className="font-semibold text-foreground">App Router</span>{" "}
            for server-first, highly complex back-office dashboards.
          </p>
        </div>

        <div className="flex justify-center space-x-12 mt-8">
          <ShieldCheck className="w-16 h-16 text-indigo-500 opacity-80" />
          <Database className="w-16 h-16 text-emerald-500 animate-pulse" />
          <Zap className="w-16 h-16 text-amber-500 opacity-80" />
        </div>
      </div>
    </div>
  );
}
