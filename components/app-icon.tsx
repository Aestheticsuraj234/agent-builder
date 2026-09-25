"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { iconBgColors, iconColors, iconMap } from "@/lib/icon-map";

export function AppIcon({
  name,
  className,
  badge = false,
}: {
  name: string;
  className?: string;
  badge?: boolean;
}) {
  const key = (name in iconMap ? name : "bot") as keyof typeof iconMap;
  const icon = iconMap[key];
  const color = iconColors[key];
  const bg = iconBgColors[key];

  if (badge) {
    return (
      <span
        className={cn(
          "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
          bg,
          className
        )}
      >
        <HugeiconsIcon icon={icon} strokeWidth={2} className={cn("size-5", color)} />
      </span>
    );
  }

  return (
    <HugeiconsIcon
      icon={icon}
      strokeWidth={2}
      className={cn("size-5 shrink-0", color, className)}
    />
  );
}
