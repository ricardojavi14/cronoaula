"use client";

import React, { useState } from "react";
import {
  Palette,
  Monitor,
  User,
  Download,
  Image,
  Database,
  ChevronRight,
  Check,
  RotateCcw,
  Save,
  ArrowLeft,
  Sun,
  Moon,
  Minus,
  Settings,
  Layout,
  Square,
  Zap,
  Bell,
  Volume2,
  VolumeX,
  BookOpen,
  Clock,
  Eye,
  EyeOff,
  Timer,
  Layers,
  AlertTriangle,
  HardDrive,
  Upload,
  Trash2,
  RefreshCw,
  Info,
  Shield,
  Play,
  Wand2,
  Star,
  Heart,
  Type,
} from "lucide-react";
import {
  useAppSettings,
  THEMES,
  FONT_SIZES,
  DEFAULT_SETTINGS,
} from "@/context/AppSettingsContext";
import { toast } from "sonner";

const TABS = [
  { id: "apariencia", label: "Apariencia", icon: <Palette size={16} /> },
  { id: "clase", label: "Modo clase", icon: <Monitor size={16} /> },
  { id: "docente", label: "Docente", icon: <User size={16} /> },
  { id: "importacion", label: "Importación", icon: <Download size={16} /> },
  { id: "fondos", label: "Fondos", icon: <Image size={16} /> },
  { id: "datos", label: "Datos", icon: <Database size={16} /> },
];

const AREAS = [
  "Comunicación",
  "Matemática",
  "Personal Social",
  "Ciencia y Tecnología",
  "Arte y Cultura",
  "Educación Física",
  "Tutoría",
  "Educación Religiosa",
  "Plan Lector",
];
const ALL_MOMENTS = [
  "Actividad permanente",
  "Inicio",
  "Desarrollo",
  "Cierre",
  "Pausa activa",
  "Metacognición",
  "Evaluación",
  "Retroalimentación",
  "Lavado de manos",
  "Transferencia",
];
const LEVELS = ["Inicial", "Primaria", "Secundaria", "Superior"];

// ─── Reusable sub-components ─────────────────────────────────────────────────

