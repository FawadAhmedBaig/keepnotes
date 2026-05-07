import type { NoteColor } from "@/types/note";

export interface NoteType {
  _id: string;
  userId: string;
  title: string;
  content: string;
  color: NoteColor;
  labels: string[];
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  trashedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LabelType {
  _id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteWithLabels extends Omit<NoteType, "labels"> {
  labels: LabelType[];
}

export type ViewType = "notes" | "archive" | "trash" | "label";

export interface NotesFilter {
  labelId?: string;
  searchQuery?: string;
  color?: NoteColor;
}
