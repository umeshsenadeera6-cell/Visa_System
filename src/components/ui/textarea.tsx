import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-20 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground/80 transition-[box-shadow,border-color] focus-visible:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-primary/15 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
export { Textarea };
