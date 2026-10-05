import Link from "next/link";
import { cn, Icon } from "@prdgenz/ui";

export function Wordmark({
  href = "/",
  className,
  suffix,
}: {
  href?: string;
  className?: string;
  suffix?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 text-lg font-bold leading-none tracking-tight",
        className,
      )}
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary-soft-foreground">
        <Icon name="document" className="h-5 w-5" />
      </span>
      <span>PRD GenZ</span>
      {suffix ? (
        <span className="ml-1 font-mono text-[0.625rem] uppercase tracking-widest text-muted-foreground">
          {suffix}
        </span>
      ) : null}
    </Link>
  );
}
