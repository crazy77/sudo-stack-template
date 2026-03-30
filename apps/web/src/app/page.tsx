import { BookOpen, Database, ShieldCheck, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6 font-sans">
      <div className="max-w-3xl w-full bg-card rounded-3xl shadow-xl p-10 border border-border">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-foreground tracking-tight mb-4">
            SUDO Stack <span className="text-primary">Web</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            The ultimate boilerplate featuring Next.js, Tailwind v4, Supabase,
            Drizzle, and oRPC.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-muted border border-border flex items-start space-x-4">
            <div className="bg-background p-3 rounded-xl">
              <ShieldCheck className="w-8 h-8 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                Supabase Auth
              </h3>
              <p className="text-muted-foreground text-sm">
                Secure and simple authentication out of the box.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-muted border border-border flex items-start space-x-4">
            <div className="bg-background p-3 rounded-xl">
              <Database className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                Drizzle ORM
              </h3>
              <p className="text-muted-foreground text-sm">
                Type-safe queries across the entire stack via global schema.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-muted border border-border flex items-start space-x-4">
            <div className="bg-background p-3 rounded-xl">
              <Zap className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                oRPC API
              </h3>
              <p className="text-muted-foreground text-sm">
                End-to-end typed RPC endpoints bridging React and backend.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-muted border border-border flex items-start space-x-4">
            <div className="bg-background p-3 rounded-xl">
              <BookOpen className="w-8 h-8 text-slate-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                Sample Posts
              </h3>
              <p className="text-muted-foreground text-sm">
                Full posts implementation ready to be explored in your codebase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
