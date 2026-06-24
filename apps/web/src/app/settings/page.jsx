"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  Monitor,
  Palette,
  RotateCcw,
  Save,
  Settings2,
  Timer,
  User,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_SETTINGS, resolveTheme, THEMES, useAppSettings } from "@/context/AppSettingsContext";
import { getTeacher, saveTeacher } from "@/utils/localStore";

const THEME_OPTIONS = [
  { value: "oscuro", label: "CronoAula oscuro" },
  { value: "claro", label: "CronoAula claro" },
  { value: "calido", label: "Aula calida" },
  { value: "contraste", label: "Alto contraste" },
  { value: "ensena", label: "Inspirado en Enseña Peru" },
  { value: "personalizado", label: "Personalizado" },
];

const FONT_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "grande", label: "Grande" },
  { value: "gigante", label: "Gigante" },
];

const FONT_FAMILY_OPTIONS = [
  { value: "system", label: "Sistema" },
  { value: "rounded", label: "Redondeada" },
  { value: "serif", label: "Serif" },
];

const DENSITY_OPTIONS = [
  { value: "compacta", label: "Compacta" },
  { value: "normal", label: "Normal" },
  { value: "amplia", label: "Amplia" },
];

const TIMER_OPTIONS = [
  { value: "grande", label: "Grande" },
  { value: "gigante", label: "Gigante" },
];

const VIEW_OPTIONS = [
  { value: "teacher", label: "Vista docente" },
  { value: "class", label: "Modo clase" },
];

const VOLUME_OPTIONS = [
  { value: "bajo", label: "Bajo" },
  { value: "medio", label: "Medio" },
];

const TEST_SPEED_OPTIONS = [
  { value: 1, label: "Tiempo real x1" },
  { value: 5, label: "Rápido x5" },
  { value: 10, label: "Muy rápido x10" },
  { value: 30, label: "Demo x30" },
];

const COLOR_OPTIONS = ["#38BDF8", "#22C55E", "#A78BFA", "#F59E0B", "#F43F5E", "#14B8A6", "#E879F9", "#F8FAFC"];

function readableText(hex = "#38BDF8") {
  const clean = String(hex).replace("#", "");
  if (clean.length !== 6) return "#0F172A";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#0F172A" : "#FFFFFF";
}

