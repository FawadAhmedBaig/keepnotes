"use client";

import { Check } from "lucide-react";
import { NOTE_COLORS, type NoteColor } from "@/types/note";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: NoteColor;
  onChange: (color: NoteColor) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2 p-2 max-w-[200px]">
{/* Change 'color' to 'colorObj' to avoid confusion */}
{NOTE_COLORS.map((colorObj) => (
  <button
    key={colorObj.value}
    onClick={() => onChange(colorObj.value)}
    className={cn(
      "w-8 h-8 rounded-full border-2 flex items-center justify-center",
      colorObj.classes,
      /* FIX 1: Compare 'value' to 'colorObj.value' */
      value === colorObj.value ? "border-primary" : "border-transparent"
    )}
  >
    {/* FIX 2: Compare 'value' to 'colorObj.value' here too */}
    {value === colorObj.value && (
      <Check className="w-4 h-4 text-foreground" />
    )}
  </button>
))}
    </div>
  );
}

export function getNoteColorClass(colorValue: string) {
  const color = NOTE_COLORS.find((c) => c.value === colorValue);
  // Return the specific classes, or the default background if not found
  return color ? color.classes : "bg-white dark:bg-zinc-950";
}