"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getTeacher } from "@/utils/localStore";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import {
  AppSettingsProvider,
  useAppSettings,
  THEMES,
  FONT_SIZES,
  DENSITIES,
} from "@/context/AppSettingsContext";

const TeacherContext = createContext(null);
export const useTeacher = () => useContext(TeacherContext);
const queryClient = new QueryClient();

function ThemedApp({ children }) {
  const { settings, loaded } = useAppSettings();
  const theme = THEMES[settings.theme] || THEMES.claro;
  const fs = FONT_SIZES[settings.fontSize] || FONT_SIZES.normal;
  const dn = DENSITIES[settings.density] || DENSITIES.normal;

  const cssVars = {
    "--ca-bg": theme.bg,
    "--ca-surface": theme.surface,
    "--ca-text": theme.text,
    "--ca-text-muted": theme.textMuted,
    "--ca-border": theme.border,
    "--ca-nav-bg": theme.navBg,
    "--ca-nav-border": theme.navBorder,
    "--ca-nav-text": theme.navText,
    "--ca-primary": settings.primaryColor,
    "--ca-secondary": settings.secondaryColor,
    "--ca-font-base": fs.base,
    "--ca-font-heading": fs.heading,
    "--ca-timer-size": fs.timer,
    "--ca-space": dn.spacing,
    "--ca-card-pad": dn.card,
    fontSize: fs.base,
    backgroundColor: theme.bg,
    color: theme.text,
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={cssVars}
    >
      <Navbar theme={theme} />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      <Toaster position="top-center" richColors />
    </div>
  );
}

function TeacherProvider({ children }) {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTeacher(getTeacher());
    setLoading(false);
  }, []);

  return (
    <TeacherContext.Provider value={{ teacher, setTeacher, loading }}>
      {children}
    </TeacherContext.Provider>
  );
}

export default function ClientLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppSettingsProvider>
        <TeacherProvider>
          <ThemedApp>{children}</ThemedApp>
        </TeacherProvider>
      </AppSettingsProvider>
    </QueryClientProvider>
  );
}
