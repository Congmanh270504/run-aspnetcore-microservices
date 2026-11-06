"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="outline" size="icon" className="rounded-full h-9 w-9" />;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full h-9 w-9 transition-colors"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <SunIcon className="h-4 w-4 text-amber-400" />
      ) : (
        <MoonIcon className="h-4 w-4 text-slate-700" />
      )}
    </Button>
  );
}
