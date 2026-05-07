"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { NoteType, LabelType, ViewType } from "@/lib/types";
import { NoteToolbar } from "./note-toolbar";
import { LabelBadge } from "@/components/labels/label-badge";
import { getNoteColorClass } from "./color-picker";
import { Pin } from "lucide-react";
import { type NoteColor } from "@/types/note";

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

  // DEBUG: Check your browser console (F12). 
  // If this prints 'undefined' for the image, the problem is in the API/Database.
  console.log(`Note ID: ${note._id} | Image:`, note.imageUrl);

  const noteLabels = labels.filter((label) => note.labels.includes(label._id));

  const handleClick = useCallback(() => {
    onEdit(note);
  }, [note, onEdit]);

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl border border-border cursor-pointer transition-all duration-200 hover:shadow-md break-inside-avoid mb-4 overflow-hidden",
        getNoteColorClass(note.color)
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
      {/* 1. IMAGE SECTION - The most important part */}
      {note.imageUrl && (
        <div className="w-full border-b border-black/5 overflow-hidden bg-black/5 relative">
          <img
            src={note.imageUrl}
            alt={note.title || "Note image"}
            // Added min-h to prevent layout shift
            className="w-full h-auto max-h-72 object-cover transition-transform duration-500 group-hover:scale-105 min-h-[100px]"
            loading="lazy"
            onError={(e) => {
              console.error("Image failed to load:", note.imageUrl);
              // Fallback to hide broken image icon
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Pin Indicator */}
      {note.isPinned && !note.isTrashed && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm z-10">
          <Pin className="w-3 h-3 text-primary-foreground" />
        </div>
      )}

      <div className="p-3 pb-1">
        {note.title && (
          <h3 className="font-bold text-sm mb-1 line-clamp-2 text-foreground/90">
            {note.title}
          </h3>
        )}
        {note.content && (
          <p className="text-sm text-foreground/80 whitespace-pre-wrap line-clamp-[10] leading-relaxed">
            {note.content}
          </p>
        )}
      </div>

      {noteLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 pb-2 pt-1">
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
          "px-2 pb-1 transition-opacity duration-200",
          isHovered ? "opacity-100" : "sm:opacity-0 opacity-100"
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