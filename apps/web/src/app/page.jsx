"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  Clock3,
  FileText,
  Play,
  Plus,
  Sparkles,
  Timer,
} from "lucide-react";
import { useTeacher } from "./client-layout";
import { getSessions } from "@/utils/localStore";

function getSessionDuration(session) {
  if (session?.total_duration) return Number(session.total_duration) || 0;
  if (session?.duration) return Number(session.duration) || 0;
  return (session?.moments || []).reduce((total, moment) => {
    const subTotal = (moment.submoments || []).reduce((sum, sub) => sum + (Number(sub.duration) || 0), 0);
    return total + (subTotal || Number(moment.duration) || 0);
  }, 0);
}

function getSessionDate(session) {
  return new Date(session?.last_modified || session?.updated_at || session?.created_at || session?.date || 0).getTime();
}

function formatDuration(minutes) {
  if (!minutes) return "Sin duración";
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours}h ${rest}m` : `${hours}h`;
  }
  return `${minutes} min`;
}

export default function HomePage() {
  const { teacher, loading } = useTeacher();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    setSessions(getSessions());

    const refresh = () => setSessions(getSessions());
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const recentSessions = useMemo(
    () => [...sessions].sort((a, b) => getSessionDate(b) - getSessionDate(a)).slice(0, 5),
    [sessions],
  );
  const latestSession = recentSessions[0] || null;
  const teacherName = teacher?.name?.trim()?.split(" ")[0] || "docente";

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[var(--ca-primary,#2563eb)] border-t-transparent" />
          <p className="text-sm" style={{ color: "var(--ca-text-muted, #64748b)" }}>Preparando CronoAula...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-14">
      <section className="pt-2">
        <p className="text-sm font-bold uppercase tracking-[0.22em]" style={{ color: "var(--ca-text-muted, #64748b)" }}>
          Inicio rápido
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: "var(--ca-text, #0f172a)" }}>
              Hola, {teacherName}
            </h1>
            <p className="mt-1 max-w-2xl text-sm sm:text-base" style={{ color: "var(--ca-text-muted, #64748b)" }}>
              Elige una sesión guardada y empieza el modo clase en pocos clics.
            </p>
          </div>
          <a
            href="/sessions"
            className="inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition hover:brightness-105"
            style={{
              borderColor: "var(--ca-border, #e2e8f0)",
              color: "var(--ca-text, #0f172a)",
              backgroundColor: "var(--ca-surface, #fff)",
            }}
          >
            <BookOpen size={16} /> Ver mis sesiones
          </a>
        </div>
      </section>

      {latestSession ? (
        <section
          className="overflow-hidden rounded-[2rem] border p-5 shadow-sm sm:p-6"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--ca-primary,#2563eb) 16%, transparent), transparent 42%), var(--ca-surface, #fff)",
            borderColor: "var(--ca-border, #e2e8f0)",
          }}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black" style={{ borderColor: "var(--ca-border, #e2e8f0)", color: "var(--ca-text-muted, #64748b)" }}>
                <Timer size={13} /> Sesión más reciente
              </div>
              <div>
                <h2 className="truncate text-2xl font-black sm:text-3xl" style={{ color: "var(--ca-text, #0f172a)" }}>
                  {latestSession.title || "Sesión sin título"}
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--ca-text-muted, #64748b)" }}>
                  {latestSession.area || "Área sin registrar"} · {latestSession.grade || "Grado sin registrar"} · {formatDuration(getSessionDuration(latestSession))}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
              <a
                href={`/class-mode/${latestSession.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black shadow-lg transition hover:brightness-110"
                style={{ backgroundColor: "var(--ca-primary, #2563eb)", color: "var(--ca-on-accent, #fff)" }}
              >
                <Play size={17} fill="currentColor" /> Continuar clase
              </a>
              <a
                href="/create"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold transition hover:brightness-105"
                style={{
                  borderColor: "var(--ca-border, #e2e8f0)",
                  color: "var(--ca-text, #0f172a)",
                  backgroundColor: "color-mix(in srgb, var(--ca-surface,#fff) 88%, transparent)",
                }}
              >
                <Plus size={17} /> Crear sesión
              </a>
            </div>
          </div>
        </section>
      ) : (
        <section
          className="rounded-[2rem] border p-6 text-center shadow-sm"
          style={{ backgroundColor: "var(--ca-surface, #fff)", borderColor: "var(--ca-border, #e2e8f0)" }}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "color-mix(in srgb, var(--ca-primary,#2563eb) 12%, transparent)", color: "var(--ca-primary,#2563eb)" }}>
            <FileText size={23} />
          </div>
          <h2 className="mt-4 text-2xl font-black" style={{ color: "var(--ca-text, #0f172a)" }}>Aún no tienes sesiones guardadas</h2>
          <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "var(--ca-text-muted, #64748b)" }}>
            Crea una sesión desde cero o importa una planificación para empezar a usar el modo clase.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <a href="/create" className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition hover:brightness-110" style={{ backgroundColor: "var(--ca-primary,#2563eb)", color: "var(--ca-on-accent, #fff)" }}>
              <Plus size={17} /> Crear primera sesión
            </a>
            <a href="/create?tab=import" className="inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold transition hover:brightness-105" style={{ borderColor: "var(--ca-border,#e2e8f0)", color: "var(--ca-text,#0f172a)" }}>
              <Sparkles size={17} /> Importar planificación
            </a>
          </div>
        </section>
      )}

      <section className="grid gap-2 sm:grid-cols-3">
        <QuickAction href="/create" icon={<Plus size={18} />} label="Crear sesión" />
        <QuickAction href="/create?tab=import" icon={<Sparkles size={18} />} label="Importar planificación" />
        <QuickAction href="/sessions" icon={<BookOpen size={18} />} label="Ver mis sesiones" />
      </section>

      {recentSessions.length > 0 && (
        <section
          className="rounded-[1.5rem] border p-4"
          style={{ backgroundColor: "var(--ca-surface, #fff)", borderColor: "var(--ca-border, #e2e8f0)" }}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-black uppercase tracking-[0.18em]" style={{ color: "var(--ca-text-muted, #64748b)" }}>
              Sesiones recientes
            </h2>
            <a href="/sessions" className="text-sm font-bold hover:underline" style={{ color: "var(--ca-primary, #2563eb)" }}>
              Ver todas
            </a>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--ca-border, #e2e8f0)" }}>
            {recentSessions.map((session) => (
              <RecentSessionRow key={session.id} session={session} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function QuickAction({ href, icon, label }) {
  return (
    <a
      href={href}
      className="group flex items-center justify-between rounded-2xl border px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-sm"
      style={{ backgroundColor: "var(--ca-surface, #fff)", borderColor: "var(--ca-border, #e2e8f0)", color: "var(--ca-text, #0f172a)" }}
    >
      <span className="flex items-center gap-2 text-sm font-black">
        <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--ca-primary,#2563eb) 12%, transparent)", color: "var(--ca-primary,#2563eb)" }}>
          {icon}
        </span>
        {label}
      </span>
      <ChevronRight size={17} className="transition group-hover:translate-x-0.5" />
    </a>
  );
}

function RecentSessionRow({ session }) {
  const duration = getSessionDuration(session);

  return (
    <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-sm font-black" style={{ color: "var(--ca-text, #0f172a)" }}>
          {session.title || "Sesión sin título"}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs" style={{ color: "var(--ca-text-muted, #64748b)" }}>
          <span>{session.area || "Área"}</span>
          <span>·</span>
          <span>{session.grade || "Grado"}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1"><Clock3 size={12} /> {formatDuration(duration)}</span>
        </p>
      </div>
      <a
        href={`/class-mode/${session.id}`}
        className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black transition hover:brightness-110 sm:shrink-0"
        style={{ backgroundColor: "var(--ca-primary, #2563eb)", color: "var(--ca-on-accent, #fff)" }}
      >
        <Play size={12} fill="currentColor" /> Iniciar
      </a>
    </div>
  );
}
