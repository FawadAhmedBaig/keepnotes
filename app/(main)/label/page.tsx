"use client";

import { Tag, Plus, Settings2, Trash2 } from "lucide-react";
import { useLabels } from "@/hooks/use-labels";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Note: Ensure your parent component passes onEditLabels (the function that opens the dialog)
export default function LabelsIndexPage({ onEditLabels }: { onEditLabels?: () => void }) {
  const { data: labels = [] } = useLabels();

  return (
    <div className="flex flex-col h-full bg-background p-4 md:hidden pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Labels</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEditLabels} // This triggers the Manage/Edit dialog
          className="gap-2 rounded-full border-primary/20 text-primary active:scale-95 transition-transform"
        >
          <Settings2 className="w-4 h-4" />
          Manage
        </Button>
      </div>
      
      <div className="grid gap-2">
        {labels.map((label) => (
          <div key={label._id} className="relative group">
            <Link
              href={`/label/${label._id}`}
              className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card active:bg-secondary/30 transition-all"
            >
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Tag className="w-4 h-4" />
              </div>
              <span className="font-medium flex-1 truncate">{label.name}</span>
            </Link>
          </div>
        ))}
        
        {/* The "Add New Label" logic - This should trigger your existing Edit Labels dialog */}
        <Button 
          variant="ghost" 
          onClick={onEditLabels}
          className="flex items-center gap-4 p-4 h-auto rounded-xl border border-dashed border-border text-muted-foreground hover:text-primary transition-colors mt-2"
        >
          <div className="p-2">
            <Plus className="w-4 h-4" />
          </div>
          <span className="font-medium">Create new label</span>
        </Button>

        {labels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-secondary/50 p-4 rounded-full mb-4">
               <Tag className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-medium">No labels found</p>
          </div>
        )}
      </div>
    </div>
  );
}