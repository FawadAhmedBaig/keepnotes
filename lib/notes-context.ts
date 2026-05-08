// lib/notes-context.ts

import { createContext, useContext } from "react";

interface NotesContextType {
  searchQuery: string;
  onEditLabels?: () => void; // <--- ADD THIS LINE
}

export const NotesContext = createContext<NotesContextType>({
  searchQuery: "",
  onEditLabels: () => {}, // Add a default empty function here too
});

export const useNotesContext = () => useContext(NotesContext);