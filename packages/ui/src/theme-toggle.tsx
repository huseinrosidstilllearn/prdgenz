"use client";
import { useTheme } from "./theme-provider";
import { Button } from "./button";
import { Icon } from "./icon";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Icon
        name={resolvedTheme === "dark" ? "sun" : "moon"}
        className="h-5 w-5 shrink-0"
      />
    </Button>
  );
}
