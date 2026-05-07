"use client";

import { cn } from "@/lib/utils";
import { NOTE_COLORS, type NoteColor } from "@/types/note";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Palette, Check } from "lucide-react";

interface ColorPickerProps {
  value: NoteColor;
  onChange: (color: NoteColor) => void;
  disabled?: boolean;
}

const colorLabels: Record<NoteColor, string> = {
  default: "Default",
  red: "Red",
  orange: "Orange",
  yellow: "Yellow",
  green: "Green",
  teal: "Teal",
  blue: "Blue",
  purple: "Purple",
  pink: "Pink",
  brown: "Brown",
  gray: "Gray",
};

const colorClasses: Record<NoteColor, string> = {
  default: "bg-[var(--note-default)] border-border",
  red: "bg-[var(--note-red)]",
  orange: "bg-[var(--note-orange)]",
  yellow: "bg-[var(--note-yellow)]",
  green: "bg-[var(--note-green)]",
  teal: "bg-[var(--note-teal)]",
  blue: "bg-[var(--note-blue)]",
  purple: "bg-[var(--note-purple)]",
  pink: "bg-[var(--note-pink)]",
  brown: "bg-[var(--note-brown)]",
  gray: "bg-[var(--note-gray)]",
};

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          className="rounded-full"
          aria-label="Change color"
        >
          <Palette className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="grid grid-cols-4 gap-1">
{NOTE_COLORS.map((colorObj) => (
  <button
    key={colorObj.value} // Use the string value for the key
    onClick={() => onChange(colorObj.value)} // Pass the string value
    className={cn(
      "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110",
      // Use the value to determine the background color
      colorObj.value === "default" ? "bg-background" : `bg-${colorObj.value}-200 dark:bg-${colorObj.value}-900`,
      value === colorObj.value && "border-primary ring-2 ring-primary ring-offset-2"
    )}
  >
    {value === colorObj.value && (
      <Check className="w-4 h-4 text-foreground" />
    )}
  </button>
))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { colorClasses };
