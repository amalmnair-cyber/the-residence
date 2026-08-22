"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface CursorApi {
  label: string | null;
  show: (label: string) => void;
  hide: () => void;
}

const CursorContext = createContext<CursorApi | null>(null);

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [label, setLabel] = useState<string | null>(null);

  const show = useCallback((l: string) => setLabel(l), []);
  const hide = useCallback(() => setLabel(null), []);

  const value = useMemo(() => ({ label, show, hide }), [label, show, hide]);

  return <CursorContext.Provider value={value}>{children}</CursorContext.Provider>;
}

export function useCursor() {
  const ctx = useContext(CursorContext);
  if (!ctx) {
    return { label: null, show: () => {}, hide: () => {} } satisfies CursorApi;
  }
  return ctx;
}
