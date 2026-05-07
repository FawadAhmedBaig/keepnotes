"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LabelManagerDialog } from "@/components/labels/label-manager-dialog";
import { useLabels } from "@/hooks/use-labels";
import { usePusher } from "@/hooks/use-pusher";
import { useDebounce } from "@/hooks/use-debounce";
import { NotesContext } from "@/lib/notes-context";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { data: labels = [] } = useLabels();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Set up Pusher for real-time sync
  usePusher(session?.user?.id, {
    onNoteEvent: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onLabelEvent: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] });
    },
  });

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    queryClient.invalidateQueries({ queryKey: ["labels"] });
  }, [queryClient]);

  return (
    <NotesContext.Provider value={{ searchQuery: debouncedSearch }}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar
          labels={labels}
          isCollapsed={isSidebarCollapsed}
          onEditLabels={() => setIsLabelDialogOpen(true)}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onRefresh={handleRefresh}
          />
          
          <main className="flex-1 overflow-auto pb-16 md:pb-0">
            {children}
          </main>
          
          <MobileNav />
        </div>
        
        <LabelManagerDialog
          open={isLabelDialogOpen}
          onOpenChange={setIsLabelDialogOpen}
          labels={labels}
        />
      </div>
    </NotesContext.Provider>
  );
}
