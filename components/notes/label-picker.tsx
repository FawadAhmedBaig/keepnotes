"use client";

import { cn } from "@/lib/utils";
import type { LabelType } from "@/lib/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tag, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LabelPickerProps {
  labels: LabelType[];
  selectedLabels: string[];
  onChange: (labelIds: string[]) => void;
  disabled?: boolean;
}

export function LabelPicker({
  labels,
  selectedLabels,
  onChange,
  disabled,
}: LabelPickerProps) {
  const toggleLabel = (labelId: string) => {
    if (selectedLabels.includes(labelId)) {
      onChange(selectedLabels.filter((id) => id !== labelId));
    } else {
      onChange([...selectedLabels, labelId]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          className="rounded-full"
          aria-label="Add label"
        >
          <Tag className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <div className="p-2 border-b border-border">
          <p className="text-sm font-medium">Labels</p>
        </div>
        <ScrollArea className="h-[200px]">
          {labels.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">
              No labels yet
            </p>
          ) : (
            <div className="p-1">
              {labels.map((label) => {
                const isSelected = selectedLabels.includes(label._id);
                return (
                  <button
                    key={label._id}
                    onClick={() => toggleLabel(label._id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors",
                      isSelected && "bg-accent"
                    )}
                  >
                    <Checkbox checked={isSelected} />
                    <span className="truncate">{label.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
