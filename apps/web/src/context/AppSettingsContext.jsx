"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export const STORAGE_KEY = "cronoaula_settings";

export function readableText(hex = "#38BDF8") {
  const clean = String(hex || "").replace("#", "");
  if (clean.length !== 6) return "#FFFFFF";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#0F172A" : "#FFFFFF";
}

export function normalizeTheme(theme, customTheme = {}) {
  const base = {
    bg: "#070B13",
    bgSecondary: "#0B1020",
    navBg: "rgba(7, 11, 19, 0.92)",
    navBorder: "rgba(255,255,255,0.10)",
    navText: "#F8FAFC",
    surface: "#101827",
    card: "rgba(255,255,255,0.055)",
    elevated: "rgba(255,255,255,0.09)",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    border: "rgba(255,255,255,0.12)",
    accent: "#38BDF8",
    accentSoft: "rgba(56,189,248,0.16)",
    onAccent: "#07111F",
    inputBg: "rgba(255,255,255,0.07)",
    shadow: "0 24px 70px rgba(0,0,0,0.22)",
    glow: "radial-gradient(circle at 50% 0%, rgba(56,189,248,0.20), transparent 38%)",
  };
  const next = { ...base, ...theme, ...customTheme };
  return { ...next, onAccent: next.onAccent || readableText(next.accent) };
}

export const THEMES = {
  oscuro: normalizeTheme({
    label: "CronoAula oscuro",
    bg: "#070B13",
    bgSecondary: "#0B1020",
    navBg: "rgba(7, 11, 19, 0.92)",
    navBorder: "rgba(255,255,255,0.10)",
    navText: "#F8FAFC",
    surface: "#0F172A",
    card: "rgba(255,255,255,0.055)",
    elevated: "rgba(255,255,255,0.09)",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    border: "rgba(255,255,255,0.12)",
    accent: "#38BDF8",
    accentSoft: "rgba(56,189,248,0.16)",
    onAccent: "#07111F",
    inputBg: "rgba(255,255,255,0.07)",
    glow: "radial-gradient(circle at 50% 0%, rgba(56,189,248,0.20), transparent 38%), radial-gradient(circle at 85% 85%, rgba(34,197,94,0.12), transparent 36%)",
  }),
  claro: normalizeTheme({
    label: "CronoAula claro",
    bg: "#F6F8FB",
    bgSecondary: "#EAF0F7",
    navBg: "rgba(255,255,255,0.88)",
    navBorder: "rgba(15,23,42,0.10)",
    navText: "#0F172A",
    surface: "#FFFFFF",
    card: "rgba(255,255,255,0.88)",
    elevated: "#FFFFFF",
    text: "#0F172A",
    textMuted: "#526176",
    border: "rgba(15,23,42,0.12)",
    accent: "#2563EB",
    accentSoft: "rgba(37,99,235,0.12)",
    onAccent: "#FFFFFF",
    inputBg: "#FFFFFF",
    shadow: "0 18px 50px rgba(15,23,42,0.10)",
    glow: "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.14), transparent 36%)",
  }),
  calido: normalizeTheme({
    label: "Aula calida",
    bg: "#FFF7ED",
    bgSecondary: "#F8E6D1",
    navBg: "rgba(255,251,245,0.90)",
    navBorder: "rgba(120,53,15,0.14)",
    navText: "#3D2B1F",
    surface: "#FFFCF7",
    card: "rgba(255,255,255,0.74)",
    elevated: "#FFFFFF",
    text: "#3D2B1F",
    textMuted: "#8A5A36",
    border: "rgba(120,53,15,0.16)",
    accent: "#D97706",
    accentSoft: "rgba(217,119,6,0.14)",
    onAccent: "#FFFFFF",
    inputBg: "rgba(255,255,255,0.82)",
    shadow: "0 18px 50px rgba(120,53,15,0.11)",
    glow: "radial-gradient(circle at 50% 0%, rgba(245,158,11,0.20), transparent 38%)",
  }),
  contraste: normalizeTheme({
    label: "Alto contraste",
    bg: "#000000",
    bgSecondary: "#080808",
    navBg: "#000000",
    navBorder: "#FACC15",
    navText: "#FFFFFF",
    surface: "#101010",
    card: "#111111",
    elevated: "#1A1A1A",
    text: "#FFFFFF",
    textMuted: "#FACC15",
    border: "#FACC15",
    accent: "#FACC15",
    accentSoft: "rgba(250,204,21,0.22)",
    onAccent: "#000000",
    inputBg: "#111111",
    shadow: "none",
    glow: "radial-gradient(circle at 50% 0%, rgba(250,204,21,0.18), transparent 35%)",
  }),
  ensena: normalizeTheme({
    label: "Inspirado en Enseña Peru",
    bg: "#FAF9F7",
    bgSecondary: "#F1EDEB",
    navBg: "rgba(250,249,247,0.92)",
    navBorder: "rgba(21,26,45,0.12)",
    navText: "#151A2D",
    surface: "#FFFFFF",
    card: "rgba(255,255,255,0.82)",
    elevated: "#FFFFFF",
    text: "#151A2D",
    textMuted: "#5D6475",
    border: "rgba(21,26,45,0.13)",
    accent: "#EE2D36",
    accentSoft: "rgba(238,45,54,0.13)",
    onAccent: "#FFFFFF",
    inputBg: "#FFFFFF",
    shadow: "0 18px 55px rgba(21,26,45,0.12)",
    glow: "radial-gradient(circle at 12% 0%, rgba(238,45,54,0.18), transparent 32%), radial-gradient(circle at 85% 10%, rgba(226,93,85,0.16), transparent 30%)",
  }),
  personalizado: normalizeTheme({
    label: "Personalizado",
  }),
};

