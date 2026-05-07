import mongoose, { Schema, models, model, Document } from "mongoose";
// Use 'import type' to prevent Mongoose from leaking into the browser
import type { INote as INoteBase, NoteColor } from "@/types/note";

// We extend the base interface for Mongoose-specific types
export interface INoteDocument extends Omit<INoteBase, "_id" | "userId" | "labels" | "createdAt" | "updatedAt" | "trashedAt">, Document {
  userId: mongoose.Types.ObjectId;
  labels: mongoose.Types.ObjectId[];
  imageUrl?: string;      // NEW: URL from Cloudinary/UploadThing
  imageKey?: string;      // NEW: Unique key to identify the file in cloud storage
  trashedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose enum validation
const VALID_COLORS: NoteColor[] = [
  "default", "red", "orange", "yellow", "green", "teal", "blue", "purple", "pink", "brown", "gray"
];

const NoteSchema = new Schema<INoteDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "", maxlength: 1000 },
    content: { type: String, default: "", maxlength: 20000 },
    color: { type: String, enum: VALID_COLORS, default: "default" },
    labels: [{ type: Schema.Types.ObjectId, ref: "Label" }],
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false },
    trashedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes
NoteSchema.index({ userId: 1, isTrashed: 1, isArchived: 1, isPinned: -1, updatedAt: -1 });
NoteSchema.index({ userId: 1, labels: 1 });
NoteSchema.index({ userId: 1, title: "text", content: "text" });

export const Note = models.Note || model<INoteDocument>("Note", NoteSchema);