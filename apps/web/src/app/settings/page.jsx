"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Monitor,
  Palette,
  RotateCcw,
  Save,
  Shield,
  Timer,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_SETTINGS, useAppSettings } from "@/context/AppSettingsContext";
import { getTeacher, saveTeacher } from "@/utils/localStore";

const THEME_OPTIONS = [
  { value: "claro", label: "Claro" },
  { value: "oscuro", label: "Oscuro" },
  { value: "calido", label: "Aula cálida" },
  { value: "contraste", label: "Alto contraste" },
];

const FONT_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "grande", label: "Grande" },
  { value: "gigante", label: "Gigante" },
];

const TIMER_OPTIONS = [
  { value: "grande", label: "Grande" },
  { value: "gigante", label: "Gigante" },
];

const DENSITY_OPTIONS = [
  { value: "compacta", label: "Compacta" },
  { value: "normal", label: "Normal" },
  { value: "amplia", label: "Amplia" },
];

const VIEW_OPTIONS = [
  { value: "teacher", label: "Vista docente" },
  { value: "class", label: "Modo clase" },
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
    <label className="block space-y-2">
      <span className="text-sm font-black text-slate-100">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-200"
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className="min-h-28 w-full resize-y rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold leading-relaxed text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-200"
    />
  );
}

function Card({ icon, title, subtitle, children }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-2xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "var(--settings-accent)" }}>
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-black text-white">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className="rounded-2xl border px-4 py-3 text-sm font-black transition hover:brightness-110"
            style={{
              backgroundColor: active ? "var(--settings-accent)" : "rgba(255,255,255,0.05)",
              borderColor: active ? "var(--settings-accent)" : "rgba(255,255,255,0.1)",
              color: active ? "var(--settings-on-accent)" : "#CBD5E1",
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
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left transition hover:bg-white/[0.075]"
    >
      <span>
        <span className="block text-sm font-black text-white">{label}</span>
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </span>
      <span className="relative h-7 w-12 rounded-full transition" style={{ backgroundColor: checked ? "var(--settings-accent)" : "#334155" }}>
        <span className="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition" style={{ left: checked ? "24px" : "4px" }} />
      </span>
    </button>
  );
}