function contrastRatio(a = "#000000", b = "#FFFFFF") {
  const channel = (hex, start) => {
    const value = parseInt(String(hex).replace("#", "").slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const luminance = (hex) => 0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 2) + 0.0722 * channel(hex, 4);
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function buildTeacherState(settings) {
  const teacher = getTeacher();
  return {
    name: settings.teacherName ?? teacher.name ?? "",
    institution: settings.institution ?? teacher.institution ?? teacher.school ?? "",
    defaultGrade: settings.defaultGrade ?? teacher.defaultGrade ?? teacher.grade ?? "",
    defaultArea: settings.defaultArea ?? teacher.defaultArea ?? "Comunicacion",
    defaultDuration: settings.defaultDuration ?? teacher.defaultDuration ?? 90,
    classroomContext: settings.classroomContext ?? teacher.classroomContext ?? "",
  };
}

function Field({ label, hint, children }) {
  return (
    <label className="space-y-1.5">
      <span className="block text-xs font-black uppercase tracking-[0.12em]" style={{ color: "var(--settings-muted)" }}>{label}</span>
      {children}
      {hint && <span className="block text-xs" style={{ color: "var(--settings-muted)" }}>{hint}</span>}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full rounded-2xl border px-3.5 py-2.5 text-sm font-semibold outline-none transition placeholder:opacity-60 focus:brightness-105"
      style={{ backgroundColor: "var(--settings-input)", borderColor: "var(--settings-border)", color: "var(--settings-text)" }}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className="min-h-24 w-full resize-y rounded-2xl border px-3.5 py-2.5 text-sm font-semibold leading-relaxed outline-none transition placeholder:opacity-60 focus:brightness-105"
      style={{ backgroundColor: "var(--settings-input)", borderColor: "var(--settings-border)", color: "var(--settings-text)" }}
    />
  );
}

function Section({ icon, title, subtitle, children }) {
  return (
    <section className="rounded-[1.5rem] border p-4 shadow-xl backdrop-blur-xl" style={{ backgroundColor: "var(--settings-card)", borderColor: "var(--settings-border)" }}>
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-2xl p-2.5" style={{ backgroundColor: "var(--ca-accent-soft, rgba(56,189,248,0.16))", color: "var(--settings-accent)" }}>
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-black" style={{ color: "var(--settings-text)" }}>{title}</h2>
          {subtitle && <p className="text-sm" style={{ color: "var(--settings-muted)" }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Segmented({ value, onChange, options, columns = "sm:grid-cols-2" }) {
  return (
    <div className={`grid gap-2 ${columns}`}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className="rounded-2xl border px-3 py-2 text-sm font-black transition hover:brightness-110"
            style={{
              backgroundColor: active ? "var(--settings-accent)" : "var(--settings-elevated)",
              borderColor: active ? "var(--settings-accent)" : "var(--settings-border)",
              color: active ? "var(--settings-on-accent)" : "var(--settings-text)",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-left transition hover:brightness-105"
      style={{ backgroundColor: "var(--settings-elevated)", borderColor: "var(--settings-border)" }}
    >
      <span className="min-w-0">
        <span className="block text-sm font-black" style={{ color: "var(--settings-text)" }}>{label}</span>
        {hint && <span className="block text-xs" style={{ color: "var(--settings-muted)" }}>{hint}</span>}
      </span>
      <span className="relative h-6 w-11 shrink-0 rounded-full transition" style={{ backgroundColor: checked ? "var(--settings-accent)" : "#334155" }}>
        <span className="absolute top-1 h-4 w-4 rounded-full bg-white shadow transition" style={{ left: checked ? "23px" : "4px" }} />
      </span>
    </button>
  );
}

export default function SettingsPage() {
  const { settings, setSettings, resetSettings } = useAppSettings();
  const [teacher, setTeacher] = useState(() => buildTeacherState(settings));
  const previewTheme = resolveTheme(settings);
  const accent = previewTheme.accent || settings.primaryColor || "#38BDF8";
  const onAccent = readableText(accent);
  const customContrastLow =
    settings.theme === "personalizado" &&
    contrastRatio(settings.customTheme?.bg || "#070B13", settings.customTheme?.text || "#F8FAFC") < 4.5;

  const rootStyle = useMemo(
    () => ({
      "--settings-accent": accent,
      "--settings-on-accent": onAccent,
      "--settings-bg": previewTheme.bg,
      "--settings-card": previewTheme.card,
      "--settings-elevated": previewTheme.elevated,
      "--settings-text": previewTheme.text,
      "--settings-muted": previewTheme.textMuted,
      "--settings-border": previewTheme.border,
      "--settings-input": previewTheme.inputBg,
    }),
    [accent, onAccent, previewTheme],
  );

  useEffect(() => {
    setTeacher(buildTeacherState(settings));
  }, [
    settings.teacherName,
    settings.institution,
    settings.defaultGrade,
    settings.defaultArea,
    settings.defaultDuration,
    settings.classroomContext,
  ]);

  const updateSetting = (key, value) => setSettings({ [key]: value });
  const updateTeacher = (key, value) => setTeacher((prev) => ({ ...prev, [key]: value }));
  const updateTheme = (value) => {
    const preset = THEMES[value];
    setSettings({
      theme: value,
      primaryColor: value === "personalizado" ? settings.customTheme?.accent || accent : preset?.accent || accent,
    });
  };
  const updateAccent = (value) => {
    if (settings.theme === "personalizado") {
      setSettings({ customTheme: { accent: value }, primaryColor: value });
      return;
    }
    updateSetting("primaryColor", value);
  };

  const handleSave = () => {
    try {
      const normalizedDuration = Number(teacher.defaultDuration) || 90;
      const teacherPayload = {
        id: "local-teacher",
        name: teacher.name || "",
        institution: teacher.institution || "",
        school: teacher.institution || "",
        grade: teacher.defaultGrade || "",
        defaultGrade: teacher.defaultGrade || "",
        defaultArea: teacher.defaultArea || "",
        defaultDuration: normalizedDuration,
        classroomContext: teacher.classroomContext || "",
      };
      setSettings({
        teacherName: teacherPayload.name,
        institution: teacherPayload.institution,
        defaultGrade: teacherPayload.defaultGrade,
        defaultArea: teacherPayload.defaultArea,
        defaultDuration: normalizedDuration,
        classroomContext: teacherPayload.classroomContext,
      });
      saveTeacher(teacherPayload);
      toast.success("Configuracion guardada");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar en localStorage");
    }
  };

  const handleReset = () => {
    if (!confirm("Restaurar la configuracion inicial de CronoAula?")) return;
    try {
      resetSettings();
      const nextTeacher = buildTeacherState(DEFAULT_SETTINGS);
      setTeacher(nextTeacher);
      saveTeacher({
        id: "local-teacher",
        name: nextTeacher.name,
        institution: nextTeacher.institution,
        school: nextTeacher.institution,
        grade: nextTeacher.defaultGrade,
        defaultGrade: nextTeacher.defaultGrade,
        defaultArea: nextTeacher.defaultArea,
        defaultDuration: nextTeacher.defaultDuration,
        classroomContext: nextTeacher.classroomContext,
      });
      toast.success("Configuracion inicial restaurada");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo restaurar la configuracion");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-5 md:px-6" style={{ ...rootStyle, backgroundColor: previewTheme.bg, color: previewTheme.text }}>
      <div className="pointer-events-none fixed inset-0" style={{ background: previewTheme.glow }} />
      <div className="relative mx-auto max-w-6xl space-y-5">
        <header className="rounded-[1.75rem] border p-5 shadow-xl backdrop-blur-xl" style={{ backgroundColor: previewTheme.card, borderColor: previewTheme.border, boxShadow: previewTheme.shadow }}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.26em]" style={{ color: "var(--settings-accent)" }}>Configuracion</p>
              <h1 className="mt-1 text-3xl font-black" style={{ color: previewTheme.text }}>Ajustes de CronoAula</h1>
              <p className="mt-1 max-w-2xl text-sm" style={{ color: previewTheme.textMuted }}>
                Perfil, apariencia y modo clase guardados en este navegador. Sin servidor, sin conexion externa.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleReset} className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-black transition hover:brightness-105" style={{ borderColor: previewTheme.border, color: previewTheme.text, backgroundColor: previewTheme.elevated }}>
                <RotateCcw size={16} /> Restaurar
              </button>
              <button onClick={handleSave} className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black shadow-sm transition hover:brightness-110" style={{ backgroundColor: "var(--settings-accent)", color: "var(--settings-on-accent)" }}>
                <Save size={16} /> Guardar
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section icon={<User size={20} />} title="Perfil docente" subtitle="Datos base para tus sesiones.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nombre del docente">
                <TextInput value={teacher.name} onChange={(event) => updateTeacher("name", event.target.value)} placeholder="Ej. Ricardo Perez" />
              </Field>
              <Field label="Institucion">
                <TextInput value={teacher.institution} onChange={(event) => updateTeacher("institution", event.target.value)} placeholder="Ej. I.E. Nuestra Senora" />
              </Field>
              <Field label="Grado predeterminado">
                <TextInput value={teacher.defaultGrade} onChange={(event) => updateTeacher("defaultGrade", event.target.value)} placeholder="Ej. 5to de primaria" />
              </Field>
              <Field label="Area predeterminada">
                <TextInput value={teacher.defaultArea} onChange={(event) => updateTeacher("defaultArea", event.target.value)} placeholder="Ej. Comunicacion" />
              </Field>
              <Field label="Duracion predeterminada" hint="En minutos.">
                <TextInput type="number" min="1" value={teacher.defaultDuration} onChange={(event) => updateTeacher("defaultDuration", event.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Contexto del aula">
                  <TextArea value={teacher.classroomContext} onChange={(event) => updateTeacher("classroomContext", event.target.value)} placeholder="Grupo, necesidades, apoyos o notas utiles." />
                </Field>
              </div>
            </div>
          </Section>

          <Section icon={<Palette size={20} />} title="Apariencia" subtitle="Acentos seguros y lectura clara.">
            <div className="space-y-4">
              <Field label="Tema visual">
                <Segmented value={settings.theme || "oscuro"} onChange={updateTheme} options={THEME_OPTIONS} columns="sm:grid-cols-2 lg:grid-cols-3" />
              </Field>
              <p className="rounded-2xl border px-3 py-2 text-xs font-semibold" style={{ borderColor: previewTheme.border, color: previewTheme.textMuted, backgroundColor: previewTheme.elevated }}>
                {THEMES[settings.theme]?.label || "Tema personalizado"} cambia fondos, navbar, tarjetas, bordes, textos y acentos de forma coordinada.
              </p>
              <Field label="Color de acento">
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => updateAccent(color)}
                      className="h-9 w-9 rounded-2xl border-2 transition hover:scale-105"
                      style={{ backgroundColor: color, borderColor: settings.primaryColor === color ? "#FFFFFF" : "rgba(255,255,255,0.14)" }}
                      aria-label={`Usar color ${color}`}
                    />
                  ))}
                  <input type="color" value={accent} onChange={(event) => updateAccent(event.target.value)} className="h-9 w-14 rounded-xl border border-white/10 bg-white/10 p-1" />
                </div>
              </Field>
              {settings.theme === "personalizado" && (
                <div className="grid gap-3 rounded-2xl border p-3 sm:grid-cols-2" style={{ borderColor: previewTheme.border, backgroundColor: previewTheme.elevated }}>
                  <Field label="Fondo">
                    <TextInput type="color" value={settings.customTheme?.bg || "#070B13"} onChange={(event) => updateSetting("customTheme", { bg: event.target.value })} />
                  </Field>
                  <Field label="Superficie / tarjeta">
                    <TextInput type="color" value={settings.customTheme?.surface || "#101827"} onChange={(event) => updateSetting("customTheme", { surface: event.target.value, card: event.target.value, elevated: event.target.value })} />
                  </Field>
                  <Field label="Acento">
                    <TextInput type="color" value={settings.customTheme?.accent || "#38BDF8"} onChange={(event) => updateSetting("customTheme", { accent: event.target.value })} />
                  </Field>
                  <Field label="Texto principal">
                    <TextInput type="color" value={settings.customTheme?.text || "#F8FAFC"} onChange={(event) => updateSetting("customTheme", { text: event.target.value })} />
                  </Field>
                  <p className="sm:col-span-2 text-xs font-semibold" style={{ color: previewTheme.textMuted }}>
                    Si el acento es claro u oscuro, CronoAula calcula automaticamente el texto del boton para conservar contraste.
                  </p>
                  {customContrastLow && (
                    <p className="sm:col-span-2 rounded-xl border px-3 py-2 text-xs font-black" style={{ borderColor: "#F59E0B", backgroundColor: "rgba(245,158,11,0.14)", color: "#F59E0B" }}>
                      El contraste entre fondo y texto es bajo. Ajusta uno de los dos para una lectura mas segura.
                    </p>
                  )}
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Letra">
                  <Segmented value={settings.fontSize || "normal"} onChange={(value) => updateSetting("fontSize", value)} options={FONT_OPTIONS} columns="" />
                </Field>
                <Field label="Fuente visual">
                  <Segmented value={settings.fontFamily || "system"} onChange={(value) => updateSetting("fontFamily", value)} options={FONT_FAMILY_OPTIONS} columns="" />
                </Field>
                <Field label="Densidad">
                  <Segmented value={settings.density || "normal"} onChange={(value) => updateSetting("density", value)} options={DENSITY_OPTIONS} columns="" />
                </Field>
              </div>
            </div>
          </Section>

          <Section icon={<Monitor size={20} />} title="Modo clase" subtitle="Controla que se muestra durante la clase.">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Vista por defecto">
                  <Segmented value={settings.defaultClassView || "class"} onChange={(value) => updateSetting("defaultClassView", value)} options={VIEW_OPTIONS} />
                </Field>
                <Field label="Temporizador">
                  <Segmented value={settings.timerSize || "grande"} onChange={(value) => updateSetting("timerSize", value)} options={TIMER_OPTIONS} />
                </Field>
                <Field label="Velocidad de prueba">
                  <Segmented value={Number(settings.testSpeed) || 10} onChange={(value) => updateSetting("testSpeed", Number(value))} options={TEST_SPEED_OPTIONS} />
                </Field>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Toggle checked={settings.showActivityInClass !== false} onChange={(value) => updateSetting("showActivityInClass", value)} label="Mostrar actividad" />
                <Toggle checked={settings.showMomentChips !== false} onChange={(value) => updateSetting("showMomentChips", value)} label="Mostrar chips de momentos" />
                <Toggle checked={settings.showMomentProgress !== false} onChange={(value) => updateSetting("showMomentProgress", value)} label="Progreso del momento" />
                <Toggle checked={settings.showSessionProgress !== false} onChange={(value) => updateSetting("showSessionProgress", value)} label="Progreso de sesion" />
                <Toggle checked={settings.showTotalTimeLeft !== false} onChange={(value) => updateSetting("showTotalTimeLeft", value)} label="Sesion restante" />
                <Toggle checked={Boolean(settings.autoAdvanceMoments)} onChange={(value) => updateSetting("autoAdvanceMoments", value)} label="Cambio automatico" hint="Preparado para una fase posterior." />
                <Toggle checked={settings.pauseAtMomentEnd !== false} onChange={(value) => updateSetting("pauseAtMomentEnd", value)} label="Pausar al terminar" />
              </div>
            </div>
          </Section>

          <Section icon={<Bell size={20} />} title="Sonidos y alertas" subtitle="Preparado para alertas sonoras futuras.">
            <div className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <Toggle checked={Boolean(settings.soundAlerts)} onChange={(value) => updateSetting("soundAlerts", value)} label="Activar sonidos" />
                <Toggle checked={Boolean(settings.earlyAlert)} onChange={(value) => updateSetting("earlyAlert", value)} label="Alerta temprana automatica" />
                <Toggle checked={Boolean(settings.beepLast15)} onChange={(value) => updateSetting("beepLast15", value)} label="Beep ultimos 15 segundos" />
                <Toggle checked={Boolean(settings.muteAll)} onChange={(value) => updateSetting("muteAll", value)} label="Silenciar todo" />
              </div>
              <Field label="Volumen">
                <Segmented value={settings.alertVolume || "medio"} onChange={(value) => updateSetting("alertVolume", value)} options={VOLUME_OPTIONS} />
              </Field>
              <div className="rounded-2xl border p-3 text-sm" style={{ borderColor: previewTheme.border, backgroundColor: previewTheme.elevated, color: previewTheme.textMuted }}>
                <Volume2 className="mr-2 inline" size={16} /> Estos ajustes quedan guardados; la logica sonora completa puede conectarse despues.
              </div>
            </div>
          </Section>

          <Section icon={<Settings2 size={20} />} title="Preferencias" subtitle="Comodidad general y accesibilidad.">
            <div className="grid gap-2 sm:grid-cols-2">
              <Toggle checked={Boolean(settings.animations)} onChange={(value) => updateSetting("animations", value)} label="Animaciones suaves" />
              <Toggle checked={Boolean(settings.highContrastMode)} onChange={(value) => updateSetting("highContrastMode", value)} label="Alto contraste" />
              <Toggle checked={Boolean(settings.distractionFree)} onChange={(value) => updateSetting("distractionFree", value)} label="Sin distracciones por defecto" />
              <Toggle checked={Boolean(settings.darkModeInClass)} onChange={(value) => updateSetting("darkModeInClass", value)} label="Fondo oscuro en clase" />
            </div>
          </Section>

          <Section icon={<Timer size={20} />} title="Vista previa" subtitle="Lectura segura con el acento elegido.">
            <div className="overflow-hidden rounded-[1.75rem] border text-left" style={{ backgroundColor: previewTheme.bg, borderColor: previewTheme.border, color: previewTheme.text }}>
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ backgroundColor: previewTheme.navBg, borderColor: previewTheme.navBorder, color: previewTheme.navText }}>
                <div className="font-black">CronoAula</div>
                <div className="rounded-full px-3 py-1 text-xs font-black" style={{ backgroundColor: previewTheme.accent, color: previewTheme.onAccent }}>Modo clase</div>
              </div>
              <div className="p-4">
                <div className="rounded-3xl border p-4" style={{ backgroundColor: previewTheme.card, borderColor: previewTheme.border, boxShadow: previewTheme.shadow }}>
                  <p className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: previewTheme.textMuted }}>Mini tarjeta de sesion</p>
                  <h3 className="mt-2 text-xl font-black" style={{ color: previewTheme.text }}>Fracciones equivalentes</h3>
                  <p className="mt-1 text-sm" style={{ color: previewTheme.textMuted }}>Comunicacion · 5to · 45 min</p>
                  <button className="mt-4 rounded-2xl px-4 py-2 text-sm font-black" style={{ backgroundColor: previewTheme.accent, color: previewTheme.onAccent }}>
                    Boton principal
                  </button>
                </div>
                <div className="mt-4 rounded-3xl border p-5 text-center" style={{ backgroundColor: previewTheme.elevated, borderColor: previewTheme.border }}>
                  <p className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: previewTheme.textMuted }}>Modo clase</p>
                  <h3 className="mt-2 text-3xl font-black" style={{ color: previewTheme.text }}>Desarrollo</h3>
                  <div className="mt-5 font-mono text-6xl font-black leading-none text-emerald-400">12:00</div>
                  <p className="mt-3 text-sm" style={{ color: previewTheme.textMuted }}>Actividad de aprendizaje clara y visible.</p>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: previewTheme.accentSoft }}>
                    <div className="h-full rounded-full" style={{ width: "62%", backgroundColor: previewTheme.accent }} />
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black" style={{ backgroundColor: previewTheme.accent, color: previewTheme.onAccent }}>
                    <Check size={14} /> Contraste seguro
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
