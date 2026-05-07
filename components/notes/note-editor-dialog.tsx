"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { NoteType, LabelType, ViewType } from "@/lib/types";
import { NOTE_COLORS, type NoteColor } from "@/types/note";
import { ColorPicker, getNoteColorClass } from "./color-picker";
import { LabelPicker } from "./label-picker";
import { LabelBadge } from "@/components/labels/label-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pin, PinOff, Archive, ArchiveRestore, Trash2, RotateCcw, Trash } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface NoteEditorDialogProps {
  note: NoteType | null;
  labels: LabelType[];
  viewType: ViewType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (note: NoteType) => void;
  onTogglePin: (noteId: string) => void;
  onToggleArchive: (noteId: string) => void;
  onDelete: (noteId: string) => void;
  onRestore?: (noteId: string) => void;
  onPermanentDelete?: (noteId: string) => void;
  onUpdateLabels: (noteId: string, labelIds: string[]) => void;
}

export function NoteEditorDialog({
  note,
  labels,
  viewType,
  open,
  onOpenChange,
  onSave,
  onTogglePin,
  onToggleArchive,
  onDelete,
  onRestore,
  onPermanentDelete,
  onUpdateLabels,
}: NoteEditorDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<NoteColor>("default");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setColor(note.color);
      setSelectedLabels(note.labels);
      setIsPinned(note.isPinned);
    }
  }, [note]);

  const handleClose = useCallback(() => {
    if (note) {
      const hasChanges =
        title !== note.title ||
        content !== note.content ||
        color !== note.color ||
        JSON.stringify(selectedLabels.sort()) !== JSON.stringify(note.labels.sort()) ||
        isPinned !== note.isPinned;

      if (hasChanges) {
        onSave({
          ...note,
          title,
          content,
          color,
          labels: selectedLabels,
          isPinned,
        });
      }
    }
    onOpenChange(false);
  }, [note, title, content, color, selectedLabels, isPinned, onSave, onOpenChange]);

  const selectedLabelObjects = labels.filter((l) =>
    selectedLabels.includes(l._id)
  );

  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "sm:max-w-xl p-0 gap-0 border-none shadow-2xl", 
          getNoteColorClass(color) // ✅ Success
        )}
      >
        <VisuallyHidden>
          <DialogTitle>Edit Note</DialogTitle>
        </VisuallyHidden>
        <div className="relative">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 pt-4 pb-1 text-lg font-medium bg-transparent border-0 outline-none placeholder:text-muted-foreground"
            disabled={note.isTrashed}
          />
          {!note.isTrashed && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsPinned(!isPinned)}
              className="absolute top-3 right-3 rounded-full"
            >
              {isPinned ? (
                <PinOff className="w-4 h-4" />
              ) : (
                <Pin className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        <textarea
          placeholder="Take a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full px-4 py-2 text-sm bg-transparent border-0 outline-none resize-none placeholder:text-muted-foreground min-h-[120px]"
          disabled={note.isTrashed}
        />

        {selectedLabelObjects.length > 0 && (
          <div className="flex flex-wrap gap-1 px-4 pb-2">
            {selectedLabelObjects.map((label) => (
              <LabelBadge
                key={label._id}
                name={label.name}
                onRemove={
                  note.isTrashed
                    ? undefined
                    : () => {
                        const newLabels = selectedLabels.filter(
                          (id) => id !== label._id
                        );
                        setSelectedLabels(newLabels);
                        onUpdateLabels(note._id, newLabels);
                      }
                }
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between px-2 py-2 border-t border-border/50">
          {note.isTrashed ? (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRestore?.(note._id)}
                className="gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Restore
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPermanentDelete?.(note._id)}
                className="gap-1 text-destructive hover:text-destructive"
              >
                <Trash className="w-4 h-4" />
                Delete forever
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <ColorPicker value={color} onChange={setColor} />
              <LabelPicker
                labels={labels}
                selectedLabels={selectedLabels}
                onChange={(newLabels) => {
                  setSelectedLabels(newLabels);
                  onUpdateLabels(note._id, newLabels);
                }}
              />
              {viewType !== "archive" && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onTogglePin(note._id)}
                  className="rounded-full"
                >
                  {isPinned ? (
                    <PinOff className="w-4 h-4" />
                  ) : (
                    <Pin className="w-4 h-4" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onToggleArchive(note._id)}
                className="rounded-full"
              >
                {note.isArchived ? (
                  <ArchiveRestore className="w-4 h-4" />
                ) : (
                  <Archive className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(note._id)}
                className="rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-sm font-medium"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
