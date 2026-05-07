// types/note.ts

export const NOTE_COLORS = [
  { name: "Default", value: "default" },
  { name: "Red", value: "red" },
  { name: "Orange", value: "orange" },
  { name: "Yellow", value: "yellow" },
  { name: "Green", value: "green" },
  { name: "Teal", value: "teal" },
  { name: "Blue", value: "blue" },
  { name: "Purple", value: "purple" },
  { name: "Pink", value: "pink" },
  { name: "Brown", value: "brown" },
  { name: "Gray", value: "gray" },
] as const;

export type NoteColor = (typeof NOTE_COLORS)[number]["value"];
export type ViewType = "notes" | "archive" | "trash" | "label";

export interface LabelType {
  _id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface INote {
  _id: string;
  userId: string;
  title: string;
  content: string;
  color: NoteColor;
  labels: string[]; // IDs as strings for the frontend
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  trashedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoteWithLabels extends Omit<INote, "labels"> {
  labels: LabelType[];
}

export interface NotesFilter {
  labelId?: string;
  searchQuery?: string;
  color?: NoteColor;
}