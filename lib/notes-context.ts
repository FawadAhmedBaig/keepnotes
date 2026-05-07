"use client";

import { createContext, useContext } from "react";

interface NotesContextType {
  searchQuery: string;
}

export const NotesContext = createContext<NotesContextType>({
  searchQuery: "",
});

export function useNotesContext() {
  return useContext(NotesContext);
}
