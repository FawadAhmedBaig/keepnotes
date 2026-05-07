"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { NoteType, LabelType, ViewType } from "@/lib/types";
import { NOTE_COLORS, type NoteColor } from "@/types/note";
import { NoteToolbar } from "./note-toolbar";
import { LabelBadge } from "@/components/labels/label-badge";
import { colorClasses } from "./color-picker";
import { Pin } from "lucide-react";

interface NoteCardProps {
  note: NoteType;
  labels: LabelType[];
  viewType: ViewType;
  onEdit: (note: NoteType) => void;
  onUpdateColor: (noteId: string, color: NoteColor) => void;
  onTogglePin: (noteId: string) => void;
  onToggleArchive: (noteId: string) => void;
  onDelete: (noteId: string) => void;
  onRestore?: (noteId: string) => void;
  onPermanentDelete?: (noteId: string) => void;
  onUpdateLabels: (noteId: string, labelIds: string[]) => void;
}

export function NoteCard({
  note,
  labels,
  viewType,
  onEdit,
  onUpdateColor,
  onTogglePin,
  onToggleArchive,
  onDelete,
  onRestore,
  onPermanentDelete,
  onUpdateLabels,
}: NoteCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const noteLabels = labels.filter((label) => note.labels.includes(label._id));

  const handleClick = useCallback(() => {
    onEdit(note);
  }, [note, onEdit]);

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-lg border border-border cursor-pointer transition-shadow hover:shadow-md break-inside-avoid mb-4",
        colorClasses[note.color]
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={note.title || "Untitled note"}
    >
      {note.isPinned && !note.isTrashed && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
          <Pin className="w-3 h-3 text-primary-foreground" />
        </div>
      )}

      <div className="p-4 pb-2">
        {note.title && (
          <h3 className="font-medium text-sm mb-1 line-clamp-2">{note.title}</h3>
        )}
        {note.content && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-8">
            {note.content}
          </p>
        )}
      </div>

      {noteLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 px-4 pb-2">
          {noteLabels.map((label) => (
            <LabelBadge
              key={label._id}
              name={label.name}
              onRemove={() =>
                onUpdateLabels(
                  note._id,
                  note.labels.filter((id) => id !== label._id)
                )
              }
            />
          ))}
        </div>
      )}

      <div
        className={cn(
          "px-2 pb-2 pt-1 transition-opacity",
          isHovered ? "opacity-100" : "opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <NoteToolbar
          color={note.color}
          isPinned={note.isPinned}
          isArchived={note.isArchived}
          isTrashed={note.isTrashed}
          selectedLabels={note.labels}
          labels={labels}
          viewType={viewType}
          onColorChange={(color) => onUpdateColor(note._id, color)}
          onTogglePin={() => onTogglePin(note._id)}
          onToggleArchive={() => onToggleArchive(note._id)}
          onDelete={() => onDelete(note._id)}
          onRestore={() => onRestore?.(note._id)}
          onPermanentDelete={() => onPermanentDelete?.(note._id)}
          onLabelsChange={(labelIds) => onUpdateLabels(note._id, labelIds)}
        />
      </div>
    </article>
  );
}
