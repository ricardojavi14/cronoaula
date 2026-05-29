"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Plus,
  BookOpen,
  Calendar,
  HelpCircle,
  Clock,
  ChevronRight,
  Zap,
  Star,
  Timer,
  FileText,
  Layers,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { useTeacher } from "./client-layout";

export default function HomePage() {
  const { teacher, loading } = useTeacher();
  const [lastSession, setLastSession] = useState(null);
  const [todaySessions, setTodaySessions] = useState([]);

  useEffect(() => {
    if (!teacher) return;
    fetch(`/api/sessions?teacher_id=${teacher.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLastSession(data[0]);
          const today = new Date().toISOString().split("T")[0];
          setTodaySessions(data.filter((s) => s.date === today));
        }
      })
      .catch(console.error);
  }, [teacher]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div
            className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          <p className="text-slate-500 text-sm">Cargando tu tablero...</p>
        </div>
        <style
          jsx
          global
        >{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-16">
      {/* Welcome bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--ca-text, #1e293b)" }}
          >
            {teacher
              ? `Hola, ${teacher.name?.split(" ")[0]} 👋`
              : "Bienvenido a CronoAula"}
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--ca-text-muted, #64748b)" }}
          >
            {teacher
              ? `${teacher.area_principal || "Docente"} · ${teacher.grade || ""}`
              : "Tu asistente pedagógico de aula"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!teacher && (
            <a
              href="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-colors"
            >
              <Star size={14} /> Configura tu perfil
            </a>
          )}
          <a
            href="/settings"
            className="p-2 rounded-xl hover:bg-black/5 transition-colors"
            title="Configuración de CronoAula"
            style={{ color: "var(--ca-text-muted, #64748b)" }}
          >
            <Settings size={20} />
          </a>
        </div>
      </div>

      {/* HERO: Modo Clase */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 text-white p-6 md:p-8 shadow-lg">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 text-xs font-semibold text-blue-100">
                <Timer size={12} /> Función principal
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                Modo Clase
              </h2>
              <p className="text-blue-100 leading-relaxed text-sm">
                Temporizador grande, notas docentes y control de momentos. Listo
                para proyector y aula real.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                {lastSession ? (
                  <a
                    href={`/class-mode/${lastSession.id}`}
                    className="flex items-center gap-2 px-5 py-3 bg-white text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-md"
                  >
                    <Play size={16} fill="currentColor" /> Continuar última
                    sesión
                  </a>
                ) : (
                  <a
                    href="/sessions"
                    className="flex items-center gap-2 px-5 py-3 bg-white text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-md"
                  >
                    <Play size={16} fill="currentColor" /> Iniciar modo clase
                  </a>
                )}
                <a
                  href="/sessions"
                  className="flex items-center gap-2 px-5 py-3 bg-blue-600/60 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-blue-600/80 transition-colors"
                >
                  <BookOpen size={16} /> Ver sesiones
                </a>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-center justify-center w-48 h-48 rounded-2xl bg-white/10 border border-white/20 shrink-0">
              <div className="text-5xl font-mono font-black text-white tabular-nums">
                12:34
              </div>
              <div className="text-blue-200 text-xs font-semibold mt-2 uppercase tracking-widest">
                Tiempo restante
              </div>
              <div className="mt-3 w-28 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-3/5 bg-white rounded-full" />
              </div>
            </div>
          </div>
          {todaySessions.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/20">
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2">
                Sesiones de hoy
              </p>
              <div className="flex gap-2 flex-wrap">
                {todaySessions.map((s) => (
                  <a
                    key={s.id}
                    href={`/class-mode/${s.id}`}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                  >
                    <Play size={11} fill="white" /> {s.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -right-8 w-48 h-48 bg-white/5 rounded-full" />
      </div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickCard
          href="/create"
          icon={<Plus size={20} className="text-blue-700" />}
          iconBg="bg-blue-100"
          title="Crear sesión"
          desc="Arma una sesión con momentos, tiempos y notas."
          cta="Crear ahora"
          ctaColor="text-blue-700"
          cardBg="bg-blue-50 border-blue-100"
        />
        <QuickCard
          href="/sessions"
          icon={<BookOpen size={20} className="text-emerald-700" />}
          iconBg="bg-emerald-100"
          title="Mis sesiones"
          desc="Edita, duplica o reutiliza sesiones."
          cta="Abrir biblioteca"
          ctaColor="text-emerald-700"
          cardBg="bg-emerald-50 border-emerald-100"
        />
        <QuickCard
          href="/agenda"
          icon={<Calendar size={20} className="text-violet-700" />}
          iconBg="bg-violet-100"
          title="Agenda diaria"
          desc="Organiza todas tus clases del día."
          cta="Ver agenda"
          ctaColor="text-violet-700"
          cardBg="bg-violet-50 border-violet-100"
        />
        <QuickCard
          href="/tutorial"
          icon={<HelpCircle size={20} className="text-amber-700" />}
          iconBg="bg-amber-100"
          title="Tutorial"
          desc="Aprende a usar CronoAula paso a paso."
          cta="Ver tutorial"
          ctaColor="text-amber-700"
          cardBg="bg-amber-50 border-amber-100"
        />
      </div>

      {/* Last session + quick create */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Clock size={15} className="text-slate-400" /> Última sesión
            </h3>
            <a
              href="/sessions"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Ver todas →
            </a>
          </div>
          {lastSession ? (
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-slate-800">
                  {lastSession.title}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {lastSession.area} · {lastSession.grade} ·{" "}
                  {lastSession.total_duration} min
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/class-mode/${lastSession.id}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Play size={13} fill="white" /> Iniciar
                </a>
                <a
                  href={`/create?id=${lastSession.id}`}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Editar
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto">
                <FileText size={18} className="text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">
                Aún no tienes sesiones guardadas.
              </p>
              <a
                href="/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus size={14} /> Crear ahora
              </a>
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
              <Zap size={13} className="text-violet-600" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              Creación rápida con IA
            </h3>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Pega el texto de tu planificación o sube un archivo y la IA extrae
            todos los momentos y tiempos automáticamente.
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="/create?tab=import"
              className="flex items-center justify-between px-4 py-3 bg-violet-50 border border-violet-100 rounded-xl hover:bg-violet-100 transition-colors group"
            >
              <span className="text-sm font-semibold text-violet-800">
                Importar planificación con IA
              </span>
              <ChevronRight size={15} className="text-violet-400" />
            </a>
            <a
              href="/create"
              className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors group"
            >
              <span className="text-sm font-semibold text-slate-700">
                Crear sesión desde cero
              </span>
              <ChevronRight size={15} className="text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Features strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FeatureCard
          icon={<Timer size={16} className="text-blue-600" />}
          iconBg="bg-blue-100"
          title="Gestión de tiempos"
          text="Suma automática, redistribución proporcional y alertas de tiempo."
        />
        <FeatureCard
          icon={<Layers size={16} className="text-emerald-600" />}
          iconBg="bg-emerald-100"
          title="Momentos pedagógicos"
          text="Inicio, Desarrollo, Cierre y más, con submomentos y notas docentes."
        />
        <FeatureCard
          icon={<AlertTriangle size={16} className="text-amber-600" />}
          iconBg="bg-amber-100"
          title="Ajuste por inicio tardío"
          text="Si empiezas tarde, CronoAula redistribuye los tiempos con un clic."
        />
      </div>
    </div>
  );
}

function QuickCard({ href, icon, iconBg, title, desc, cta, ctaColor, cardBg }) {
  return (
    <a
      href={href}
      className={`${cardBg} border rounded-2xl p-4 flex flex-col gap-3 hover:shadow-md transition-all group`}
    >
      <div
        className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
        <p className="text-slate-600 text-xs mt-1 leading-relaxed">{desc}</p>
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold ${ctaColor}`}>
        {cta} <ChevronRight size={12} />
      </div>
    </a>
  );
}

function FeatureCard({ icon, iconBg, title, text }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex gap-3 shadow-sm">
      <div
        className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
        <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
