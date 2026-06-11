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
  Sparkles,
  Timer,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_SETTINGS,
  THEMES,
  useAppSettings,
} from "@/context/AppSettingsContext";
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
  { value: "class", label: "Vista de clase" },
];

const COLOR_OPTIONS = [
  "#2563EB",
  "#0F766E",
  "#7C3AED",
  "#D97706",
  "#DC2626",
  "#0891B2",
  "#BE185D",
  "#111827",
];

function buildTeacherState(settings) {
  const teacher = getTeacher();
  return {
    name: settings.teacherName || teacher.name || "",
    institution: settings.institution || teacher.institution || teacher.school || "",
    defaultGrade: settings.defaultGrade || teacher.defaultGrade || teacher.grade || "",
    defaultArea: settings.defaultArea || teacher.defaultArea || "Comunicacion",
    defaultDuration: settings.defaultDuration || teacher.defaultDuration || 90,
    classroomContext:
      settings.classroomContext || teacher.classroomContext || "",
  };
}

function Field({ label, children, hint }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-slate-800">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className="min-h-28 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
    />
  );
}

function SelectField({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-300"
    >
      <span>
        <span className="block text-sm font-bold text-slate-800">{label}</span>
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </span>
      <span
        className="relative h-7 w-12 rounded-full transition"
        style={{ backgroundColor: checked ? "var(--settings-primary)" : "#CBD5E1" }}
      >
        <span
          className="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition"
          style={{ left: checked ? "24px" : "4px" }}
        />
      </span>
    </button>
  );
}

