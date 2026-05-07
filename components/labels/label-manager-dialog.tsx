"use client";

import { useState } from "react";
import type { LabelType } from "@/lib/types";
import { useCreateLabel, useUpdateLabel, useDeleteLabel } from "@/hooks/use-labels";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Pencil, Trash2, Check, X, Tag } from "lucide-react";

interface LabelManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: LabelType[];
}

export function LabelManagerDialog({
  open,
  onOpenChange,
  labels,
}: LabelManagerDialogProps) {
  const [newLabelName, setNewLabelName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const createLabel = useCreateLabel();
  const updateLabel = useUpdateLabel();
  const deleteLabel = useDeleteLabel();

  const handleCreateLabel = () => {
    if (newLabelName.trim()) {
      createLabel.mutate(newLabelName.trim(), {
        onSuccess: () => {
          setNewLabelName("");
        },
      });
    }
  };

  const handleStartEdit = (label: LabelType) => {
    setEditingId(label._id);
    setEditingName(label.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      updateLabel.mutate(
        { id: editingId, name: editingName.trim() },
        {
          onSuccess: () => {
            setEditingId(null);
            setEditingName("");
          },
        }
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = (labelId: string) => {
    deleteLabel.mutate(labelId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Edit labels
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create new label */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Create new label"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateLabel();
                }
              }}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={handleCreateLabel}
              disabled={!newLabelName.trim() || createLabel.isPending}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Labels list */}
          <ScrollArea className="h-[300px] pr-4">
            {labels.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No labels yet. Create one above.
              </p>
            ) : (
              <div className="space-y-1">
                {labels.map((label) => (
                  <div
                    key={label._id}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent group"
                  >
                    {editingId === label._id ? (
                      <>
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveEdit();
                            } else if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                          className="flex-1 h-8"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={handleSaveEdit}
                          disabled={updateLabel.isPending}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 truncate text-sm">
                          {label.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleStartEdit(label)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(label._id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          disabled={deleteLabel.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