export default function SettingsPage() {
  const { settings, setSettings, resetSettings } = useAppSettings();
  const [teacher, setTeacher] = useState(() => buildTeacherState(settings));
  const accent = settings.primaryColor || "#38BDF8";
  const onAccent = readableText(accent);
  const previewTimerSize = settings.timerSize === "gigante" ? "64px" : "48px";
  const rootStyle = useMemo(
    () => ({
      "--settings-accent": accent,
      "--settings-on-accent": onAccent,
    }),
    [accent, onAccent],
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
      const nextSettings = {
        ...settings,
        teacherName: teacherPayload.name,
        institution: teacherPayload.institution,
        defaultGrade: teacherPayload.defaultGrade,
        defaultArea: teacherPayload.defaultArea,
        defaultDuration: normalizedDuration,
        classroomContext: teacherPayload.classroomContext,
      };
      localStorage.setItem("cronoaula_settings", JSON.stringify(nextSettings));
      saveTeacher(teacherPayload);
      setSettings(nextSettings);
      toast.success("Configuración guardada");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar la configuración en este navegador");
    }
  };

  const handleReset = () => {
    if (!confirm("¿Restaurar la configuración inicial de CronoAula?")) return;
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
      toast.success("Configuración inicial restaurada");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo restaurar la configuración");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#070B13] px-4 py-6 text-white md:px-8" style={rootStyle}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.12),transparent_34%)]" />
      <div className="relative mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <a href="/" className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:bg-white/10" aria-label="Volver">
              <ArrowLeft size={20} />
            </a>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: "var(--settings-accent)" }}>Configuración</p>
              <h1 className="mt-1 text-3xl font-black text-white">CronoAula</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-400">
                Perfil, apariencia y modo clase guardados solo en este navegador.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleReset} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-black text-slate-300 transition hover:bg-white/10">
              <RotateCcw size={16} /> Restaurar
            </button>
            <button onClick={handleSave} className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black shadow-sm transition hover:brightness-110" style={{ backgroundColor: "var(--settings-accent)", color: "var(--settings-on-accent)" }}>
              <Save size={16} /> Guardar
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card icon={<User size={22} />} title="Perfil docente" subtitle="Datos que se reutilizan al planificar y conducir sesiones.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nombre del docente">
                <TextInput value={teacher.name} onChange={(event) => updateTeacher("name", event.target.value)} placeholder="Ej. Ricardo Pérez" />
              </Field>
              <Field label="Institución educativa">
                <TextInput value={teacher.institution} onChange={(event) => updateTeacher("institution", event.target.value)} placeholder="Ej. I.E. Nuestra Señora" />
              </Field>
              <Field label="Grado predeterminado">
                <TextInput value={teacher.defaultGrade} onChange={(event) => updateTeacher("defaultGrade", event.target.value)} placeholder="Ej. 5to de primaria" />
              </Field>
              <Field label="Área predeterminada">
                <TextInput value={teacher.defaultArea} onChange={(event) => updateTeacher("defaultArea", event.target.value)} placeholder="Ej. Comunicación" />
              </Field>
              <Field label="Duración predeterminada" hint="En minutos.">
                <TextInput type="number" min="1" value={teacher.defaultDuration} onChange={(event) => updateTeacher("defaultDuration", event.target.value)} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Contexto o nota del aula">
                  <TextArea value={teacher.classroomContext} onChange={(event) => updateTeacher("classroomContext", event.target.value)} placeholder="Ej. Grupo participativo, algunos estudiantes requieren apoyo lector..." />
                </Field>
              </div>
            </div>
          </Card>

          <Card icon={<Palette size={22} />} title="Apariencia" subtitle="El color solo se usa como acento; la lectura se mantiene segura.">
            <div className="space-y-5">
              <Field label="Tema visual">
                <Segmented value={settings.theme} onChange={(value) => updateSetting("theme", value)} options={THEME_OPTIONS} />
              </Field>
              <Field label="Color principal">
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => updateSetting("primaryColor", color)}
                      className="h-10 w-10 rounded-2xl border-2 shadow-sm transition hover:scale-105"
                      style={{ backgroundColor: color, borderColor: settings.primaryColor === color ? "#FFFFFF" : "rgba(255,255,255,0.12)" }}
                      aria-label={`Usar color ${color}`}
                    />
                  ))}
                  <input type="color" value={accent} onChange={(event) => updateSetting("primaryColor", event.target.value)} className="h-10 w-14 rounded-xl border border-white/10 bg-white/10 p-1" />
                </div>
              </Field>
            </div>
          </Card>

          <Card icon={<Monitor size={22} />} title="Modo clase" subtitle="Preferencias para el temporizador docente.">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Vista por defecto">
                <Segmented value={settings.defaultClassView || "teacher"} onChange={(value) => updateSetting("defaultClassView", value)} options={VIEW_OPTIONS} />
              </Field>
              <Field label="Tamaño del temporizador">
                <Segmented value={settings.timerSize || "grande"} onChange={(value) => updateSetting("timerSize", value)} options={TIMER_OPTIONS} />
              </Field>
              <Field label="Tamaño de letra">
                <Segmented value={settings.fontSize || "normal"} onChange={(value) => updateSetting("fontSize", value)} options={FONT_OPTIONS} />
              </Field>
              <Field label="Densidad">
                <Segmented value={settings.density || "normal"} onChange={(value) => updateSetting("density", value)} options={DENSITY_OPTIONS} />
              </Field>
            </div>
          </Card>

          <Card icon={<Shield size={22} />} title="Preferencias" subtitle="Comodidad y legibilidad.">
            <div className="space-y-4">
              <Toggle checked={Boolean(settings.distractionFree)} onChange={(value) => updateSetting("distractionFree", value)} label="Sin distracciones por defecto" hint="Oculta elementos secundarios al entrar al Modo clase." />
              <Toggle checked={Boolean(settings.animations)} onChange={(value) => updateSetting("animations", value)} label="Animaciones suaves" hint="Mantiene transiciones discretas en botones y progreso." />
              <Toggle checked={Boolean(settings.highContrastMode)} onChange={(value) => updateSetting("highContrastMode", value)} label="Alto contraste reforzado" hint="Aumenta la legibilidad en Modo clase." />
              <Toggle checked={Boolean(settings.darkModeInClass)} onChange={(value) => updateSetting("darkModeInClass", value)} label="Fondo oscuro en clase" hint="Mantiene la estética oscura para proyectar o enseñar." />
            </div>
          </Card>

          <Card icon={<Timer size={22} />} title="Vista previa" subtitle="Una muestra del nuevo estilo del temporizador.">
            <div className="rounded-[2rem] border border-white/10 bg-black/35 p-6 text-center">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Modo clase</p>
              <h3 className="mt-3 text-3xl font-black text-white">Desarrollo</h3>
              <div className="mt-6 font-mono font-black leading-none" style={{ color: "#22C55E", fontSize: previewTimerSize }}>12:00</div>
              <p className="mt-4 text-sm text-slate-400">Actividad de aprendizaje clara, breve y visible.</p>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full" style={{ width: "62%", backgroundColor: accent }} />
              </div>
            </div>
          </Card>

          <Card icon={<Check size={22} />} title="Guardado local" subtitle="CronoAula funciona como app estática en Netlify.">
            <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/10 p-4 text-sm leading-relaxed text-emerald-100">
              Tus datos del docente, sesiones y preferencias se guardan en localStorage de este navegador.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
