import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showLabel?: boolean;
  href?: string;
};

export function Logo({ className, showLabel = true, href = "/" }: LogoProps) {
  const content = (
    <>
      <Image
        src="/logo.svg"
        alt="Agent Builder"
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-lg"
        priority
      />
      {showLabel ? (
        <span className="font-heading text-lg font-medium">Agent Builder</span>
      ) : null}
    </>
  );

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      {content}
    </Link>
  );
}
