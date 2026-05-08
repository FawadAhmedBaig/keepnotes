import { createContext, useContext } from "react";

interface NotesContextType {
  searchQuery: string;
  onEditLabels?: () => void; // ADD THIS LINE
}

// Ensure the default value matches the interface
export const NotesContext = createContext<NotesContextType>({
  searchQuery: "",
  onEditLabels: () => {}, // Add a default empty function
});

export const useNotesContext = () => useContext(NotesContext);