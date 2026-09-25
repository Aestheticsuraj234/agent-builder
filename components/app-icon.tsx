"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { iconMap } from "@/lib/icon-map";

export function AppIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const icon = iconMap[name as keyof typeof iconMap] ?? iconMap.bot;

  return (
    <HugeiconsIcon
      icon={icon}
      strokeWidth={2}
      className={cn("size-5 shrink-0 text-foreground", className)}
    />
  );
}
