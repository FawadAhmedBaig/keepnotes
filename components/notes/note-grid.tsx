"use client";

import { cn } from "@/lib/utils";
import type { NoteType, LabelType, ViewType } from "@/lib/types";
import { NOTE_COLORS, type NoteColor } from "@/types/note";
import { NoteCard } from "./note-card";

interface NoteGridProps {
  notes: NoteType[];
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
  className?: string;
}

export function NoteGrid({
  notes,
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
  className,
}: NoteGridProps) {
  const pinnedNotes = notes.filter((note) => note.isPinned && !note.isArchived && !note.isTrashed);
  const otherNotes = notes.filter((note) => !note.isPinned || note.isArchived || note.isTrashed);

  const showPinnedSection = viewType === "notes" && pinnedNotes.length > 0;

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground">No notes here</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {showPinnedSection && (
        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Pinned
          </h2>
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                labels={labels}
                viewType={viewType}
                onEdit={onEdit}
                onUpdateColor={onUpdateColor}
                onTogglePin={onTogglePin}
                onToggleArchive={onToggleArchive}
                onDelete={onDelete}
                onRestore={onRestore}
                onPermanentDelete={onPermanentDelete}
                onUpdateLabels={onUpdateLabels}
              />
            ))}
          </div>
        </section>
      )}

      {showPinnedSection && otherNotes.length > 0 && (
        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Others
          </h2>
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {otherNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                labels={labels}
                viewType={viewType}
                onEdit={onEdit}
                onUpdateColor={onUpdateColor}
                onTogglePin={onTogglePin}
                onToggleArchive={onToggleArchive}
                onDelete={onDelete}
                onRestore={onRestore}
                onPermanentDelete={onPermanentDelete}
                onUpdateLabels={onUpdateLabels}
              />
            ))}
          </div>
        </section>
      )}

      {!showPinnedSection && (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              labels={labels}
              viewType={viewType}
              onEdit={onEdit}
              onUpdateColor={onUpdateColor}
              onTogglePin={onTogglePin}
              onToggleArchive={onToggleArchive}
              onDelete={onDelete}
              onRestore={onRestore}
              onPermanentDelete={onPermanentDelete}
              onUpdateLabels={onUpdateLabels}
            />
          ))}
        </div>
      )}
    </div>
  );
}
