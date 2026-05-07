// types/note.ts

export const NOTE_COLORS = [
  { name: "Default", value: "default", classes: "bg-white dark:bg-zinc-950 border-gray-200" },
  { name: "Red", value: "red", classes: "bg-red-200 dark:bg-red-900 border-red-300" },
  { name: "Orange", value: "orange", classes: "bg-orange-200 dark:bg-orange-900 border-orange-300" },
  { name: "Yellow", value: "yellow", classes: "bg-yellow-200 dark:bg-yellow-900 border-yellow-300" },
  { name: "Green", value: "green", classes: "bg-green-200 dark:bg-green-900 border-green-300" },
  { name: "Teal", value: "teal", classes: "bg-teal-200 dark:bg-teal-900 border-teal-300" },
  { name: "Blue", value: "blue", classes: "bg-blue-200 dark:bg-blue-900 border-blue-300" },
  { name: "Purple", value: "purple", classes: "bg-purple-200 dark:bg-purple-900 border-purple-300" },
  { name: "Pink", value: "pink", classes: "bg-pink-200 dark:bg-pink-900 border-pink-300" },
  { name: "Brown", value: "brown", classes: "bg-amber-200 dark:bg-amber-900 border-amber-300" },
  { name: "Gray", value: "gray", classes: "bg-gray-200 dark:bg-gray-800 border-gray-300" },
] as const;

export type NoteColor = (typeof NOTE_COLORS)[number]["value"];

export interface INote {
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