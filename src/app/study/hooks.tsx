"use client";
import { ToolInvocation } from "ai";
import { createContext, ReactNode, useContext, useState } from "react";

interface StudyContextType {
  viewToolInvocation: ToolInvocation | null;
  setViewToolInvocation: (toolInvocation: ToolInvocation | null) => void;
  unsetViewToolInvocation: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [viewToolInvocation, setViewToolInvocation] = useState<ToolInvocation | null>(null);
  const unsetViewToolInvocation = () => setViewToolInvocation(null);
  return (
    <StudyContext.Provider
      value={{ viewToolInvocation, setViewToolInvocation, unsetViewToolInvocation }}
    >
      {children}
    </StudyContext.Provider>
  );
}

export function useStudyContext() {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error("useStudyContext must be used within a StudyProvider");
  }
  return context;
}
