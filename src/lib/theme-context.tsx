"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
 theme: Theme;
 setTheme: (t: Theme) => void;
 resolved: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getSystemTheme(): "light" | "dark" {
 if (typeof window === "undefined") return "light";
 return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
 const [theme, setThemeState] = useState<Theme>("system");
 const [resolved, setResolved] = useState<"light" | "dark">("light");

 const applyTheme = useCallback((t: Theme) => {
  const root = document.documentElement;
  const actual = t === "system" ? getSystemTheme() : t;
  if (actual === "dark") {
   root.classList.add("dark");
  } else {
   root.classList.remove("dark");
  }
  setResolved(actual);
 }, []);

 useEffect(() => {
  const stored = localStorage.getItem("gigmate_theme") as Theme | null;
  const initial = stored || "system";
  setThemeState(initial);
  applyTheme(initial);
 }, [applyTheme]);

 useEffect(() => {
  if (theme !== "system") return;
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => applyTheme("system");
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
 }, [theme, applyTheme]);

 const setTheme = useCallback((t: Theme) => {
  localStorage.setItem("gigmate_theme", t);
  setThemeState(t);
  applyTheme(t);
 }, [applyTheme]);

 return (
  <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
   {children}
  </ThemeContext.Provider>
 );
}

export function useTheme() {
 const ctx = useContext(ThemeContext);
 if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
 return ctx;
}