function Section({ title, desc, children }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-base" style={{ color: "var(--ca-text)" }}>
          {title}
        </h3>
        {desc && (
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--ca-text-muted)" }}
          >
            {desc}
          </p>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SettingRow({ label, desc, children, tight }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-3 border-b`}
      style={{ borderColor: "var(--ca-border)" }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: "var(--ca-text)" }}>
          {label}
        </p>
        {desc && (
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--ca-text-muted)" }}
          >
            {desc}
          </p>
        )}
      </div>
      <div
        className={`shrink-0 ${tight ? "" : "min-w-[160px]"} flex justify-end`}
      >
        {children}
      </div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none"
      style={{
        backgroundColor: value
          ? "var(--ca-primary, #2563EB)"
          : "var(--ca-border)",
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
        style={{ transform: value ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

function Chip({ label, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
      style={{
        backgroundColor: active
          ? color || "var(--ca-primary)"
          : "var(--ca-surface)",
        color: active ? "#fff" : "var(--ca-text-muted)",
        borderColor: active ? color || "var(--ca-primary)" : "var(--ca-border)",
      }}
    >
      {label}
    </button>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 text-sm rounded-xl border outline-none focus:ring-2 min-w-[140px]"
      style={{
        backgroundColor: "var(--ca-surface)",
        color: "var(--ca-text)",
        borderColor: "var(--ca-border)",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function NumberStepper({ value, onChange, min = 0, max = 120, step = 1 }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-8 h-8 rounded-lg border flex items-center justify-center text-lg font-bold hover:bg-black/5"
        style={{ borderColor: "var(--ca-border)", color: "var(--ca-text)" }}
      >
        −
      </button>
      <span
        className="w-12 text-center font-mono font-bold text-sm"
        style={{ color: "var(--ca-text)" }}
      >
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-8 h-8 rounded-lg border flex items-center justify-center text-lg font-bold hover:bg-black/5"
        style={{ borderColor: "var(--ca-border)", color: "var(--ca-text)" }}
      >
        +
      </button>
    </div>
  );
}

function SliderSetting({
  label,
  desc,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.05,
  format,
}) {
  const display = format ? format(value) : Math.round(value * 100) + "%";
  return (
    <SettingRow label={label} desc={desc}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-24 accent-blue-600"
        />
        <span
          className="text-xs font-mono w-10 text-right"
          style={{ color: "var(--ca-text-muted)" }}
        >
          {display}
        </span>
      </div>
    </SettingRow>
  );
}

function ColorPicker({ value, onChange, label }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative w-9 h-9 rounded-xl border overflow-hidden cursor-pointer"
        style={{ borderColor: "var(--ca-border)" }}
      >
        <div
          className="absolute inset-0 rounded-xl"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <span
        className="text-xs font-mono"
        style={{ color: "var(--ca-text-muted)" }}
      >
        {value}
      </span>
    </div>
  );
}

function MultiChip({ value = [], options, onChange }) {
  const toggle = (opt) => {
    const next = value.includes(opt)
      ? value.filter((x) => x !== opt)
      : [...value, opt];
    onChange(next);
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <Chip
          key={opt}
          label={opt}
          active={value.includes(opt)}
          onClick={() => toggle(opt)}
        />
      ))}
    </div>
  );
}

// ─── Main settings page ───────────────────────────────────────────────────────
export default function SettingsPage() {
  const { settings, setSetting, setSettings, resetSettings } = useAppSettings();
  const [activeTab, setActiveTab] = useState("apariencia");
  const [saved, setSaved] = useState(false);

  const s = (key, val) => {
    setSetting(key, val);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleReset = () => {
    if (
      !confirm(
        "¿Restaurar toda la configuración a los valores predeterminados?",
      )
    )
      return;
    resetSettings();
    toast.success("Configuración restaurada");
  };

  const surfaceStyle = {
    backgroundColor: "var(--ca-surface)",
    borderColor: "var(--ca-border)",
    color: "var(--ca-text)",
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="p-2 rounded-xl hover:bg-black/5 transition-colors"
            style={{ color: "var(--ca-text-muted)" }}
          >
            <ArrowLeft size={18} />
          </a>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--ca-text)" }}
            >
              Configuración de CronoAula
            </h1>
            <p className="text-sm" style={{ color: "var(--ca-text-muted)" }}>
              Personaliza toda tu experiencia docente
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <Check size={14} /> Guardado
            </span>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium hover:bg-black/5 transition-colors"
            style={{
              borderColor: "var(--ca-border)",
              color: "var(--ca-text-muted)",
            }}
          >
            <RotateCcw size={14} /> Restaurar
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        {/* Sidebar */}
        <div className="md:w-52 shrink-0">
          <div
            className="rounded-2xl border p-2 space-y-0.5 sticky top-20"
            style={{ ...surfaceStyle }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                style={{
                  backgroundColor:
                    activeTab === tab.id
                      ? "var(--ca-primary, #2563EB)"
                      : "transparent",
                  color: activeTab === tab.id ? "#fff" : "var(--ca-text-muted)",
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div
            className="rounded-2xl border p-6 space-y-8"
            style={surfaceStyle}
          >
            {/* ─── APARIENCIA ─────────────────────────────────── */}
            {activeTab === "apariencia" && (
              <>
                <Section
                  title="Tema visual"
                  desc="Elige el estilo que más te cómodo te resulte en el aula"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(THEMES).map(([key, t]) => (
                      <button
                        key={key}
                        onClick={() => s("theme", key)}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all hover:scale-105"
                        style={{
                          backgroundColor: t.bg,
                          borderColor:
                            settings.theme === key
                              ? "var(--ca-primary)"
                              : t.border,
                          boxShadow:
                            settings.theme === key
                              ? "0 0 0 3px var(--ca-primary)20"
                              : "none",
                        }}
                      >
                        <span className="text-2xl">{t.emoji}</span>
                        <div
                          className="w-full h-6 rounded-md"
                          style={{
                            backgroundColor: t.surface,
                            border: `1px solid ${t.border}`,
                          }}
                        />
                        <span
                          className="text-xs font-bold"
                          style={{ color: t.text }}
                        >
                          {t.label}
                        </span>
                        {settings.theme === key && (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <Check size={10} /> Activo
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </Section>

                <Section title="Colores">
                  <SettingRow
                    label="Color principal"
                    desc="Color de botones, acentos y elementos activos"
                  >
                    <ColorPicker
                      value={settings.primaryColor}
                      onChange={(v) => s("primaryColor", v)}
                    />
                  </SettingRow>
                  <SettingRow
                    label="Color secundario"
                    desc="Color de elementos secundarios y etiquetas"
                  >
                    <ColorPicker
                      value={settings.secondaryColor}
                      onChange={(v) => s("secondaryColor", v)}
                    />
                  </SettingRow>
                  <div className="flex gap-3 flex-wrap pt-1">
                    {[
                      "#2563EB",
                      "#7C3AED",
                      "#059669",
                      "#D97706",
                      "#DC2626",
                      "#0891B2",
                      "#9333EA",
                      "#BE185D",
                    ].map((c) => (
                      <button
                        key={c}
                        onClick={() => s("primaryColor", c)}
                        className="w-8 h-8 rounded-xl border-2 hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: c,
                          borderColor:
                            settings.primaryColor === c
                              ? "var(--ca-text)"
                              : "transparent",
                        }}
                      />
                    ))}
                  </div>
                </Section>

                <Section title="Tipografía y tamaño de letra">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "pequeño", label: "A (pequeño)", size: "12px" },
                      { id: "normal", label: "A (normal)", size: "15px" },
                      { id: "grande", label: "A (grande)", size: "18px" },
                      { id: "gigante", label: "A (gigante)", size: "22px" },
                    ].map((fs) => (
                      <button
                        key={fs.id}
                        onClick={() => s("fontSize", fs.id)}
                        className="px-4 py-2.5 rounded-xl border-2 font-semibold transition-all"
                        style={{
                          fontSize: fs.size,
                          borderColor:
                            settings.fontSize === fs.id
                              ? "var(--ca-primary)"
                              : "var(--ca-border)",
                          backgroundColor:
                            settings.fontSize === fs.id
                              ? "var(--ca-primary)" + "15"
                              : "transparent",
                          color:
                            settings.fontSize === fs.id
                              ? "var(--ca-primary)"
                              : "var(--ca-text-muted)",
                        }}
                      >
                        {fs.label}
                      </button>
                    ))}
                  </div>
                </Section>

                <Section
                  title="Espaciado de la interfaz"
                  desc="Cuánto espacio ocupa cada elemento en pantalla"
                >
                  <div className="flex gap-2">
                    {[
                      {
                        id: "compacta",
                        label: "Compacta",
                        icon: <Minus size={14} />,
                      },
                      {
                        id: "normal",
                        label: "Normal",
                        icon: <Layout size={14} />,
                      },
                      {
                        id: "amplia",
                        label: "Amplia",
                        icon: <Layers size={14} />,
                      },
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => s("density", d.id)}
                        className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all"
                        style={{
                          borderColor:
                            settings.density === d.id
                              ? "var(--ca-primary)"
                              : "var(--ca-border)",
                          backgroundColor:
                            settings.density === d.id
                              ? "var(--ca-primary)" + "15"
                              : "transparent",
                          color:
                            settings.density === d.id
                              ? "var(--ca-primary)"
                              : "var(--ca-text-muted)",
                        }}
                      >
                        {d.icon} {d.label}
                      </button>
                    ))}
                  </div>
                </Section>

                <Section title="Estilo de bordes">
                  <div className="flex gap-2">
                    {[
                      { id: "suaves", label: "Suaves", radius: "8px" },
                      {
                        id: "redondeados",
                        label: "Redondeados",
                        radius: "16px",
                      },
                      { id: "rectos", label: "Rectos", radius: "0px" },
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => s("borderStyle", b.id)}
                        className="flex-1 py-3 border-2 text-xs font-semibold transition-all"
                        style={{
                          borderRadius: b.radius,
                          borderColor:
                            settings.borderStyle === b.id
                              ? "var(--ca-primary)"
                              : "var(--ca-border)",
                          backgroundColor:
                            settings.borderStyle === b.id
                              ? "var(--ca-primary)" + "15"
                              : "transparent",
                          color:
                            settings.borderStyle === b.id
                              ? "var(--ca-primary)"
                              : "var(--ca-text-muted)",
                        }}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </Section>

                <Section title="Efectos y animaciones">
                  <SettingRow
                    label="Activar animaciones"
                    desc="Transiciones suaves al navegar entre pantallas"
                    tight
                  >
                    <Toggle
                      value={settings.animations}
                      onChange={(v) => s("animations", v)}
                    />
                  </SettingRow>
                  <SettingRow
                    label="Fondos decorativos"
                    desc="Elementos visuales decorativos en el fondo"
                    tight
                  >
                    <Toggle
                      value={settings.decorativeBackgrounds}
                      onChange={(v) => s("decorativeBackgrounds", v)}
                    />
                  </SettingRow>
                </Section>
              </>
            )}

            {/* ─── MODO CLASE ──────────────────────────────────── */}
            {activeTab === "clase" && (
              <>
                <Section
                  title="Tamaño del temporizador"
                  desc="Cuán grande se ve el cronómetro durante la clase"
                >
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        id: "grande",
                        label: "Grande",
                        sample: "12:34",
                        size: "text-3xl",
                      },
                      {
                        id: "gigante",
                        label: "Gigante",
                        sample: "12:34",
                        size: "text-5xl",
                      },
                      {
                        id: "proyector",
                        label: "Proyector",
                        sample: "12:34",
                        size: "text-6xl",
                      },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => s("timerSize", t.id)}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all"
                        style={{
                          borderColor:
                            settings.timerSize === t.id
                              ? "var(--ca-primary)"
                              : "var(--ca-border)",
                          backgroundColor:
                            settings.timerSize === t.id
                              ? "var(--ca-primary)" + "10"
                              : "transparent",
                        }}
                      >
                        <span
                          className={`font-mono font-black tabular-nums ${t.size}`}
                          style={{ color: "var(--ca-text)" }}
                        >
                          {t.sample}
                        </span>
                        <span
                          className="text-xs font-semibold"
                          style={{
                            color:
                              settings.timerSize === t.id
                                ? "var(--ca-primary)"
                                : "var(--ca-text-muted)",
                          }}
                        >
                          {t.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </Section>

                <Section
                  title="Mostrar en pantalla"
                  desc="Qué información aparece durante la clase"
                >
                  {[
                    {
                      key: "showCurrentMoment",
                      label: "Momento actual",
                      desc: "Nombre del momento en curso",
                    },
                    {
                      key: "showNextMoment",
                      label: "Próximo momento",
                      desc: "Qué viene después",
                    },
                    {
                      key: "showProgressBar",
                      label: "Barra de progreso",
                      desc: "Avance visual de la sesión",
                    },
                    {
                      key: "showTeacherNotes",
                      label: "Notas docentes",
                      desc: "Tus recordatorios personales",
                    },
                    {
                      key: "showTotalTimeLeft",
                      label: "Tiempo restante de sesión",
                      desc: "Cuánto queda de toda la clase",
                    },
                    {
                      key: "showMomentTimeLeft",
                      label: "Tiempo restante del momento",
                      desc: "Cuánto queda de este momento",
                    },
                  ].map(({ key, label, desc }) => (
                    <SettingRow key={key} label={label} desc={desc} tight>
                      <Toggle
                        value={settings[key]}
                        onChange={(v) => s(key, v)}
                      />
                    </SettingRow>
                  ))}
                </Section>

                <Section title="Modos especiales">
                  <SettingRow
                    label="Modo oscuro automático en clase"
                    desc="Al iniciar modo clase, cambia al tema oscuro automáticamente"
                    tight
                  >
                    <Toggle
                      value={settings.darkModeInClass}
                      onChange={(v) => s("darkModeInClass", v)}
                    />
                  </SettingRow>
                  <SettingRow
                    label="Modo sin distracciones"
                    desc="Oculta elementos decorativos y fondos durante la clase"
                    tight
                  >
                    <Toggle
                      value={settings.distractionFree}
                      onChange={(v) => s("distractionFree", v)}
                    />
                  </SettingRow>
                </Section>

                <Section title="Sonidos y avisos">
                  <SettingRow
                    label="Activar sonidos de aviso"
                    desc="Emite un sonido cuando el tiempo se acaba"
                    tight
                  >
                    <Toggle
                      value={settings.soundAlerts}
                      onChange={(v) => s("soundAlerts", v)}
                    />
                  </SettingRow>
                  {settings.soundAlerts && (
                    <SettingRow label="Tipo de sonido">
                      <Select
                        value={settings.alertSound}
                        onChange={(v) => s("alertSound", v)}
                        options={[
                          { value: "beep", label: "Bip corto" },
                          { value: "bell", label: "Campana" },
                          { value: "chime", label: "Timbre suave" },
                          { value: "soft", label: "Tono suave" },
                        ]}
                      />
                    </SettingRow>
                  )}
                  <SettingRow
                    label="Vibración en celular"
                    desc="Si el dispositivo lo permite"
                    tight
                  >
                    <Toggle
                      value={settings.vibration}
                      onChange={(v) => s("vibration", v)}
                    />
                  </SettingRow>
                </Section>

                <Section
                  title="¿Cuándo alertar?"
                  desc="Elige en qué momentos recibirás alertas de tiempo"
                >
                  {[
                    { key: "alertAt5min", label: "Cuando falten 5 minutos" },
                    { key: "alertAt3min", label: "Cuando falten 3 minutos" },
                    { key: "alertAt1min", label: "Cuando falte 1 minuto" },
                    { key: "alertAt30sec", label: "Cuando falten 30 segundos" },
                  ].map(({ key, label }) => (
                    <SettingRow key={key} label={label} tight>
                      <Toggle
                        value={settings[key]}
                        onChange={(v) => s(key, v)}
                      />
                    </SettingRow>
                  ))}
                </Section>
              </>
            )}

            {/* ─── DOCENTE ─────────────────────────────────────── */}
            {activeTab === "docente" && (
              <>
                <Section
                  title="Datos del docente"
                  desc="Se usan como valores predeterminados al crear sesiones"
                >
                  <SettingRow label="Nivel educativo predeterminado">
                    <Select
                      value={settings.defaultLevel}
                      onChange={(v) => s("defaultLevel", v)}
                      options={LEVELS.map((l) => ({ value: l, label: l }))}
                    />
                  </SettingRow>
                  <SettingRow label="Grado predeterminado">
                    <input
                      value={settings.defaultGrade}
                      onChange={(e) => s("defaultGrade", e.target.value)}
                      placeholder="Ej. 3° primaria"
                      className="px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-400 w-40"
                      style={{
                        backgroundColor: "var(--ca-bg)",
                        borderColor: "var(--ca-border)",
                        color: "var(--ca-text)",
                      }}
                    />
                  </SettingRow>
                  <SettingRow
                    label="Duración habitual de sesión"
                    desc="En minutos"
                  >
                    <NumberStepper
                      value={settings.defaultDuration}
                      onChange={(v) => s("defaultDuration", v)}
                      min={30}
                      max={180}
                      step={5}
                    />
                  </SettingRow>
                </Section>

                <Section
                  title="Áreas favoritas"
                  desc="Las que usas más seguido — aparecen primero en los menús"
                >
                  <MultiChip
                    value={settings.favoriteAreas}
                    options={AREAS}
                    onChange={(v) => s("favoriteAreas", v)}
                  />
                </Section>

                <Section
                  title="Momentos favoritos"
                  desc="Los que siempre usas en tus sesiones"
                >
                  <MultiChip
                    value={settings.favoriteMoments}
                    options={ALL_MOMENTS}
                    onChange={(v) => s("favoriteMoments", v)}
                  />
                </Section>

                <Section
                  title="Modo de creación predeterminado"
                  desc="Cómo prefieres crear tus sesiones"
                >
                  <div className="flex gap-2 flex-wrap">
                    {[
                      {
                        id: "simple",
                        label: "Simple",
                        icon: <Zap size={14} />,
                      },
                      {
                        id: "advanced",
                        label: "Completo",
                        icon: <Layers size={14} />,
                      },
                      {
                        id: "import",
                        label: "Importar con IA",
                        icon: <Wand2 size={14} />,
                      },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => s("defaultCreationMode", m.id)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all"
                        style={{
                          borderColor:
                            settings.defaultCreationMode === m.id
                              ? "var(--ca-primary)"
                              : "var(--ca-border)",
                          backgroundColor:
                            settings.defaultCreationMode === m.id
                              ? "var(--ca-primary)" + "15"
                              : "transparent",
                          color:
                            settings.defaultCreationMode === m.id
                              ? "var(--ca-primary)"
                              : "var(--ca-text-muted)",
                        }}
                      >
                        {m.icon} {m.label}
                      </button>
                    ))}
                  </div>
                </Section>
              </>
            )}

            {/* ─── IMPORTACIÓN ─────────────────────────────────── */}
            {activeTab === "importacion" && (
              <>
                <Section title="Tipo de importación predeterminada">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        id: "automatica",
                        label: "Automática",
                        icon: <Zap size={18} />,
                        desc: "La IA analiza y genera todo de una vez",
                      },
                      {
                        id: "asistida",
                        label: "Asistida",
                        icon: <Wand2 size={18} />,
                        desc: "La app te guía paso a paso con preguntas",
                      },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => s("importMode", m.id)}
                        className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 text-center transition-all"
                        style={{
                          borderColor:
                            settings.importMode === m.id
                              ? "var(--ca-primary)"
                              : "var(--ca-border)",
                          backgroundColor:
                            settings.importMode === m.id
                              ? "var(--ca-primary)" + "10"
                              : "transparent",
                        }}
                      >
                        <span
                          style={{
                            color:
                              settings.importMode === m.id
                                ? "var(--ca-primary)"
                                : "var(--ca-text-muted)",
                          }}
                        >
                          {m.icon}
                        </span>
                        <span
                          className="font-bold text-sm"
                          style={{ color: "var(--ca-text)" }}
                        >
                          {m.label}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "var(--ca-text-muted)" }}
                        >
                          {m.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </Section>

                <Section title="Comportamiento de la importación">
                  <SettingRow
                    label="Mostrar vista previa antes de guardar"
                    desc="Revisar y editar lo que detectó la IA antes de crear la sesión"
                    tight
                  >
                    <Toggle
                      value={settings.alwaysShowPreview}
                      onChange={(v) => s("alwaysShowPreview", v)}
                    />
                  </SettingRow>
                  <SettingRow
                    label="Detectar momentos y submomentos"
                    desc="Identificar la estructura pedagógica del texto"
                    tight
                  >
                    <Toggle
                      value={settings.detectMoments}
                      onChange={(v) => s("detectMoments", v)}
                    />
                  </SettingRow>
                  <SettingRow
                    label="Sugerir tiempos automáticamente"
                    desc="Si el texto no tiene duraciones, la IA las sugiere"
                    tight
                  >
                    <Toggle
                      value={settings.suggestTimes}
                      onChange={(v) => s("suggestTimes", v)}
                    />
                  </SettingRow>
                  <SettingRow
                    label="Advertir cuando la detección es incierta"
                    desc="La app te avisa cuando no está segura de algo que detectó"
                    tight
                  >
                    <Toggle
                      value={settings.showUncertainWarnings}
                      onChange={(v) => s("showUncertainWarnings", v)}
                    />
                  </SettingRow>
                </Section>

                <Section
                  title="Formatos permitidos"
                  desc="Qué puedes usar para importar una sesión"
                >
                  <SettingRow label="Pegar texto directamente" tight>
                    <Toggle
                      value={settings.allowPasteText}
                      onChange={(v) => s("allowPasteText", v)}
                    />
                  </SettingRow>
                  <SettingRow label="Subir archivos (.txt, .pdf, .docx)" tight>
                    <Toggle
                      value={settings.allowFileUpload}
                      onChange={(v) => s("allowFileUpload", v)}
                    />
                  </SettingRow>
                  <div
                    className="p-3 rounded-xl border flex items-start gap-2.5"
                    style={{
                      borderColor: "var(--ca-border)",
                      backgroundColor: "var(--ca-bg)",
                    }}
                  >
                    <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                    <p
                      className="text-xs"
                      style={{ color: "var(--ca-text-muted)" }}
                    >
                      Para archivos Word (.docx) o PDF, te recomendamos abrir el
                      archivo, seleccionar todo el texto (Ctrl+A), copiarlo y
                      pegarlo directamente. Así la IA lo lee mejor.
                    </p>
                  </div>
                </Section>
              </>
            )}

            {/* ─── FONDOS ──────────────────────────────────────── */}
            {activeTab === "fondos" && (
              <>
                <Section title="Imágenes de fondo globales">
                  <SettingRow
                    label="Activar imágenes de fondo"
                    desc="Mostrar imágenes decorativas en la app"
                    tight
                  >
                    <Toggle
                      value={settings.backgroundsEnabled}
                      onChange={(v) => s("backgroundsEnabled", v)}
                    />
                  </SettingRow>
                  <SettingRow
                    label="Modo seguro de legibilidad"
                    desc="Aplica automáticamente contraste para que el texto siempre se lea"
                    tight
                  >
                    <Toggle
                      value={settings.readabilitySafe}
                      onChange={(v) => s("readabilitySafe", v)}
                    />
                  </SettingRow>
                </Section>

                {settings.backgroundsEnabled && (
                  <>
                    <Section
                      title="Fondo de la app"
                      desc="Imagen que aparece de fondo en todas las pantallas"
                    >
                      <div className="space-y-3">
                        <input
                          value={settings.appBackground}
                          onChange={(e) => s("appBackground", e.target.value)}
                          placeholder="Pega una URL de imagen (https://...)"
                          className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-400"
                          style={{
                            backgroundColor: "var(--ca-bg)",
                            borderColor: "var(--ca-border)",
                            color: "var(--ca-text)",
                          }}
                        />
                        {settings.appBackground && (
                          <div
                            className="w-full h-24 rounded-xl overflow-hidden border relative"
                            style={{ borderColor: "var(--ca-border)" }}
                          >
                            <img
                              src={settings.appBackground}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                            <button
                              onClick={() => s("appBackground", "")}
                              className="absolute top-2 right-2 p-1 bg-black/50 rounded-lg text-white hover:bg-black/70"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </Section>

                    <Section
                      title="Fondo de modo clase"
                      desc="Imagen que aparece de fondo durante la clase"
                    >
                      <div className="space-y-3">
                        <input
                          value={settings.classModeBackground}
                          onChange={(e) =>
                            s("classModeBackground", e.target.value)
                          }
                          placeholder="Pega una URL de imagen (https://...)"
                          className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-400"
                          style={{
                            backgroundColor: "var(--ca-bg)",
                            borderColor: "var(--ca-border)",
                            color: "var(--ca-text)",
                          }}
                        />
                      </div>
                    </Section>

                    <Section
                      title="Controles globales del fondo"
                      desc="Aplican a todos los fondos de la app"
                    >
                      <SliderSetting
                        label="Intensidad del fondo"
                        desc="Qué tan visible es la imagen"
                        value={settings.globalBgOpacity}
                        onChange={(v) => s("globalBgOpacity", v)}
                      />
                      <SliderSetting
                        label="Desenfoque"
                        desc="Suaviza la imagen de fondo"
                        value={settings.globalBgBlur}
                        onChange={(v) => s("globalBgBlur", v)}
                        min={0}
                        max={20}
                        step={1}
                        format={(v) => v + "px"}
                      />
                      <SliderSetting
                        label="Capa oscura"
                        desc="Oscurece el fondo para mejor contraste"
                        value={settings.globalBgDarken}
                        onChange={(v) => s("globalBgDarken", v)}
                      />
                      <SliderSetting
                        label="Capa clara"
                        desc="Aclara el fondo para fondos oscuros"
                        value={settings.globalBgBrighten}
                        onChange={(v) => s("globalBgBrighten", v)}
                      />
                    </Section>

                    <Section title="Biblioteca de fondos sugeridos">
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            label: "Aula suave",
                            url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=60",
                          },
                          {
                            label: "Lectura",
                            url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=60",
                          },
                          {
                            label: "Naturaleza",
                            url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=60",
                          },
                          {
                            label: "Abstracto",
                            url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&q=60",
                          },
                          {
                            label: "Minimalista",
                            url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=60",
                          },
                          {
                            label: "Ciencia",
                            url: "https://images.unsplash.com/photo-1532094349884-543559059ebb?w=400&q=60",
                          },
                        ].map((img) => (
                          <button
                            key={img.url}
                            onClick={() => s("appBackground", img.url)}
                            className="relative rounded-xl overflow-hidden border-2 transition-all hover:scale-105 aspect-video"
                            style={{
                              borderColor:
                                settings.appBackground === img.url
                                  ? "var(--ca-primary)"
                                  : "transparent",
                            }}
                          >
                            <img
                              src={img.url}
                              alt={img.label}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-end justify-center pb-1">
                              <span className="text-white text-[10px] font-semibold">
                                {img.label}
                              </span>
                            </div>
                            {settings.appBackground === img.url && (
                              <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                <Check size={10} className="text-green-600" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </Section>
                  </>
                )}
              </>
            )}

            {/* ─── DATOS ───────────────────────────────────────── */}
            {activeTab === "datos" && (
              <>
                <Section title="Guardado">
                  <SettingRow
                    label="Guardado automático"
                    desc="Guarda el borrador de tu sesión automáticamente mientras editas"
                    tight
                  >
                    <Toggle
                      value={settings.autoSave}
                      onChange={(v) => s("autoSave", v)}
                    />
                  </SettingRow>
                  <div
                    className="p-4 rounded-xl border flex items-start gap-3"
                    style={{
                      borderColor: "var(--ca-border)",
                      backgroundColor: "var(--ca-bg)",
                    }}
                  >
                    <HardDrive
                      size={16}
                      className="text-blue-500 shrink-0 mt-0.5"
                    />
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--ca-text)" }}
                      >
                        Almacenamiento local
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--ca-text-muted)" }}
                      >
                        Tus sesiones y configuración se guardan en este
                        navegador. Si limpias los datos del navegador o usas
                        otro dispositivo, no las encontrarás. Para respaldo, usa
                        la opción de exportar.
                      </p>
                    </div>
                  </div>
                </Section>

                <Section title="Exportar e importar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        const data = {};
                        for (let i = 0; i < localStorage.length; i++) {
                          const k = localStorage.key(i);
                          if (k.startsWith("cronoaula"))
                            data[k] = localStorage.getItem(k);
                        }
                        const blob = new Blob([JSON.stringify(data, null, 2)], {
                          type: "application/json",
                        });
                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(blob);
                        a.download = `cronoaula_backup_${new Date().toISOString().split("T")[0]}.json`;
                        a.click();
                        toast.success("Datos exportados correctamente");
                      }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold hover:bg-black/5 transition-colors"
                      style={{
                        borderColor: "var(--ca-border)",
                        color: "var(--ca-text)",
                      }}
                    >
                      <Download size={16} /> Exportar mis datos
                    </button>
                    <label
                      className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold hover:bg-black/5 transition-colors cursor-pointer"
                      style={{
                        borderColor: "var(--ca-border)",
                        color: "var(--ca-text)",
                      }}
                    >
                      <Upload size={16} /> Importar datos
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            try {
                              const data = JSON.parse(ev.target.result);
                              Object.entries(data).forEach(([k, v]) =>
                                localStorage.setItem(k, v),
                              );
                              toast.success(
                                "Datos importados. Recarga la página.",
                              );
                            } catch {
                              toast.error("Archivo inválido");
                            }
                          };
                          reader.readAsText(file);
                        }}
                      />
                    </label>
                  </div>
                </Section>

                <Section title="Zona de peligro">
                  <div className="p-4 rounded-xl border border-red-200 bg-red-50 space-y-3">
                    <p className="text-sm font-bold text-red-700 flex items-center gap-2">
                      <AlertTriangle size={14} /> Estas acciones no se pueden
                      deshacer
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 bg-white text-sm font-semibold hover:bg-red-50 transition-colors"
                      >
                        <RotateCcw size={14} /> Restaurar configuración
                      </button>
                      <button
                        onClick={() => {
                          if (
                            !confirm(
                              "¿Eliminar TODAS las sesiones y datos locales? Esta acción es irreversible.",
                            )
                          )
                            return;
                          localStorage.clear();
                          toast.success("Datos eliminados. Recarga la página.");
                          setTimeout(() => window.location.reload(), 1500);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 text-red-700 bg-white text-sm font-semibold hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} /> Borrar todos los datos
                      </button>
                    </div>
                  </div>
                </Section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
