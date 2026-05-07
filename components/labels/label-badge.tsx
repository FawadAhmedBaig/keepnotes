"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface LabelBadgeProps {
  name: string;
  onRemove?: () => void;
  className?: string;
}

export function LabelBadge({ name, onRemove, className }: LabelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-secondary text-secondary-foreground",
        className
      )}
    >
      {name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-3 h-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
          aria-label={`Remove ${name} label`}
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  );
}
