"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker } from "./color-picker";
import { NOTE_COLORS, type NoteColor } from "@/types/note";
import { useClickAway } from "react-use";
import { UploadButton } from "@/lib/uploadthing";
import { ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateNote } from "@/hooks/use-notes"; // Ensure this path is correct

export function NoteInput() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<NoteColor>("default");
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Image State
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);
  
  const containerRef = useRef(null);
  const createMutation = useCreateNote();

  const handleSave = async () => {
    // 1. Safety Check: If an image is still uploading, don't save yet.
    if (isUploading) {
      toast.error("Please wait for the image to finish uploading");
      return;
    }

    // 2. Only close if everything is empty
    if (!title.trim() && !content.trim() && !imageUrl) {
      setIsExpanded(false);
      return;
    }

    setLoading(true);
    try {
      // 3. Execution: Pass the current state values to the mutation.
      await createMutation.mutateAsync({ 
        title: title.trim(), 
        content: content.trim(), 
        color, 
        imageUrl, 
        imageKey 
      });

      // 4. Cleanup: Reset all states ONLY after the mutation succeeds
      setTitle("");
      setContent("");
      setColor("default");
      setImageUrl(null);
      setImageKey(null);
      setIsExpanded(false);
      
      toast.success("Note saved successfully");
    } catch (error) {
      console.error("Failed to save note:", error);
      // Errors are typically handled globally in the hook, but fallback is safe here
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
        "max-w-xl mx-auto rounded-lg border shadow-md transition-colors duration-200 overflow-hidden mb-8",
        currentColorClasses
      )}
    >
      {/* Image Preview Area */}
      {imageUrl && (
        <div className="relative w-full group bg-black/5">
          <img 
            src={imageUrl} 
            alt="Upload preview" 
            className="w-full h-auto max-h-[450px] object-contain mx-auto"
          />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setImageUrl(null);
              setImageKey(null);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="p-1">
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
          className="border-none shadow-none focus-visible:ring-0 resize-none min-h-[45px] bg-transparent text-base"
        />
      </div>

      {isExpanded && (
        <div className="flex items-center justify-between p-2 border-t border-black/10">
          <div className="flex items-center gap-1">
            <ColorPicker value={color} onChange={setColor} />
            
            {/* <UploadButton
              endpoint="imageUploader"
              onUploadBegin={() => {
                setIsUploading(true);
              }}
              onClientUploadComplete={(res) => {
                setIsUploading(false);
                setImageUrl(res[0].url);
                setImageKey(res[0].key);
                toast.success("Image ready");
              }}
              onUploadError={(error: Error) => {
                setIsUploading(false);
                toast.error(`Upload failed: ${error.message}`);
              }}
              appearance={{
                button: "ut-ready:bg-transparent ut-uploading:cursor-not-allowed rounded-full p-2 h-9 w-9 text-slate-600 hover:bg-black/10 border-none shadow-none focus-within:ring-0 transition-colors",
                allowedContent: "hidden",
              }}
              content={{
                button: isUploading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-slate-700" />
                )
              }}
            /> */}
          </div>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleSave} 
            disabled={loading || isUploading}
            className="font-semibold text-sm"
          >
            {loading ? "Saving..." : "Close"}
          </Button>
        </div>
      )}
    </div>
  );
}