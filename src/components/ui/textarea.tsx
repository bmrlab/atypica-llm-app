import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full field-sizing-content",
        "rounded-md border border-input",
        "bg-transparent",
        "px-3 py-2 text-base md:text-sm",
        "shadow-xs outline-none",
        "placeholder:text-muted-foreground",
        // "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-[color,box-shadow]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
