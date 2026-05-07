"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { NOTE_COLORS, type NoteColor } from "@/types/note";
import type { LabelType } from "@/lib/types";
import { ColorPicker, colorClasses } from "./color-picker";
import { LabelPicker } from "./label-picker";
import { LabelBadge } from "@/components/labels/label-badge";
import { Button } from "@/components/ui/button";
import { Pin, PinOff } from "lucide-react";

interface NoteInputProps {
  labels: LabelType[];
  onSubmit: (data: {
    title: string;
    content: string;
    color: NoteColor;
    labels: string[];
    isPinned: boolean;
  }) => void;
}

export function NoteInput({ labels, onSubmit }: NoteInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<NoteColor>("default");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const handleExpand = useCallback(() => {
    setIsExpanded(true);
    setTimeout(() => contentRef.current?.focus(), 0);
  }, []);

  const handleClose = useCallback(() => {
    if (title.trim() || content.trim()) {
      onSubmit({
        title: title.trim(),
        content: content.trim(),
        color,
        labels: selectedLabels,
        isPinned,
      });
    }
    
    // Reset state
    setIsExpanded(false);
    setTitle("");
    setContent("");
    setColor("default");
    setSelectedLabels([]);
    setIsPinned(false);
  }, [title, content, color, selectedLabels, isPinned, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    },
    [handleClose]
  );

  const selectedLabelObjects = labels.filter((l) =>
    selectedLabels.includes(l._id)
  );

  if (!isExpanded) {
    return (
      <div
        className="max-w-xl mx-auto cursor-text"
        onClick={handleExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleExpand();
          }
        }}
      >
        <div className="flex items-center px-4 py-3 rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <span className="text-muted-foreground">Take a note...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "max-w-xl mx-auto rounded-lg border border-border shadow-md",
        colorClasses[color]
      )}
      onKeyDown={handleKeyDown}
    >
      <div className="relative">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 pt-3 pb-1 text-base font-medium bg-transparent border-0 outline-none placeholder:text-muted-foreground"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsPinned(!isPinned)}
          className="absolute top-2 right-2 rounded-full"
        >
          {isPinned ? (
            <PinOff className="w-4 h-4" />
          ) : (
            <Pin className="w-4 h-4" />
          )}
        </Button>
      </div>

      <textarea
        ref={contentRef}
        placeholder="Take a note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full px-4 py-2 text-sm bg-transparent border-0 outline-none resize-none placeholder:text-muted-foreground"
      />

      {selectedLabelObjects.length > 0 && (
        <div className="flex flex-wrap gap-1 px-4 pb-2">
          {selectedLabelObjects.map((label) => (
            <LabelBadge
              key={label._id}
              name={label.name}
              onRemove={() =>
                setSelectedLabels(selectedLabels.filter((id) => id !== label._id))
              }
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between px-2 py-2 border-t border-border/50">
        <div className="flex items-center gap-1">
          <ColorPicker value={color} onChange={setColor} />
          <LabelPicker
            labels={labels}
            selectedLabels={selectedLabels}
            onChange={setSelectedLabels}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-sm font-medium"
        >
          Close
        </Button>
      </div>
    </div>
  );
}
