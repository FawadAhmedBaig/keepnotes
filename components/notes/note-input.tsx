"use client";
import { cn } from "@/lib/utils";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker } from "./color-picker";
import { createNote } from "@/lib/actions/notes";
import { NOTE_COLORS, type NoteColor } from "@/types/note";
import { INote } from "../../types/note";
import { useClickAway } from "react-use";

export function NoteInput() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<NoteColor>("default");
  const [loading, setLoading] = useState(false);
  
  const containerRef = useRef(null);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      setIsExpanded(false);
      return;
    }

    setLoading(true);
    try {
      await createNote({ title, content, color });
      // Reset after successful save
      setTitle("");
      setContent("");
      setColor("default");
      setIsExpanded(false);
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save when clicking outside
  useClickAway(containerRef, () => {
    if (isExpanded) handleSave();
  });

  const currentColorClasses = NOTE_COLORS.find(c => c.value === color)?.classes || "bg-card";

  return (
    <div 
      ref={containerRef}
      className={cn(
        "max-w-xl mx-auto rounded-lg border shadow-md transition-colors duration-200",
        currentColorClasses
      )}
    >
      {isExpanded && (
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-none shadow-none focus-visible:ring-0 text-lg font-bold bg-transparent"
        />
      )}
      <Textarea
        placeholder="Take a note..."
        value={content}
        onFocus={() => setIsExpanded(true)}
        onChange={(e) => setContent(e.target.value)}
        className="border-none shadow-none focus-visible:ring-0 resize-none min-h-[45px] bg-transparent"
      />
      {isExpanded && (
        <div className="flex items-center justify-between p-2 border-t border-black/10">
          <ColorPicker value={color} onChange={setColor} />
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleSave} 
            disabled={loading}
            className="font-semibold"
          >
            {loading ? "Saving..." : "Close"}
          </Button>
        </div>
      )}
    </div>
  );
}