function Card({ icon, title, subtitle, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">{icon}</div>
        <div>
          <h2 className="text-lg font-black text-slate-950">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className="rounded-2xl border px-4 py-3 text-sm font-black transition"
          style={{
            backgroundColor:
              value === option.value ? "var(--settings-primary)" : "#FFFFFF",
            borderColor:
              value === option.value ? "var(--settings-primary)" : "#E2E8F0",
            color: value === option.value ? "#FFFFFF" : "#334155",
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const { settings, setSettings, resetSettings } = useAppSettings();
  const [teacher, setTeacher] = useState(() => buildTeacherState(settings));
  const theme = THEMES[settings.theme] || THEMES.claro;
  const previewStyle = useMemo(
    () => ({
      backgroundColor: settings.highContrastMode ? "#000000" : theme.bg,
      color: settings.highContrastMode ? "#FFFFFF" : theme.text,
      borderColor: settings.highContrastMode ? "#FACC15" : theme.border,
    }),
    [settings.highContrastMode, theme],
  );

  useEffect(() => {
    setTeacher(buildTeacherState(settings));
  }, [settings.teacherName, settings.institution, settings.defaultGrade, settings.defaultArea, settings.defaultDuration, settings.classroomContext]);

  const updateSetting = (key, value) => {
    setSettings({ [key]: value });
  };

  const updateTeacher = (key, value) => {
    setTeacher((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    try {
      const teacherPayload = {
        id: "local-teacher",
        name: teacher.name,
        institution: teacher.institution,
        school: teacher.institution,
        grade: teacher.defaultGrade,
        defaultGrade: teacher.defaultGrade,
        defaultArea: teacher.defaultArea,
        defaultDuration: Number(teacher.defaultDuration) || 90,
        classroomContext: teacher.classroomContext,
      };
      saveTeacher(teacherPayload);
      setSettings({
        teacherName: teacher.name,
        institution: teacher.institution,
        defaultGrade: teacher.defaultGrade,
        defaultArea: teacher.defaultArea,
        defaultDuration: Number(teacher.defaultDuration) || 90,
        classroomContext: teacher.classroomContext,
      });
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
      const nextTeacher = {
        name: DEFAULT_SETTINGS.teacherName,
        institution: DEFAULT_SETTINGS.institution,
        defaultGrade: DEFAULT_SETTINGS.defaultGrade,
        defaultArea: DEFAULT_SETTINGS.defaultArea,
        defaultDuration: DEFAULT_SETTINGS.defaultDuration,
        classroomContext: DEFAULT_SETTINGS.classroomContext,
      };
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
    <div
      className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-6 md:px-8"
      style={{ "--settings-primary": settings.primaryColor || "#2563EB" }}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <a
              href="/"
              className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
              aria-label="Volver"
            >
              <ArrowLeft size={20} />
            </a>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                Configuración
              </p>
              <h1 className="text-2xl font-black text-slate-950 md:text-3xl">
                Personaliza CronoAula
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Tus datos y preferencias se guardan en este navegador. No se
                envían a un servidor.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw size={16} /> Restaurar configuración inicial
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white shadow-sm transition hover:brightness-95"
              style={{ backgroundColor: "var(--settings-primary)" }}
            >
              <Save size={16} /> Guardar
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card
            icon={<User size={22} />}
            title="Datos del docente"
            subtitle="Estos datos ayudan a preparar sesiones más consistentes."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nombre del docente">
                <TextInput
                  value={teacher.name}
                  onChange={(event) => updateTeacher("name", event.target.value)}
                  placeholder="Ej. Ricardo Pérez"
                />
              </Field>
              <Field label="Institución educativa">
                <TextInput
                  value={teacher.institution}
                  onChange={(event) =>
                    updateTeacher("institution", event.target.value)
                  }
                  placeholder="Ej. I.E. Nuestra Señora..."
                />
              </Field>
              <Field label="Grado predeterminado">
                <TextInput
                  value={teacher.defaultGrade}
                  onChange={(event) =>
                    updateTeacher("defaultGrade", event.target.value)
                  }
                  placeholder="Ej. 5to de primaria"
                />
              </Field>
              <Field label="Área predeterminada">
                <TextInput
                  value={teacher.defaultArea}
                  onChange={(event) =>
                    updateTeacher("defaultArea", event.target.value)
                  }
                  placeholder="Ej. Comunicación"
                />
              </Field>
              <Field label="Duración predeterminada" hint="En minutos.">
                <TextInput
                  type="number"
                  min="1"
                  value={teacher.defaultDuration}
                  onChange={(event) =>
                    updateTeacher("defaultDuration", event.target.value)
                  }
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Contexto o nota del aula">
                  <TextArea
                    value={teacher.classroomContext}
                    onChange={(event) =>
                      updateTeacher("classroomContext", event.target.value)
                    }
                    placeholder="Ej. Grupo participativo, algunos estudiantes requieren apoyo lector..."
                  />
                </Field>
              </div>
            </div>
          </Card>

          <Card
            icon={<Palette size={22} />}
            title="Configuración visual"
            subtitle="Ajusta cómo se ve CronoAula durante la planificación y la clase."
          >
            <div className="space-y-5">
              <Field label="Tema visual">
                <Segmented
                  value={settings.theme}
                  onChange={(value) => updateSetting("theme", value)}
                  options={THEME_OPTIONS}
                />
              </Field>

              <Field label="Color principal">
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => updateSetting("primaryColor", color)}
                      className="h-10 w-10 rounded-2xl border-2 shadow-sm transition hover:scale-105"
                      style={{
                        backgroundColor: color,
                        borderColor:
                          settings.primaryColor === color ? "#0F172A" : "#FFFFFF",
                      }}
                      aria-label={`Usar color ${color}`}
                    />
                  ))}
                  <input
                    type="color"
                    value={settings.primaryColor || "#2563EB"}
                    onChange={(event) =>
                      updateSetting("primaryColor", event.target.value)
                    }
                    className="h-10 w-14 rounded-xl border border-slate-200 bg-white p-1"
                  />
                </div>
              </Field>

              <Field label="Tamaño de letra">
                <Segmented
                  value={settings.fontSize}
                  onChange={(value) => updateSetting("fontSize", value)}
                  options={FONT_OPTIONS}
                />
              </Field>

              <Field label="Densidad de interfaz">
                <Segmented
                  value={settings.density}
                  onChange={(value) => updateSetting("density", value)}
                  options={DENSITY_OPTIONS}
                />
              </Field>

              <Toggle
                checked={Boolean(settings.animations)}
                onChange={(value) => updateSetting("animations", value)}
                label="Animaciones suaves"
                hint="Mantiene transiciones discretas en botones y progreso."
              />
              <Toggle
                checked={Boolean(settings.highContrastMode)}
                onChange={(value) => updateSetting("highContrastMode", value)}
                label="Modo alto contraste"
                hint="Refuerza contraste en pantallas de clase y proyector."
              />
            </div>
          </Card>

          <Card
            icon={<Monitor size={22} />}
            title="Modo clase"
            subtitle="Preferencias para usar CronoAula en laptop, pantalla o proyector."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Vista por defecto">
                <Segmented
                  value={settings.defaultClassView || "teacher"}
                  onChange={(value) => updateSetting("defaultClassView", value)}
                  options={VIEW_OPTIONS}
                />
              </Field>
              <Field label="Tamaño del temporizador">
                <Segmented
                  value={settings.timerSize || "grande"}
                  onChange={(value) => updateSetting("timerSize", value)}
                  options={TIMER_OPTIONS}
                />
              </Field>
              <Toggle
                checked={Boolean(settings.distractionFree)}
                onChange={(value) => updateSetting("distractionFree", value)}
                label="Sin distracciones por defecto"
                hint="Oculta paneles secundarios al entrar al Modo clase."
              />
              <Toggle
                checked={Boolean(settings.darkModeInClass)}
                onChange={(value) => updateSetting("darkModeInClass", value)}
                label="Usar fondo oscuro en clase"
                hint="Útil si proyectas en ambientes con poca luz."
              />
            </div>
          </Card>

          <Card
            icon={<Sparkles size={22} />}
            title="Vista previa"
            subtitle="Así se sentirá la personalización en Modo clase."
          >
            <div
              className="rounded-3xl border p-5"
              style={previewStyle}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide opacity-70">
                    Vista de clase
                  </p>
                  <h3
                    className="mt-1 font-black"
                    style={{
                      fontSize:
                        settings.fontSize === "gigante"
                          ? "32px"
                          : settings.fontSize === "grande"
                            ? "26px"
                            : "22px",
                    }}
                  >
                    Desarrollo
                  </h3>
                </div>
                <Shield size={22} />
              </div>
              <div className="mt-5 rounded-2xl bg-white/80 p-4 text-slate-900">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Actividad de aprendizaje
                </p>
                <p className="mt-2 text-sm leading-relaxed">
                  Los estudiantes trabajan una actividad guiada y comparten sus
                  avances.
                </p>
              </div>
              <div
                className="mt-5 rounded-2xl px-4 py-4 text-center font-mono font-black text-white"
                style={{
                  backgroundColor: settings.primaryColor || "#2563EB",
                  fontSize:
                    settings.timerSize === "gigante" ? "54px" : "42px",
                }}
              >
                12:00
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/50">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "62%",
                    backgroundColor: settings.primaryColor || "#2563EB",
                  }}
                />
              </div>
            </div>
          </Card>

          <Card
            icon={<Timer size={22} />}
            title="Guardado local"
            subtitle="CronoAula funciona como app estática: todo queda en este navegador."
          >
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900">
              <div className="mb-2 flex items-center gap-2 font-black">
                <Check size={18} /> Sin conexión a servidor
              </div>
              Los datos del docente, sesiones y preferencias se conservan al
              recargar mientras no borres los datos del navegador.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
