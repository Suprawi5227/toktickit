import { createContext, useContext, useState, ReactNode } from "react";
import { Requester } from "../api.js";

interface RequesterContextType {
  requester: Requester | null;
  setRequester: (requester: Requester | null) => void;
}

const RequesterContext = createContext<RequesterContextType | undefined>(undefined);

export function RequesterProvider({ children }: { children: ReactNode }) {
  const [requester, setRequester] = useState<Requester | null>(null);

  return (
    <RequesterContext.Provider value={{ requester, setRequester }}>
      {children}
    </RequesterContext.Provider>
  );
}

export function useRequester() {
  const context = useContext(RequesterContext);
  if (context === undefined) {
    throw new Error("useRequester must be used within a RequesterProvider");
  }
  return context;
}
