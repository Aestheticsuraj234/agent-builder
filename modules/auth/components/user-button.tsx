"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/modules/auth/hooks/use-session";

export function UserButton() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) {
    return null;
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="flex items-center gap-3 rounded-full border border-border bg-card px-3 py-1.5">
      <Avatar size="sm">
        {user.image ? <AvatarImage src={user.image} alt={user.name ?? "User"} /> : null}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="text-left text-sm leading-tight">
        <p className="font-medium">{user.name ?? "User"}</p>
        <p className="text-muted-foreground text-xs">{user.email}</p>
      </div>
    </div>
  );
}
