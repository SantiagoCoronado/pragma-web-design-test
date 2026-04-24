"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";

export type MotionPref = "on" | "off";

interface MotionContextValue {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const MotionContext = createContext<MotionContextValue | null>(null);

const STORAGE_KEY = "pragma-motion";
const CHANGE_EVENT = "pragma-motion-change";

function readClientEnabled(): boolean {
  const attr = document.documentElement.dataset.motion;
  return attr !== "off";
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const enabled = useSyncExternalStore<boolean>(
    subscribe,
    readClientEnabled,
    () => true
  );

  const setEnabled = useCallback((next: boolean) => {
    if (typeof document === "undefined") return;
    const value: MotionPref = next ? "on" : "off";
    document.documentElement.dataset.motion = value;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* storage may be blocked; attribute still switches live */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return (
    <MotionContext.Provider value={{ enabled, setEnabled }}>
      {children}
    </MotionContext.Provider>
  );
}

export function useMotionContext() {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error("useMotionContext must be used inside MotionProvider");
  return ctx;
}

export function useMotionEnabled(): boolean {
  return useMotionContext().enabled;
}

export function useMotionActive(): boolean {
  const enabled = useMotionEnabled();
  const reduced = useReducedMotion();
  return enabled && !reduced;
}
