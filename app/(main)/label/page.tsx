"use client";

import { Tag, Plus, Settings2 } from "lucide-react";
import { useLabels } from "@/hooks/use-labels";
import { useNotesContext } from "@/lib/notes-context"; // Import the hook
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LabelsIndexPage() {
  const { data: labels = [] } = useLabels();
  // Pull the open function from the global context
  const { onEditLabels } = useNotesContext();

  return (
    <div className="flex flex-col h-full bg-background p-4 md:hidden pb-24">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold tracking-tight">Labels</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEditLabels} 
          className="gap-2 rounded-full border-primary/20 text-primary active:scale-95 transition-all shadow-sm"
        >
          <Settings2 className="w-4 h-4" />
          <span className="text-xs font-semibold">Manage</span>
        </Button>
      </div>
      
      <div className="grid gap-3">
        {/* Existing Labels List */}
        {labels.map((label) => (
          <div key={label._id} className="relative">
            <Link
              href={`/label/${label._id}`}
              className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card active:bg-secondary/40 transition-all shadow-sm"
            >
              <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                <Tag className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm flex-1 truncate">{label.name}</span>
              {/* <Plus className="w-4 h-4 text-muted-foreground/40 rotate-45" /> */}
            </Link>
          </div>
        ))}
        
        {/* Create New Label Button */}
        <Button 
          variant="ghost" 
          onClick={onEditLabels}
          className="flex items-center justify-start gap-4 p-4 h-auto rounded-2xl border-2 border-dashed border-border/60 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all mt-2 active:bg-primary/5"
        >
          <div className="bg-secondary/50 p-2.5 rounded-xl">
            <Plus className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm">Create new label</span>
        </Button>

        {/* Empty State */}
        {labels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
            <div className="bg-secondary/30 p-6 rounded-full mb-4">
               <Tag className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground font-semibold">No labels yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Organize your notes with labels</p>
          </div>
        )}
      </div>
    </div>
  );
}