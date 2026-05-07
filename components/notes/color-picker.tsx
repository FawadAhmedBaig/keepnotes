"use client";

import { Check, Palette } from "lucide-react";
import { NOTE_COLORS, type NoteColor } from "@/types/note";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ColorPickerProps {
  value: NoteColor;
  onChange: (color: NoteColor) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-slate-500 hover:bg-black/5"
          title="Change color"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        side="top" 
        align="start" 
        className="w-fit p-2 bg-popover border shadow-lg rounded-xl"
      >
        {/* Grid layout: 4 columns to keep it compact and professional */}
        <div className="grid grid-cols-4 gap-2">
          {NOTE_COLORS.map((colorObj) => (
            <button
              key={colorObj.value}
              type="button" // Prevent form submission if used inside a form
              onClick={() => onChange(colorObj.value as NoteColor)}
              className={cn(
                "w-8 h-8 rounded-full border flex items-center justify-center transition-transform hover:scale-110 active:scale-95",
                colorObj.classes,
                value === colorObj.value ? "border-slate-900 ring-1 ring-slate-900" : "border-black/10"
              )}
              // FIXED: Changed colorObj.label to colorObj.name to match your types
              title={colorObj.name}
            >
              {value === colorObj.value && (
                <Check className="w-4 h-4 text-slate-800" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function getNoteColorClass(colorValue: string) {
  const color = NOTE_COLORS.find((c) => c.value === colorValue);
  
  // Return a default border so white/default notes have a visible structure in the grid
  if (!color || color.value === "default") {
    return "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800";
  }
  
  return color.classes;
}