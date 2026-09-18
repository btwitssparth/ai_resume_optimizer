import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";

type Density = "comfortable" | "compact";
type Motion = "full" | "reduced";

interface AppContextValue {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  density: Density;
  setDensity: (v: Density) => void;
  motion: Motion;
  setMotion: (v: Motion) => void;
  motionEnabled: boolean;
  motionMultiplier: number;
  densityClass: "density-comfortable" | "density-compact";
  defaultMatcherResumeId: string | null;
  setDefaultMatcherResumeId: (v: string | null) => void;
  autoApplyEdits: boolean;
  setAutoApplyEdits: (v: boolean) => void;
  mobileDrawerOpen: boolean;
  toggleMobileDrawer: () => void;
  setMobileDrawerOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // Malformed or inaccessible localStorage value — fall back to the default.
    return fallback;
  }
}

function writeLS<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private browsing, quota exceeded, etc.) — ignore.
  }
}

function getSystemReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(() =>
    readLS("ats_sidebar_collapsed", false)
  );
  const [density, setDensityState] = useState<Density>(() =>
    readLS<Density>("ats_density", "comfortable")
  );
  const [motion, setMotionState] = useState<Motion>(() => {
    const saved = localStorage.getItem("ats_motion");
    if (saved !== null) {
      try {
        return JSON.parse(saved) as Motion;
      } catch {
        // Fall through to the system preference below.
      }
    }
    return getSystemReducedMotion() ? "reduced" : "full";
  });
  const [systemReduced, setSystemReduced] = useState<boolean>(getSystemReducedMotion);
  const [defaultMatcherResumeId, setDefaultMatcherResumeIdState] = useState<string | null>(() =>
    readLS<string | null>("ats_default_matcher", null)
  );
  const [autoApplyEdits, setAutoApplyEditsState] = useState<boolean>(() =>
    readLS("ats_auto_apply_edits", false)
  );

  const [mobileDrawerOpen, setMobileDrawerOpenState] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setSystemReduced(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  const userSetMotion = useMemo(() => localStorage.getItem("ats_motion") !== null, []);

  const motionEnabled = useMemo(() => {
    if (motion === "full" && !systemReduced) return true;
    if (motion === "full" && systemReduced && userSetMotion) return true;
    return false;
  }, [motion, systemReduced, userSetMotion]);

  const motionMultiplier = motionEnabled ? 1 : 0;
  const densityClass = density === "compact" ? "density-compact" : "density-comfortable";

  const setSidebarCollapsed = useCallback((v: boolean) => {
    setSidebarCollapsedState(v);
    writeLS("ats_sidebar_collapsed", v);
  }, []);
  const setDensity = useCallback((v: Density) => {
    setDensityState(v);
    writeLS("ats_density", v);
  }, []);
  const setMotion = useCallback((v: Motion) => {
    setMotionState(v);
    writeLS("ats_motion", v);
  }, []);
  const setDefaultMatcherResumeId = useCallback((v: string | null) => {
    setDefaultMatcherResumeIdState(v);
    writeLS("ats_default_matcher", v);
  }, []);
  const setAutoApplyEdits = useCallback((v: boolean) => {
    setAutoApplyEditsState(v);
    writeLS("ats_auto_apply_edits", v);
  }, []);

  const toggleMobileDrawer = useCallback(() => {
    setMobileDrawerOpenState((v) => !v);
  }, []);

  const setMobileDrawerOpen = useCallback((v: boolean) => {
    setMobileDrawerOpenState(v);
  }, []);

  const value: AppContextValue = {
    sidebarCollapsed,
    setSidebarCollapsed,
    density,
    setDensity,
    motion,
    setMotion,
    motionEnabled,
    motionMultiplier,
    densityClass,
    defaultMatcherResumeId,
    setDefaultMatcherResumeId,
    autoApplyEdits,
    setAutoApplyEdits,
    mobileDrawerOpen,
    toggleMobileDrawer,
    setMobileDrawerOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- co-locating the hook with its Provider is intentional
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
