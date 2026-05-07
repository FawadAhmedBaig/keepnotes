"use client";

import { cn } from "@/lib/utils";
import { NOTE_COLORS, type NoteColor } from "@/types/note";
import type { LabelType, ViewType } from "@/lib/types";
import { ColorPicker } from "./color-picker";
import { LabelPicker } from "./label-picker";
import { Button } from "@/components/ui/button";
import {
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  Trash2,
  RotateCcw,
  Trash,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NoteToolbarProps {
  color: NoteColor;
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  selectedLabels: string[];
  labels: LabelType[];
  viewType: ViewType;
  onColorChange: (color: NoteColor) => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
  onRestore?: () => void;
  onPermanentDelete?: () => void;
  onLabelsChange: (labelIds: string[]) => void;
  className?: string;
  disabled?: boolean;
}

export function NoteToolbar({
  color,
  isPinned,
  isArchived,
  isTrashed,
  selectedLabels,
  labels,
  viewType,
  onColorChange,
  onTogglePin,
  onToggleArchive,
  onDelete,
  onRestore,
  onPermanentDelete,
  onLabelsChange,
  className,
  disabled,
}: NoteToolbarProps) {
  if (isTrashed) {
    return (
      <TooltipProvider>
        <div className={cn("flex items-center gap-1", className)}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onRestore}
                disabled={disabled}
                className="rounded-full"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Restore</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onPermanentDelete}
                disabled={disabled}
                className="rounded-full text-destructive hover:text-destructive"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete forever</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        <ColorPicker value={color} onChange={onColorChange} disabled={disabled} />
        
        <LabelPicker
          labels={labels}
          selectedLabels={selectedLabels}
          onChange={onLabelsChange}
          disabled={disabled}
        />

        {viewType !== "archive" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onTogglePin}
                disabled={disabled}
                className="rounded-full"
              >
                {isPinned ? (
                  <PinOff className="w-4 h-4" />
                ) : (
                  <Pin className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isPinned ? "Unpin" : "Pin"}</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleArchive}
              disabled={disabled}
              className="rounded-full"
            >
              {isArchived ? (
                <ArchiveRestore className="w-4 h-4" />
              ) : (
                <Archive className="w-4 h-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isArchived ? "Unarchive" : "Archive"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onDelete}
              disabled={disabled}
              className="rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
