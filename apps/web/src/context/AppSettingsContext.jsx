"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// ─── Default settings ────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS = {
  // Apariencia
  theme: "claro", // claro | oscuro | contraste | calido | colorido | minimalista
  primaryColor: "#2563EB", // hex
  secondaryColor: "#059669",
  fontSize: "normal", // pequeño | normal | grande | gigante
  density: "normal", // compacta | normal | amplia
  borderStyle: "redondeados", // suaves | redondeados | rectos
  animations: true,
  decorativeBackgrounds: true,

  // Modo clase
  timerSize: "grande", // grande | gigante | proyector
  defaultClassView: "teacher", // teacher | class
  showCurrentMoment: true,
  showNextMoment: true,
  showProgressBar: true,
  showTeacherNotes: true,
  showTotalTimeLeft: true,
  showMomentTimeLeft: true,
  darkModeInClass: false,
  highContrastMode: false,
  distractionFree: false,
  soundAlerts: true,
  alertSound: "beep", // beep | bell | chime | soft
  vibration: true,
  alertAt5min: false,
  alertAt3min: true,
  alertAt1min: true,
  alertAt30sec: false,

  // Preferencias docentes
  teacherName: "",
  institution: "",
  defaultGrade: "",
  defaultLevel: "Primaria",
  defaultArea: "Comunicacion",
  favoriteAreas: ["Comunicación", "Matemática"],
  defaultDuration: 90,
  classroomContext: "",
  favoriteMoments: ["Inicio", "Desarrollo", "Cierre"],
  defaultCreationMode: "simple", // simple | advanced | import

  // Importación
  importMode: "automatica", // automatica | asistida
  alwaysShowPreview: true,
  detectMoments: true,
  suggestTimes: true,
  showUncertainWarnings: true,
  allowPasteText: true,
  allowFileUpload: true,

  // Fondos e imágenes
  backgroundsEnabled: true,
  appBackground: "", // url or ""
  classModeBackground: "",
  globalBgOpacity: 0.4,
  globalBgBlur: 0,
  globalBgDarken: 0.3,
  globalBgBrighten: 0,
  readabilitySafe: true,

  // Datos
  autoSave: true,
};

const STORAGE_KEY = "cronoaula_settings";

const AppSettingsContext = createContext(null);

export function AppSettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettingsState({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    } finally {
      setLoaded(true);
    }
  }, []);

  const setSetting = useCallback((key, value) => {
    setSettingsState((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const setSettings = useCallback((updates) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsState(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }, []);

  return (
    <AppSettingsContext.Provider
      value={{ settings, setSetting, setSettings, resetSettings, loaded }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx)
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  return ctx;
}

// ─── Theme definitions ────────────────────────────────────────────────────────
export const THEMES = {
  claro: {
    label: "Claro profesional",
    emoji: "☀️",
    bg: "#F7F6F3",
    surface: "#FFFFFF",
    text: "#1E293B",
    textMuted: "#64748B",
    border: "#E2E8F0",
    navBg: "#FFFFFF",
    navBorder: "#E2E8F0",
    navText: "#1E293B",
    tag: "bg-white text-slate-800 border-slate-200",
  },
  oscuro: {
    label: "Oscuro aula",
    emoji: "🌙",
    bg: "#0F0F1A",
    surface: "#1A1A2E",
    text: "#F1F5F9",
    textMuted: "#94A3B8",
    border: "#FFFFFF1A",
    navBg: "#0F0F1A",
    navBorder: "#FFFFFF10",
    navText: "#F1F5F9",
    tag: "bg-slate-800 text-white border-slate-700",
  },
  contraste: {
    label: "Alto contraste",
    emoji: "⬛",
    bg: "#000000",
    surface: "#111111",
    text: "#FFFFFF",
    textMuted: "#FACC15",
    border: "#FACC15",
    navBg: "#000000",
    navBorder: "#FACC15",
    navText: "#FFFFFF",
    tag: "bg-black text-yellow-400 border-yellow-400",
  },
  calido: {
    label: "Cálido",
    emoji: "🧡",
    bg: "#FFF8F0",
    surface: "#FFFFFF",
    text: "#3D2B1F",
    textMuted: "#9A7C6E",
    border: "#F5D5BE",
    navBg: "#FFFFFF",
    navBorder: "#F5D5BE",
    navText: "#3D2B1F",
    tag: "bg-orange-50 text-orange-900 border-orange-200",
  },
  colorido: {
    label: "Colorido escolar",
    emoji: "🎨",
    bg: "#F0F4FF",
    surface: "#FFFFFF",
    text: "#1E1B4B",
    textMuted: "#6366F1",
    border: "#C7D2FE",
    navBg: "#FFFFFF",
    navBorder: "#C7D2FE",
    navText: "#1E1B4B",
    tag: "bg-indigo-50 text-indigo-900 border-indigo-200",
  },
  minimalista: {
    label: "Minimalista",
    emoji: "⬜",
    bg: "#FFFFFF",
    surface: "#FAFAFA",
    text: "#111827",
    textMuted: "#6B7280",
    border: "#E5E7EB",
    navBg: "#FFFFFF",
    navBorder: "#E5E7EB",
    navText: "#111827",
    tag: "bg-gray-50 text-gray-800 border-gray-200",
  },
};

export const FONT_SIZES = {
  pequeño: { base: "13px", heading: "18px", timer: "80px" },
  normal: { base: "15px", heading: "22px", timer: "100px" },
  grande: { base: "17px", heading: "26px", timer: "130px" },
  gigante: { base: "20px", heading: "32px", timer: "160px" },
};

export const DENSITIES = {
  compacta: { spacing: "0.5rem", card: "0.75rem" },
  normal: { spacing: "1rem", card: "1.25rem" },
  amplia: { spacing: "1.5rem", card: "2rem" },
};
