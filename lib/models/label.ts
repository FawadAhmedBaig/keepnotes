import mongoose, { Schema, models, model, type Document } from "mongoose";

export interface ILabel extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const LabelSchema = new Schema<ILabel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, maxlength: 50 },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique label names per user
LabelSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Label = models.Label || model<ILabel>("Label", LabelSchema);
