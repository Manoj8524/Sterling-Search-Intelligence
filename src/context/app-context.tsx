import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { resorts } from "@/data/resorts";

interface AppState {
  resortId: string; // "all" | resort id
  setResortId: (id: string) => void;
  dateRange: string;
  setDateRange: (r: string) => void;
  resortName: string;
  isAll: boolean;
}

const AppCtx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [resortId, setResortId] = useState("all");
  const [dateRange, setDateRange] = useState("Last 12 weeks");

  const value = useMemo<AppState>(() => {
    const r = resorts.find((x) => x.id === resortId);
    return {
      resortId,
      setResortId,
      dateRange,
      setDateRange,
      resortName: r ? r.name : "All Resorts",
      isAll: resortId === "all",
    };
  }, [resortId, dateRange]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

/** Filter any list of records that carry a resortId by the active resort. */
export function useResortFilter<T extends { resortId: string }>(rows: T[]) {
  const { resortId, isAll } = useApp();
  return useMemo(() => (isAll ? rows : rows.filter((r) => r.resortId === resortId)), [rows, resortId, isAll]);
}
