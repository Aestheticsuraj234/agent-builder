import { Logo } from "@/components/logo";
import { requireAuth } from "@/modules/auth/actions";
import { LogOutButton } from "@/modules/auth/components/log-out-button";
import { UserButton } from "@/modules/auth/components/user-button";

export default async function HomePage() {
  await requireAuth();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Logo />
        <div className="flex items-center gap-3">
          <UserButton />
          <LogOutButton />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          You are signed in
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Auth is set up. New features can live under the modules folder.
        </p>
      </main>
    </div>
  );
}