THEMES.minimalista = { ...THEMES.claro, label: "CronoAula claro" };
THEMES.colorido = { ...THEMES.claro, label: "CronoAula claro" };

export const DEFAULT_CUSTOM_THEME = {
  bg: "#070B13",
  surface: "#101827",
  card: "rgba(255,255,255,0.055)",
  text: "#F8FAFC",
  accent: "#38BDF8",
};

export function resolveTheme(settings = {}) {
  const preset = settings.theme || "oscuro";
  const base = THEMES[preset] || THEMES.oscuro;
  const custom =
    preset === "personalizado"
      ? {
          ...settings.customTheme,
          bgSecondary: settings.customTheme?.bgSecondary || settings.customTheme?.bg,
          navBg: settings.customTheme?.navBg || settings.customTheme?.surface,
          navText: settings.customTheme?.text,
          surface: settings.customTheme?.surface,
          card: settings.customTheme?.card || settings.customTheme?.surface,
          elevated: settings.customTheme?.elevated || settings.customTheme?.surface,
          text: settings.customTheme?.text,
          textMuted: settings.customTheme?.textMuted || "#94A3B8",
          border: settings.customTheme?.border || "rgba(255,255,255,0.14)",
          accent: settings.customTheme?.accent,
          accentSoft: settings.customTheme?.accentSoft || `${settings.customTheme?.accent || "#38BDF8"}24`,
          inputBg: settings.customTheme?.inputBg || settings.customTheme?.surface,
        }
      : {};
  const theme = normalizeTheme(base, custom);
  const accent = preset === "personalizado" ? theme.accent : settings.primaryColor || theme.accent;
  return normalizeTheme(theme, {
    accent,
    accentSoft: preset === "personalizado" ? theme.accentSoft : `${accent}22`,
    onAccent: readableText(accent),
  });
}

export const DEFAULT_SETTINGS = {
  theme: "oscuro",
  primaryColor: "#38BDF8",
  secondaryColor: "#059669",
  customTheme: DEFAULT_CUSTOM_THEME,
  fontFamily: "system",
  fontSize: "normal",
  density: "normal",
  borderStyle: "redondeados",
  animations: true,
  decorativeBackgrounds: true,

  timerSize: "grande",
  defaultClassView: "class",
  showCurrentMoment: true,
  showNextMoment: true,
  showActivityInClass: true,
  showMomentChips: true,
  showProgressBar: true,
  showMomentProgress: true,
  showSessionProgress: true,
  showTeacherNotes: true,
  showTotalTimeLeft: true,
  showMomentTimeLeft: true,
  autoAdvanceMoments: false,
  pauseAtMomentEnd: true,
  darkModeInClass: false,
  highContrastMode: false,
  distractionFree: false,

  soundAlerts: true,
  alertVolume: "medio",
  earlyAlert: true,
  beepLast15: false,
  muteAll: false,
  alertSound: "beep",
  vibration: true,
  alertAt5min: false,
  alertAt3min: true,
  alertAt1min: true,
  alertAt30sec: false,

  teacherName: "",
  institution: "",
  defaultGrade: "",
  defaultLevel: "Primaria",
  defaultArea: "Comunicacion",
  favoriteAreas: ["Comunicacion", "Matematica"],
  defaultDuration: 90,
  classroomContext: "",
  favoriteMoments: ["Inicio", "Desarrollo", "Cierre"],
  defaultCreationMode: "simple",

  importMode: "automatica",
  alwaysShowPreview: true,
  detectMoments: true,
  suggestTimes: true,
  showUncertainWarnings: true,
  allowPasteText: true,
  allowFileUpload: true,

  backgroundsEnabled: true,
  appBackground: "",
  classModeBackground: "",
  globalBgOpacity: 0.4,
  globalBgBlur: 0,
  globalBgDarken: 0.3,
  globalBgBrighten: 0,
  readabilitySafe: true,

  autoSave: true,
};

const AppSettingsContext = createContext(null);

export function AppSettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettingsState({
          ...DEFAULT_SETTINGS,
          ...parsed,
          customTheme: { ...DEFAULT_CUSTOM_THEME, ...(parsed.customTheme || {}) },
        });
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
      const next = {
        ...prev,
        ...updates,
        customTheme: updates.customTheme
          ? { ...prev.customTheme, ...updates.customTheme }
          : prev.customTheme,
      };
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
  if (!ctx) throw new Error("useAppSettings must be used within AppSettingsProvider");
  return ctx;
}

export const FONT_SIZES = {
  pequeno: { base: "13px", heading: "18px", timer: "80px" },
  normal: { base: "15px", heading: "22px", timer: "100px" },
  grande: { base: "17px", heading: "26px", timer: "130px" },
  gigante: { base: "20px", heading: "32px", timer: "160px" },
};

export const DENSITIES = {
  compacta: { spacing: "0.5rem", card: "0.75rem" },
  normal: { spacing: "1rem", card: "1.25rem" },
  amplia: { spacing: "1.5rem", card: "2rem" },
};
